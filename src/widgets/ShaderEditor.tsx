import { useEffect, useRef, useState } from "react";
import { initWebGPU, resizeToDisplay, startLoop, webgpuSupported } from "../engine/webgpu/gpu";

const DEFAULT_FRAG = `// Fragment shader — runs once per pixel.
// 'uv' is 0..1 across the canvas, 't' is seconds. Return an RGB color.
fn shade(uv : vec2<f32>, t : f32) -> vec3<f32> {
  let c = 0.5 + 0.5 * cos(t + uv.xyx * 6.0 + vec3<f32>(0.0, 2.0, 4.0));
  return c;
}`;

// Full-screen triangle vertex shader + a fixed wrapper that calls user's shade().
function buildWGSL(userBody: string): string {
  return /* wgsl */ `
struct U { t : f32, aspect : f32 };
@group(0) @binding(0) var<uniform> u : U;

@vertex
fn vs(@builtin(vertex_index) i : u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>, 3>(vec2(-1.0, -3.0), vec2(-1.0, 1.0), vec2(3.0, 1.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}

${userBody}

@fragment
fn fs(@builtin(position) frag : vec4<f32>) -> @location(0) vec4<f32> {
  let uv = frag.xy / vec2<f32>(512.0, 512.0);
  return vec4<f32>(shade(uv, u.t), 1.0);
}
`;
}

/** Edit a WGSL fragment shader; recompile on the fly and see it on a canvas. */
export function ShaderEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState(DEFAULT_FRAG);
  const [status, setStatus] = useState<string>("compiling…");
  const rebuildRef = useRef<((body: string) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!webgpuSupported()) { setStatus("WebGPU not available"); return; }
    const canvas = canvasRef.current!;
    let stop: (() => void) | null = null;
    let disposed = false;

    initWebGPU(canvas).then((gpu) => {
      if (disposed) { gpu.device.destroy(); return; }
      const { device, context, format } = gpu;
      const ubuf = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      let pipeline: GPURenderPipeline | null = null;
      let bind: GPUBindGroup | null = null;

      async function rebuild(body: string) {
        const code = buildWGSL(body);
        const module = device.createShaderModule({ code });
        const info = await module.getCompilationInfo();
        const errs = info.messages.filter((m) => m.type === "error");
        if (errs.length) {
          setStatus("✗ " + errs.map((e) => `line ${e.lineNum}: ${e.message}`).join(" · "));
          return;
        }
        const p = device.createRenderPipeline({
          layout: "auto",
          vertex: { module, entryPoint: "vs" },
          fragment: { module, entryPoint: "fs", targets: [{ format }] },
          primitive: { topology: "triangle-list" },
        });
        pipeline = p;
        bind = device.createBindGroup({ layout: p.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
        setStatus("✓ compiled");
      }
      rebuildRef.current = rebuild;
      rebuild(src);

      const loop = startLoop((t) => {
        const [w, h] = resizeToDisplay(canvas);
        if (!pipeline || !bind) return;
        device.queue.writeBuffer(ubuf, 0, new Float32Array([t, w / h]));
        const enc = device.createCommandEncoder();
        const pass = enc.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: "clear", storeOp: "store",
          }],
        });
        pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
        device.queue.submit([enc.finish()]);
      });
      stop = () => { loop.stop(); ubuf.destroy(); };
    }).catch((e) => setStatus(String(e.message ?? e)));

    return () => { disposed = true; stop?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced recompile as the user types.
  useEffect(() => {
    const id = setTimeout(() => rebuildRef.current?.(src), 400);
    return () => clearTimeout(id);
  }, [src]);

  return (
    <div className="widget">
      <div className="wtitle"><span className="dotlive" /> Live shader · edit and watch it recompile</div>
      <div className="wbody">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <canvas ref={canvasRef} style={{ width: 260, height: 260, flex: "none" }} />
          <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column" }}>
            <textarea
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, minHeight: 200, width: "100%", background: "var(--bg-inset)",
                color: "var(--text)", border: "1px solid var(--border-bright)", borderRadius: 8,
                padding: "0.6rem 0.8rem", fontFamily: "var(--mono)", fontSize: "0.8rem", resize: "vertical",
              }}
            />
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", marginTop: 6, color: status.startsWith("✓") ? "var(--good)" : "var(--bad)" }}>
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
