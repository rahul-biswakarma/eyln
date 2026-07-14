import * as React from "react";
import { cn } from "../../lib/cn";

const BASE =
  "relative overflow-hidden rounded bg-[linear-gradient(180deg,rgba(255,255,255,0.028),transparent_42%),var(--surface)] " +
  "border border-border p-[1.3rem_1.4rem] shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_30px_rgba(0,0,0,0.35)] " +
  "transition-[border-color,transform,box-shadow] duration-200 ease-brand " +
  "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

const HOVER =
  "hover:border-border-glow hover:-translate-y-[3px] hover:shadow-[var(--shadow),0_0_0_1px_rgba(255,176,0,0.14)]";

const GRAD =
  "!bg-[radial-gradient(120%_140%_at_100%_0%,rgba(255,138,0,0.20),transparent_55%),radial-gradient(120%_140%_at_0%_100%,rgba(255,176,0,0.16),transparent_55%),var(--surface-2)] " +
  "!border-border-glow shadow-[var(--accent-glow)]";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  grad?: boolean;
  as?: "div" | "a";
  href?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, grad, as = "div", ...props }, ref) => {
    const cls = cn(BASE, hover && HOVER, grad && GRAD, className);
    if (as === "a") {
      return <a ref={ref as React.Ref<HTMLAnchorElement>} className={cls} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} />;
    }
    return <div ref={ref} className={cls} {...props} />;
  }
);
Card.displayName = "Card";
