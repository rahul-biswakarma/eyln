import { useEffect, useRef, useState } from "react";
import type { Vec2 } from "../engine/vec";
import { dot2, cross2, len2, angleBetween, DEG } from "../engine/vec";

export function VectorPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [a, setA] = useState<Vec2>([2, 1]);
  const [b, setB] = useState<Vec2>([-1, 2]);
  const dragging = useRef<null | "a" | "b">(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = W / 2, cy = H / 2;
    const unit = 45; 
    const toScreen = (v: Vec2): Vec2 => [cx + v[0] * unit, cy - v[1] * unit];

    ctx.clearRect(0, 0, W, H);
    
    ctx.strokeStyle = "#1A1D26";
    ctx.lineWidth = 1;
    for (let x = cx % unit; x < W; x += unit) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = cy % unit; y < H; y += unit) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    
    ctx.strokeStyle = "#3A3F4B";
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    const arrow = (v: Vec2, color: string, label: string) => {
      const [sx, sy] = toScreen(v);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy); ctx.stroke();
      const ang = Math.atan2(sy - cy, sx - cx);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - 12 * Math.cos(ang - 0.4), sy - 12 * Math.sin(ang - 0.4));
      ctx.lineTo(sx - 12 * Math.cos(ang + 0.4), sy - 12 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();
      ctx.font = "600 14px ui-monospace, monospace";
      ctx.fillText(label, sx + 8, sy - 6);
    };

    const [ax, ay] = toScreen(a);
    const [bx, by] = toScreen(b);
    ctx.fillStyle = "rgba(255,176,0,0.12)";
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(ax, ay);
    ctx.lineTo(ax + bx - cx, ay + by - cy); ctx.lineTo(bx, by);
    ctx.closePath(); ctx.fill();

    arrow(a, "#FFB000", "a");
    arrow(b, "#F4F4F5", "b");
  }, [a, b]);

  function pick(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2, cy = 300 / 2, unit = 45;
    const mx = (e.clientX - rect.left - cx) / unit;
    const my = -(e.clientY - rect.top - cy) / unit;
    const da = Math.hypot(mx - a[0], my - a[1]);
    const db = Math.hypot(mx - b[0], my - b[1]);
    dragging.current = da < db ? "a" : "b";
    move(e);
  }
  function move(e: React.PointerEvent) {
    if (!dragging.current) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2, cy = 300 / 2, unit = 45;
    const mx = Math.round(((e.clientX - rect.left - cx) / unit) * 2) / 2;
    const my = Math.round((-(e.clientY - rect.top - cy) / unit) * 2) / 2;
    if (dragging.current === "a") setA([mx, my]);
    else setB([mx, my]);
  }

  const d = dot2(a, b);
  const c = cross2(a, b);
  const ang = angleBetween(a, b) * DEG;

  return (
    <div className="widget">
      <div className="wtitle"><span className="dotlive" /> Vector playground · drag the arrows</div>
      <div className="wbody">
        <canvas
          ref={canvasRef}
          style={{ height: 300, cursor: "grab" }}
          onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); pick(e); }}
          onPointerMove={move}
          onPointerUp={() => (dragging.current = null)}
        />
        <div className="readout">
          <div>a = <b>({a[0].toFixed(1)}, {a[1].toFixed(1)})</b>&nbsp;&nbsp; |a| = <b>{len2(a).toFixed(2)}</b></div>
          <div>b = <b>({b[0].toFixed(1)}, {b[1].toFixed(1)})</b>&nbsp;&nbsp; |b| = <b>{len2(b).toFixed(2)}</b></div>
          <div>a · b = <b>{d.toFixed(2)}</b> &nbsp; {d > 0.01 ? "(&lt;90°, pointing similarly)" : d < -0.01 ? "(&gt;90°, opposed)" : "(perpendicular!)"}</div>
          <div>a × b (z) = <b>{c.toFixed(2)}</b> &nbsp; (signed area of the shaded parallelogram)</div>
          <div>angle = <b>{ang.toFixed(1)}°</b></div>
        </div>
      </div>
    </div>
  );
}
