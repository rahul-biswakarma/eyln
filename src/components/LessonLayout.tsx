import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock, Gauge, Sparkle, BookmarkSimple, PencilSimpleLine, CheckCircle, ArrowRight, ListChecks,
} from "@phosphor-icons/react";
import type { LessonRef } from "../content/registry";
import { allLessons, lessonPath, lessonKey, questionaryPath, moduleDifficulty } from "../content/registry";
import { useProgress } from "../lib/progress";
import { useNotes } from "../lib/notes";
import { NotePanel } from "./NotePanel";
import { TutorChat } from "./TutorChat";
import { ModuleIcon } from "./ModuleIcon";

export function LessonLayout({ data }: { data: LessonRef }) {
  const { module, lesson, index } = data;
  const done = useProgress((s) => s.done);
  const toggleDone = useProgress((s) => s.toggleDone);
  const visit = useProgress((s) => s.visit);
  const bookmarks = useNotes((s) => s.bookmarks);
  const toggleBookmark = useNotes((s) => s.toggleBookmark);
  const key = lessonKey(module.id, lesson.id);
  const isDone = !!done[key];
  const isBookmarked = !!bookmarks[key];
  const [readPct, setReadPct] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [selection, setSelection] = useState<string | undefined>();

  const prev = allLessons[index - 1];
  const next = allLessons[index + 1];
  const Body = lesson.Body;
  const bodyRef = useRef<HTMLDivElement>(null);

  const lessonNumInModule = module.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const diff = moduleDifficulty(module);
  const isInteractive = /widget|playground|canvas|demo|editor/i.test(String(Body));
  const hasQuestions =
    (lesson.quiz?.questions.length ?? 0) > 0 || (lesson.exercises?.length ?? 0) > 0;

  useEffect(() => { visit(key); }, [key, visit]);

  useEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const blocks = Array.from(root.children) as HTMLElement[];
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    blocks.forEach((b) => { b.classList.add("reveal"); io.observe(b); });
    return () => io.disconnect();
  }, [key]);

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

  function openNote() {
    const sel = window.getSelection?.()?.toString().trim();
    setSelection(sel && sel.length > 0 ? sel : undefined);
    setNoteOpen(true);
  }

  return (
    <div className="content lesson">
      <div className="readbar"><i style={{ width: `${readPct * 100}%` }} /></div>

      <header className="lesson-hero prose">
        <div className="crumbs">
          <Link to="/">Dashboard</Link>
          <span>/</span>
          <Link className="seg" to={lessonPath(module.id, module.lessons[0].id)}>
            <ModuleIcon id={module.id} size={14} /> {module.title}
          </Link>
        </div>

        <div className="lh-kicker">Mission {lessonNumInModule} / {module.lessons.length}</div>
        <h1 className="lh-title">{lesson.title}</h1>
        <p className="lh-objective">{lesson.summary}</p>

        <div className="lh-meta">
          <span className="lh-chip"><Clock size={14} weight="duotone" /> {lesson.minutes} min</span>
          <span className="lh-chip"><Gauge size={14} weight="duotone" /> {diff.label}</span>
          {isInteractive && <span className="lh-chip interactive"><Sparkle size={14} weight="fill" /> Interactive</span>}
          {isDone && <span className="lh-chip done"><CheckCircle size={14} weight="fill" /> Completed</span>}
          <span className="lh-actions">
            <button
              className={"icon-btn" + (isBookmarked ? " on" : "")}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
              onClick={() => toggleBookmark(key)}
            >
              <BookmarkSimple size={16} weight={isBookmarked ? "fill" : "regular"} />
            </button>
            <button className="icon-btn" title="Add a note (select text first to quote it)" onClick={openNote}>
              <PencilSimpleLine size={16} weight="regular" />
            </button>
          </span>
        </div>
      </header>

      <div className="prose lesson-body" ref={bodyRef}>
        <Body />
      </div>

      {hasQuestions && (
        <div className="prose lesson-section">
          <Link className="qn-cta" to={questionaryPath(module.id)}>
            <span className="qn-cta-ic"><ListChecks size={22} weight="duotone" /></span>
            <span className="qn-cta-body">
              <span className="qn-cta-title">Practice in the Questionary</span>
              <span className="qn-cta-sub">
                Knowledge checks and exercises for {module.title} are collected on one page —
                like an end-of-chapter problem set.
              </span>
            </span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      )}

      <div className="prose lesson-section">
        <TutorChat lessonTitle={lesson.title} lessonSummary={lesson.summary} />
      </div>

      <div className="prose lesson-summary">
        <div className={"ls-card" + (isDone ? " done" : "")}>
          <div className="ls-icon"><CheckCircle size={28} weight={isDone ? "fill" : "duotone"} /></div>
          <div className="ls-body">
            <h3>{isDone ? "Mission accomplished" : "Ready to lock it in?"}</h3>
            <p>{isDone ? "You've completed this mission. Carry the momentum forward." : "Mark this mission complete once the concept clicks."}</p>
          </div>
          <button className={"btn" + (isDone ? "" : " primary")} onClick={() => toggleDone(key)}>
            {isDone ? "Completed ✓" : "Mark complete"}
          </button>
        </div>

        <div className="lesson-nav">
          {prev ? (
            <Link className="prev" to={lessonPath(prev.module.id, prev.lesson.id)}>
              <div className="k">← previous</div>
              <div className="t">{prev.lesson.title}</div>
            </Link>
          ) : <span />}
          {next ? (
            <Link className="next" to={lessonPath(next.module.id, next.lesson.id)}>
              <div className="k">next mission</div>
              <div className="t">{next.lesson.title} <ArrowRight size={14} weight="bold" /></div>
            </Link>
          ) : <span />}
        </div>
      </div>

      {noteOpen && (
        <NotePanel
          lessonKey={key}
          moduleId={module.id}
          lessonTitle={lesson.title}
          selection={selection}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </div>
  );
}
