import { useNavigate } from "react-router-dom";
import { Sparkle, Wrench, Gear, Blueprint, Medal, Crown, SealCheck, Lock, type Icon } from "@phosphor-icons/react";
import { useProgress } from "../lib/progress";
import { useAuth } from "../lib/auth";
import { computeStats } from "../lib/stats";
import { badgeState, levelFor } from "../lib/badges";

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

  return (
    <div className="dash">
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
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span>{initial}</span>
            )}
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
          return (
            <div key={b.id} className={"badge-card card" + (b.earned ? " earned" : "")}>
              <div className="badge-ic">
                {b.earned ? <Ic size={30} weight="duotone" /> : <Lock size={24} weight="duotone" />}
              </div>
              <div className="badge-body">
                <div className="badge-name">
                  {b.name}
                  {b.earned && <SealCheck size={15} weight="fill" className="badge-check" />}
                </div>
                <div className="badge-desc">{b.desc}</div>
                {!b.earned && (
                  <div className="badge-prog">
                    <div className="pbar"><i style={{ width: `${b.progress * 100}%` }} /></div>
                    <span>{s.lessonsDone}/{b.need}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title"><h3>Account</h3></div>
      <div className="card profile-account">
        <button className="btn" onClick={() => void signOut()}>Sign out</button>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm("Reset all progress? This clears completed lessons and quiz scores on this device.")) {
              reset();
              navigate("/");
            }
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
