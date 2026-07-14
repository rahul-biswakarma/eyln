import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CircleIcon, CaretDownIcon, ListChecksIcon, ClockIcon, GaugeIcon, BookOpenIcon, BarbellIcon, LightningIcon, TrophyIcon, SparkleIcon, PencilSimpleLineIcon, BrainIcon } from "@phosphor-icons/react";
import type { Lesson, Module } from "../../content/types";
import { getModule, modulesForTrack, moduleHasQuestionary, lessonPath, lessonKey, questionaryPath, moduleDifficulty, moduleMinutes, trackIdOf, } from "../../content/registry";
import { challengesForModule, xpForChallenge, EST_MINUTES } from "../../content/challenges";
import type { CodeChallenge } from "../../content/types";
import { Quiz } from "../../components/quiz";
import { Exercise } from "../../components/exercise";
import { ModuleIcon } from "../../components/module-icon";
import { useProgress } from "../../lib/progress";
import { useUI } from "../../lib/ui";
import { buttonClass } from "../../components/ui";
const exKey = (moduleId: string, lessonId: string, exId: string) => `${moduleId}/${lessonId}/${exId}`;
interface LessonStat {
    lesson: Lesson;
    key: string;
    exCount: number;
    quizCount: number;
    exDone: number;
    quizScore: number;
    complete: boolean;
}
export function Questionary() {
    const { moduleId } = useParams();
    const module = moduleId ? getModule(moduleId) : undefined;
    const exercisesDone = useProgress((s) => s.exercisesDone);
    const quizScores = useProgress((s) => s.quizScores);
    const solvedChallenges = useProgress((s) => s.solvedChallenges);
    const capstones: CodeChallenge[] = useMemo(() => (module ? challengesForModule(trackIdOf(module), module.title) : []), [module]);
    const boss = capstones[0];
    const lessonsWithWork = useMemo(() => (module?.lessons ?? []).filter((l) => (l.quiz?.questions.length ?? 0) > 0 || (l.exercises?.length ?? 0) > 0), [module]);
    const setTutorContext = useUI((s) => s.setTutorContext);
    useEffect(() => {
        if (!module)
            return;
        setTutorContext({
            scope: "chapter review",
            title: module.title,
            summary: module.blurb,
            body: `Chapter review covering: ${lessonsWithWork.map((l) => l.title).join(", ")}.`,
            sourceId: `${module.id}/questionary`,
        });
    }, [module, lessonsWithWork, setTutorContext]);
    useEffect(() => () => setTutorContext(null), [setTutorContext]);
    if (!module) {
        return (<div className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
        <div className="prose animate-[rise_0.4s_var(--ease)_both]">
          <h1>Chapter Review not found</h1>
          <p>That module doesn’t exist. Head back to the curriculum.</p>
        </div>
      </div>);
    }
    const stats: LessonStat[] = lessonsWithWork.map((lesson) => {
        const key = lessonKey(module.id, lesson.id);
        const exercises = lesson.exercises ?? [];
        const exCount = exercises.length;
        const quizCount = lesson.quiz?.questions.length ?? 0;
        const exDone = exercises.filter((ex) => exercisesDone[exKey(module.id, lesson.id, ex.id)]).length;
        const quizScore = key in quizScores ? quizScores[key] : -1;
        const quizPassed = quizCount === 0 || quizScore >= 0;
        const complete = exDone === exCount && quizPassed;
        return { lesson, key, exCount, quizCount, exDone, quizScore, complete };
    });
    const totalEx = stats.reduce((n, s) => n + s.exCount, 0);
    const doneEx = stats.reduce((n, s) => n + s.exDone, 0);
    const quizLessons = stats.filter((s) => s.quizCount > 0);
    const attemptedQuizzes = quizLessons.filter((s) => s.quizScore >= 0);
    const avgQuiz = attemptedQuizzes.length
        ? attemptedQuizzes.reduce((sum, s) => sum + s.quizScore, 0) / quizLessons.length
        : 0;
    const totalQ = stats.reduce((n, s) => n + s.quizCount, 0);
    const bossSolved = boss ? !!solvedChallenges[boss.id] : false;
    const exMeter = totalEx ? doneEx / totalEx : 1;
    const quizMeter = quizLessons.length ? avgQuiz : 1;
    const challengeMeter = boss ? (bossSolved ? 1 : 0) : 1;
    const dims = [
        totalEx ? exMeter : null,
        quizLessons.length ? quizMeter : null,
        boss ? challengeMeter : null,
    ].filter((v): v is number => v !== null);
    const chapterMeter = dims.length ? dims.reduce((a, b) => a + b, 0) / dims.length : 0;
    const exercisesComplete = totalEx === 0 || doneEx === totalEx;
    const quizzesComplete = quizLessons.length === 0 || attemptedQuizzes.length === quizLessons.length;
    const chapterComplete = exercisesComplete && quizzesComplete && challengeMeter === 1;
    const xpEarned = doneEx * 20 +
        Math.round(attemptedQuizzes.reduce((sum, s) => sum + s.quizScore * s.quizCount, 0) * 15) +
        (bossSolved && boss ? xpForChallenge(boss) : 0);
    const keyConcepts = lessonsWithWork.slice(0, 6);
    const diff = moduleDifficulty(module);
    const minutes = moduleMinutes(module);
    return (<div className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden mx-auto max-w-[780px] px-[clamp(1.2rem,4vw,2rem)] pt-[clamp(1.6rem,4vw,3.2rem)] pb-24" style={{ "--cr-accent": "var(--track-accent, var(--accent))" } as React.CSSProperties}>

      <header className="pb-[2.4rem] border-b border-border">
        <div className="crumbs flex items-center gap-[0.5rem] text-[0.74rem] text-text-faint mb-4 flex-wrap font-mono">
          <Link className="text-text-dim hover:text-accent" to="/">Dashboard</Link>
          <span>/</span>
          <Link className="seg text-text-faint hover:text-accent" to={lessonPath(module.id, module.lessons[0].id)}>
            <ModuleIcon id={module.id} size={14}/> {module.title}
          </Link>
        </div>

        <div className="font-mono text-[0.72rem] tracking-[0.22em] uppercase text-[var(--cr-accent)] mt-[1.4rem] mb-[0.7rem]">Chapter Review</div>
        <h1 className="font-display font-semibold tracking-[-0.02em] text-[clamp(2.1rem,5vw,3.1rem)] leading-[1.05] m-0">{module.title}</h1>
        <p className="text-text-dim text-[1.08rem] leading-[1.6] max-w-[60ch] mt-4">
          Consolidate everything from this chapter — work the exercises, pass the knowledge
          checks, and take on the challenge to prove you’ve mastered it.
        </p>

        <div className="flex flex-wrap gap-[1.3rem] mt-[1.6rem]">
          <span className="inline-flex items-center gap-[0.42rem] text-[0.86rem] text-text-dim font-mono [&_svg]:text-[var(--cr-accent)] [&_svg]:opacity-90"><ClockIcon size={15} weight="duotone"/> {minutes} min</span>
          <span className="inline-flex items-center gap-[0.42rem] text-[0.86rem] text-text-dim font-mono [&_svg]:text-[var(--cr-accent)] [&_svg]:opacity-90"><GaugeIcon size={15} weight="duotone"/> {diff.label}</span>
          <span className="inline-flex items-center gap-[0.42rem] text-[0.86rem] text-text-dim font-mono [&_svg]:text-[var(--cr-accent)] [&_svg]:opacity-90"><BookOpenIcon size={15} weight="duotone"/> {lessonsWithWork.length} lessons</span>
          {totalEx > 0 && <span className="inline-flex items-center gap-[0.42rem] text-[0.86rem] text-text-dim font-mono [&_svg]:text-[var(--cr-accent)] [&_svg]:opacity-90"><BarbellIcon size={15} weight="duotone"/> {totalEx} exercises</span>}
          {totalQ > 0 && <span className="inline-flex items-center gap-[0.42rem] text-[0.86rem] text-text-dim font-mono [&_svg]:text-[var(--cr-accent)] [&_svg]:opacity-90"><BrainIcon size={15} weight="duotone"/> {totalQ} questions</span>}
        </div>
      </header>

      {lessonsWithWork.length === 0 ? (<div className="text-text-dim py-12 text-center">This chapter has no exercises or knowledge checks yet.</div>) : (<>

          <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-8 gap-y-[1.4rem] py-8 border-b border-border">
            <Meter label="Chapter" value={chapterMeter} tone="amber"/>
            {totalEx > 0 && <Meter label="Exercises" value={exMeter} tone="emerald" caption={`${doneEx}/${totalEx}`}/>}
            {quizLessons.length > 0 && (<Meter label="Knowledge Check" value={quizMeter} tone="violet" caption={`${Math.round(quizMeter * 100)}%`}/>)}
            {boss && (<div className="min-w-0">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[0.82rem] font-medium text-text">Challenge</span>
                  <span className="font-mono text-[0.72rem] text-text-faint">{bossSolved ? "solved" : "open"}</span>
                </div>
                <div className={"grid place-items-center w-8 h-8 rounded-full border transition-[color,border-color] duration-200 ease-brand" + (bossSolved ? " text-accent border-[color-mix(in_srgb,var(--accent)_45%,transparent)]" : " text-text-faint border-border")}>
                  {bossSolved ? <CheckCircleIcon size={20} weight="fill"/> : <CircleIcon size={20} weight="duotone"/>}
                </div>
              </div>)}
          </section>


          {keyConcepts.length > 0 && (<section className="py-[2.4rem] border-b border-border">
              <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-text-faint mb-[1.1rem]">What this chapter covered</div>
              <ul className="list-none p-0 m-0 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-[1.6rem] gap-y-[0.7rem]">
                {keyConcepts.map((l) => (<li key={l.id} className="flex items-center gap-[0.6rem] font-display font-medium text-[1.02rem] text-text m-0 [&_svg]:text-good [&_svg]:flex-none">
                    <CheckCircleIcon size={17} weight="fill"/> {l.title}
                  </li>))}
              </ul>
            </section>)}


          <section className="pt-[2.4rem]">
            <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-text-faint mb-[1.1rem]">Section review</div>
            {stats.map((stat, i) => (<SectionReview key={stat.lesson.id} module={module} stat={stat} index={i + 1}/>))}
          </section>


          {boss && <ChallengeCard challenge={boss} solved={bossSolved}/>}


          {chapterComplete ? (<CompletionBanner module={module} scorePct={Math.round(chapterMeter * 100)} xp={xpEarned}/>) : (<section className="pt-12 flex flex-col items-start gap-[1.2rem]">
              <div className="flex items-center gap-[0.55rem] text-text-dim text-[0.92rem] [&_svg]:text-[var(--cr-accent)]">
                <SparkleIcon size={18} weight="duotone"/>
                Keep going — finish the exercises and knowledge checks to complete this chapter.
              </div>
              <Link className={buttonClass("ghost")} to={lessonPath(module.id, module.lessons[0].id)}>
                <ArrowLeftIcon size={15} weight="bold"/> Back to chapter
              </Link>
            </section>)}
        </>)}
    </div>);
}
function Meter({ label, value, tone, caption, }: {
    label: string;
    value: number;
    tone: "amber" | "emerald" | "violet";
    caption?: string;
}) {
    const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
    const toneBg: Record<"amber" | "emerald" | "violet", string> = {
        amber: "bg-[var(--accent-grad)]",
        emerald: "bg-[linear-gradient(90deg,#2FBF71,#46D98A)]",
        violet: "bg-[linear-gradient(90deg,#7C5CFF,#A98CFF)]",
    };
    return (<div className="min-w-0">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[0.82rem] font-medium text-text">{label}</span>
        <span className="font-mono text-[0.72rem] text-text-faint">{caption ?? `${pct}%`}</span>
      </div>
      <div className="h-1.5 rounded-pill bg-[color-mix(in_srgb,var(--text)_8%,transparent)] overflow-hidden"><i className={"block h-full rounded-pill transition-[width] duration-[900ms] ease-brand " + toneBg[tone]} style={{ width: `${pct}%` }}/></div>
    </div>);
}
function SectionReview({ module, stat, index, }: {
    module: Module;
    stat: LessonStat;
    index: number;
}) {
    const { lesson, key, exCount, quizCount, complete } = stat;
    const [open, setOpen] = useState(!complete);
    return (<div className="border-t border-border [&:last-of-type]:border-b [&:last-of-type]:border-border">
      <button className="w-full bg-transparent border-0 cursor-pointer text-left flex items-center gap-4 py-6 px-1 text-text transition-[background] duration-200 ease-brand hover:bg-[color-mix(in_srgb,var(--text)_3%,transparent)]" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={"flex-none grid place-items-center w-8 h-8 rounded-full font-mono text-[0.9rem] font-semibold border" + (complete ? " text-good border-[color-mix(in_srgb,var(--good)_45%,transparent)]" : " text-[var(--cr-accent)] border-[color-mix(in_srgb,var(--cr-accent)_35%,var(--border))]")}>
          {complete ? <CheckCircleIcon size={20} weight="fill"/> : index}
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-[0.15rem]">
          <span className={"font-display font-semibold text-[1.12rem]" + (complete ? " text-text-dim" : "")}>{lesson.title}</span>
          <span className="text-[0.82rem] text-text-faint font-mono">
            {exCount > 0 && `${exCount} exercise${exCount === 1 ? "" : "s"}`}
            {exCount > 0 && quizCount > 0 && " · "}
            {quizCount > 0 && `${quizCount} quiz question${quizCount === 1 ? "" : "s"}`}
          </span>
        </span>
        <span className="flex-none inline-flex items-center gap-[0.4rem] text-[0.82rem] text-text-dim">
          {complete ? "Reviewed" : open ? "Hide" : "Begin review"}
          <CaretDownIcon size={15} weight="bold" className={"transition-transform duration-200 ease-brand" + (open ? " rotate-180" : "")}/>
        </span>
      </button>

      {open && (<div className="pt-[0.4rem] pb-8 animate-[cr-rise_300ms_var(--ease)]">
          {exCount > 0 && <ExerciseFlow module={module} lesson={lesson}/>}

          {quizCount > 0 && (<div className="mt-[1.8rem] mb-[0.4rem]">
              <div className="flex items-center gap-[0.45rem] font-mono text-[0.72rem] tracking-[0.14em] uppercase text-text-faint mt-[0.4rem] mb-4 [&_svg]:text-[var(--cr-accent)]"><BrainIcon size={14} weight="duotone"/> Knowledge Check</div>
              <Quiz id={key} quiz={lesson.quiz!} lessonTitle={lesson.title} lessonSummary={lesson.summary}/>
            </div>)}

          <Link className="inline-flex items-center gap-[0.4rem] mt-[1.4rem] text-[0.82rem] text-text-faint hover:text-[var(--cr-accent)]" to={lessonPath(module.id, lesson.id)}>
            <PencilSimpleLineIcon size={13} weight="duotone"/> Revisit the lesson
          </Link>
        </div>)}
    </div>);
}
function ExerciseFlow({ module, lesson }: {
    module: Module;
    lesson: Lesson;
}) {
    const exercises = lesson.exercises ?? [];
    const exercisesDone = useProgress((s) => s.exercisesDone);
    const recordExercise = useProgress((s) => s.recordExercise);
    const keyOf = (exId: string) => exKey(module.id, lesson.id, exId);
    const isDone = (i: number) => !!exercisesDone[keyOf(exercises[i].id)];
    const doneCount = exercises.filter((_, i) => isDone(i)).length;
    const allDone = doneCount === exercises.length;
    const firstUndone = exercises.findIndex((_, i) => !isDone(i));
    const [cursor, setCursor] = useState(firstUndone < 0 ? 0 : firstUndone);
    function nextUndone(from: number): number {
        const n = exercises.length;
        for (let step = 1; step < n; step++) {
            const i = (from + step) % n;
            if (!isDone(i))
                return i;
        }
        return -1;
    }
    const active = allDone ? null : exercises[cursor];
    const undoneRemaining = exercises.filter((_, i) => !isDone(i) && i !== cursor).length;
    return (<div className="mb-[1.8rem]">
      <div className="flex items-center gap-[0.45rem] font-mono text-[0.72rem] tracking-[0.14em] uppercase text-text-faint mt-[0.4rem] mb-4 [&_svg]:text-[var(--cr-accent)]"><BarbellIcon size={14} weight="duotone"/> Exercises · {doneCount}/{exercises.length}</div>


      {exercises.map((ex, i) => isDone(i) ? (<div key={ex.id} className="flex items-center gap-[0.6rem] py-[0.7rem] px-[0.9rem] mb-2 rounded-sm bg-[color-mix(in_srgb,var(--good)_8%,transparent)] animate-[cr-rise_260ms_var(--ease)] [&_svg]:text-good [&_svg]:flex-none">
            <CheckCircleIcon size={17} weight="fill"/>
            <span className="flex-1 min-w-0 text-[0.86rem] text-text-dim overflow-hidden text-ellipsis whitespace-nowrap">{ex.prompt}</span>
          </div>) : null)}

      {active ? (<div className="animate-[cr-rise_300ms_var(--ease)]" key={active.id}>
          <Exercise ex={active} logId={keyOf(active.id)} step={cursor} total={exercises.length} onResult={(passed) => {
                recordExercise(keyOf(active.id), passed);
                if (passed) {
                    const nxt = nextUndone(cursor);
                    if (nxt >= 0)
                        setCursor(nxt);
                }
            }} onSkip={undoneRemaining > 0 ? () => setCursor(nextUndone(cursor)) : undefined}/>
        </div>) : (<div className="flex items-center gap-2 text-good text-[0.9rem] mb-[0.4rem]">
          <CheckCircleIcon size={18} weight="fill"/> All exercises complete.
        </div>)}
    </div>);
}
function ChallengeCard({ challenge, solved }: {
    challenge: CodeChallenge;
    solved: boolean;
}) {
    const diffCls: Record<"Easy" | "Medium" | "Hard", string> = {
        Easy: "text-good bg-[color-mix(in_srgb,var(--good)_14%,transparent)]",
        Medium: "text-warn bg-[color-mix(in_srgb,var(--warn)_14%,transparent)]",
        Hard: "text-bad bg-[color-mix(in_srgb,var(--bad)_14%,transparent)]",
    };
    return (<section className="pt-12 pb-4">
      <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-text-faint mb-[1.1rem]">Challenge problem</div>
      <div className={"relative overflow-hidden rounded-lg border py-[1.8rem] px-[1.9rem] bg-[radial-gradient(120%_140%_at_100%_0%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_55%),var(--surface)]" + (solved ? " border-[color-mix(in_srgb,var(--good)_30%,var(--border))]" : " border-[color-mix(in_srgb,var(--accent)_24%,var(--border))]")}>
        <div className="absolute -top-[40%] right-[40%] bottom-auto -left-[10%] h-[260px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_22%,transparent),transparent)] blur-[20px] pointer-events-none" aria-hidden/>
        <div className="relative flex items-center gap-[0.9rem]">
          <span className={"flex-none grid place-items-center w-[46px] h-[46px] rounded-[14px]" + (solved ? " bg-[color-mix(in_srgb,var(--good)_16%,transparent)] text-good" : " bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-accent")}>
            {solved ? <TrophyIcon size={22} weight="fill"/> : <BarbellIcon size={22} weight="duotone"/>}
          </span>
          <div>
            <div className="font-mono text-[0.68rem] tracking-[0.14em] uppercase text-text-faint">Boss level · combine the whole chapter</div>
            <h3 className="font-display font-semibold text-[1.35rem] mt-[0.1rem]">{challenge.title}</h3>
          </div>
          {solved && <span className="ml-auto inline-flex items-center gap-[0.35rem] text-[0.78rem] text-good font-mono"><CheckCircleIcon size={16} weight="fill"/> Solved</span>}
        </div>

        <div className="relative flex items-center gap-2 flex-wrap my-[1.1rem] text-[0.82rem] text-text-dim font-mono">
          <span className={"font-semibold py-[0.1rem] px-2 rounded-xs " + diffCls[challenge.difficulty]}>{challenge.difficulty}</span>
          <span className="text-text-faint">·</span>
          <ClockIcon size={13} weight="duotone"/> {EST_MINUTES[challenge.difficulty]} min
          <span className="text-text-faint">·</span>
          <LightningIcon size={13} weight="duotone"/> {xpForChallenge(challenge)} XP
        </div>

        <div className="relative text-text-dim leading-[1.6] mb-[1.4rem] [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-text" dangerouslySetInnerHTML={{ __html: challenge.prompt }}/>

        <Link className={buttonClass("primary")} to={`/practice?c=${challenge.id}`}>
          {solved ? "Revisit challenge" : "Take on the challenge"} <ArrowRightIcon size={15} weight="bold"/>
        </Link>
      </div>
    </section>);
}
function CompletionBanner({ module, scorePct, xp, }: {
    module: Module;
    scorePct: number;
    xp: number;
}) {
    return (<section className="relative overflow-hidden mt-12 py-12 px-8 text-center rounded-lg border border-[color-mix(in_srgb,var(--accent)_24%,var(--border))] animate-[cr-rise_500ms_var(--ease)] bg-[radial-gradient(120%_120%_at_50%_-10%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_60%),var(--surface)]" role="status">
      <div className="absolute -top-[60%] right-[20%] bottom-auto left-[20%] h-[320px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_24%,transparent),transparent)] blur-[30px] pointer-events-none" aria-hidden/>
      <div className="relative text-accent"><TrophyIcon size={40} weight="duotone"/></div>
      <div className="relative font-mono text-[0.72rem] tracking-[0.22em] uppercase text-accent mt-[0.6rem] mb-[0.3rem]">Chapter complete</div>
      <h2 className="relative font-display font-semibold text-[1.9rem] m-0">{module.title}</h2>

      <div className="relative flex justify-center gap-12 my-[1.8rem]">
        <div>
          <div className="font-display font-semibold text-[2.2rem] text-text leading-none">{scorePct}%</div>
          <div className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-text-faint mt-[0.4rem]">Overall score</div>
        </div>
        <div>
          <div className="font-display font-semibold text-[2.2rem] text-text leading-none">+{xp}</div>
          <div className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-text-faint mt-[0.4rem]">XP earned</div>
        </div>
      </div>

      <NextChapterLink module={module}/>
    </section>);
}
function NextChapterLink({ module }: {
    module: Module;
}) {
    const next = useMemo(() => {
        const mods = modulesForTrack(trackIdOf(module));
        const idx = mods.findIndex((m) => m.id === module.id);
        for (let j = idx + 1; j < mods.length; j++) {
            if (moduleHasQuestionary(mods[j]))
                return mods[j];
        }
        return undefined;
    }, [module]);
    if (!next) {
        return (<div className="relative inline-flex items-center gap-2 text-text-dim text-[0.92rem]">
        <ListChecksIcon size={16} weight="duotone"/> You’ve reached the end of this track — outstanding work.
      </div>);
    }
    return (<Link className={buttonClass("primary", "lg")} to={questionaryPath(next.id)}>
      Next chapter: {next.title} <ArrowRightIcon size={16} weight="bold"/>
    </Link>);
}
