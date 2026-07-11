export interface GpuContext {
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  canvas: HTMLCanvasElement;
}

export function webgpuSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function initWebGPU(canvas: HTMLCanvasElement): Promise<GpuContext> {
  if (!webgpuSupported()) {
    throw new Error("WebGPU is not available in this browser.");
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("No suitable GPU adapter found.");
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });
  return { device, context, format, canvas };
}

export function resizeToDisplay(canvas: HTMLCanvasElement, maxDpr = 2): [number, number] {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return [w, h];
}

export interface Loop {
  stop: () => void;
}

export function startLoop(fn: (tSec: number, dt: number) => void): Loop {
  let raf = 0;
  let last = performance.now();
  let stopped = false;
  const tick = (now: number) => {
    if (stopped) return;
    const dt = (now - last) / 1000;
    last = now;
    fn(now / 1000, dt);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(raf);
    },
  };
}

export function makeBuffer(
  device: GPUDevice,
  data: Float32Array | Uint16Array | Uint32Array,
  usage: GPUBufferUsageFlags
): GPUBuffer {
  const buf = device.createBuffer({
    size: (data.byteLength + 3) & ~3, 
    usage: usage | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });
  const Ctor = data.constructor as
    | Float32ArrayConstructor
    | Uint16ArrayConstructor
    | Uint32ArrayConstructor;
  new Ctor(buf.getMappedRange()).set(data as never);
  buf.unmap();
  return buf;
}
