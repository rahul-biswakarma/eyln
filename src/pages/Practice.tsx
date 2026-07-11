import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { challenges } from "../content/challenges";
import { CodeChallenge } from "../components/CodeChallenge";
import { useProgress } from "../lib/progress";

export function Practice() {
  const solved = useProgress((s) => s.solvedChallenges);
  const [activeId, setActiveId] = useState(challenges[0].id);
  const active = challenges.find((c) => c.id === activeId) ?? challenges[0];
  const solvedCount = challenges.filter((c) => solved[c.id]).length;

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Practice Arena</div>
          <h1>Coding Challenges</h1>
          <div className="sub">
            Classic interview problems (Blind 75 / NeetCode). Write a solution, run it against the
            hidden test cases, and get instant pass/fail.
          </div>
        </div>
      </div>

      <div className="chip-row">
        <span className="chip active">{solvedCount}/{challenges.length} solved</span>
      </div>

      <div className="practice-layout">
        <aside className="practice-list">
          {challenges.map((c) => (
            <button
              key={c.id}
              className={"practice-item" + (c.id === activeId ? " active" : "")}
              onClick={() => setActiveId(c.id)}
            >
              <span className={"pi-dot " + c.difficulty.toLowerCase()} />
              <span className="pi-title">{c.title}</span>
              {solved[c.id] && <CheckCircle size={15} weight="fill" className="pi-check" />}
            </button>
          ))}
        </aside>

        <div className="practice-main">
          <CodeChallenge key={active.id} challenge={active} />
        </div>
      </div>
    </div>
  );
}
