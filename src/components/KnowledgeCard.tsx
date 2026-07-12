import type { ReactNode } from "react";

/**
 * The shared "Knowledge Card" shell used by both Exercise and Quiz (and usable
 * by Challenge). Every learning interaction reads as the same component:
 *
 *   eyebrow (Exercise 2 of 5)  ·  segmented progress
 *   large editorial question
 *   interactive area  (numeric answer / option cards / editor)
 *   action footer     (primary spans the width, secondary + tertiary beside it)
 *
 * Only `children` (the interactive area) and the footer change between modes;
 * the spacing, typography, and transitions stay identical.
 */
export function KnowledgeCard({
  eyebrow,
  step,
  total,
  question,
  children,
  footer,
  feedback,
  tone = "neutral",
  shake,
  ghosts = 0,
}: {
  /** Small mono label, e.g. "Exercise 2 of 5" or "Question 3". */
  eyebrow: string;
  /** 0-based index within the set (for the segmented bar). Omit to hide the bar. */
  step?: number;
  total?: number;
  question: ReactNode;
  /** The interaction area — numeric answer, option cards, editor, … */
  children: ReactNode;
  /** Action footer — typically <KnowledgeFooter/>. */
  footer?: ReactNode;
  /** Optional feedback block rendered above the footer. */
  feedback?: ReactNode;
  /** Colours the ambient accent: correct / incorrect / neutral. */
  tone?: "neutral" | "right" | "wrong";
  shake?: boolean;
  /** How many faded cards to fan behind this one (0–2). */
  ghosts?: number;
}) {
  const showBar = typeof step === "number" && typeof total === "number" && total > 1;

  return (
    <div className="kc-wrap">
      {showBar && (
        <div className="kc-segs" aria-hidden>
          {Array.from({ length: total! }).map((_, i) => (
            <span key={i} className={"kc-seg" + (i < step! ? " done" : i === step! ? " current" : "")} />
          ))}
        </div>
      )}

      <div className="kc-stack">
        {ghosts >= 1 && <div className="kc-ghost g1" aria-hidden />}
        {ghosts >= 2 && <div className="kc-ghost g2" aria-hidden />}

        <div className={"kc-card tone-" + tone + (shake ? " shake" : "")}>
          <div className="kc-glow" aria-hidden />
          <div className="kc-eyebrow">{eyebrow}</div>
          <div className="kc-question">{question}</div>

          <div className="kc-area">{children}</div>

          {feedback}
          {footer && <div className="kc-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/**
 * Consistent action footer. Primary action spans the footer width; optional
 * secondary (hint) and tertiary (skip) sit on a subordinate row.
 */
export function KnowledgeFooter({
  primary,
  secondary,
  tertiary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
}) {
  return (
    <>
      <div className="kc-actions-primary">{primary}</div>
      {(secondary || tertiary) && (
        <div className="kc-actions-sub">
          {secondary}
          {tertiary}
        </div>
      )}
    </>
  );
}
