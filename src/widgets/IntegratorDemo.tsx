import { useEffect, useRef, useState } from "react";

type Method = "euler" | "semi" | "verlet";

/** A bouncing ball under gravity, integrated three ways, side by side. */
export function IntegratorDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [method, setMethod] = useState<Method>("semi");
  const [dt, setDt] = useState(0.016);
  const [restitution, setRestitution] = useState(0.7);
  const cfg = useRef({ method, dt, restitution });
  cfg.current = { method, dt, restitution };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = 280;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = 900; // px/s^2
    const floor = H - 20;
    let y = 40, vy = 0, prevY = 40;
    let raf = 0, acc = 0, last = performance.now();

    const trail: number[] = [];

    const step = (h: number) => {
      const m = cfg.current.method;
      const e = cfg.current.restitution;
      if (m === "euler") {
        // explicit Euler: update pos with OLD velocity (gains energy)
        y += vy * h;
        vy += g * h;
      } else if (m === "semi") {
        // semi-implicit Euler: update velocity first (stable — game standard)
        vy += g * h;
        y += vy * h;
      } else {
        // position Verlet
        const nextY = 2 * y - prevY + g * h * h;
        prevY = y; y = nextY;
        vy = (y - prevY) / h;
      }
      if (y > floor) {
        y = floor;
        if (m === "verlet") { prevY = y + vy * h * e; }
        else vy = -vy * e;
      }
    };

    const frame = (now: number) => {
      const h = cfg.current.dt;
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      while (acc >= h) { step(h); acc -= h; }

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#3A3F4B"; ctx.beginPath(); ctx.moveTo(0, floor + 10); ctx.lineTo(W, floor + 10); ctx.stroke();
      trail.push(y); if (trail.length > 120) trail.shift();
      trail.forEach((ty, i) => {
        ctx.fillStyle = `rgba(255,211,92,${i / trail.length * 0.5})`;
        ctx.beginPath(); ctx.arc(W / 2, ty, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = "#FFB000";
      ctx.beginPath(); ctx.arc(W / 2, y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.font = "12px ui-monospace, monospace"; ctx.fillStyle = "#A3A9B8";
      ctx.fillText(`v = ${vy.toFixed(0)} px/s`, 12, 20);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="widget">
      <div className="wtitle"><span className="dotlive" /> Integrators · a ball under gravity</div>
      <div className="wbody">
        <canvas ref={canvasRef} style={{ height: 280 }} />
        <div className="controls">
          <div className="ctl">
            <label>method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as Method)}>
              <option value="euler">explicit Euler</option>
              <option value="semi">semi-implicit Euler</option>
              <option value="verlet">position Verlet</option>
            </select>
            <output />
          </div>
          <div className="ctl">
            <label>timestep dt</label>
            <input type="range" min={0.004} max={0.05} step={0.002} value={dt} onChange={(e) => setDt(+e.target.value)} />
            <output>{(dt * 1000).toFixed(0)}ms</output>
          </div>
          <div className="ctl">
            <label>bounciness</label>
            <input type="range" min={0} max={0.95} step={0.05} value={restitution} onChange={(e) => setRestitution(+e.target.value)} />
            <output>{restitution.toFixed(2)}</output>
          </div>
        </div>
        <div className="readout">
          <div>Pick <b>explicit Euler</b> and raise dt — the ball gains energy and bounces higher each time (unstable).</div>
          <div><b>Semi-implicit Euler</b> stays stable at the same dt. That's why it's the game-dev default.</div>
        </div>
      </div>
    </div>
  );
}
