import type { ReactNode } from "react";
import { Card } from "./ui";
import { cn } from "../lib/cn";

export function StatCard({ label, value, icon, foot, children, urgent, className }: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  foot?: ReactNode;
  children?: ReactNode;
  urgent?: boolean;
  className?: string;
}) {
  return (
    <Card
      hover
      className={cn(urgent && "!border-accent shadow-[inset_0_0_10px_rgba(255,176,0,0.05),0_0_12px_rgba(255,176,0,0.08)]", className)}
    >
      <div className="flex items-center gap-[0.4rem] font-mono text-[0.72rem] uppercase tracking-[0.1em] text-text-faint">{icon}<span>{label}</span></div>
      <div className={cn("mt-[0.5rem] font-display text-[2.1rem] font-semibold tracking-[-0.03em]", urgent ? "text-accent" : "text-text")}>{value}</div>
      {foot && <div className="mt-[0.4rem] flex items-center gap-[0.5rem] text-[0.78rem] text-text-faint">{foot}</div>}
      {children}
    </Card>
  );
}

/** Small up/down delta pill used in stat footers. */
export function Delta({ up, children }: { up: boolean; children: ReactNode }) {
  return (
    <span className={cn(
      "font-mono text-[0.74rem] font-semibold px-[0.5rem] py-[0.1rem] rounded-pill",
      up ? "text-good bg-[rgba(70,217,138,0.1)]" : "text-warn bg-[rgba(255,211,92,0.12)]"
    )}>
      {children}
    </span>
  );
}
