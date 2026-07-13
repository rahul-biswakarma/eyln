import { useNavigate } from "react-router-dom";
import { Sparkle, Wrench, Gear, Blueprint, Medal, Crown, SealCheck, Lock, Check, X, type Icon } from "@phosphor-icons/react";
import { useProgress } from "../../lib/progress";
import { useAuth } from "../../lib/auth";
import { computeStats } from "../../lib/stats";
import { badgeState, levelFor } from "../../lib/badges";
import { useTutor, TUTOR_KIND_META, type TutorTaskKind } from "../../lib/tutor";
import { Tooltip } from "../../components/ui";
const BADGE_ICON: Record<string, Icon> = {
    Sparkle, Wrench, Gear, Blueprint, Medal, Crown,
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

      <div className="profile-band">
        <div className="profile-hero card">
          <div className="profile-av">
            {user?.photoURL ? (<img src={user.photoURL} alt="" referrerPolicy="no-referrer"/>) : (<span>{initial}</span>)}
          </div>
          <div className="profile-lv">
            <div className="lv-num">Level {level}</div>
            <div className="lv-sub">{s.lessonsDone} lessons cleared · {earnedCount}/{badges.length} badges</div>
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
      <div className="badge-grid">
        {badges.map((b) => {
            const Ic = BADGE_ICON[b.icon] ?? SealCheck;
            return (<div key={b.id} className={"badge-card card" + (b.earned ? " earned" : "")}>
              <div className="badge-ic">
                {b.earned ? <Ic size={30} weight="duotone"/> : <Lock size={24} weight="duotone"/>}
              </div>
              <div className="badge-body">
                <div className="badge-name">
                  {b.name}
                  {b.earned && <SealCheck size={15} weight="fill" className="badge-check"/>}
                </div>
                <div className="badge-desc">{b.desc}</div>
                {!b.earned && (<div className="badge-prog">
                    <div className="pbar"><i style={{ width: `${b.progress * 100}%` }}/></div>
                    <span>{s.lessonsDone}/{b.need}</span>
                  </div>)}
              </div>
            </div>);
        })}
      </div>

      <TutorTasks />

      <div className="section-title"><h3>Account</h3></div>
      <div className="card profile-account">
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
function TutorTasks() {
    const tasks = useTutor((s) => s.tasks);
    const toggleTask = useTutor((s) => s.toggleTask);
    const removeTask = useTutor((s) => s.removeTask);
    const clearDone = useTutor((s) => s.clearDone);
    if (tasks.length === 0) {
        return (<>
        <div className="section-title"><h3>Tutor tasks</h3></div>
        <div className="card tutor-tasks-empty">
          <Sparkle size={20} weight="duotone"/>
          <p>
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
        <span className="tt-count">{openCount} open</span>
        {tasks.some((t) => t.done) && (<button className="tt-clear" onClick={clearDone}>Clear done</button>)}
      </div>

      <div className="tutor-tasks">
        {KIND_ORDER.map((kind) => {
            const group = tasks.filter((t) => t.kind === kind);
            if (group.length === 0)
                return null;
            return (<div key={kind} className="tt-group card">
              <div className={"tt-group-head " + kind}>{TUTOR_KIND_META[kind].label}</div>
              <ul className="tt-list">
                {group.map((t) => (<li key={t.id} className={"tt-item" + (t.done ? " done" : "")}>
                    <button className="tt-check" onClick={() => toggleTask(t.id)} aria-label={t.done ? "Mark not done" : "Mark done"}>
                      {t.done ? <Check size={13} weight="bold"/> : null}
                    </button>
                    <div className="tt-body">
                      <span className="tt-text">{t.text}</span>
                      {t.source && <span className="tt-source">{t.source}</span>}
                    </div>
                    <Tooltip content="Remove task">
                      <button className="tt-remove" onClick={() => removeTask(t.id)} aria-label="Remove task">
                        <X size={13} weight="bold"/>
                      </button>
                    </Tooltip>
                  </li>))}
              </ul>
            </div>);
        })}
      </div>
    </>);
}
