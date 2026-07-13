export function ProgressRing({ value, size = 40, stroke = 4, showText = true }: {
    value: number;
    size?: number;
    stroke?: number;
    showText?: boolean;
}) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, value)));
    return (<div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ringgrad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 0.5s ease" }}/>
        <defs>
          <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD35C"/>
            <stop offset="100%" stopColor="#FF8A00"/>
          </linearGradient>
        </defs>
      </svg>
      {showText && <span className="rtxt">{Math.round(value * 100)}</span>}
    </div>);
}
