import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LessonRef } from "../content/registry";
import { allLessons, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";
import { Quiz } from "./Quiz";
import { Exercise } from "./Exercise";

export function LessonLayout({ data }: { data: LessonRef }) {
  const { module, lesson, index } = data;
  const done = useProgress((s) => s.done);
  const toggleDone = useProgress((s) => s.toggleDone);
  const visit = useProgress((s) => s.visit);
  const key = lessonKey(module.id, lesson.id);
  const isDone = !!done[key];
  const [readPct, setReadPct] = useState(0);

  const prev = allLessons[index - 1];
  const next = allLessons[index + 1];
  const Body = lesson.Body;

  // Stamp a visit for the activity feed (once per mount).
  useEffect(() => { visit(key); }, [key, visit]);

  // Reading-progress bar tied to window scroll.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setReadPct(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return (
    <div className="content">
      <div className="readbar"><i style={{ width: `${readPct * 100}%` }} /></div>
      <div className="prose">
        <div className="crumbs">
          <Link to="/">Dashboard</Link>
          <span>/</span>
          <span className="seg">{module.icon} {module.title}</span>
          <span>/</span>
          <span className="seg">{lesson.title}</span>
        </div>
        <h1>{lesson.title}</h1>
        <div className="lesson-head">
          <span className="badge time">⏱ {lesson.minutes} min</span>
          {isDone && <span className="badge" style={{ color: "var(--good)", borderColor: "var(--good)" }}>✓ completed</span>}
          <span style={{ color: "var(--text-dim)" }}>{lesson.summary}</span>
        </div>

        <Body />

        {lesson.exercises?.map((ex) => (
          <Exercise key={ex.id} ex={ex} />
        ))}
        {lesson.quiz && <Quiz id={key} quiz={lesson.quiz} />}

        <div className="done-toggle">
          <button className={"btn" + (isDone ? " primary" : "")} onClick={() => toggleDone(key)}>
            {isDone ? "✓ Completed — click to undo" : "Mark as complete"}
          </button>
        </div>

        <div className="lesson-nav">
          {prev ? (
            <Link className="prev" to={lessonPath(prev.module.id, prev.lesson.id)}>
              <div className="k">← previous</div>
              <div className="t">{prev.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="next" to={lessonPath(next.module.id, next.lesson.id)}>
              <div className="k">next →</div>
              <div className="t">{next.lesson.title}</div>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
