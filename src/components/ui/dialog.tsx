import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "../../lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

const OVERLAY = "fixed inset-0 z-[100] bg-[rgba(6,6,9,0.65)] backdrop-blur-[4px] animate-[fade_var(--dur)_var(--ease)_both]";
const CONTENT =
  "fixed top-0 right-0 h-[100dvh] w-[min(440px,92vw)] bg-surface border-l border-border-bright " +
  "shadow-[-30px_0_80px_rgba(0,0,0,0.6)] z-[101] p-[1.6rem] overflow-y-auto outline-none " +
  "animate-[slidein-right_0.28s_var(--ease)_both]";
const CLOSE =
  "absolute top-[1.2rem] right-[1.2rem] bg-none border-0 cursor-pointer text-text-faint w-6 h-6 " +
  "flex items-center justify-center rounded-full transition-colors duration-200 ease-brand hover:text-text hover:bg-border";

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn(OVERLAY, className)} {...props} />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(CONTENT, className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className={CLOSE} aria-label="Close">
          <XIcon size={15} weight="bold" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("font-display text-[1.15rem] font-semibold text-text m-0 mb-[0.8rem]", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-[0.86rem] text-text-dim leading-[1.5] mb-[1.2rem]", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
