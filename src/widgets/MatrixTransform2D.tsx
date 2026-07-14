import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui";
export function MatrixTransform2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [m, setM] = useState({ a: 1, b: 0, c: 0, d: 1 });
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = canvas.clientWidth, H = 320;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cx = W / 2, cy = H / 2, unit = 40;
        const apply = (x: number, y: number): [
            number,
            number
        ] => [
            m.a * x + m.c * y,
            m.b * x + m.d * y,
        ];
        const toScreen = (x: number, y: number): [
            number,
            number
        ] => [cx + x * unit, cy - y * unit];
        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = "#1E212B";
        ctx.lineWidth = 1;
        for (let i = -6; i <= 6; i++) {
            let p = toScreen(...apply(i, -6));
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            p = toScreen(...apply(i, 6));
            ctx.lineTo(p[0], p[1]);
            ctx.stroke();
            p = toScreen(...apply(-6, i));
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            p = toScreen(...apply(6, i));
            ctx.lineTo(p[0], p[1]);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,176,0,0.14)";
        ctx.strokeStyle = "#FFB000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sq: [
            number,
            number
        ][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
        sq.forEach((p, i) => {
            const s = toScreen(...apply(p[0], p[1]));
            i === 0 ? ctx.moveTo(s[0], s[1]) : ctx.lineTo(s[0], s[1]);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        const drawBasis = (vx: number, vy: number, color: string, label: string) => {
            const s = toScreen(vx, vy);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(s[0], s[1]);
            ctx.stroke();
            ctx.font = "600 13px ui-monospace, monospace";
            ctx.fillText(label, s[0] + 6, s[1] - 4);
        };
        drawBasis(m.a, m.b, "#FFB000", "î");
        drawBasis(m.c, m.d, "#F4F4F5", "ĵ");
    }, [m]);
    const det = m.a * m.d - m.b * m.c;
    const presets = {
        identity: { a: 1, b: 0, c: 0, d: 1 },
        rotate45: { a: 0.707, b: 0.707, c: -0.707, d: 0.707 },
        scale2x: { a: 2, b: 0, c: 0, d: 2 },
        shear: { a: 1, b: 0, c: 1, d: 1 },
        flip: { a: -1, b: 0, c: 0, d: 1 },
    };
    const slider = (key: keyof typeof m, label: string) => (<div className="ctl">
      <label>{label}</label>
      <input type="range" min={-2} max={2} step={0.05} value={m[key]} onChange={(e) => setM({ ...m, [key]: +e.target.value })}/>
      <output>{m[key].toFixed(2)}</output>
    </div>);
    return (<div className="widget">
      <div className="wtitle"><span className="dotlive"/> 2×2 matrix · watch space deform</div>
      <div className="wbody">
        <canvas ref={canvasRef} style={{ height: 320 }}/>
        <div className="controls">
          {slider("a", "a (î.x)")}
          {slider("b", "b (î.y)")}
          {slider("c", "c (ĵ.x)")}
          {slider("d", "d (ĵ.y)")}
        </div>
        <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {Object.entries(presets).map(([k, v]) => (<Button key={k} size="sm" onClick={() => setM(v)}>{k}</Button>))}
        </div>
        <div className="readout">
          <div>M = [ <b>{m.a.toFixed(2)} {m.c.toFixed(2)}</b> ; <b>{m.b.toFixed(2)} {m.d.toFixed(2)}</b> ]</div>
          <div>det(M) = <b>{det.toFixed(2)}</b> — area scale factor {det < 0 ? "(negative ⇒ space is flipped)" : ""}</div>
        </div>
      </div>
    </div>);
}
