import * as React from "react";
import { cn } from "../../lib/cn";

type Variant = "default" | "primary" | "ghost" | "danger";
type Size = "default" | "sm" | "lg";

const BASE =
  "inline-flex items-center gap-[0.45rem] rounded-pill font-display font-medium cursor-pointer " +
  "transition-[border-color,background,transform,box-shadow] duration-200 ease-brand disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT: Record<Variant, string> = {
  default:
    "bg-surface text-text border border-border-bright hover:border-border-glow hover:bg-surface-2 hover:shadow-[0_0_0_1px_rgba(255,176,0,0.14)]",
  primary:
    "bg-[image:var(--accent-grad)] text-on-accent border border-transparent shadow-[0_6px_24px_rgba(255,138,0,0.32)] " +
    "hover:brightness-[1.06] hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(255,138,0,0.4)]",
  ghost: "bg-transparent border border-transparent text-text-dim hover:bg-surface-2 hover:text-text",
  danger:
    "bg-surface text-bad border border-[rgba(255,92,92,0.4)] hover:bg-[rgba(255,92,92,0.1)] hover:border-bad",
};

const SIZE: Record<Size, string> = {
  default: "px-[1.2rem] py-[0.6rem] text-[0.86rem]",
  sm: "px-[0.85rem] py-[0.45rem] text-[0.78rem]",
  lg: "px-[1.5rem] py-[0.8rem] text-[0.95rem]",
};

/** Button styling as a class string — for <Link>/<a> that should look like a Button. */
export function buttonClass(variant: Variant = "default", size: Size = "default", extra?: string): string {
  return cn(BASE, VARIANT[variant], SIZE[size], extra);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button ref={ref} className={cn(BASE, VARIANT[variant], SIZE[size], className)} {...props} />
  )
);
Button.displayName = "Button";
