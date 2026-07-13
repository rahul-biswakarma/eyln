import { useState } from "react";
import { CheckCircle, XCircle, Circle, ArrowRight, Sparkle } from "@phosphor-icons/react";
import type { Quiz as QuizType } from "../content/types";
import { useProgress } from "../lib/progress";
import { isLLMEnabled, generate } from "../lib/llm";
import { KnowledgeCard, KnowledgeFooter } from "./knowledge-card";

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
    if (answered) return;
    setPicked((p) => ({ ...p, [step]: oi }));
    const correct = oi === q.answer;
    // Log the full attempt: what was picked, whether it was right, and why.
    logAttempt(`${id}#q${step}`, {
      answer: q.choices?.[oi] ?? String(oi),
      correct,
      feedback: q.explain,
      at: Date.now(),
    });
    if (correct) {
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
      <div className="kc-complete" role="status">
        <div className="kc-complete-glow" aria-hidden />
        <div className="kc-complete-icon"><Sparkle size={32} weight="fill" /></div>
        <div className="kc-complete-title">Knowledge Check Complete</div>
        <div className="kc-complete-score">{correctCount} / {total} correct</div>
        <div className="kc-complete-pct">{pct}%</div>
        <div className="kc-complete-label">estimated mastery</div>
        <div className="kc-complete-meter"><i style={{ width: `${pct}%` }} /></div>
      </div>
    );
  }

  return (
    <KnowledgeCard
      key={step}
      eyebrow={`Question ${step + 1} of ${total}`}
      step={step}
      total={total}
      question={q.q}
      tone={answered ? (isWrong ? "wrong" : "right") : "neutral"}
      shake={shake}
      ghosts={Math.min(2, total - step - 1)}
      feedback={
        answered ? (
          <div className={"kc-feedback" + (isWrong ? " wrong" : " right")}>
            <div className="kc-fb-head">
              {isWrong ? <XCircle size={17} weight="fill" /> : <CheckCircle size={17} weight="fill" />}
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
        ) : undefined
      }
      footer={
        <KnowledgeFooter
          primary={
            <button className="kc-btn primary" onClick={next} disabled={!answered}>
              {step + 1 >= total ? "Finish" : "Continue"} <ArrowRight size={15} weight="bold" />
            </button>
          }
        />
      }
    >
      <div className="kc-options">
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
              className={"kc-opt" + state + (chosen === oi ? " picked" : "")}
              onClick={() => choose(oi)}
              disabled={answered}
            >
              <span className="kc-radio">
                {answered && oi === q.answer ? <CheckCircle size={20} weight="fill" />
                  : answered && oi === chosen ? <XCircle size={20} weight="fill" />
                  : <Circle size={20} weight={chosen === oi ? "fill" : "regular"} />}
              </span>
              <span className="kc-opt-text">{c}</span>
            </button>
          );
        })}
      </div>
    </KnowledgeCard>
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
    <div className="kc-coach">
      {!text && (
        <button className="kc-btn ghost sm" onClick={explain} disabled={loading}>
          {loading ? "Thinking…" : "✦ Explain my mistake"}
        </button>
      )}
      {text && (
        <div className="kc-coach-note">
          <span className="kc-coach-lbl">Coach</span>
          <span>{text}</span>
        </div>
      )}
    </div>
  );
}
