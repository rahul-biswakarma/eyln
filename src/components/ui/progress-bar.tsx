import { cn } from "../../lib/cn";

/** Thin progress bar. `value` is 0..1. Fill color follows --mod-accent when set. */
export function ProgressBar({ value, className, fillStyle }: { value: number; className?: string; fillStyle?: React.CSSProperties }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn("h-[3px] rounded-[3px] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] overflow-hidden relative flex-1", className)}>
      <i
        className="block h-full rounded-[3px] bg-[var(--mod-accent,var(--accent))] transition-[width] duration-[600ms] ease-brand"
        style={{ width: `${pct}%`, ...fillStyle }}
      />
    </div>
  );
}
