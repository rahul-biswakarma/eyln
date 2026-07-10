import { Link } from "react-router-dom";
import type { Module } from "../content/types";
import {
  lessonPath,
  moduleProgress,
  lessonKey,
  moduleMinutes,
  moduleDifficulty,
  modulePrereqTitles,
} from "../content/registry";
import { useProgress } from "../lib/progress";
import { formatMinutes } from "../lib/stats";

export function ModuleCard({ module, highlight }: { module: Module; highlight?: boolean }) {
  const done = useProgress((s) => s.done);
  const pct = moduleProgress(module, done);
  const diff = moduleDifficulty(module);
  const prereqs = modulePrereqTitles(module);
  const minutes = moduleMinutes(module);
  const started = pct > 0;
  const complete = pct >= 1;
  // Deep-link to the first not-yet-done lesson in this module, else the first.
  const target = module.lessons.find((l) => !done[lessonKey(module.id, l.id)]) ?? module.lessons[0];

  return (
    <Link className={"card mod-card hover" + (highlight ? " grad" : "")} to={lessonPath(module.id, target.id)}>
      <div className="top">
        <span className="ic">{module.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker">Module</div>
          <h3>{module.title}</h3>
        </div>
      </div>

      <p className="blurb">{module.blurb}</p>

      <div className="mod-meta">
        <span className={"meta-pill diff-" + diff.level}>{diff.label}</span>
        <span className="meta-pill"><span className="k">Lessons</span> {module.lessons.length}</span>
        <span className="meta-pill"><span className="k">Est.</span> {formatMinutes(minutes)}</span>
      </div>

      <div className="pbar-row">
        <span>{complete ? "Mission complete" : started ? "In progress" : "Not started"}</span>
        <span>{Math.round(pct * 100)}%</span>
      </div>
      <div className="pbar"><i style={{ width: `${Math.max(pct * 100, started ? 6 : 0)}%` }} /></div>

      <div className="foot">
        <span className="prereq">
          {prereqs.length > 0 ? <>Requires <b>{prereqs.join(" · ")}</b></> : "No prerequisites"}
        </span>
        <span className="mod-cta">
          {complete ? "Review" : started ? "Continue" : "Begin Mission"} →
        </span>
      </div>
    </Link>
  );
}
