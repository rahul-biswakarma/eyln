import { Link } from "react-router-dom";
import type { Module } from "../content/types";
import { modulesForTrack, trackIdOf, lessonPath, moduleProgress, lessonKey, moduleMinutes, moduleDifficulty, } from "../content/registry";
import { getTrack } from "../content/tracks";
import { useProgress } from "../lib/progress";
import { formatMinutes } from "../lib/stats";
import { ModuleIcon } from "./module-icon";
const MODULE_ACCENT: Record<string, string> = {
    "linear-algebra": "#FFB000", odin: "#FF8A00", "procedural-math": "#8FBF6B",
    physics: "#FF6B57", metal: "#C2C6CE", rendering: "#FFD35C",
    lighting: "#FFC24B", textures: "#D0A06A", optimization: "#FF9E2C",
    "dsa-complexity": "#FF8A00", "dsa-arrays": "#FFB000", "dsa-hashing": "#FFC24B",
    "dsa-linear": "#FF9E2C", "dsa-trees": "#8FBF6B", "dsa-graphs": "#D0A06A",
    "dsa-sorting": "#FF6B57", "dsa-recursion": "#FFD35C",
    "math-functions": "#8FBF6B", "math-limits": "#A6C880", "math-derivatives": "#FFC24B",
    "math-integrals": "#FFB000", "math-curves": "#D0A06A", "math-vector-calc": "#FF9E2C",
};
export function ModuleCard({ module, highlight }: {
    module: Module;
    highlight?: boolean;
}) {
    const done = useProgress((s) => s.done);
    const pct = moduleProgress(module, done);
    const diff = moduleDifficulty(module);
    const minutes = moduleMinutes(module);
    const started = pct > 0;
    const complete = pct >= 1;
    const trackModules = modulesForTrack(trackIdOf(module));
    const accent = MODULE_ACCENT[module.id] ?? getTrack(trackIdOf(module))?.accent ?? "var(--accent)";
    const idx = trackModules.findIndex((m) => m.id === module.id) + 1;
    const target = module.lessons.find((l) => !done[lessonKey(module.id, l.id)]) ?? module.lessons[0];
    const pctLabel = Math.round(pct * 100);
    return (<Link className={"mod-card" + (highlight ? " highlight" : "")} to={lessonPath(module.id, target.id)} style={{ "--mod-accent": accent } as React.CSSProperties}>
      <span className="mod-idx" aria-hidden>{String(idx).padStart(2, "0")}</span>

      <span className="mod-ic"><ModuleIcon id={module.id} size={22}/></span>

      <h3 className="mb-2 font-display text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.01em]">{module.title}</h3>
      <p className="mb-6 line-clamp-2 text-[0.9rem] leading-[1.6] text-text-dim">{module.blurb}</p>

      <div className="mb-6 font-mono text-[0.72rem] tracking-[0.04em] text-text-faint">
        {diff.label} <span className="mx-[0.4em] opacity-50">·</span> {module.lessons.length} lessons{" "}
        <span className="mx-[0.4em] opacity-50">·</span> {formatMinutes(minutes)}
      </div>

      {started && (<div className="mb-6 flex items-center gap-3">
          <div className="pbar"><i style={{ width: `${Math.max(pctLabel, 4)}%` }}/></div>
          <span className="flex-none font-mono text-[0.7rem] text-text-dim">{complete ? "Complete" : `${pctLabel}%`}</span>
        </div>)}

      <span className="mod-cta">
        {complete ? "Review" : started ? "Continue" : "Begin"} →
      </span>
    </Link>);
}
