import { useNavigate } from "react-router-dom";
import { SparkleIcon, WrenchIcon, GearIcon, BlueprintIcon, MedalIcon, CrownIcon, SealCheckIcon, LockIcon, CheckIcon, XIcon, type Icon } from "@phosphor-icons/react";
import { useProgress } from "../../lib/progress";
import { useAuth } from "../../lib/auth";
import { computeStats } from "../../lib/stats";
import { badgeState, levelFor } from "../../lib/badges";
import { useTutor, TUTOR_KIND_META, type TutorTaskKind } from "../../lib/tutor";
import { Tooltip } from "../../components/ui";
const BADGE_ICON: Record<string, Icon> = {
    SparkleIcon, WrenchIcon, GearIcon, BlueprintIcon, MedalIcon, CrownIcon,
};
export function Profile() {
    const done = useProgress((s) => s.done);
    const quizScores = useProgress((s) => s.quizScores);
    const reset = useProgress((s) => s.reset);
    const user = useAuth((s) => s.user);
    const signOut = useAuth((s) => s.signOut);
    const navigate = useNavigate();
    const s = computeStats(done, quizScores);
    const level = levelFor(s.lessonsDone);
    const badges = badgeState(s.lessonsDone);
    const earnedCount = badges.filter((b) => b.earned).length;
    const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
    return (<div className="dash">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Your Profile</div>
          <h1>{user?.name ?? "Builder"}</h1>
          <div className="sub">{user?.email ?? "Signed in locally"}</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-6 items-stretch mb-4 max-[820px]:grid-cols-1">
        <div className="profile-hero card">
          <div className="w-[72px] h-[72px] flex-none rounded-full overflow-hidden grid place-items-center border border-border-glow bg-surface-inset text-accent font-display font-bold text-[1.8rem]">
            {user?.photoURL ? (<img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover"/>) : (<span>{initial}</span>)}
          </div>
          <div>
            <div className="font-display text-[1.5rem] font-semibold text-text">Level {level}</div>
            <div className="text-text-dim text-[0.85rem] font-mono mt-[0.3rem]">{s.lessonsDone} lessons cleared · {earnedCount}/{badges.length} badges</div>
          </div>
        </div>

        <div className="stat-row" style={{ marginBottom: 0 }}>
          <div className="card stat-card">
            <div className="label">Overall</div>
            <div className="value">{s.overallPct}%</div>
            <div className="foot">{s.lessonsDone}/{s.totalLessons} lessons</div>
          </div>
          <div className="card stat-card">
            <div className="label">Modules</div>
            <div className="value">{s.modulesComplete}/{s.totalModules}</div>
            <div className="foot">{s.modulesStarted} started</div>
          </div>
          <div className="card stat-card">
            <div className="label">Avg quiz</div>
            <div className="value">{s.avgQuizScore === null ? "—" : `${s.avgQuizScore}%`}</div>
            <div className="foot">{s.avgQuizScore === null ? "no quizzes yet" : "keep it up"}</div>
          </div>
        </div>
      </div>

      <div className="section-title"><h3>Badges to earn</h3></div>
      <div className="grid gap-[1.1rem] grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {badges.map((b) => {
            const Ic = BADGE_ICON[b.icon] ?? SealCheckIcon;
            return (<div key={b.id} className={"badge-card card flex items-start gap-4 p-[1.3rem] opacity-[0.62]" + (b.earned ? " earned" : "")}>
              <div className="badge-ic w-[52px] h-[52px] flex-none grid place-items-center rounded-[14px] bg-surface-inset border border-border text-text-faint">
                {b.earned ? <Ic size={30} weight="duotone"/> : <LockIcon size={24} weight="duotone"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-text flex items-center gap-[0.4rem]">
                  {b.name}
                  {b.earned && <SealCheckIcon size={15} weight="fill" className="text-accent"/>}
                </div>
                <div className="text-[0.82rem] text-text-dim mt-[0.2rem]">{b.desc}</div>
                {!b.earned && (<div className="flex items-center gap-[0.6rem] mt-[0.7rem]">
                    <div className="pbar flex-1"><i style={{ width: `${b.progress * 100}%` }}/></div>
                    <span className="font-mono text-[0.7rem] text-text-faint">{s.lessonsDone}/{b.need}</span>
                  </div>)}
              </div>
            </div>);
        })}
      </div>

      <TutorTasks />

      <div className="section-title"><h3>Account</h3></div>
      <div className="card flex gap-[0.8rem] flex-wrap">
        <button className="btn" onClick={() => void signOut()}>Sign out</button>
        <button className="btn danger" onClick={() => {
            if (confirm("Reset all progress? This clears completed lessons and quiz scores on this device.")) {
                reset();
                navigate("/");
            }
        }}>
          Reset all progress
        </button>
      </div>
    </div>);
}
const KIND_ORDER: TutorTaskKind[] = ["struggle", "review", "next", "content-gap"];
const KIND_COLOR: Record<TutorTaskKind, string> = {
    struggle: "text-bad",
    review: "text-warn",
    next: "text-good",
    "content-gap": "text-accent",
};
function TutorTasks() {
    const tasks = useTutor((s) => s.tasks);
    const toggleTask = useTutor((s) => s.toggleTask);
    const removeTask = useTutor((s) => s.removeTask);
    const clearDone = useTutor((s) => s.clearDone);
    if (tasks.length === 0) {
        return (<>
        <div className="section-title"><h3>Tutor tasks</h3></div>
        <div className="card flex items-center gap-[0.9rem] text-text-dim text-[0.9rem] leading-[1.6]">
          <SparkleIcon size={20} weight="duotone" className="text-accent flex-none"/>
          <p className="m-0">
            As you chat with the AI tutor on lessons and chapter reviews, it captures what you’re
            struggling with and what to learn next here — a study plan that also guides new course content.
          </p>
        </div>
      </>);
    }
    const openCount = tasks.filter((t) => !t.done).length;
    return (<>
      <div className="section-title">
        <h3>Tutor tasks</h3>
        <span className="font-mono text-[0.72rem] text-text-faint ml-[0.6rem]">{openCount} open</span>
        {tasks.some((t) => t.done) && (<button className="ml-auto cursor-pointer border-0 bg-transparent text-[0.8rem] text-text-faint hover:text-text-dim" onClick={clearDone}>Clear done</button>)}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {KIND_ORDER.map((kind) => {
            const group = tasks.filter((t) => t.kind === kind);
            if (group.length === 0)
                return null;
            return (<div key={kind} className="tt-group card py-[1.1rem] px-[1.2rem]">
              <div className={"font-mono text-[0.68rem] tracking-[0.12em] uppercase mb-[0.9rem] " + KIND_COLOR[kind]}>{TUTOR_KIND_META[kind].label}</div>
              <ul className="list-none m-0 p-0 flex flex-col gap-[0.6rem]">
                {group.map((t) => (<li key={t.id} className="group flex items-start gap-[0.6rem]">
                    <button className={"flex-none w-5 h-5 mt-px rounded-xs cursor-pointer grid place-items-center text-on-accent border transition-colors duration-200 ease-brand " + (t.done ? "bg-good border-good" : "bg-transparent border-border-bright")} onClick={() => toggleTask(t.id)} aria-label={t.done ? "Mark not done" : "Mark done"}>
                      {t.done ? <CheckIcon size={13} weight="bold"/> : null}
                    </button>
                    <div className="flex-1 min-w-0 flex flex-col gap-[0.15rem]">
                      <span className={"text-[0.9rem] leading-[1.5] " + (t.done ? "text-text-faint line-through" : "text-text")}>{t.text}</span>
                      {t.source && <span className="font-mono text-[0.68rem] text-text-faint">{t.source}</span>}
                    </div>
                    <Tooltip content="Remove task">
                      <button className="flex-none cursor-pointer border-0 bg-transparent text-text-faint opacity-0 transition-opacity duration-200 ease-brand group-hover:opacity-100 hover:text-bad" onClick={() => removeTask(t.id)} aria-label="Remove task">
                        <XIcon size={13} weight="bold"/>
                      </button>
                    </Tooltip>
                  </li>))}
              </ul>
            </div>);
        })}
      </div>
    </>);
}
