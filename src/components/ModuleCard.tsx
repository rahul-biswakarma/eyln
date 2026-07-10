import { Link } from "react-router-dom";
import type { Module } from "../content/types";
import {
  modules,
  lessonPath,
  moduleProgress,
  lessonKey,
  moduleMinutes,
  moduleDifficulty,
  modulePrereqTitles,
} from "../content/registry";
import { useProgress } from "../lib/progress";
import { formatMinutes } from "../lib/stats";

/**
 * Per-module accent — a curated warm/earthy spectrum so each card has its own
 * identity. Stays inside the industrial palette (amber → orange → red, plus
 * sage/steel/clay); no neon, blue, or purple.
 */
const MODULE_ACCENT: Record<string, string> = {
  "linear-algebra": "#FFB000", // amber — geometry
  odin: "#FF8A00",             // deep orange — systems language
  "procedural-math": "#8FBF6B", // sage — organic noise
  physics: "#FF6B57",          // coral — motion & forces
  metal: "#C2C6CE",            // steel — the GPU
  rendering: "#FFD35C",        // gold — the capstone
  lighting: "#FFC24B",         // warm yellow — light
  textures: "#D0A06A",         // clay — surfaces
  optimization: "#FF9E2C",     // bright amber — speed
};

export function ModuleCard({ module, highlight }: { module: Module; highlight?: boolean }) {
  const done = useProgress((s) => s.done);
  const pct = moduleProgress(module, done);
  const diff = moduleDifficulty(module);
  const prereqs = modulePrereqTitles(module);
  const minutes = moduleMinutes(module);
  const started = pct > 0;
  const complete = pct >= 1;
  const accent = MODULE_ACCENT[module.id] ?? "var(--accent)";
  const idx = modules.findIndex((m) => m.id === module.id) + 1;
  // Deep-link to the first not-yet-done lesson in this module, else the first.
  const target = module.lessons.find((l) => !done[lessonKey(module.id, l.id)]) ?? module.lessons[0];

  return (
    <Link
      className={"card mod-card hover" + (highlight ? " grad" : "")}
      to={lessonPath(module.id, target.id)}
      style={{ "--mod-accent": accent } as React.CSSProperties}
    >
      <span className="mod-idx">{String(idx).padStart(2, "0")}</span>
      <div className="top">
        <span className="ic">{module.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker">Module {String(idx).padStart(2, "0")}</div>
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
      <div className="pbar"><i style={{ width: `${Math.max(pct * 100, started ? 6 : 0)}%`, background: accent, boxShadow: `0 0 10px ${accent}80` }} /></div>

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
