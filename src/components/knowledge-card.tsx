import type { ReactNode } from "react";
export function KnowledgeCard({ eyebrow, step, total, question, children, footer, feedback, tone = "neutral", shake, ghosts = 0, }: {
    eyebrow: string;
    step?: number;
    total?: number;
    question: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    feedback?: ReactNode;
    tone?: "neutral" | "right" | "wrong";
    shake?: boolean;
    ghosts?: number;
}) {
    const showBar = typeof step === "number" && typeof total === "number" && total > 1;
    const cardBorder = tone === "right"
        ? "border-[color-mix(in_srgb,var(--good)_40%,var(--border))]"
        : tone === "wrong"
            ? "border-[color-mix(in_srgb,var(--bad)_34%,var(--border))]"
            : "border-border";
    const cardAnim = shake ? "animate-[kc-shake_0.42s_var(--ease)]" : "animate-[kc-rise_0.32s_var(--ease)_both]";
    const glowTone = tone === "right"
        ? "opacity-60 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--good)_22%,transparent),transparent)]"
        : tone === "wrong"
            ? "opacity-50 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--bad)_20%,transparent),transparent)]"
            : "opacity-50 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--kc-accent)_22%,transparent),transparent)]";
    return (<div className="[--kc-accent:var(--track-accent,var(--accent))] mt-[0.6rem] mb-[0.4rem]">
      {showBar && (<div className="flex gap-[5px] mb-[1.4rem]" aria-hidden>
          {Array.from({ length: total! }).map((_, i) => (<span key={i} className={"h-[4px] flex-1 rounded-pill transition-[background,box-shadow] duration-500 ease-brand " + (i < step! ? "bg-[var(--kc-accent)] shadow-[0_0_10px_color-mix(in_srgb,var(--kc-accent)_45%,transparent)]" : i === step! ? "bg-[color-mix(in_srgb,var(--kc-accent)_45%,transparent)]" : "bg-[color-mix(in_srgb,var(--text)_8%,transparent)]")}/>))}
        </div>)}

      <div className="relative">
        {ghosts >= 1 && <div className="absolute left-0 right-0 top-[10px] bottom-auto h-full rounded-[22px] border border-border bg-surface-2 pointer-events-none z-0 origin-[50%_92%] [transform:rotate(-1.6deg)_translateY(4px)] opacity-50" aria-hidden/>}
        {ghosts >= 2 && <div className="absolute left-0 right-0 top-[10px] bottom-auto h-full rounded-[22px] border border-border bg-surface-2 pointer-events-none z-0 origin-[50%_92%] [transform:rotate(1.4deg)_translateY(8px)] opacity-30" aria-hidden/>}

        <div className={"kc-card relative z-[1] overflow-hidden border rounded-[22px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--text)_2%,transparent),transparent_42%),var(--surface)] p-[clamp(1.6rem,3vw,2.2rem)] " + cardBorder + " " + cardAnim}>
          <div className={"absolute inset-x-[30%] top-[-60%] bottom-auto h-[220px] pointer-events-none blur-[26px] transition-opacity duration-500 ease-brand " + glowTone} aria-hidden/>
          <div className="kc-eyebrow relative font-mono text-[0.7rem] tracking-[0.18em] uppercase text-[var(--kc-accent)] mb-[1rem]">{eyebrow}</div>
          <div className="relative font-display font-medium tracking-[-0.01em] text-[clamp(1.35rem,2.6vw,1.7rem)] leading-[1.32] text-text mb-[1.8rem] max-w-[30ch]">{question}</div>

          <div className="relative">{children}</div>

          {feedback}
          {footer && <div className="relative mt-[1.8rem]">{footer}</div>}
        </div>
      </div>
    </div>);
}
export function KnowledgeFooter({ primary, secondary, tertiary, }: {
    primary: ReactNode;
    secondary?: ReactNode;
    tertiary?: ReactNode;
}) {
    return (<>
      <div className="flex">{primary}</div>
      {(secondary || tertiary) && (<div className="flex items-center gap-[0.4rem] mt-[0.7rem]">
          {secondary}
          {tertiary}
        </div>)}
    </>);
}
