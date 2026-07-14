import { Link } from "react-router-dom";
import { lessonPath } from "../../content/registry";
import { useProgress } from "../../lib/progress";
import { useNotes, dueReminders } from "../../lib/notes";
import { computeStats, formatMinutes, recentActivity, relativeTime } from "../../lib/stats";
import { StatCard } from "../../components/stat-card";
import { Sparkline } from "../../components/sparkline";
import { RoadmapRail } from "../../components/roadmap-rail";
import { ProgressRing } from "../../components/progress-ring";
import { CoachCard } from "../../components/coach-card";
import { TrackCard } from "../../components/track-card";
import { ModuleIcon } from "../../components/module-icon";
import { tracks } from "../../content/tracks";
export function Dashboard() {
    const done = useProgress((s) => s.done);
    const quizScores = useProgress((s) => s.quizScores);
    const lastVisited = useProgress((s) => s.lastVisited);
    const solvedChallenges = useProgress((s) => s.solvedChallenges);
    const exercisesDone = useProgress((s) => s.exercisesDone);
    const s = computeStats(done, quizScores);
    const notes = useNotes((s) => s.notes);
    const reminders = useNotes((s) => s.reminders);
    const bookmarks = useNotes((s) => s.bookmarks);
    const dueCount = dueReminders(reminders, Date.now()).length;
    const totalBookmarks = Object.keys(bookmarks).length;
    const solvedCount = Object.keys(solvedChallenges).length;
    const exercisesCount = Object.values(exercisesDone).filter(Boolean).length;
    const greeting = (() => {
        const h = new Date().getHours();
        return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    })();
    const activity = recentActivity(lastVisited, done);
    const now = Date.now();
    const next = s.nextRef;
    const series = s.perModuleDone.reduce<number[]>((acc, n) => {
        acc.push((acc[acc.length - 1] ?? 0) + n);
        return acc;
    }, []);
    return (<div className="dash flex-1 overflow-y-auto max-w-[1240px] w-full mx-auto min-h-0">
      <div className="flex items-end justify-between gap-6 pt-10 px-[clamp(1.2rem,4vw,3rem)] pb-[1.2rem] shrink-0">
        <div>
          <div className="font-mono text-[0.72rem] tracking-[0.24em] uppercase text-accent mb-[0.7rem] flex items-center gap-[0.6rem] before:content-[''] before:w-[22px] before:h-px before:bg-accent before:opacity-70">Mission Control</div>
          <h1 className="m-0">{greeting}, builder</h1>
          <div className="text-text-dim mt-[0.6rem] max-w-[46ch] text-base">
            {s.lessonsDone === 0
            ? "Your journey from a single triangle to a 3D world starts here."
            : `You've cleared ${s.lessonsDone} of ${s.totalLessons} lessons. Keep the momentum.`}
          </div>
        </div>
        {next && (<Link className="btn primary" to={lessonPath(next.module.id, next.lesson.id)}>
            {s.lessonsDone === 0 ? "Start learning" : "Resume"} →
          </Link>)}
      </div>
      <div className="px-[clamp(1.2rem,4vw,3rem)] pb-20">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-[1.2rem]">
          <StatCard label="Overall progress" value={`${s.overallPct}%`} foot={<span>{s.lessonsDone}/{s.totalLessons} lessons</span>}>
            <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
              <ProgressRing value={s.overallPct / 100} size={44}/>
            </div>
          </StatCard>
          <StatCard label="Modules" value={`${s.modulesComplete}/${s.totalModules}`} foot={<span>{s.modulesStarted} started</span>}>
            <div style={{ marginTop: "0.6rem" }}>
              <Sparkline values={series.length ? series : [0]}/>
            </div>
          </StatCard>
          <StatCard label="Time remaining" value={formatMinutes(s.minutesRemaining)} foot={<span>of {formatMinutes(s.minutesTotal)} total</span>}/>
          <StatCard label="Avg quiz score" value={s.avgQuizScore === null ? "—" : `${s.avgQuizScore}%`} foot={<span className={s.avgQuizScore !== null && s.avgQuizScore >= 60 ? "delta up" : "delta down"}>
              {s.avgQuizScore === null ? "no quizzes yet" : s.avgQuizScore >= 60 ? "passing" : "review"}
            </span>}/>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-[1.2rem]">
          <StatCard label="Notebook entries" value={String(notes.length)} foot={<span>{totalBookmarks} bookmarked</span>}/>
          <StatCard label="Review queue" value={String(dueCount)} foot={<span>{dueCount > 0 ? `${dueCount} items overdue` : "all caught up"}</span>} className={dueCount > 0 ? "urgent" : ""}/>
          <StatCard label="Coding builds" value={`${solvedCount} solved`} foot={<span>{solvedCount} challenges · {exercisesCount} practice Qs</span>}/>
        </div>

        <div className="grid grid-cols-1 min-[961px]:grid-cols-[1.35fr_1fr] gap-6 items-stretch">
          <div className="flex flex-col gap-6 [&>*]:flex-1">
            {next ? (<Link className="card grad hover grid grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] gap-x-[1.3rem] gap-y-[0.2rem] p-[1.9rem]" to={lessonPath(next.module.id, next.lesson.id)}>
                <span className="row-[1/2] col-start-1 text-[1.6rem] w-[62px] h-[62px] flex-none grid place-items-center rounded bg-[rgba(11,11,14,0.45)] border border-border-glow shadow-[inset_0_0_22px_rgba(255,176,0,0.16)] [&_svg]:text-accent"><ModuleIcon id={next.module.id} size={28}/></span>
                <div className="col-start-2 row-[1/3] min-w-0 self-start">
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent">{s.lessonsDone === 0 ? "Start here" : "Continue"} · {next.module.title}</div>
                  <h2 className="font-display mt-[0.5rem] mx-0 mb-[0.4rem] text-[1.55rem]">{next.lesson.title}</h2>
                  <div className="text-text-dim text-[0.92rem]">{next.lesson.summary}</div>
                </div>
                <span className="col-start-2 row-start-3 justify-self-start mt-[1.4rem] inline-flex items-center gap-2 bg-[var(--accent-grad)] border-none text-on-accent px-[1.3rem] py-[0.7rem] rounded-pill font-semibold font-display shadow-[0_6px_22px_rgba(255,138,0,0.32)] transition-[filter,transform] duration-200 ease-brand hover:brightness-[1.06] hover:translate-x-[2px] hover:text-on-accent">{next.lesson.minutes}m →</span>
              </Link>) : (<div className="card grad grid grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto] gap-x-[1.3rem] gap-y-[0.2rem] p-[1.9rem]">
                <span className="row-[1/2] col-start-1 text-[1.6rem] w-[62px] h-[62px] flex-none grid place-items-center rounded bg-[rgba(11,11,14,0.45)] border border-border-glow shadow-[inset_0_0_22px_rgba(255,176,0,0.16)] [&_svg]:text-accent">🏆</span>
                <div className="col-start-2 row-[1/3] min-w-0 self-start">
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent">Complete</div>
                  <h2 className="font-display mt-[0.5rem] mx-0 mb-[0.4rem] text-[1.55rem]">You finished the whole curriculum.</h2>
                  <div className="text-text-dim text-[0.92rem]">Every module cleared. Go build a world.</div>
                </div>
              </div>)}
          </div>

          <div className="flex flex-col gap-6 [&>*]:flex-1">
            <CoachCard />
          </div>
        </div>

        <div className="section-title">
          <h3>Learning tracks</h3>
          <Link className="more" to="/curriculum">all modules →</Link>
        </div>
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {tracks.map((t) => (<TrackCard key={t.id} track={t}/>))}
        </div>

        <div className="section-title">
          <h3>Engine capstone roadmap</h3>
          <Link className="more" to={lessonPath("rendering", "triangle")}>the build →</Link>
        </div>
        <div className="card">
          <RoadmapRail />
        </div>

        <div className="section-title">
          <h3>Recent activity</h3>
        </div>
        <div className="card">
          {activity.length === 0 ? (<div className="empty-note">No activity yet. Open a lesson and it'll show up here.</div>) : (<div className="flex flex-col">
              {activity.map((a) => (<Link key={a.ref.module.id + a.ref.lesson.id} className="flex items-center gap-[0.8rem] px-[0.3rem] py-[0.75rem] border-b border-border last:border-b-0 transition-[background] duration-200 ease-brand rounded-[8px] hover:bg-surface-2" to={lessonPath(a.ref.module.id, a.ref.lesson.id)} style={{ color: "inherit" }}>
                  <span className="w-9 h-9 rounded-sm bg-surface-inset border border-border grid place-items-center flex-none text-[0.9rem] [&_svg]:text-accent">{a.done ? "✓" : <ModuleIcon id={a.ref.module.id} size={18}/>}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.88rem] text-text">{a.ref.lesson.title}</div>
                    <div className="text-[0.74rem] text-text-faint font-mono">{a.ref.module.title}</div>
                  </div>
                  <span className="text-[0.72rem] text-text-faint font-mono">{relativeTime(a.when, now)}</span>
                </Link>))}
            </div>)}
        </div>
      </div>
    </div>);
}
