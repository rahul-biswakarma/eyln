import { useState } from "react";
import { CheckCircle, CaretDown } from "@phosphor-icons/react";
import { challenges } from "../content/challenges";
import { CodeChallenge } from "../components/CodeChallenge";
import { useProgress } from "../lib/progress";

export function Practice() {
  const solved = useProgress((s) => s.solvedChallenges);
  const [activeId, setActiveId] = useState(challenges[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const active = challenges.find((c) => c.id === activeId) ?? challenges[0];
  const solvedCount = challenges.filter((c) => solved[c.id]).length;

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <div className="practice-picker" onMouseLeave={() => setPickerOpen(false)}>
          <button className="picker-btn" onClick={() => setPickerOpen((o) => !o)}>
            <span className={"pi-dot " + active.difficulty.toLowerCase()} />
            <span className="picker-title">{active.title}</span>
            <CaretDown size={14} weight="bold" />
          </button>
          {pickerOpen && (
            <div className="picker-menu card">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  className={"practice-item" + (c.id === activeId ? " active" : "")}
                  onClick={() => { setActiveId(c.id); setPickerOpen(false); }}
                >
                  <span className={"pi-dot " + c.difficulty.toLowerCase()} />
                  <span className="pi-title">{c.title}</span>
                  {solved[c.id] && <CheckCircle size={15} weight="fill" className="pi-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="practice-meta">
          <span className="eyebrow" style={{ margin: 0 }}>Practice Arena</span>
          <span className="practice-solved">{solvedCount}/{challenges.length} solved</span>
        </div>
      </div>

      <CodeChallenge key={active.id} challenge={active} />
    </div>
  );
}
