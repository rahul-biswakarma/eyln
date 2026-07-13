import { useRef, useState } from "react";
import { CheckCircle, XCircle, Lightbulb, ArrowRight, CircleNotch } from "@phosphor-icons/react";
import type { Exercise as ExerciseType, ExerciseResult } from "../content/types";
import { isLLMEnabled, generate, parseJSON } from "../lib/llm";
import { useNotes } from "../lib/notes";
import { useProgress } from "../lib/progress";
import { KnowledgeCard, KnowledgeFooter } from "./knowledge-card";

interface GradeJSON {
  pass: boolean;
  score: number;
  feedback: string;
}

export function Exercise({
  ex,
  onResult,
  onSkip,
  step,
  total,
  logId,
}: {
  ex: ExerciseType;
  /** Fired whenever the exercise is graded, with the pass/fail outcome. */
  onResult?: (passed: boolean) => void;
  /** If provided, a tertiary "Skip" action appears. */
  onSkip?: () => void;
  /** 0-based position within the lesson's exercise set (for progress + eyebrow). */
  step?: number;
  total?: number;
  /** Stable id under which to log the full attempt history. */
  logId?: string;
}) {
  const [value, setValue] = useState(ex.starter ?? "");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [grading, setGrading] = useState(false);
  const [focused, setFocused] = useState(false);
  const recordOpenScore = useNotes((s) => s.recordOpenScore);
  const logAttempt = useProgress((s) => s.logAttempt);
  const inputRef = useRef<HTMLInputElement>(null);

  function finish(r: ExerciseResult) {
    setResult(r);
    logAttempt(logId ?? ex.id, {
      answer: value,
      correct: r.pass,
      feedback: r.feedback ?? r.message,
      at: Date.now(),
    });
    onResult?.(r.pass);
  }

  // Editing after a wrong attempt clears the red state, back to neutral.
  function edit(v: string) {
    setValue(v);
    if (result && !result.pass) setResult(null);
  }

  const isOpen = ex.kind === "open" || ex.kind === "code-open";
  const multiline = ex.kind === "wgsl" || ex.kind === "ts" || ex.kind === "code-open";
  const solved = result?.pass ?? false;

  async function check() {
    if (grading || solved) return;

    if (isOpen) {
      if (!isLLMEnabled()) {
        finish({
          pass: false,
          message: "AI grading is off.",
          feedback:
            "Configure Firebase to have your answer graded with feedback. For now, compare your answer against the hint and the lesson above.",
        });
        return;
      }
      setGrading(true);
      setResult(null);
      try {
        const prompt = [
          "You are grading a learner's answer for a course on building a 3D game engine in Odin + Metal.",
          'Grade fairly but rigorously. Reply ONLY with JSON: {"pass": boolean, "score": number 0..1, "feedback": string}.',
          "Keep feedback to 2-4 sentences: what was right, what to fix.",
          "",
          `QUESTION: ${ex.prompt}`,
          ex.rubric ? `RUBRIC: ${ex.rubric}` : "",
          `LEARNER ANSWER:\n${value}`,
        ].join("\n");
        const raw = await generate(prompt, { temperature: 0.2 });
        const parsed = parseJSON<GradeJSON>(raw);
        if (parsed) {
          recordOpenScore(ex.id, Math.max(0, Math.min(1, parsed.score)));
          finish({ pass: parsed.pass, message: parsed.pass ? "Correct" : "Not yet", feedback: parsed.feedback });
        } else {
          setResult({ pass: false, message: "Couldn't parse the grade — here's the raw feedback:", feedback: raw });
        }
      } catch (e) {
        setResult({ pass: false, message: "Grading failed.", feedback: e instanceof Error ? e.message : String(e) });
      } finally {
        setGrading(false);
      }
      return;
    }
    // Deterministic kinds.
    if (ex.validate) finish(ex.validate(value));
  }

  const eyebrow =
    typeof step === "number" && typeof total === "number"
      ? `Exercise ${step + 1} of ${total}`
      : "Exercise";

  // Compact success state once solved.
  if (solved) {
    return (
      <div className="kc-solved" role="status">
        <span className="kc-solved-ic"><CheckCircle size={20} weight="fill" /></span>
        <div className="kc-solved-body">
          <div className="kc-solved-q">{ex.prompt}</div>
          {value && <div className="kc-solved-a">Your answer: <strong>{value}</strong></div>}
        </div>
        <span className="kc-solved-tag">Solved</span>
      </div>
    );
  }

  const wrong = result && !result.pass;

  const answerArea = multiline ? (
    <div className={"kc-notebook multiline" + (focused ? " focus" : "")}>
      <textarea
        rows={6}
        value={value}
        placeholder="Write your answer…"
        onChange={(e) => edit(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        spellCheck={false}
      />
      <span className="kc-notebook-rule" />
    </div>
  ) : (
    <div
      className={"kc-notebook" + (focused ? " focus" : "") + (wrong ? " wrong" : "")}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        placeholder="Type your answer"
        onChange={(e) => edit(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === "Enter") check(); }}
        spellCheck={false}
        autoComplete="off"
      />
      <span className="kc-notebook-rule" />
    </div>
  );

  return (
    <KnowledgeCard
      eyebrow={eyebrow}
      step={step}
      total={total}
      question={ex.prompt}
      tone={wrong ? "wrong" : "neutral"}
      feedback={
        <>
          {showHint && ex.hint && (
            <div className="kc-hint">
              <Lightbulb size={16} weight="duotone" /> {ex.hint}
            </div>
          )}
          {result && !result.pass && (
            <div className="kc-feedback wrong">
              <div className="kc-fb-head"><XCircle size={17} weight="fill" /> {result.message}</div>
              {result.feedback && <p>{result.feedback}</p>}
            </div>
          )}
        </>
      }
      footer={
        <KnowledgeFooter
          primary={
            <button className="kc-btn primary" onClick={check} disabled={grading}>
              {grading ? (
                <><CircleNotch size={15} weight="bold" className="spin" /> Grading…</>
              ) : (
                <>Check Answer</>
              )}
            </button>
          }
          secondary={
            ex.hint ? (
              <button className="kc-btn ghost" onClick={() => setShowHint((h) => !h)}>
                <Lightbulb size={14} weight="duotone" /> {showHint ? "Hide hint" : "Hint"}
              </button>
            ) : undefined
          }
          tertiary={
            onSkip ? (
              <button className="kc-btn tertiary" onClick={onSkip}>
                Skip <ArrowRight size={13} weight="bold" />
              </button>
            ) : undefined
          }
        />
      }
    >
      {answerArea}
    </KnowledgeCard>
  );
}
