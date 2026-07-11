import { useState } from "react";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { challenges, challengesByTopic } from "../content/challenges";
import { CodeChallenge } from "../components/CodeChallenge";
import { useProgress } from "../lib/progress";

export function Practice() {
  const solved = useProgress((s) => s.solvedChallenges);
  const [activeId, setActiveId] = useState(challenges[0].id);

  const active = challenges.find((c) => c.id === activeId) ?? challenges[0];
  const activeIdx = challenges.findIndex((c) => c.id === active.id);
  const solvedCount = challenges.filter((c) => solved[c.id]).length;
  const pct = challenges.length ? solvedCount / challenges.length : 0;
  const nextUp = challenges[activeIdx + 1];

  return (
    <div className="practice-shell">
      <aside className="practice-sidebar">
        <div className="track-panel">
          <div className="tp-grid" aria-hidden />
          <div className="tp-eyebrow">Practice Track</div>
          <div className="tp-name">Blind 75</div>

          <div className="tp-segments">
            {challenges.map((c, i) => (
              <span key={c.id} className={"tp-seg" + (solved[c.id] ? " done" : "") + (i === activeIdx ? " current" : "")} />
            ))}
          </div>
          <div className="tp-pct-row">
            <span className="tp-pct">{Math.round(pct * 100)}%</span>
            <span className="tp-mission">Mission {activeIdx + 1} of {challenges.length}</span>
          </div>

          <div className="tp-now">
            <div className="tp-slot">
              <span className="tp-k">Current</span>
              <span className="tp-v">{active.title}</span>
            </div>
            {nextUp && (
              <div className="tp-slot">
                <span className="tp-k">Next</span>
                <span className="tp-v muted">{nextUp.title}</span>
              </div>
            )}
          </div>

          {nextUp && (
            <button className="tp-cta" onClick={() => setActiveId(nextUp.id)}>
              {solved[active.id] ? "Continue" : "Skip ahead"} <ArrowRight size={15} weight="bold" />
            </button>
          )}
        </div>

        <nav className="ps-list">
          {challengesByTopic().map((group) => {
            const groupSolved = group.items.filter((c) => solved[c.id]).length;
            return (
              <div key={group.topic} className="ps-group">
                <div className="ps-group-head">
                  <span>{group.topic}</span>
                  <span className="ps-group-count">{groupSolved}/{group.items.length}</span>
                </div>
                {group.items.map((c) => (
                  <button
                    key={c.id}
                    className={"ps-item" + (c.id === activeId ? " active" : "") + (solved[c.id] ? " solved" : "")}
                    onClick={() => setActiveId(c.id)}
                  >
                    <span className={"pi-dot " + c.difficulty.toLowerCase()} />
                    <span className="ps-item-title">{c.title}</span>
                    {solved[c.id] && <CheckCircle size={15} weight="fill" className="pi-check" />}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="practice-main">
        <CodeChallenge key={active.id} challenge={active} missionIndex={activeIdx + 1} missionTotal={challenges.length} />
      </main>
    </div>
  );
}
