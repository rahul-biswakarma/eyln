import { modulesForTrack } from "../../content/registry";
import { tracks } from "../../content/tracks";
import { ModuleCard } from "../../components/module-card";
import { TrackIcon } from "../../components/module-icon";
import { useProgress } from "../../lib/progress";
import { computeStats } from "../../lib/stats";
export function Curriculum() {
    const done = useProgress((s) => s.done);
    const s = computeStats(done);
    return (<div className="dash flex-1 overflow-y-auto max-w-[1240px] w-full mx-auto min-h-0">
      <div className="flex items-end justify-between gap-6 pt-10 px-[clamp(1.2rem,4vw,3rem)] pb-[1.2rem] shrink-0">
        <div>
          <div className="font-mono text-[0.72rem] tracking-[0.24em] uppercase text-accent mb-[0.7rem] flex items-center gap-[0.6rem] before:content-[''] before:w-[22px] before:h-px before:bg-accent before:opacity-70">Flight Plan</div>
          <h1 className="m-0">Curriculum</h1>
          <div className="text-text-dim mt-[0.6rem] max-w-[46ch] text-base">
            Three tracks — build a 3D engine, master data structures &amp; algorithms, and the
            mathematics underneath. Pick a mission and go.
          </div>
        </div>
      </div>

      <div className="px-[clamp(1.2rem,4vw,3rem)] pb-20">
        <div className="chip-row">
          <span className="chip active">{tracks.length} tracks</span>
          <span className="chip ghost">{s.totalModules} modules</span>
          <span className="chip ghost">{s.totalLessons} lessons</span>
          <span className="chip ghost">{s.modulesComplete} complete</span>
        </div>

        {tracks.map((track) => {
            const trackModules = modulesForTrack(track.id);
            if (trackModules.length === 0)
                return null;
            return (<section key={track.id} className="mt-12 first-of-type:mt-4" style={{ "--track-accent": track.accent } as React.CSSProperties}>
              <div className="track-header">
                <span className="track-glyph"><TrackIcon id={track.id} size={24}/></span>
                <div>
                  <h2>{track.title}</h2>
                  <p>{track.blurb}</p>
                </div>
                <span className="track-count">{trackModules.length} modules</span>
              </div>
              <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
                {trackModules.map((m) => (<ModuleCard key={m.id} module={m} highlight={s.nextRef?.module.id === m.id}/>))}
              </div>
            </section>);
        })}
      </div>
    </div>);
}
