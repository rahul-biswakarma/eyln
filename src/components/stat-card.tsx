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
      <div className="label">{icon}<span>{label}</span></div>
      <div className="value">{value}</div>
      {foot && <div className="foot">{foot}</div>}
      {children}
    </div>);
}
