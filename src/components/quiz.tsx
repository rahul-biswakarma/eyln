import { useState } from "react";
import { CheckCircleIcon, XCircleIcon, CircleIcon, ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react";
import type { Quiz as QuizType } from "../content/types";
import { useProgress } from "../lib/progress";
import { isLLMEnabled, generate } from "../lib/llm";
import { KnowledgeCard, KnowledgeFooter } from "./knowledge-card";
export function Quiz({ id, quiz, lessonTitle, lessonSummary, }: {
    id: string;
    quiz: QuizType;
    lessonTitle?: string;
    lessonSummary?: string;
}) {
    const total = quiz.questions.length;
    const recordQuiz = useProgress((s) => s.recordQuiz);
    const logAttempt = useProgress((s) => s.logAttempt);
    const [step, setStep] = useState(0);
    const [picked, setPicked] = useState<Record<number, number>>({});
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [shake, setShake] = useState(false);
    const q = quiz.questions[step];
    const chosen = picked[step];
    const answered = chosen !== undefined;
    const isWrong = answered && chosen !== q.answer;
    function choose(oi: number) {
        if (answered)
            return;
        setPicked((p) => ({ ...p, [step]: oi }));
        const correct = oi === q.answer;
        logAttempt(`${id}#q${step}`, {
            answer: q.choices?.[oi] ?? String(oi),
            correct,
            feedback: q.explain,
            at: Date.now(),
        });
        if (correct) {
            setCorrectCount((c) => c + 1);
        }
        else {
            setShake(true);
            window.setTimeout(() => setShake(false), 420);
        }
    }
    function next() {
        if (step + 1 >= total) {
            recordQuiz(id, correctCount / total);
            setFinished(true);
        }
        else {
            setStep((s) => s + 1);
        }
    }
    const pct = Math.round((correctCount / total) * 100);
    if (finished) {
        return (<div className="relative overflow-hidden text-center py-[2.8rem] px-[2rem] rounded-[22px] border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[radial-gradient(120%_120%_at_50%_0%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_62%),var(--surface)] animate-[kc-rise_0.4s_var(--ease)_both]" role="status">
        <div className="absolute inset-x-[25%] top-[-50%] bottom-auto h-[280px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_22%,transparent),transparent)] blur-[28px] pointer-events-none" aria-hidden/>
        <div className="relative text-accent [filter:drop-shadow(0_0_16px_rgba(255,176,0,0.45))]"><SparkleIcon size={32} weight="fill"/></div>
        <div className="relative font-display text-[1.35rem] font-semibold mt-[0.5rem]">Knowledge Check Complete</div>
        <div className="relative font-mono text-text-dim text-[0.82rem] mt-[0.4rem]">{correctCount} / {total} correct</div>
        <div className="relative font-display text-[3rem] font-bold text-accent mt-[0.7rem] leading-none">{pct}%</div>
        <div className="relative font-mono text-[0.68rem] tracking-[0.14em] uppercase text-text-faint mt-[0.35rem]">estimated mastery</div>
        <div className="relative h-[6px] rounded-[999px] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] overflow-hidden max-w-[280px] mx-auto mt-[1.3rem]"><i className="block h-full bg-[var(--accent-grad)] rounded-[999px] transition-[width] duration-[800ms] ease-brand" style={{ width: `${pct}%` }}/></div>
      </div>);
    }
    return (<KnowledgeCard key={step} eyebrow={`Question ${step + 1} of ${total}`} step={step} total={total} question={q.q} tone={answered ? (isWrong ? "wrong" : "right") : "neutral"} shake={shake} ghosts={Math.min(2, total - step - 1)} feedback={answered ? (<div className={"relative mt-[1.4rem] p-[1rem_1.15rem] rounded-[14px] border animate-[kc-fade_0.3s_var(--ease)_both] " + (isWrong ? "bg-[rgba(255,92,92,0.06)] border-[color-mix(in_srgb,var(--bad)_28%,var(--border))]" : "bg-[rgba(70,217,138,0.08)] border-[color-mix(in_srgb,var(--good)_28%,var(--border))]")}>
            <div className={"flex items-center gap-[0.5rem] font-display font-semibold mb-[0.3rem] " + (isWrong ? "text-bad" : "text-good")}>
              {isWrong ? <XCircleIcon size={17} weight="fill"/> : <CheckCircleIcon size={17} weight="fill"/>}
              {isWrong ? "Not quite" : "Correct"}
            </div>
            <p className="m-0 text-text-dim text-[0.9rem] leading-[1.6]">{q.explain}</p>
            {isWrong && (<ExplainMistake question={q.q} chosen={q.choices?.[chosen] ?? ""} correctAnswer={q.choices?.[q.answer] ?? ""} staticExplain={q.explain} lessonTitle={lessonTitle} lessonSummary={lessonSummary}/>)}
          </div>) : undefined} footer={<KnowledgeFooter primary={<button className="inline-flex items-center justify-center gap-[0.45rem] cursor-pointer font-sans font-medium text-[0.92rem] rounded-pill border-0 flex-1 py-[0.95rem] px-[1.4rem] text-on-accent bg-[var(--accent-grad)] shadow-[0_8px_26px_color-mix(in_srgb,var(--accent-2)_26%,transparent)] transition duration-200 ease-brand enabled:hover:-translate-y-px disabled:opacity-40 disabled:cursor-default disabled:shadow-none" onClick={next} disabled={!answered}>
              {step + 1 >= total ? "Finish" : "Continue"} <ArrowRightIcon size={15} weight="bold"/>
            </button>}/>}>
      <div className="flex flex-col gap-[0.6rem]">
        {(q.choices ?? []).map((c, oi) => {
            const isCorrect = answered && oi === q.answer;
            const isIncorrect = answered && oi !== q.answer && oi === chosen;
            const isMuted = answered && oi !== q.answer && oi !== chosen;
            const isPicked = chosen === oi;
            let optState = "border-border bg-[color-mix(in_srgb,var(--text)_2.5%,transparent)] text-text-dim";
            let radioState = "text-text-faint";
            if (isCorrect) {
                optState = "border-[color-mix(in_srgb,var(--good)_55%,var(--border))] bg-[rgba(70,217,138,0.1)] text-text";
                radioState = "text-good";
            }
            else if (isIncorrect) {
                optState = "border-[color-mix(in_srgb,var(--bad)_55%,var(--border))] bg-[rgba(255,92,92,0.08)] text-text";
                radioState = "text-bad";
            }
            else if (isPicked) {
                optState = "border-[color-mix(in_srgb,var(--kc-accent)_55%,var(--border))] text-text";
                radioState = "text-[var(--kc-accent)]";
            }
            if (isMuted)
                optState += " opacity-45";
            const hoverCls = answered ? "" : "hover:-translate-y-px hover:border-border-bright hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)] hover:text-text [&:hover_.kc-radio]:text-[var(--kc-accent)]";
            return (<button key={oi} className={"group flex items-center gap-[0.9rem] text-left w-full cursor-pointer py-[1rem] px-[1.15rem] rounded-[14px] border text-[0.98rem] leading-[1.4] transition duration-200 ease-brand disabled:cursor-default " + optState + " " + hoverCls} onClick={() => choose(oi)} disabled={answered}>
              <span className={"kc-radio flex-none grid place-items-center transition-colors duration-200 ease-brand " + radioState}>
                {answered && oi === q.answer ? <CheckCircleIcon size={20} weight="fill"/>
                    : answered && oi === chosen ? <XCircleIcon size={20} weight="fill"/>
                        : <CircleIcon size={20} weight={chosen === oi ? "fill" : "regular"}/>}
              </span>
              <span>{c}</span>
            </button>);
        })}
      </div>
    </KnowledgeCard>);
}
function ExplainMistake({ question, chosen, correctAnswer, staticExplain, lessonTitle, lessonSummary, }: {
    question: string;
    chosen: string;
    correctAnswer: string;
    staticExplain: string;
    lessonTitle?: string;
    lessonSummary?: string;
}) {
    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    if (!isLLMEnabled())
        return null;
    async function explain() {
        setLoading(true);
        try {
            const prompt = [
                "You are a patient tutor for an engineering academy.",
                `Lesson: ${lessonTitle ?? "(unknown)"}${lessonSummary ? ` — ${lessonSummary}` : ""}.`,
                `Question: ${question}`,
                `The learner picked: "${chosen}", which is wrong. The correct answer is: "${correctAnswer}".`,
                `Reference explanation: ${staticExplain}`,
                "In 2-3 sentences, explain WHY their choice is wrong and what concept to review. Be encouraging, no markdown.",
            ].join("\n");
            setText(await generate(prompt, { temperature: 0.3 }));
        }
        catch (e) {
            setText(e instanceof Error ? e.message : String(e));
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="mt-[0.8rem]">
      {!text && (<button className="inline-flex items-center justify-center gap-[0.45rem] cursor-pointer font-sans font-medium text-[0.82rem] rounded-pill border border-border py-[0.4rem] px-[0.8rem] text-text-dim bg-none transition duration-200 ease-brand enabled:hover:text-text enabled:hover:border-border-bright" onClick={explain} disabled={loading}>
          {loading ? "Thinking…" : "✦ Explain my mistake"}
        </button>)}
      {text && (<div className="mt-[0.6rem] flex flex-col gap-[0.3rem] text-[0.88rem] text-text-dim leading-[1.6]">
          <span className="font-mono text-[0.64rem] tracking-[0.14em] uppercase text-[var(--kc-accent)]">Coach</span>
          <span>{text}</span>
        </div>)}
    </div>);
}
