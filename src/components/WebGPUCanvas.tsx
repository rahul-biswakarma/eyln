import { useEffect, useRef, useState } from "react";
import { initWebGPU, webgpuSupported, type GpuContext } from "../engine/webgpu/gpu";

interface Props {
  
  setup: (ctx: GpuContext) => void | (() => void);
  height?: number;
  title?: string;
  
  children?: React.ReactNode;
}

export function WebGPUCanvas({ setup, height = 320, title = "WebGPU · live", children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cleanup: void | (() => void);
    let cancelled = false;

    initWebGPU(canvas)
      .then((ctx) => {
        if (cancelled) {
          ctx.device.destroy();
          return;
        }
        cleanup = setup(ctx);
      })
      .catch((e) => setError(String(e?.message ?? e)));

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
    
  }, []);

  if (!webgpuSupported()) {
    return (
      <div className="widget">
        <div className="wtitle">{title}</div>
        <div className="wbody">
          <div className="notice warn">
            <span className="lbl">WebGPU unavailable</span>
            This live demo needs WebGPU. Use Chrome, Edge, or Safari 18+ on macOS. The concept is
            explained in the text and code below regardless.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="wtitle">
        <span className="dotlive" /> {title}
      </div>
      <div className="wbody">
        {error ? (
          <div className="notice warn">
            <span className="lbl">GPU error</span>
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} style={{ height }} />
        )}
        {!error && children}
      </div>
    </div>
  );
}
