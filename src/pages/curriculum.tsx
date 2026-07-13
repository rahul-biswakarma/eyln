import { modulesForTrack } from "../content/registry";
import { tracks } from "../content/tracks";
import { ModuleCard } from "../components/module-card";
import { TrackIcon } from "../components/module-icon";
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
            Three tracks — build a 3D engine, master data structures &amp; algorithms, and the
            mathematics underneath. Pick a mission and go.
          </div>
        </div>
      </div>

      <div className="dash-body">
        <div className="chip-row">
          <span className="chip active">{tracks.length} tracks</span>
          <span className="chip ghost">{s.totalModules} modules</span>
          <span className="chip ghost">{s.totalLessons} lessons</span>
          <span className="chip ghost">{s.modulesComplete} complete</span>
        </div>

        {tracks.map((track) => {
          const trackModules = modulesForTrack(track.id);
          if (trackModules.length === 0) return null;
          return (
            <section key={track.id} className="track-section" style={{ "--track-accent": track.accent } as React.CSSProperties}>
              <div className="track-header">
                <span className="track-glyph"><TrackIcon id={track.id} size={24} /></span>
                <div>
                  <h2>{track.title}</h2>
                  <p>{track.blurb}</p>
                </div>
                <span className="track-count">{trackModules.length} modules</span>
              </div>
              <div className="mod-grid">
                {trackModules.map((m) => (
                  <ModuleCard key={m.id} module={m} highlight={s.nextRef?.module.id === m.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
