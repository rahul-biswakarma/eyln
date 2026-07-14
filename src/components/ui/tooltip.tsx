import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;

const CONTENT =
  "bg-[rgba(19,22,29,0.94)] backdrop-blur-[12px] border border-border-bright text-text " +
  "px-[0.7rem] py-[0.4rem] rounded-sm text-[0.76rem] font-sans " +
  "shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_10px_rgba(255,176,0,0.1)] " +
  "animate-[tt-rise_0.15s_var(--ease)_both] z-[200] max-w-[240px]";

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn(CONTENT, className)} {...props} />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface TooltipProps extends Omit<React.ComponentPropsWithoutRef<typeof TooltipContent>, "content"> {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
}
export function Tooltip({ children, content, delayDuration = 200, ...props }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...props}>
            {content}
            <TooltipPrimitive.Arrow className="fill-border-bright" />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipPrimitive.Provider>
  );
}
