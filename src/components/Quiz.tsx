import { useState } from "react";
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
  const [picked, setPicked] = useState<Record<number, number>>({});
  const recordQuiz = useProgress((s) => s.recordQuiz);

  function choose(qi: number, oi: number) {
    if (picked[qi] !== undefined) return; // lock after first answer
    const next = { ...picked, [qi]: oi };
    setPicked(next);
    const correct = quiz.questions.filter((q, i) => next[i] === q.answer).length;
    recordQuiz(id, correct / quiz.questions.length);
  }

  const answered = Object.keys(picked).length;
  const correct = quiz.questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <div className="quiz">
      <h4>🧠 Check your understanding</h4>
      {quiz.questions.map((q, qi) => {
        const chosen = picked[qi];
        const wrong = chosen !== undefined && chosen !== q.answer;
        return (
          <div className="q" key={qi}>
            <p>{q.q}</p>
            {(q.choices ?? []).map((c, oi) => {
              let cls = "opt";
              if (chosen !== undefined) {
                if (oi === q.answer) cls += " correct";
                else if (oi === chosen) cls += " wrong";
              }
              return (
                <div key={oi} className={cls} onClick={() => choose(qi, oi)}>
                  <span>{c}</span>
                </div>
              );
            })}
            {chosen !== undefined && <div className="explain">{q.explain}</div>}
            {wrong && (
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
        );
      })}
      {answered === quiz.questions.length && (
        <p style={{ fontFamily: "var(--mono)", color: correct === answered ? "var(--good)" : "var(--warn)" }}>
          Score: {correct} / {quiz.questions.length}
        </p>
      )}
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

  if (!isLLMEnabled()) return null; // static `explain` already shown above

  async function explain() {
    setLoading(true);
    try {
      const prompt = [
        "You are a patient tutor for a course on building a 3D game engine in Odin + Metal.",
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
    <div style={{ marginTop: "0.6rem" }}>
      {!text && (
        <button className="btn" onClick={explain} disabled={loading}>
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
