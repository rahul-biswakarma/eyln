import * as React from "react";
import { cn } from "../../lib/cn";

const BASE =
  "inline-flex items-center gap-[0.45rem] px-[0.95rem] py-[0.45rem] rounded-pill border text-[0.82rem] font-medium cursor-pointer " +
  "transition-[color,border-color,background] duration-200 ease-brand";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  ghost?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active, ghost, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        BASE,
        ghost ? "bg-transparent border-border text-text-dim" : "bg-surface border-border text-text-dim",
        !active && "hover:text-text hover:border-border-bright",
        active && "!bg-accent-soft text-highlight !border-border-glow",
        className
      )}
      {...props}
    />
  )
);
Chip.displayName = "Chip";
