import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClockIcon, GaugeIcon, SparkleIcon, BookmarkSimpleIcon, PencilSimpleLineIcon, CheckCircleIcon, ArrowRightIcon, ListChecksIcon } from "@phosphor-icons/react";
import type { LessonRef } from "../content/registry";
import { allLessons, lessonPath, lessonKey, questionaryPath, moduleDifficulty } from "../content/registry";
import { useProgress } from "../lib/progress";
import { useNotes } from "../lib/notes";
import { NotePanel } from "./note-panel";
import { ModuleIcon } from "./module-icon";
import { useUI } from "../lib/ui";
import { Tooltip } from "./ui";
export function LessonLayout({ data }: {
    data: LessonRef;
}) {
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
    const [bodyText, setBodyText] = useState("");
    const prev = allLessons[index - 1];
    const next = allLessons[index + 1];
    const Body = lesson.Body;
    const bodyRef = useRef<HTMLDivElement>(null);
    const lessonNumInModule = module.lessons.findIndex((l) => l.id === lesson.id) + 1;
    const diff = moduleDifficulty(module);
    const isInteractive = /widget|playground|canvas|demo|editor/i.test(String(Body));
    const hasQuestions = (lesson.quiz?.questions.length ?? 0) > 0 || (lesson.exercises?.length ?? 0) > 0;
    useEffect(() => { visit(key); }, [key, visit]);
    useEffect(() => {
        const text = bodyRef.current?.innerText?.replace(/\s+\n/g, "\n").trim() ?? "";
        setBodyText(text);
    }, [key]);
    const setTutorContext = useUI((s) => s.setTutorContext);
    const setCurrentParagraph = useUI((s) => s.setCurrentParagraph);
    const setCurrentExercise = useUI((s) => s.setCurrentExercise);
    const setSelectedText = useUI((s) => s.setSelectedText);
    useEffect(() => {
        setTutorContext({
            scope: "lesson",
            title: lesson.title,
            summary: lesson.summary,
            body: bodyText,
            sourceId: key,
        });
    }, [key, lesson.title, lesson.summary, bodyText, setTutorContext]);
    useEffect(() => {
        return () => {
            setTutorContext(null);
            setCurrentParagraph(null);
            setCurrentExercise(null);
            setSelectedText(null);
        };
    }, [key, setTutorContext, setCurrentParagraph, setCurrentExercise, setSelectedText]);
    useEffect(() => {
        const handleSelection = () => {
            const sel = window.getSelection();
            if (!sel) {
                setSelectedText(null);
                return;
            }
            const text = sel.toString().trim();
            const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
            if (text && range && bodyRef.current?.contains(range.commonAncestorContainer)) {
                setSelectedText(text);
            }
            else {
                setSelectedText(null);
            }
        };
        document.addEventListener("selectionchange", handleSelection);
        return () => {
            document.removeEventListener("selectionchange", handleSelection);
        };
    }, [setSelectedText]);
    useEffect(() => {
        const root = bodyRef.current;
        if (!root)
            return;
        const blocks = Array.from(root.children) as HTMLElement[];
        if (!("IntersectionObserver" in window))
            return;
        const io = new IntersectionObserver((entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    e.target.classList.add("revealed");
                    io.unobserve(e.target);
                }
            }
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
        blocks.forEach((b) => { b.classList.add("reveal"); io.observe(b); });
        return () => io.disconnect();
    }, [key]);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            setReadPct(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
            if (!bodyRef.current)
                return;
            const paragraphs = Array.from(bodyRef.current.querySelectorAll("p"));
            let activeIdx = 0;
            for (let i = 0; i < paragraphs.length; i++) {
                const rect = paragraphs[i].getBoundingClientRect();
                if (rect.top <= 250) {
                    activeIdx = i + 1;
                }
                else {
                    break;
                }
            }
            if (activeIdx > 0) {
                setCurrentParagraph(`Paragraph ${activeIdx}`);
            }
            else {
                setCurrentParagraph("Paragraph 1");
            }
            const questions = Array.from(bodyRef.current.querySelectorAll(".kc-card, .quiz-card, .exercise, .code-challenge"));
            let activeExName: string | null = null;
            for (let i = 0; i < questions.length; i++) {
                const rect = questions[i].getBoundingClientRect();
                if (rect.top < window.innerHeight - 100 && rect.bottom > 100) {
                    const header = questions[i].querySelector(".kc-eyebrow, .quiz-eyebrow, h3, h4");
                    activeExName = header?.textContent?.trim() || `Exercise ${i + 1}`;
                    break;
                }
            }
            setCurrentExercise(activeExName);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [key, setCurrentParagraph, setCurrentExercise]);
    function openNote() {
        const sel = window.getSelection?.()?.toString().trim();
        setSelection(sel && sel.length > 0 ? sel : undefined);
        setNoteOpen(true);
    }
    return (<div className="content lesson">
      <div className="sticky top-[70px] z-20 h-[2px] bg-transparent"><i className="block h-full [background-image:var(--accent-line)] w-0 shadow-[0_0_12px_rgba(255,176,0,0.7)] transition-[width] duration-100 ease-linear" style={{ width: `${readPct * 100}%` }}/></div>

      <div className="flex-1 overflow-y-auto pt-[2rem] px-[clamp(1.2rem,4vw,3rem)] pb-[6rem] w-full">
        <header className="lesson-hero prose relative mb-[2.6rem] pt-[0.5rem] pb-[2rem] border-b border-border">
          <div className="crumbs">
            <Link to="/">Dashboard</Link>
            <span>/</span>
            <Link className="seg" to={lessonPath(module.id, module.lessons[0].id)}>
              <ModuleIcon id={module.id} size={14}/> {module.title}
            </Link>
          </div>

          <div className="font-mono text-[0.72rem] tracking-[0.2em] uppercase text-accent mt-[0.4rem] mb-[0.6rem]">Mission {lessonNumInModule} / {module.lessons.length}</div>
          <h1 className="mt-0 mb-[0.7rem] text-[clamp(2rem,4vw,2.9rem)]">{lesson.title}</h1>
          <p className="lh-objective text-text-dim text-[1.05rem] leading-[1.6] max-w-[60ch] mt-0 mb-[1.4rem]">{lesson.summary}</p>

          <div className="flex items-center gap-[0.6rem] flex-wrap">
            <span className="inline-flex items-center gap-[0.4rem] font-mono text-[0.74rem] text-text-dim bg-surface border border-border rounded-pill px-[0.75rem] py-[0.35rem] [&_svg]:text-text-faint"><ClockIcon size={14} weight="duotone"/> {lesson.minutes} min</span>
            <span className="inline-flex items-center gap-[0.4rem] font-mono text-[0.74rem] text-text-dim bg-surface border border-border rounded-pill px-[0.75rem] py-[0.35rem] [&_svg]:text-text-faint"><GaugeIcon size={14} weight="duotone"/> {diff.label}</span>
            {isInteractive && <span className="inline-flex items-center gap-[0.4rem] font-mono text-[0.74rem] text-[#7fb0ff] bg-surface border border-[rgba(127,176,255,0.3)] rounded-pill px-[0.75rem] py-[0.35rem] [&_svg]:text-[#7fb0ff]"><SparkleIcon size={14} weight="fill"/> Interactive</span>}
            {isDone && <span className="inline-flex items-center gap-[0.4rem] font-mono text-[0.74rem] text-good bg-surface border border-[color-mix(in_srgb,var(--good)_40%,var(--border))] rounded-pill px-[0.75rem] py-[0.35rem] [&_svg]:text-good"><CheckCircleIcon size={14} weight="fill"/> Completed</span>}
            <span className="ml-auto flex gap-[0.5rem]">
              <Tooltip content={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}>
                <button className={"icon-btn" + (isBookmarked ? " text-accent! border-border-glow!" : "")} onClick={() => toggleBookmark(key)} aria-label="Bookmark lesson">
                  <BookmarkSimpleIcon size={16} weight={isBookmarked ? "fill" : "regular"}/>
                </button>
              </Tooltip>
              <Tooltip content="Add a note (select text first to quote it)">
                <button className="icon-btn" onClick={openNote} aria-label="Add note">
                  <PencilSimpleLineIcon size={16} weight="regular"/>
                </button>
              </Tooltip>
            </span>
          </div>
        </header>

        <div className="prose lesson-body" ref={bodyRef}>
          <Body />
        </div>

        {hasQuestions && (<div className="prose mt-[2.6rem]">
            <Link className="group flex items-center gap-[1rem] px-[1.3rem] py-[1.1rem] rounded-[16px] border border-border [background:radial-gradient(120%_160%_at_0%_0%,color-mix(in_srgb,var(--accent)_9%,transparent),transparent_55%),var(--surface)] transition-[border-color,transform] duration-200 ease-brand hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:-translate-y-px" to={questionaryPath(module.id)}>
              <span className="flex-none grid place-items-center w-[42px] h-[42px] rounded-[12px] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent"><ListChecksIcon size={22} weight="duotone"/></span>
              <span className="flex-1 min-w-0 flex flex-col gap-[0.15rem]">
                <span className="font-display font-semibold text-text">Practice in the Questionary</span>
                <span className="text-[0.85rem] text-text-dim leading-[1.45]">
                  Knowledge checks and exercises for {module.title} are collected on one page —
                  like an end-of-chapter problem set.
                </span>
              </span>
              <ArrowRightIcon size={16} weight="bold"/>
            </Link>
          </div>)}

        <div className="prose mt-[3rem]">
          <div className={"flex items-center gap-[1.2rem] px-[1.6rem] py-[1.5rem] rounded-[18px] border " + (isDone ? "border-[color-mix(in_srgb,var(--good)_34%,var(--border))] [background:radial-gradient(120%_160%_at_100%_0%,rgba(70,217,138,0.12),transparent_55%),var(--surface)]" : "border-border [background:radial-gradient(120%_160%_at_100%_0%,rgba(255,138,0,0.10),transparent_55%),var(--surface)]")}>
            <div className={"flex-none " + (isDone ? "text-good" : "text-accent")}><CheckCircleIcon size={28} weight={isDone ? "fill" : "duotone"}/></div>
            <div className="flex-1 min-w-0">
              <h3 className="mt-0 mb-[0.25rem] text-[1.15rem]">{isDone ? "Mission accomplished" : "Ready to lock it in?"}</h3>
              <p className="m-0 text-text-dim text-[0.9rem]">{isDone ? "You've completed this mission. Carry the momentum forward." : "Mark this mission complete once the concept clicks."}</p>
            </div>
            <button className={"btn" + (isDone ? "" : " primary")} onClick={() => toggleDone(key)}>
              {isDone ? "Completed ✓" : "Mark complete"}
            </button>
          </div>

          <div className="flex justify-between gap-[1rem] mt-[3.5rem] pt-[1.8rem] border-t border-border">
            {prev ? (<Link className="flex-1 px-[1.3rem] py-[1.1rem] border border-border rounded bg-surface transition-[border-color,transform,background] duration-200 ease-brand hover:border-border-glow hover:bg-surface-2 hover:-translate-y-0.5" to={lessonPath(prev.module.id, prev.lesson.id)}>
                <div className="text-[0.68rem] text-text-faint font-mono uppercase tracking-[0.1em]">← previous</div>
                <div className="text-text font-display font-medium mt-[0.3rem]">{prev.lesson.title}</div>
              </Link>) : <span />}
            {next ? (<Link className="flex-1 px-[1.3rem] py-[1.1rem] border border-border rounded bg-surface transition-[border-color,transform,background] duration-200 ease-brand hover:border-border-glow hover:bg-surface-2 hover:-translate-y-0.5 text-right" to={lessonPath(next.module.id, next.lesson.id)}>
                <div className="text-[0.68rem] text-text-faint font-mono uppercase tracking-[0.1em]">next mission</div>
                <div className="text-text font-display font-medium mt-[0.3rem]">{next.lesson.title} <ArrowRightIcon size={14} weight="bold"/></div>
              </Link>) : <span />}
          </div>
        </div>
      </div>

      {noteOpen && (<NotePanel lessonKey={key} moduleId={module.id} lessonTitle={lesson.title} selection={selection} onClose={() => setNoteOpen(false)}/>)}
    </div>);
}
