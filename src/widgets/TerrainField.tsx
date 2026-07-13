import { useRef, useState } from "react";
import { WebGPUCanvas } from "../components/webgpu-canvas";
import { makeBuffer, resizeToDisplay, startLoop } from "../engine/webgpu/gpu";
import { mul, perspective, lookAt } from "../engine/mat";
import { fbm } from "../engine/noise";
const WGSL = `
struct U { mvp : mat4x4<f32> };
@group(0) @binding(0) var<uniform> u : U;
struct VSOut { @builtin(position) pos : vec4<f32>, @location(0) h : f32, @location(1) shade : f32 };

@vertex
fn vs(@location(0) p : vec3<f32>, @location(1) n : vec3<f32>) -> VSOut {
  var o : VSOut;
  o.pos = u.mvp * vec4<f32>(p, 1.0);
  o.h = p.y;
  let L = normalize(vec3<f32>(0.5, 0.8, 0.3));
  o.shade = clamp(dot(normalize(n), L) * 0.7 + 0.35, 0.0, 1.0);
  return o;
}

@fragment
fn fs(i : VSOut) -> @location(0) vec4<f32> {
  var col : vec3<f32>;
  let h = i.h;
  if (h < 0.05) { col = vec3<f32>(0.16, 0.35, 0.55); }
  else if (h < 0.25) { col = vec3<f32>(0.27, 0.5, 0.27); }
  else if (h < 0.5) { col = vec3<f32>(0.43, 0.39, 0.35); }
  else { col = vec3<f32>(0.86, 0.86, 0.9); }
  return vec4<f32>(col * i.shade, 1.0);
}
`;
export function TerrainField() {
    const params = useRef({ freq: 3, octaves: 5, seed: 3 });
    const [, force] = useState(0);
    const rebuild = useRef<(() => void) | null>(null);
    return (<>
      <WebGPUCanvas title="Heightfield terrain — a grid of ~15k triangles" height={360} setup={(gpu) => {
            const { device, context, format, canvas } = gpu;
            const N = 64;
            const ubuf = device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
            let vbuf: GPUBuffer | null = null;
            let vertCount = 0;
            function buildMesh() {
                const { freq, octaves, seed } = params.current;
                const heights: number[] = new Array((N + 1) * (N + 1));
                const H = (i: number, j: number) => fbm(i / N, j / N, { kind: "perlin", octaves, frequency: freq, lacunarity: 2, gain: 0.5, seed }) * 1.2;
                for (let j = 0; j <= N; j++)
                    for (let i = 0; i <= N; i++)
                        heights[j * (N + 1) + i] = H(i, j);
                const pos = (i: number, j: number): [
                    number,
                    number,
                    number
                ] => [
                    (i / N - 0.5) * 4, heights[j * (N + 1) + i], (j / N - 0.5) * 4,
                ];
                const normalAt = (i: number, j: number): [
                    number,
                    number,
                    number
                ] => {
                    const hl = heights[j * (N + 1) + Math.max(0, i - 1)];
                    const hr = heights[j * (N + 1) + Math.min(N, i + 1)];
                    const hd = heights[Math.max(0, j - 1) * (N + 1) + i];
                    const hu = heights[Math.min(N, j + 1) * (N + 1) + i];
                    const nx = hl - hr, nz = hd - hu, ny = 2 / N * 4;
                    const l = Math.hypot(nx, ny, nz) || 1;
                    return [nx / l, ny / l, nz / l];
                };
                const data: number[] = [];
                const push = (i: number, j: number) => { data.push(...pos(i, j), ...normalAt(i, j)); };
                for (let j = 0; j < N; j++)
                    for (let i = 0; i < N; i++) {
                        push(i, j);
                        push(i + 1, j);
                        push(i + 1, j + 1);
                        push(i, j);
                        push(i + 1, j + 1);
                        push(i, j + 1);
                    }
                vbuf?.destroy();
                const arr = new Float32Array(data);
                vbuf = makeBuffer(device, arr, GPUBufferUsage.VERTEX);
                vertCount = arr.length / 6;
            }
            buildMesh();
            rebuild.current = buildMesh;
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
                primitive: { topology: "triangle-list", cullMode: "none" },
                depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" },
            });
            const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ubuf } }] });
            let depthTex: GPUTexture | null = null;
            const loop = startLoop((t) => {
                const [w, h] = resizeToDisplay(canvas);
                if (!depthTex || depthTex.width !== w || depthTex.height !== h) {
                    depthTex?.destroy();
                    depthTex = device.createTexture({ size: [w, h], format: "depth24plus", usage: GPUTextureUsage.RENDER_ATTACHMENT });
                }
                const r = 5.5;
                const eye: [
                    number,
                    number,
                    number
                ] = [Math.cos(t * 0.25) * r, 3.2, Math.sin(t * 0.25) * r];
                const mvp = mul(perspective((55 * Math.PI) / 180, w / h, 0.1, 100), lookAt(eye, [0, 0.3, 0], [0, 1, 0]));
                device.queue.writeBuffer(ubuf, 0, new Float32Array(mvp));
                if (!vbuf)
                    return;
                const enc = device.createCommandEncoder();
                const pass = enc.beginRenderPass({
                    colorAttachments: [{ view: context.getCurrentTexture().createView(), clearValue: { r: 0.035, g: 0.035, b: 0.043, a: 1 }, loadOp: "clear", storeOp: "store" }],
                    depthStencilAttachment: { view: depthTex.createView(), depthClearValue: 1, depthLoadOp: "clear", depthStoreOp: "store" },
                });
                pass.setPipeline(pipeline);
                pass.setBindGroup(0, bind);
                pass.setVertexBuffer(0, vbuf);
                pass.draw(vertCount);
                pass.end();
                device.queue.submit([enc.finish()]);
            });
            return () => { loop.stop(); depthTex?.destroy(); vbuf?.destroy(); ubuf.destroy(); };
        }}/>
      <div className="widget" style={{ marginTop: "-0.6rem" }}>
        <div className="wbody">
          <div className="controls">
            <div className="ctl">
              <label>frequency</label>
              <input type="range" min={1} max={8} step={0.5} defaultValue={3} onChange={(e) => { params.current.freq = +e.target.value; rebuild.current?.(); force((x) => x + 1); }}/>
              <output>{params.current.freq.toFixed(1)}</output>
            </div>
            <div className="ctl">
              <label>octaves</label>
              <input type="range" min={1} max={8} step={1} defaultValue={5} onChange={(e) => { params.current.octaves = +e.target.value; rebuild.current?.(); force((x) => x + 1); }}/>
              <output>{params.current.octaves}</output>
            </div>
            <div className="ctl">
              <label>seed</label>
              <input type="range" min={1} max={12} step={1} defaultValue={3} onChange={(e) => { params.current.seed = +e.target.value; rebuild.current?.(); force((x) => x + 1); }}/>
              <output>{params.current.seed}</output>
            </div>
          </div>
        </div>
      </div>
    </>);
}
