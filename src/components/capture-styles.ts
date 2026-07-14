/**
 * Shared Tailwind class strings for the capture action-sheet + forms.
 * These reproduce the former rw-capture, rw-form, rw-input and rw-seg rules
 * so BookCapture and CollectionCapture stay pixel-identical after the
 * Tailwind migration. Kept as constants (not CSS) to avoid a shared stylesheet.
 */
export const rwCaptureSheet = "flex flex-col gap-[0.6rem]";

export const rwCaptureChoice =
  "flex items-center gap-[0.8rem] text-left bg-surface-inset border border-border rounded-sm px-4 py-[0.9rem] " +
  "cursor-pointer text-text-dim transition duration-200 ease-brand hover:border-accent hover:bg-surface-2 hover:translate-x-[2px]";

export const rwForm = "flex flex-col gap-[0.7rem]";
export const rwRow = "flex gap-[0.6rem]";

export const rwInput =
  "w-full bg-surface-inset border border-border rounded-sm text-text px-3 py-[0.6rem] text-[0.86rem] font-sans resize-y " +
  "focus:outline-none focus:border-accent";

export const rwFormSave =
  "mt-[0.3rem] bg-accent text-on-accent border-none rounded-sm p-[0.65rem] text-[0.85rem] font-semibold cursor-pointer " +
  "disabled:opacity-40 disabled:cursor-not-allowed";

export const rwFormBack =
  "mt-[0.9rem] bg-transparent border-none text-text-faint text-[0.78rem] cursor-pointer hover:text-text-dim";

export const rwSeg = "flex gap-[0.35rem]";

export const rwSegBtn = (active: boolean) =>
  "flex-1 border rounded-sm text-[0.74rem] p-[0.42rem] cursor-pointer transition duration-200 ease-brand " +
  (active ? "bg-accent-soft border-accent text-accent" : "bg-surface-inset border-border text-text-dim hover:text-text");

export const rwCaptureBtn =
  "inline-flex items-center gap-[0.4rem] bg-accent text-on-accent border-none rounded-sm px-[0.8rem] py-[0.45rem] " +
  "text-[0.78rem] font-semibold cursor-pointer whitespace-nowrap transition duration-200 ease-brand " +
  "hover:shadow-[0_0_0_3px_var(--accent-soft)] hover:-translate-y-px";

export const rwFavToggle = (on: boolean) =>
  "inline-flex items-center gap-[0.4rem] rounded-sm border px-[0.6rem] py-[0.4rem] text-[0.76rem] cursor-pointer transition duration-200 ease-brand " +
  (on ? "bg-accent-soft border-accent text-accent" : "bg-surface-inset border-border text-text-dim hover:text-text");
