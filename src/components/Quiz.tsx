import { useState } from "react";
import { CheckCircle, XCircle, Circle, ArrowRight, Sparkle } from "@phosphor-icons/react";
import type { Quiz as QuizType } from "../content/types";
import { useProgress } from "../lib/progress";
import { isLLMEnabled, generate } from "../lib/llm";

export function Quiz({
  id,
  quiz,
  lessonTitle,
  lessonSummary,
}: {
  id: string;
  quiz: QuizType;
  lessonTitle?: string;
  lessonSummary?: string;
}) {
  const total = quiz.questions.length;
  const recordQuiz = useProgress((s) => s.recordQuiz);

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
    if (answered) return;
    setPicked((p) => ({ ...p, [step]: oi }));
    if (oi === q.answer) {
      setCorrectCount((c) => c + 1);
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
    }
  }

  function next() {
    if (step + 1 >= total) {
      recordQuiz(id, correctCount / total);
      setFinished(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  const pct = Math.round((correctCount / total) * 100);

  if (finished) {
    return (
      <div className="qz">
        <QuizHeader step={total} total={total} />
        <div className="qz-complete">
          <div className="qzc-icon"><Sparkle size={34} weight="fill" /></div>
          <div className="qzc-title">Knowledge Check Complete</div>
          <div className="qzc-score">{correctCount} / {total} Correct</div>
          <div className="qzc-pct">{pct}%</div>
          <div className="qzc-label">estimated mastery</div>
          <div className="qzc-meter"><i style={{ width: `${pct}%` }} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="qz">
      <QuizHeader step={step} total={total} />

      <div className="qz-stack">
        {step + 1 < total && <div className="qz-ghost g1" aria-hidden />}
        {step + 2 < total && <div className="qz-ghost g2" aria-hidden />}

        <div className={"qz-card" + (shake ? " shake" : "")} key={step}>
          <div className="qz-qnum">Question {step + 1}</div>
          <div className="qz-question">{q.q}</div>

          <div className="qz-options">
            {(q.choices ?? []).map((c, oi) => {
              let state = "";
              if (answered) {
                if (oi === q.answer) state = " correct";
                else if (oi === chosen) state = " incorrect";
                else state = " muted";
              }
              return (
                <button
                  key={oi}
                  className={"qz-opt" + state + (chosen === oi ? " picked" : "")}
                  onClick={() => choose(oi)}
                  disabled={answered}
                >
                  <span className="qz-radio">
                    {answered && oi === q.answer ? <CheckCircle size={20} weight="fill" />
                      : answered && oi === chosen ? <XCircle size={20} weight="fill" />
                      : <Circle size={20} weight={chosen === oi ? "fill" : "regular"} />}
                  </span>
                  <span className="qz-opt-text">{c}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={"qz-feedback" + (isWrong ? " wrong" : " right")}>
              <div className="qz-fb-head">
                {isWrong ? <XCircle size={18} weight="fill" /> : <CheckCircle size={18} weight="fill" />}
                {isWrong ? "Not quite" : "Correct"}
              </div>
              <p>{q.explain}</p>
              {isWrong && (
                <ExplainMistake
                  question={q.q}
                  chosen={q.choices?.[chosen] ?? ""}
                  correctAnswer={q.choices?.[q.answer] ?? ""}
                  staticExplain={q.explain}
                  lessonTitle={lessonTitle}
                  lessonSummary={lessonSummary}
                />
              )}
            </div>
          )}

          <div className="qz-nav">
            <button className="btn primary" onClick={next} disabled={!answered}>
              {step + 1 >= total ? "Finish" : "Continue"} <ArrowRight size={15} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizHeader({ step, total }: { step: number; total: number }) {
  const doneCount = Math.min(step, total);
  return (
    <div className="qz-head">
      <div className="qz-head-top">
        <span className="qz-title">Knowledge Check</span>
        <span className="qz-count">{doneCount} / {total} Complete</span>
      </div>
      <div className="qz-segs">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={"qz-seg" + (i < step ? " done" : i === step ? " current" : "")} />
        ))}
      </div>
    </div>
  );
}

function ExplainMistake({
  question,
  chosen,
  correctAnswer,
  staticExplain,
  lessonTitle,
  lessonSummary,
}: {
  question: string;
  chosen: string;
  correctAnswer: string;
  staticExplain: string;
  lessonTitle?: string;
  lessonSummary?: string;
}) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLLMEnabled()) return null;

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
    } catch (e) {
      setText(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qz-coach">
      {!text && (
        <button className="btn sm" onClick={explain} disabled={loading}>
          {loading ? "Thinking…" : "✦ Explain my mistake"}
        </button>
      )}
      {text && (
        <div className="notice">
          <span className="lbl">Coach</span>
          <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
        </div>
      )}
    </div>
  );
}
