export function Sparkline({ values, width = 120, height = 34 }: {
    values: number[];
    width?: number;
    height?: number;
}) {
    if (values.length === 0)
        return null;
    const max = Math.max(1, ...values);
    const n = values.length;
    const dx = n > 1 ? width / (n - 1) : width;
    const pts = values.map((v, i) => {
        const x = i * dx;
        const y = height - (v / max) * (height - 4) - 2;
        return [x, y] as const;
    });
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = `${line} L${width},${height} L0,${height} Z`;
    return (<svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,176,0,0.42)"/>
          <stop offset="100%" stopColor="rgba(255,176,0,0)"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)"/>
      <path d={line} fill="none" stroke="#FFB000" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
