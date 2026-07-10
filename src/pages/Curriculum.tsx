import { modules } from "../content/registry";
import { ModuleCard } from "../components/ModuleCard";
import { useProgress } from "../lib/progress";
import { computeStats } from "../lib/stats";

export function Curriculum() {
  const done = useProgress((s) => s.done);
  const s = computeStats(done);
  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Flight Plan</div>
          <h1>Curriculum</h1>
          <div className="sub">
            {s.totalModules} modules, ordered by dependency, from linear algebra to a spline-driven wall generator.
          </div>
        </div>
      </div>

      <div className="chip-row">
        <span className="chip active">{s.totalModules} modules</span>
        <span className="chip ghost">{s.totalLessons} lessons</span>
        <span className="chip ghost">{s.modulesComplete} complete</span>
      </div>

      <div className="mod-grid">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} highlight={s.nextRef?.module.id === m.id} />
        ))}
      </div>
    </div>
  );
}
