import { useEffect, useRef, useState } from "react";
import { fbm, type NoiseKind } from "../engine/noise";

export function NoiseExplorer() {
  const mapRef = useRef<HTMLCanvasElement>(null);
  const terrRef = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<NoiseKind>("perlin");
  const [octaves, setOctaves] = useState(5);
  const [freq, setFreq] = useState(3);
  const [gain, setGain] = useState(0.5);
  const [ridged, setRidged] = useState(false);
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    const N = 96;
    const heights: number[] = new Array(N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        heights[y * N + x] = fbm(x / N, y / N, {
          kind, octaves, frequency: freq, lacunarity: 2, gain, ridged, seed,
        });
      }
    }

    const map = mapRef.current!;
    const mctx = map.getContext("2d")!;
    const size = Math.min(map.clientWidth, 220);
    map.width = size; map.height = size;
    const img = mctx.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const v = Math.floor(heights[i] * 255);
      img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
    }
    createImageBitmap(img).then((bmp) => {
      mctx.imageSmoothingEnabled = false;
      mctx.clearRect(0, 0, size, size);
      mctx.drawImage(bmp, 0, 0, size, size);
    });

    const terr = terrRef.current!;
    const tctx = terr.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = terr.clientWidth, H = 260;
    terr.width = W * dpr; terr.height = H * dpr;
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, W, H);
    const step = 3;
    const tile = W / (N + 20);
    const zScale = 60;
    
    for (let y = 0; y < N - step; y += step) {
      for (let x = 0; x < N - step; x += step) {
        const h = heights[y * N + x];
        const hx = heights[y * N + Math.min(N - 1, x + step)];
        const hy = heights[Math.min(N - 1, (y + step)) * N + x];
        
        const nx = h - hx, ny = h - hy, nz = 0.08;
        const nl = Math.max(0.2, (nx * 0.5 + ny * 0.5 + nz) / Math.hypot(nx, ny, nz) + 0.4);
        const iso_x = (x - y) * tile * 0.5 + W / 2;
        const iso_y = (x + y) * tile * 0.28 - h * zScale + 40;
        
        let col: [number, number, number];
        if (h < 0.35) col = [40, 90, 140];
        else if (h < 0.55) col = [70, 130, 70];
        else if (h < 0.75) col = [110, 100, 90];
        else col = [220, 220, 230];
        const shade = Math.min(1, nl);
        tctx.fillStyle = `rgb(${col[0] * shade | 0},${col[1] * shade | 0},${col[2] * shade | 0})`;
        tctx.fillRect(iso_x, iso_y, tile * step + 1, tile * step + 1);
      }
    }
  }, [kind, octaves, freq, gain, ridged, seed]);

  return (
    <div className="widget">
      <div className="wtitle"><span className="dotlive" /> Noise explorer · heightmap → terrain</div>
      <div className="wbody">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <canvas ref={mapRef} style={{ width: 220, height: 220, imageRendering: "pixelated", flex: "none" }} />
          <canvas ref={terrRef} style={{ height: 260, flex: 1, minWidth: 240 }} />
        </div>
        <div className="controls">
          <div className="ctl">
            <label>type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as NoiseKind)}>
              <option value="value">value</option>
              <option value="perlin">perlin</option>
              <option value="simplex">simplex</option>
            </select>
            <output />
          </div>
          <div className="ctl">
            <label>octaves</label>
            <input type="range" min={1} max={8} step={1} value={octaves} onChange={(e) => setOctaves(+e.target.value)} />
            <output>{octaves}</output>
          </div>
          <div className="ctl">
            <label>frequency</label>
            <input type="range" min={1} max={10} step={0.5} value={freq} onChange={(e) => setFreq(+e.target.value)} />
            <output>{freq.toFixed(1)}</output>
          </div>
          <div className="ctl">
            <label>gain</label>
            <input type="range" min={0.2} max={0.8} step={0.05} value={gain} onChange={(e) => setGain(+e.target.value)} />
            <output>{gain.toFixed(2)}</output>
          </div>
          <div className="ctl">
            <label>seed</label>
            <input type="range" min={1} max={20} step={1} value={seed} onChange={(e) => setSeed(+e.target.value)} />
            <output>{seed}</output>
          </div>
          <div className="ctl">
            <label>ridged</label>
            <input type="checkbox" checked={ridged} onChange={(e) => setRidged(e.target.checked)} style={{ justifySelf: "start" }} />
            <output />
          </div>
        </div>
      </div>
    </div>
  );
}
