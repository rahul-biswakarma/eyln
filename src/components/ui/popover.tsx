import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverPortal = PopoverPrimitive.Portal;
export const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (<PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className="PopoverContent" {...props}/>
  </PopoverPrimitive.Portal>));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
