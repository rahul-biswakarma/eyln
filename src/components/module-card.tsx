import { Link } from "react-router-dom";
import type { Module } from "../content/types";
import { modulesForTrack, trackIdOf, lessonPath, moduleProgress, lessonKey, moduleMinutes, moduleDifficulty, } from "../content/registry";
import { getTrack } from "../content/tracks";
import { useProgress } from "../lib/progress";
import { formatMinutes } from "../lib/stats";
import { ModuleIcon } from "./module-icon";
import { ProgressBar } from "./ui";
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
export function ModuleCard({ module }: {
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
    return (<Link
      className="group relative block isolate overflow-hidden p-6 rounded-[20px] border border-border text-inherit
        bg-[linear-gradient(180deg,rgba(255,255,255,0.022),transparent_55%),var(--surface)]
        shadow-[0_6px_24px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-200 ease-brand
        hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--mod-accent)_34%,var(--border-bright))]
        hover:shadow-[0_16px_44px_rgba(0,0,0,0.4),0_0_0_1px_color-mix(in_srgb,var(--mod-accent)_20%,transparent),0_0_34px_color-mix(in_srgb,var(--mod-accent)_16%,transparent)]"
      to={lessonPath(module.id, target.id)} style={{ "--mod-accent": accent } as React.CSSProperties}>
      <span className="absolute top-1 right-[18px] -z-10 font-display font-bold text-[4.5rem] leading-none text-text opacity-[0.035] tracking-[-0.05em] pointer-events-none" aria-hidden>{String(idx).padStart(2, "0")}</span>

      <span className="block mb-4 text-[var(--mod-accent)]"><ModuleIcon id={module.id} size={22}/></span>

      <h3 className="mb-2 font-display text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.01em]">{module.title}</h3>
      <p className="mb-6 line-clamp-2 text-[0.9rem] leading-[1.6] text-text-dim">{module.blurb}</p>

      <div className="mb-6 font-mono text-[0.72rem] tracking-[0.04em] text-text-faint">
        {diff.label} <span className="mx-[0.4em] opacity-50">·</span> {module.lessons.length} lessons{" "}
        <span className="mx-[0.4em] opacity-50">·</span> {formatMinutes(minutes)}
      </div>

      {started && (<div className="mb-6 flex items-center gap-3">
          <ProgressBar value={Math.max(pctLabel, 4) / 100} />
          <span className="flex-none font-mono text-[0.7rem] text-text-dim">{complete ? "Complete" : `${pctLabel}%`}</span>
        </div>)}

      <span className="inline-flex items-center gap-[0.4rem] font-display text-[0.9rem] font-semibold text-[var(--mod-accent)]
        opacity-70 transition-[opacity,gap,transform] duration-200 ease-brand group-hover:opacity-100 group-hover:gap-[0.6rem]
        [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100">
        {complete ? "Review" : started ? "Continue" : "Begin"} →
      </span>
    </Link>);
}
