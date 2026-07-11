import { useState } from "react";
import { CheckCircle, Lightning, Flame, Target } from "@phosphor-icons/react";
import { challenges, totalXpEarned } from "../content/challenges";
import { CodeChallenge } from "../components/CodeChallenge";
import { useProgress } from "../lib/progress";
import { computeCoachSignals } from "../lib/coach";

export function Practice() {
  const solved = useProgress((s) => s.solvedChallenges);
  const done = useProgress((s) => s.done);
  const quizScores = useProgress((s) => s.quizScores);
  const lastVisited = useProgress((s) => s.lastVisited);
  const [activeId, setActiveId] = useState(challenges[0].id);

  const active = challenges.find((c) => c.id === activeId) ?? challenges[0];
  const activeIdx = challenges.findIndex((c) => c.id === active.id);
  const solvedCount = challenges.filter((c) => solved[c.id]).length;
  const pct = challenges.length ? solvedCount / challenges.length : 0;
  const xp = totalXpEarned(solved);
  const streak = computeCoachSignals(done, quizScores, lastVisited, Date.now()).streak;

  return (
    <div className="practice-shell">
      <aside className="practice-sidebar">
        <div className="ps-head">
          <div className="eyebrow" style={{ margin: 0 }}>Practice Arena</div>
          <div className="ps-title">Missions</div>
        </div>

        <div className="ps-progress">
          <div className="mhp-label">
            <span>Track progress</span>
            <span className="mhp-count">{solvedCount}/{challenges.length}</span>
          </div>
          <div className="mhp-bar"><i style={{ width: `${Math.max(pct * 100, 2)}%` }} /></div>
          <div className="ps-stats">
            <div className="mhp-stat"><Lightning size={14} weight="duotone" /><b>{xp}</b><span>XP</span></div>
            <div className="mhp-stat"><Flame size={14} weight="duotone" /><b>{streak}</b><span>streak</span></div>
            <div className="mhp-stat"><Target size={14} weight="duotone" /><b>{solvedCount}</b><span>solved</span></div>
          </div>
        </div>

        <nav className="ps-list">
          {challenges.map((c, i) => (
            <button
              key={c.id}
              className={"ps-item" + (c.id === activeId ? " active" : "") + (solved[c.id] ? " solved" : "")}
              onClick={() => setActiveId(c.id)}
            >
              <span className="ps-idx">{String(i + 1).padStart(2, "0")}</span>
              <span className={"pi-dot " + c.difficulty.toLowerCase()} />
              <span className="ps-item-title">{c.title}</span>
              {solved[c.id] && <CheckCircle size={15} weight="fill" className="pi-check" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="practice-main">
        <CodeChallenge key={active.id} challenge={active} missionIndex={activeIdx + 1} missionTotal={challenges.length} />
      </main>
    </div>
  );
}
