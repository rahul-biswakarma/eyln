import * as React from "react";
import { cn } from "../../lib/cn";

/** Left-accent callout used throughout lesson content. `warn` uses the warn color. */
export function Notice({ warn, className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { warn?: boolean }) {
  return (
    <div
      className={cn(
        "border-l-2 bg-surface px-[1.1rem] py-[0.9rem] rounded-r-sm my-[1.6rem] text-[0.9rem] text-text-dim",
        // style inner `.lbl` spans (kept from the old .notice .lbl rule)
        "[&_.lbl]:block [&_.lbl]:font-mono [&_.lbl]:text-[0.68rem] [&_.lbl]:uppercase [&_.lbl]:tracking-[0.12em] [&_.lbl]:text-text-faint [&_.lbl]:mb-[0.25rem]",
        warn ? "border-l-warn" : "border-l-accent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Small uppercase label used inside a Notice (was .notice .lbl). */
export function NoticeLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-faint mb-[0.25rem]", className)} {...props} />;
}
