import { useRef, useState } from "react";
import { WebGPUCanvas } from "../components/WebGPUCanvas";
import { makeBuffer, resizeToDisplay, startLoop } from "../engine/webgpu/gpu";
import { identity, mul, perspective, lookAt, rotateY, rotateX, scaling } from "../engine/mat";

const WGSL = /* wgsl */ `
struct Uniforms { mvp : mat4x4<f32>, };
@group(0) @binding(0) var<uniform> u : Uniforms;

struct VSOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) color : vec3<f32>,
};

@vertex
fn vs(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VSOut {
  var o : VSOut;
  o.pos = u.mvp * vec4<f32>(position, 1.0);
  o.color = color;
  return o;
}

@fragment
fn fs(in : VSOut) -> @location(0) vec4<f32> {
  return vec4<f32>(in.color, 1.0);
}
`;

// A unit cube: 8 corners, 12 triangles, per-face-ish vertex colors.
function cubeData(): Float32Array {
  const c: [number, number, number][] = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const faces = [
    [0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7],
    [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0],
  ];
  const colors = [
    [1, 0.48, 0.27], [0.31, 0.7, 1], [0.35, 0.83, 0.55],
    [1, 0.81, 0.36], [0.8, 0.4, 0.9], [0.9, 0.3, 0.42],
  ];
  const verts: number[] = [];
  faces.forEach((f, fi) => {
    const [a, b, cc, d] = f;
    const col = colors[fi];
    const push = (idx: number) => verts.push(...c[idx], ...col);
    push(a); push(b); push(cc);
    push(a); push(cc); push(d);
  });
  return new Float32Array(verts);
}

/** The model → view → projection pipeline, live. Toggle each matrix on/off. */
export function TransformPipeline3D() {
  const [useModel, setUseModel] = useState(true);
  const [useView, setUseView] = useState(true);
  const [useProj, setUseProj] = useState(true);
  // refs so the render loop reads latest toggle state without re-creating the pipeline
  const flags = useRef({ useModel, useView, useProj });
  flags.current = { useModel, useView, useProj };

  return (
    <>
      <WebGPUCanvas
        title="Model · View · Projection — live cube"
        height={340}
        setup={(gpu) => {
          const { device, context, format, canvas } = gpu;
          const verts = cubeData();
          const vbuf = makeBuffer(device, verts, GPUBufferUsage.VERTEX);
          const ubuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

          const module = device.createShaderModule({ code: WGSL });
          const pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
              module, entryPoint: "vs",
              buffers: [{
                arrayStride: 24,
                attributes: [
                  { shaderLocation: 0, offset: 0, format: "float32x3" },
                  { shaderLocation: 1, offset: 12, format: "float32x3" },
                ],
              }],
            },
            fragment: { module, entryPoint: "fs", targets: [{ format }] },
            primitive: { topology: "triangle-list", cullMode: "back" },
            depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" },
          });
          const bind = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: ubuf } }],
          });

          let depthTex: GPUTexture | null = null;
          const loop = startLoop((t) => {
            const [w, h] = resizeToDisplay(canvas);
            if (!depthTex || depthTex.width !== w || depthTex.height !== h) {
              depthTex?.destroy();
              depthTex = device.createTexture({ size: [w, h], format: "depth24plus", usage: GPUTextureUsage.RENDER_ATTACHMENT });
            }
            const f = flags.current;
            const model = f.useModel ? mul(rotateY(t * 0.8), rotateX(t * 0.4)) : scaling([0.5, 0.5, 0.5]);
            const view = f.useView ? lookAt([0, 1.6, 5], [0, 0, 0], [0, 1, 0]) : identity();
            const proj = f.useProj ? perspective((60 * Math.PI) / 180, w / h, 0.1, 100) : identity();
            const mvp = mul(proj, mul(view, model));
            device.queue.writeBuffer(ubuf, 0, new Float32Array(mvp));

            const enc = device.createCommandEncoder();
            const pass = enc.beginRenderPass({
              colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0.02, g: 0.03, b: 0.04, a: 1 },
                loadOp: "clear", storeOp: "store",
              }],
              depthStencilAttachment: {
                view: depthTex.createView(),
                depthClearValue: 1, depthLoadOp: "clear", depthStoreOp: "store",
              },
            });
            pass.setPipeline(pipeline);
            pass.setBindGroup(0, bind);
            pass.setVertexBuffer(0, vbuf);
            pass.draw(verts.length / 6);
            pass.end();
            device.queue.submit([enc.finish()]);
          });

          return () => { loop.stop(); depthTex?.destroy(); vbuf.destroy(); ubuf.destroy(); };
        }}
      />
      <div className="widget" style={{ marginTop: "-0.6rem" }}>
        <div className="wbody">
          <div className="row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--mono)", fontSize: "0.82rem" }}>
              <input type="checkbox" checked={useModel} onChange={(e) => setUseModel(e.target.checked)} /> M_model (spin)
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--mono)", fontSize: "0.82rem" }}>
              <input type="checkbox" checked={useView} onChange={(e) => setUseView(e.target.checked)} /> M_view (camera)
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--mono)", fontSize: "0.82rem" }}>
              <input type="checkbox" checked={useProj} onChange={(e) => setUseProj(e.target.checked)} /> M_proj (perspective)
            </label>
          </div>
          <div className="readout">
            Turn off <b>M_proj</b>: the cube goes flat/orthographic. Turn off <b>M_view</b>: the camera
            snaps to the origin. Turn off <b>M_model</b>: the cube stops spinning. This is the whole
            <code> P_clip = M_proj · M_view · M_model · v</code> chain.
          </div>
        </div>
      </div>
    </>
  );
}
