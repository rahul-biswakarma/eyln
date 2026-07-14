import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/cn";

const ROOT =
  "w-9 h-5 bg-surface-inset border border-border rounded-full relative cursor-pointer outline-none " +
  "transition-colors duration-200 ease-brand data-[state=checked]:bg-accent-soft data-[state=checked]:border-accent";
const THUMB =
  "block w-[14px] h-[14px] bg-text-faint rounded-full translate-x-[2px] " +
  "transition-transform duration-200 ease-brand data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-accent";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root className={cn(ROOT, className)} {...props} ref={ref}>
    <SwitchPrimitive.Thumb className={THUMB} />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
