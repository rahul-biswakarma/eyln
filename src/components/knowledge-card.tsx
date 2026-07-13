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
    return (<div className="kc-wrap">
      {showBar && (<div className="kc-segs" aria-hidden>
          {Array.from({ length: total! }).map((_, i) => (<span key={i} className={"kc-seg" + (i < step! ? " done" : i === step! ? " current" : "")}/>))}
        </div>)}

      <div className="kc-stack">
        {ghosts >= 1 && <div className="kc-ghost g1" aria-hidden/>}
        {ghosts >= 2 && <div className="kc-ghost g2" aria-hidden/>}

        <div className={"kc-card tone-" + tone + (shake ? " shake" : "")}>
          <div className="kc-glow" aria-hidden/>
          <div className="kc-eyebrow">{eyebrow}</div>
          <div className="kc-question">{question}</div>

          <div className="kc-area">{children}</div>

          {feedback}
          {footer && <div className="kc-footer">{footer}</div>}
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
      <div className="kc-actions-primary">{primary}</div>
      {(secondary || tertiary) && (<div className="kc-actions-sub">
          {secondary}
          {tertiary}
        </div>)}
    </>);
}
