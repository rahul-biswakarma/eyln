import * as React from "react";
import { cn } from "../../lib/cn";

type Tone = "default" | "dep" | "time";

const TONE: Record<Tone, string> = {
  default: "text-text-dim border-border",
  dep: "text-accent border-border-glow",
  time: "text-text-dim border-border",
};

export function Badge({ tone = "default", className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "font-mono text-[0.7rem] px-[0.6rem] py-[0.2rem] rounded-pill border bg-surface tracking-[0.03em]",
        TONE[tone],
        className
      )}
      {...props}
    />
  );
}
