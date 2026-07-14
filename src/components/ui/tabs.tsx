import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

export const Tabs = TabsPrimitive.Root;

const LIST = "flex border-b border-border bg-[rgba(19,22,29,0.3)]";
const TRIGGER =
  "flex-1 bg-none border-0 border-b-2 border-b-transparent text-text-faint font-display text-[0.82rem] font-medium " +
  "py-[0.8rem] cursor-pointer flex items-center justify-center gap-[0.4rem] transition-all duration-200 ease-brand " +
  "hover:text-text-dim hover:bg-[rgba(255,255,255,0.02)] data-[state=active]:text-text data-[state=active]:border-b-accent";

/** `unstyled` opts out of the default tab chrome so callers can fully restyle
 * (e.g. the reading-workspace tabs) without utility-order conflicts. */
type ListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { unstyled?: boolean };
type TriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { unstyled?: boolean };

export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, ListProps>(
  ({ className, unstyled, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={cn(!unstyled && LIST, className)} {...props} />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TriggerProps>(
  ({ className, unstyled, ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={cn(!unstyled && TRIGGER, className)} {...props} />
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("outline-none", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
