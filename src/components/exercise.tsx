import { useRef, useState } from "react";
import { CheckCircleIcon, XCircleIcon, LightbulbIcon, ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
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
export function Exercise({ ex, onResult, onSkip, step, total, logId, }: {
    ex: ExerciseType;
    onResult?: (passed: boolean) => void;
    onSkip?: () => void;
    step?: number;
    total?: number;
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
    function edit(v: string) {
        setValue(v);
        if (result && !result.pass)
            setResult(null);
    }
    const isOpen = ex.kind === "open" || ex.kind === "code-open";
    const multiline = ex.kind === "wgsl" || ex.kind === "ts" || ex.kind === "code-open";
    const solved = result?.pass ?? false;
    async function check() {
        if (grading || solved)
            return;
        if (isOpen) {
            if (!isLLMEnabled()) {
                finish({
                    pass: false,
                    message: "AI grading is off.",
                    feedback: "Configure Firebase to have your answer graded with feedback. For now, compare your answer against the hint and the lesson above.",
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
                }
                else {
                    setResult({ pass: false, message: "Couldn't parse the grade — here's the raw feedback:", feedback: raw });
                }
            }
            catch (e) {
                setResult({ pass: false, message: "Grading failed.", feedback: e instanceof Error ? e.message : String(e) });
            }
            finally {
                setGrading(false);
            }
            return;
        }
        if (ex.validate)
            finish(ex.validate(value));
    }
    const eyebrow = typeof step === "number" && typeof total === "number"
        ? `Exercise ${step + 1} of ${total}`
        : "Exercise";
    if (solved) {
        return (<div className="flex items-center gap-[0.8rem] py-[0.9rem] px-[1.1rem] rounded-[16px] bg-[color-mix(in_srgb,var(--good)_8%,transparent)] border border-[color-mix(in_srgb,var(--good)_22%,var(--border))] animate-[kc-fade_0.3s_var(--ease)_both]" role="status">
        <span className="flex-none text-good grid place-items-center"><CheckCircleIcon size={20} weight="fill"/></span>
        <div className="flex-1 min-w-0">
          <div className="text-[0.92rem] text-text overflow-hidden text-ellipsis whitespace-nowrap">{ex.prompt}</div>
          {value && <div className="text-[0.82rem] text-text-dim mt-[0.15rem]">Your answer: <strong>{value}</strong></div>}
        </div>
        <span className="flex-none font-mono text-[0.66rem] tracking-[0.12em] uppercase text-good">Solved</span>
      </div>);
    }
    const wrong = result && !result.pass;
    const ruleAfter = "after:content-[''] after:absolute after:inset-0 after:rounded-[2px] after:origin-center after:transition-transform after:duration-[400ms] after:ease-brand";
    const ruleAfterState = wrong
        ? "after:bg-bad after:scale-x-100"
        : focused
            ? "after:bg-[var(--kc-accent)] after:scale-x-100"
            : "after:bg-[var(--kc-accent)] after:scale-x-0";
    const answerArea = multiline ? (<div className="relative cursor-auto text-center pt-[0.4rem] pb-[0.6rem]">
      <textarea rows={6} value={value} placeholder="Write your answer…" onChange={(e) => edit(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} spellCheck={false} className="w-full border-0 bg-none outline-none resize-y text-text font-mono text-[0.95rem] leading-[1.7] text-left min-h-[7rem] placeholder:text-text-faint"/>
      <span className={"absolute left-0 right-0 bottom-0 h-[2px] rounded-[2px] bg-[color-mix(in_srgb,var(--text)_14%,transparent)] overflow-hidden " + ruleAfter + " " + ruleAfterState}/>
    </div>) : (<div className="relative cursor-text pt-[1.4rem] px-[1rem] pb-[1.5rem] text-center" onClick={() => inputRef.current?.focus()}>
      <input ref={inputRef} type="text" inputMode="decimal" value={value} placeholder="Type your answer" onChange={(e) => edit(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={(e) => {
            if (e.key === "Enter")
                check();
        }} spellCheck={false} autoComplete="off" className="w-full border-0 bg-none outline-none text-center text-text font-display font-medium text-[clamp(1.8rem,5vw,2.6rem)] tracking-[0.01em] leading-[1.1] placeholder:text-text-faint placeholder:font-normal placeholder:opacity-60"/>
      <span className={"absolute left-[8%] right-[8%] bottom-0 h-[2px] rounded-[2px] bg-[color-mix(in_srgb,var(--text)_14%,transparent)] overflow-hidden " + ruleAfter + " " + ruleAfterState}/>
    </div>);
    return (<KnowledgeCard eyebrow={eyebrow} step={step} total={total} question={ex.prompt} tone={wrong ? "wrong" : "neutral"} feedback={<>
          {showHint && ex.hint && (<div className="relative flex items-start gap-[0.55rem] mt-[1.3rem] py-[0.9rem] px-[1.1rem] rounded-[14px] text-[0.9rem] leading-[1.6] text-text-dim bg-[color-mix(in_srgb,var(--kc-accent)_8%,transparent)] animate-[kc-fade_0.3s_var(--ease)_both] [&_svg]:text-[var(--kc-accent)] [&_svg]:flex-none [&_svg]:mt-[2px]">
              <LightbulbIcon size={16} weight="duotone"/> {ex.hint}
            </div>)}
          {result && !result.pass && (<div className="relative mt-[1.4rem] p-[1rem_1.15rem] rounded-[14px] bg-[rgba(255,92,92,0.06)] border border-[color-mix(in_srgb,var(--bad)_28%,var(--border))] animate-[kc-fade_0.3s_var(--ease)_both]">
              <div className="flex items-center gap-[0.5rem] font-display font-semibold mb-[0.3rem] text-bad"><XCircleIcon size={17} weight="fill"/> {result.message}</div>
              {result.feedback && <p className="m-0 text-text-dim text-[0.9rem] leading-[1.6]">{result.feedback}</p>}
            </div>)}
        </>} footer={<KnowledgeFooter primary={<button className="inline-flex items-center justify-center gap-[0.45rem] cursor-pointer font-sans font-medium text-[0.92rem] rounded-pill border-0 flex-1 py-[0.95rem] px-[1.4rem] text-on-accent bg-[image:var(--accent-grad)] shadow-[0_8px_26px_color-mix(in_srgb,var(--accent-2)_26%,transparent)] transition duration-200 ease-brand enabled:hover:-translate-y-px disabled:opacity-40 disabled:cursor-default disabled:shadow-none" onClick={check} disabled={grading}>
              {grading ? (<><CircleNotchIcon size={15} weight="bold" className="spin"/> Grading…</>) : (<>Check Answer</>)}
            </button>} secondary={ex.hint ? (<button className="inline-flex items-center justify-center gap-[0.45rem] cursor-pointer font-sans font-medium text-[0.92rem] rounded-pill border border-border py-[0.5rem] px-[0.9rem] text-text-dim bg-none transition duration-200 ease-brand enabled:hover:text-text enabled:hover:border-border-bright" onClick={() => setShowHint((h) => !h)}>
                <LightbulbIcon size={14} weight="duotone"/> {showHint ? "Hide hint" : "Hint"}
              </button>) : undefined} tertiary={onSkip ? (<button className="inline-flex items-center justify-center gap-[0.45rem] cursor-pointer font-sans font-medium text-[0.92rem] rounded-pill border border-transparent ml-auto py-[0.5rem] px-[0.6rem] text-text-faint bg-none transition duration-200 ease-brand hover:text-text-dim" onClick={onSkip}>
                Skip <ArrowRightIcon size={13} weight="bold"/>
              </button>) : undefined}/>}>
      {answerArea}
    </KnowledgeCard>);
}
