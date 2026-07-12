import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle, Circle, CaretDown, ListChecks,
  Clock, Gauge, BookOpen, Barbell, Lightning, Trophy, Sparkle, PencilSimpleLine, Brain,
} from "@phosphor-icons/react";
import type { Lesson, Module } from "../content/types";
import {
  getModule, modulesForTrack, moduleHasQuestionary, lessonPath, lessonKey, questionaryPath,
  moduleDifficulty, moduleMinutes, trackIdOf,
} from "../content/registry";
import { challengesForModule, xpForChallenge, EST_MINUTES } from "../content/challenges";
import type { CodeChallenge } from "../content/types";
import { Quiz } from "../components/Quiz";
import { Exercise } from "../components/Exercise";
import { ModuleIcon } from "../components/ModuleIcon";
import { useProgress } from "../lib/progress";

/* Namespaced key so an exercise's completion is unique across the whole course. */
const exKey = (moduleId: string, lessonId: string, exId: string) =>
  `${moduleId}/${lessonId}/${exId}`;

interface LessonStat {
  lesson: Lesson;
  key: string;
  exCount: number;
  quizCount: number;
  exDone: number;
  quizScore: number; // 0..1, best recorded; -1 if never attempted
  complete: boolean;
}

export function Questionary() {
  const { moduleId } = useParams();
  const module = moduleId ? getModule(moduleId) : undefined;

  const exercisesDone = useProgress((s) => s.exercisesDone);
  const quizScores = useProgress((s) => s.quizScores);
  const solvedChallenges = useProgress((s) => s.solvedChallenges);

  const capstones: CodeChallenge[] = useMemo(
    () => (module ? challengesForModule(trackIdOf(module), module.title) : []),
    [module]
  );
  const boss = capstones[0];

  const lessonsWithWork = useMemo(
    () =>
      (module?.lessons ?? []).filter(
        (l) => (l.quiz?.questions.length ?? 0) > 0 || (l.exercises?.length ?? 0) > 0
      ),
    [module]
  );

  if (!module) {
    return (
      <div className="content">
        <div className="prose">
          <h1>Chapter Review not found</h1>
          <p>That module doesn’t exist. Head back to the curriculum.</p>
        </div>
      </div>
    );
  }

  // ---- Derive per-lesson + chapter-wide stats ---------------------------------
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

  // Chapter meter blends the three dimensions the learner can move.
  const dims = [
    totalEx ? exMeter : null,
    quizLessons.length ? quizMeter : null,
    boss ? challengeMeter : null,
  ].filter((v): v is number => v !== null);
  const chapterMeter = dims.length ? dims.reduce((a, b) => a + b, 0) / dims.length : 0;

  const exercisesComplete = totalEx === 0 || doneEx === totalEx;
  const quizzesComplete = quizLessons.length === 0 || attemptedQuizzes.length === quizLessons.length;
  const chapterComplete = exercisesComplete && quizzesComplete && challengeMeter === 1;

  // XP: exercises + quiz mastery + boss challenge.
  const xpEarned =
    doneEx * 20 +
    Math.round(attemptedQuizzes.reduce((sum, s) => sum + s.quizScore * s.quizCount, 0) * 15) +
    (bossSolved && boss ? xpForChallenge(boss) : 0);

  const keyConcepts = lessonsWithWork.slice(0, 6);
  const diff = moduleDifficulty(module);
  const minutes = moduleMinutes(module);

  return (
    <div className="content chapter-review">
      {/* 1 · Editorial hero -------------------------------------------------- */}
      <header className="cr-hero">
        <div className="crumbs">
          <Link to="/">Dashboard</Link>
          <span>/</span>
          <Link className="seg" to={lessonPath(module.id, module.lessons[0].id)}>
            <ModuleIcon id={module.id} size={14} /> {module.title}
          </Link>
        </div>

        <div className="cr-kicker">Chapter Review</div>
        <h1 className="cr-title">{module.title}</h1>
        <p className="cr-lede">
          Consolidate everything from this chapter — work the exercises, pass the knowledge
          checks, and take on the challenge to prove you’ve mastered it.
        </p>

        <div className="cr-facts">
          <span className="cr-fact"><Clock size={15} weight="duotone" /> {minutes} min</span>
          <span className="cr-fact"><Gauge size={15} weight="duotone" /> {diff.label}</span>
          <span className="cr-fact"><BookOpen size={15} weight="duotone" /> {lessonsWithWork.length} lessons</span>
          {totalEx > 0 && <span className="cr-fact"><Barbell size={15} weight="duotone" /> {totalEx} exercises</span>}
          {totalQ > 0 && <span className="cr-fact"><Brain size={15} weight="duotone" /> {totalQ} questions</span>}
        </div>
      </header>

      {lessonsWithWork.length === 0 ? (
        <div className="cr-empty">This chapter has no exercises or knowledge checks yet.</div>
      ) : (
        <>
          {/* Progress rail --------------------------------------------------- */}
          <section className="cr-progress">
            <Meter label="Chapter" value={chapterMeter} tone="amber" />
            {totalEx > 0 && <Meter label="Exercises" value={exMeter} tone="emerald" caption={`${doneEx}/${totalEx}`} />}
            {quizLessons.length > 0 && (
              <Meter label="Knowledge Check" value={quizMeter} tone="violet" caption={`${Math.round(quizMeter * 100)}%`} />
            )}
            {boss && (
              <div className="cr-meter">
                <div className="cr-meter-head">
                  <span className="cr-meter-label">Challenge</span>
                  <span className="cr-meter-cap">{bossSolved ? "solved" : "open"}</span>
                </div>
                <div className={"cr-token" + (bossSolved ? " on" : "")}>
                  {bossSolved ? <CheckCircle size={20} weight="fill" /> : <Circle size={20} weight="duotone" />}
                </div>
              </div>
            )}
          </section>

          {/* 2 · Chapter summary --------------------------------------------- */}
          {keyConcepts.length > 0 && (
            <section className="cr-summary">
              <div className="cr-section-label">What this chapter covered</div>
              <ul className="cr-concepts">
                {keyConcepts.map((l) => (
                  <li key={l.id}>
                    <CheckCircle size={17} weight="fill" /> {l.title}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3 · Section review ---------------------------------------------- */}
          <section className="cr-sections">
            <div className="cr-section-label">Section review</div>
            {stats.map((stat, i) => (
              <SectionReview key={stat.lesson.id} module={module} stat={stat} index={i + 1} />
            ))}
          </section>

          {/* 6 · Challenge problem — the chapter boss level ------------------ */}
          {boss && <ChallengeCard challenge={boss} solved={bossSolved} />}

          {/* 7 · Completion -------------------------------------------------- */}
          {chapterComplete ? (
            <CompletionBanner
              module={module}
              scorePct={Math.round(chapterMeter * 100)}
              xp={xpEarned}
            />
          ) : (
            <section className="cr-footer">
              <div className="cr-footer-note">
                <Sparkle size={18} weight="duotone" />
                Keep going — finish the exercises and knowledge checks to complete this chapter.
              </div>
              <Link className="btn ghost" to={lessonPath(module.id, module.lessons[0].id)}>
                <ArrowLeft size={15} weight="bold" /> Back to chapter
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ---- Progress meter ---------------------------------------------------------- */
function Meter({
  label, value, tone, caption,
}: {
  label: string; value: number; tone: "amber" | "emerald" | "violet"; caption?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={"cr-meter " + tone}>
      <div className="cr-meter-head">
        <span className="cr-meter-label">{label}</span>
        <span className="cr-meter-cap">{caption ?? `${pct}%`}</span>
      </div>
      <div className="cr-bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/* ---- Collapsible per-lesson review section ----------------------------------- */
function SectionReview({
  module, stat, index,
}: {
  module: Module; stat: LessonStat; index: number;
}) {
  const { lesson, key, exCount, quizCount, complete } = stat;
  const [open, setOpen] = useState(!complete);

  return (
    <div className={"cr-block" + (complete ? " complete" : "") + (open ? " open" : "")}>
      <button className="cr-block-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={"cr-block-num" + (complete ? " done" : "")}>
          {complete ? <CheckCircle size={20} weight="fill" /> : index}
        </span>
        <span className="cr-block-titles">
          <span className="cr-block-title">{lesson.title}</span>
          <span className="cr-block-sub">
            {exCount > 0 && `${exCount} exercise${exCount === 1 ? "" : "s"}`}
            {exCount > 0 && quizCount > 0 && " · "}
            {quizCount > 0 && `${quizCount} quiz question${quizCount === 1 ? "" : "s"}`}
          </span>
        </span>
        <span className="cr-block-cta">
          {complete ? "Reviewed" : open ? "Hide" : "Begin review"}
          <CaretDown size={15} weight="bold" className="cr-caret" />
        </span>
      </button>

      {open && (
        <div className="cr-block-body">
          {exCount > 0 && <ExerciseFlow module={module} lesson={lesson} />}

          {quizCount > 0 && (
            <div className="cr-kc">
              <div className="cr-group-label"><Brain size={14} weight="duotone" /> Knowledge Check</div>
              <Quiz id={key} quiz={lesson.quiz!} lessonTitle={lesson.title} lessonSummary={lesson.summary} />
            </div>
          )}

          <Link className="cr-block-link" to={lessonPath(module.id, lesson.id)}>
            <PencilSimpleLine size={13} weight="duotone" /> Revisit the lesson
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---- One-exercise-at-a-time flow --------------------------------------------- */
function ExerciseFlow({ module, lesson }: { module: Module; lesson: Lesson }) {
  const exercises = lesson.exercises ?? [];
  const exercisesDone = useProgress((s) => s.exercisesDone);
  const recordExercise = useProgress((s) => s.recordExercise);

  const keyOf = (exId: string) => exKey(module.id, lesson.id, exId);
  const isDone = (i: number) => !!exercisesDone[keyOf(exercises[i].id)];

  const doneCount = exercises.filter((_, i) => isDone(i)).length;
  const allDone = doneCount === exercises.length;

  // cursor points at the exercise being worked. Start at the first undone one.
  const firstUndone = exercises.findIndex((_, i) => !isDone(i));
  const [cursor, setCursor] = useState(firstUndone < 0 ? 0 : firstUndone);

  // Next undone exercise other than `from`, wrapping around; -1 if none remain.
  function nextUndone(from: number): number {
    const n = exercises.length;
    for (let step = 1; step < n; step++) {
      const i = (from + step) % n;
      if (!isDone(i)) return i;
    }
    return -1;
  }

  const active = allDone ? null : exercises[cursor];
  const undoneRemaining = exercises.filter((_, i) => !isDone(i) && i !== cursor).length;

  return (
    <div className="cr-exflow">
      <div className="cr-group-label"><Barbell size={14} weight="duotone" /> Exercises · {doneCount}/{exercises.length}</div>

      {/* Completed exercises collapse into compact success rows. */}
      {exercises.map((ex, i) =>
        isDone(i) ? (
          <div key={ex.id} className="cr-ex-done">
            <CheckCircle size={17} weight="fill" />
            <span className="cr-ex-done-txt">{ex.prompt}</span>
          </div>
        ) : null
      )}

      {active ? (
        <div className="cr-ex-active" key={active.id}>
          <Exercise
            ex={active}
            step={cursor}
            total={exercises.length}
            onResult={(passed) => {
              recordExercise(keyOf(active.id), passed);
              if (passed) {
                const nxt = nextUndone(cursor);
                if (nxt >= 0) setCursor(nxt);
              }
            }}
            onSkip={undoneRemaining > 0 ? () => setCursor(nextUndone(cursor)) : undefined}
          />
        </div>
      ) : (
        <div className="cr-ex-allclear">
          <CheckCircle size={18} weight="fill" /> All exercises complete.
        </div>
      )}
    </div>
  );
}

/* ---- Challenge problem (boss level) ------------------------------------------ */
function ChallengeCard({ challenge, solved }: { challenge: CodeChallenge; solved: boolean }) {
  return (
    <section className={"cr-challenge" + (solved ? " solved" : "")}>
      <div className="cr-section-label">Challenge problem</div>
      <div className="cr-boss">
        <div className="cr-boss-glow" aria-hidden />
        <div className="cr-boss-head">
          <span className="cr-boss-badge">
            {solved ? <Trophy size={22} weight="fill" /> : <Barbell size={22} weight="duotone" />}
          </span>
          <div>
            <div className="cr-boss-kicker">Boss level · combine the whole chapter</div>
            <h3 className="cr-boss-title">{challenge.title}</h3>
          </div>
          {solved && <span className="cr-boss-solved"><CheckCircle size={16} weight="fill" /> Solved</span>}
        </div>

        <div className="cr-boss-meta">
          <span className={"cr-diff " + challenge.difficulty.toLowerCase()}>{challenge.difficulty}</span>
          <span className="dot">·</span>
          <Clock size={13} weight="duotone" /> {EST_MINUTES[challenge.difficulty]} min
          <span className="dot">·</span>
          <Lightning size={13} weight="duotone" /> {xpForChallenge(challenge)} XP
        </div>

        <div className="cr-boss-prompt" dangerouslySetInnerHTML={{ __html: challenge.prompt }} />

        <Link className="btn primary" to={`/practice?c=${challenge.id}`}>
          {solved ? "Revisit challenge" : "Take on the challenge"} <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </section>
  );
}

/* ---- Completion celebration -------------------------------------------------- */
function CompletionBanner({
  module, scorePct, xp,
}: {
  module: Module; scorePct: number; xp: number;
}) {
  return (
    <section className="cr-complete" role="status">
      <div className="cr-complete-glow" aria-hidden />
      <div className="cr-complete-icon"><Trophy size={40} weight="duotone" /></div>
      <div className="cr-complete-kicker">Chapter complete</div>
      <h2 className="cr-complete-title">{module.title}</h2>

      <div className="cr-complete-stats">
        <div className="cr-cstat">
          <div className="cr-cstat-val">{scorePct}%</div>
          <div className="cr-cstat-lbl">Overall score</div>
        </div>
        <div className="cr-cstat">
          <div className="cr-cstat-val">+{xp}</div>
          <div className="cr-cstat-lbl">XP earned</div>
        </div>
      </div>

      <NextChapterLink module={module} />
    </section>
  );
}

function NextChapterLink({ module }: { module: Module }) {
  // Next module in the same track that has its own review to unlock.
  const next = useMemo(() => {
    const mods = modulesForTrack(trackIdOf(module));
    const idx = mods.findIndex((m) => m.id === module.id);
    for (let j = idx + 1; j < mods.length; j++) {
      if (moduleHasQuestionary(mods[j])) return mods[j];
    }
    return undefined;
  }, [module]);

  if (!next) {
    return (
      <div className="cr-complete-next">
        <ListChecks size={16} weight="duotone" /> You’ve reached the end of this track — outstanding work.
      </div>
    );
  }
  return (
    <Link className="btn primary lg" to={questionaryPath(next.id)}>
      Next chapter: {next.title} <ArrowRight size={16} weight="bold" />
    </Link>
  );
}
