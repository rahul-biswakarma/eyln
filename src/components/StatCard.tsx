import type { ReactNode } from "react";

export function StatCard({ label, value, icon, foot, children }: {
  label: string; value: ReactNode; icon?: ReactNode; foot?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="card stat-card hover">
      <div className="label">{icon}<span>{label}</span></div>
      <div className="value">{value}</div>
      {foot && <div className="foot">{foot}</div>}
      {children}
    </div>
  );
}
