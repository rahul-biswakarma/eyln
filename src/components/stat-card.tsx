import type { ReactNode } from "react";
export function StatCard({ label, value, icon, foot, children, className }: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    foot?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    return (<div className={`card stat-card hover ${className ?? ""}`}>
      <div className="flex items-center gap-[0.4rem] font-mono text-[0.72rem] uppercase tracking-[0.1em] text-text-faint">{icon}<span>{label}</span></div>
      <div className="stat-card-value mt-[0.5rem] font-display text-[2.1rem] font-semibold tracking-[-0.03em] text-text">{value}</div>
      {foot && <div className="mt-[0.4rem] flex items-center gap-[0.5rem] text-[0.78rem] text-text-faint">{foot}</div>}
      {children}
    </div>);
}
