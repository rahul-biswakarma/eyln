import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipPortal = TooltipPrimitive.Portal;
export const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({ className, sideOffset = 6, ...props }, ref) => (<TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className="TooltipContent" {...props}/>));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
interface TooltipProps extends Omit<React.ComponentPropsWithoutRef<typeof TooltipContent>, "content"> {
    children: React.ReactNode;
    content: React.ReactNode;
    delayDuration?: number;
}
export function Tooltip({ children, content, delayDuration = 200, ...props }: TooltipProps) {
    return (<TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...props}>
            {content}
            <TooltipPrimitive.Arrow className="TooltipArrow"/>
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipPrimitive.Provider>);
}
