import { WebGPUCanvas } from "../components/WebGPUCanvas";
import { makeBuffer, resizeToDisplay, startLoop } from "../engine/webgpu/gpu";

const WGSL = /* wgsl */ `
struct VSOut { @builtin(position) pos : vec4<f32>, @location(0) color : vec3<f32> };
@vertex
fn vs(@location(0) p : vec2<f32>, @location(1) c : vec3<f32>) -> VSOut {
  var o : VSOut; o.pos = vec4<f32>(p, 0.0, 1.0); o.color = c; return o;
}
@fragment
fn fs(i : VSOut) -> @location(0) vec4<f32> { return vec4<f32>(i.color, 1.0); }
`;

/** The "hello triangle" of graphics — the smoke test for the whole pipeline. */
export function TriangleDemo() {
  return (
    <WebGPUCanvas
      title="Hello, triangle — the whole pipeline in one draw call"
      height={300}
      setup={(gpu) => {
        const { device, context, format, canvas } = gpu;
        // 3 verts: x, y, r, g, b
        const verts = new Float32Array([
          0.0, 0.7, 1.0, 0.48, 0.27,
          -0.7, -0.6, 0.31, 0.7, 1.0,
          0.7, -0.6, 0.35, 0.83, 0.55,
        ]);
        const vbuf = makeBuffer(device, verts, GPUBufferUsage.VERTEX);
        const module = device.createShaderModule({ code: WGSL });
        const pipeline = device.createRenderPipeline({
          layout: "auto",
          vertex: {
            module, entryPoint: "vs",
            buffers: [{
              arrayStride: 20,
              attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x2" },
                { shaderLocation: 1, offset: 8, format: "float32x3" },
              ],
            }],
          },
          fragment: { module, entryPoint: "fs", targets: [{ format }] },
          primitive: { topology: "triangle-list" },
        });
        const loop = startLoop(() => {
          resizeToDisplay(canvas);
          const enc = device.createCommandEncoder();
          const pass = enc.beginRenderPass({
            colorAttachments: [{
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0.043, g: 0.043, b: 0.055, a: 1 },
              loadOp: "clear", storeOp: "store",
            }],
          });
          pass.setPipeline(pipeline); pass.setVertexBuffer(0, vbuf); pass.draw(3); pass.end();
          device.queue.submit([enc.finish()]);
        });
        return () => { loop.stop(); vbuf.destroy(); };
      }}
    />
  );
}
