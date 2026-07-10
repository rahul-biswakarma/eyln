import { useState } from "react";
import type { Quiz as QuizType } from "../content/types";
import { useProgress } from "../lib/progress";

export function Quiz({ id, quiz }: { id: string; quiz: QuizType }) {
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
      {quiz.questions.map((q, qi) => (
        <div className="q" key={qi}>
          <p>{q.q}</p>
          {(q.choices ?? []).map((c, oi) => {
            const chosen = picked[qi];
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
          {picked[qi] !== undefined && <div className="explain">{q.explain}</div>}
        </div>
      ))}
      {answered === quiz.questions.length && (
        <p style={{ fontFamily: "var(--mono)", color: correct === answered ? "var(--good)" : "var(--warn)" }}>
          Score: {correct} / {quiz.questions.length}
        </p>
      )}
    </div>
  );
}
