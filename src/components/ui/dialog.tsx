import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "@phosphor-icons/react";
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
export const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (<DialogPrimitive.Overlay ref={ref} className="DialogOverlay" {...props}/>));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
}>(({ className, children, showCloseButton = true, ...props }, ref) => (<DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className="DialogContent" {...props}>
      {children}
      {showCloseButton && (<DialogPrimitive.Close className="DialogClose" aria-label="Close">
          <XIcon size={15} weight="bold"/>
        </DialogPrimitive.Close>)}
    </DialogPrimitive.Content>
  </DialogPortal>));
DialogContent.displayName = DialogPrimitive.Content.displayName;
export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => (<DialogPrimitive.Title ref={ref} className="DialogTitle" {...props}/>));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
export const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => (<DialogPrimitive.Description ref={ref} className="DialogDescription" {...props}/>));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
