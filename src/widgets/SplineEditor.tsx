import { useEffect, useRef, useState } from "react";
import type { P2 } from "../engine/spline";
import { catmullRomChain, extrudeRibbon, arcLength } from "../engine/spline";
export function SplineEditor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pts, setPts] = useState<P2[]>([
        [80, 220], [200, 120], [340, 200], [460, 110],
    ]);
    const [halfWidth, setHalfWidth] = useState(14);
    const [showRibbon, setShowRibbon] = useState(true);
    const drag = useRef<number | null>(null);
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = canvas.clientWidth, H = 300;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const curve = catmullRomChain(pts, 20);
        if (showRibbon && curve.length > 1) {
            const { left, right } = extrudeRibbon(curve, halfWidth);
            ctx.fillStyle = "rgba(255,176,0,0.18)";
            ctx.beginPath();
            ctx.moveTo(left[0][0], left[0][1]);
            for (const p of left)
                ctx.lineTo(p[0], p[1]);
            for (let i = right.length - 1; i >= 0; i--)
                ctx.lineTo(right[i][0], right[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(255,176,0,0.35)";
            ctx.lineWidth = 1;
            for (let i = 0; i < left.length; i++) {
                ctx.beginPath();
                ctx.moveTo(left[i][0], left[i][1]);
                ctx.lineTo(right[i][0], right[i][1]);
                ctx.stroke();
            }
        }
        ctx.strokeStyle = "#FFD35C";
        ctx.lineWidth = 2;
        ctx.beginPath();
        curve.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
        ctx.stroke();
        ctx.strokeStyle = "#3A3F4B";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
        ctx.stroke();
        ctx.setLineDash([]);
        pts.forEach((p, i) => {
            ctx.fillStyle = "#FFD35C";
            ctx.beginPath();
            ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1A1205";
            ctx.font = "600 10px ui-monospace, monospace";
            ctx.fillText(String(i), p[0] - 3, p[1] + 3);
        });
    }, [pts, halfWidth, showRibbon]);
    function hitTest(mx: number, my: number): number | null {
        for (let i = 0; i < pts.length; i++) {
            if (Math.hypot(mx - pts[i][0], my - pts[i][1]) < 12)
                return i;
        }
        return null;
    }
    function onDown(e: React.PointerEvent) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const hit = hitTest(mx, my);
        if (hit !== null) {
            drag.current = hit;
            (e.target as Element).setPointerCapture(e.pointerId);
        }
        else {
            setPts((p) => [...p, [mx, my]]);
        }
    }
    function onMove(e: React.PointerEvent) {
        if (drag.current === null)
            return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        setPts((p) => p.map((q, i) => (i === drag.current ? [mx, my] : q)));
    }
    const curveLen = arcLength(catmullRomChain(pts, 20));
    const triCount = Math.max(0, (catmullRomChain(pts, 20).length - 1) * 2);
    return (<div className="widget">
      <div className="wtitle"><span className="dotlive"/> Spline → wall · click to add points, drag to move</div>
      <div className="wbody">
        <canvas ref={canvasRef} style={{ height: 300, cursor: "crosshair" }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)}/>
        <div className="controls">
          <div className="ctl">
            <label>wall width</label>
            <input type="range" min={2} max={40} step={1} value={halfWidth} onChange={(e) => setHalfWidth(+e.target.value)}/>
            <output>{halfWidth * 2}px</output>
          </div>
          <div className="ctl">
            <label>show mesh</label>
            <input type="checkbox" checked={showRibbon} onChange={(e) => setShowRibbon(e.target.checked)} style={{ justifySelf: "start" }}/>
            <output />
          </div>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => setPts(pts.slice(0, -1))} disabled={pts.length <= 2}>undo point</button>
          <button className="btn" onClick={() => setPts([[80, 220], [200, 120], [340, 200], [460, 110]])}>reset</button>
        </div>
        <div className="readout">
          <div>control points: <b>{pts.length}</b> &nbsp; curve length: <b>{curveLen.toFixed(0)}px</b></div>
          <div>generated wall mesh: <b>{triCount}</b> triangles (a strip of {triCount / 2} quads)</div>
        </div>
      </div>
    </div>);
}
