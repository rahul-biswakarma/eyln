import { modulesForTrack } from "../../content/registry";
import { tracks } from "../../content/tracks";
import { ModuleCard } from "../../components/module-card";
import { TrackIcon } from "../../components/module-icon";
import { useProgress } from "../../lib/progress";
import { computeStats } from "../../lib/stats";
import { Chip } from "../../components/ui";
export function Curriculum() {
    const done = useProgress((s) => s.done);
    const s = computeStats(done);
    return (<div className="flex-1 overflow-y-auto max-w-[1240px] w-full mx-auto min-h-0 [&>*]:animate-[rise_0.4s_var(--ease)_both]">
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
        <div className="flex items-center gap-[0.6rem] flex-wrap mb-8">
          <Chip active>{tracks.length} tracks</Chip>
          <Chip ghost>{s.totalModules} modules</Chip>
          <Chip ghost>{s.totalLessons} lessons</Chip>
          <Chip ghost>{s.modulesComplete} complete</Chip>
        </div>

        {tracks.map((track) => {
            const trackModules = modulesForTrack(track.id);
            if (trackModules.length === 0)
                return null;
            return (<section key={track.id} className="mt-12 first-of-type:mt-4" style={{ "--track-accent": track.accent } as React.CSSProperties}>
              <div className="flex items-center gap-4 mb-[1.4rem] pb-4 border-b border-border relative before:content-[''] before:absolute before:left-0 before:bottom-[-1px] before:w-[120px] before:h-[2px] before:bg-[linear-gradient(90deg,var(--track-accent),transparent)]">
                <span className="w-[46px] h-[46px] flex-none grid place-items-center text-[1.3rem] rounded-[13px] text-[var(--track-accent)] bg-[radial-gradient(120%_120%_at_30%_20%,color-mix(in_srgb,var(--track-accent)_26%,transparent),transparent_70%),var(--surface-inset)] border border-[color-mix(in_srgb,var(--track-accent)_34%,var(--border))]"><TrackIcon id={track.id} size={24}/></span>
                <div>
                  <h2 className="m-0 text-[1.4rem]">{track.title}</h2>
                  <p className="mt-[0.2rem] mb-0 text-text-dim text-[0.9rem]">{track.blurb}</p>
                </div>
                <span className="ml-auto flex-none font-mono text-[0.72rem] text-[var(--track-accent)] tracking-[0.06em] px-[0.7rem] py-[0.3rem] rounded-pill border border-[color-mix(in_srgb,var(--track-accent)_32%,var(--border))] bg-[color-mix(in_srgb,var(--track-accent)_10%,transparent)] max-[640px]:hidden">{trackModules.length} modules</span>
              </div>
              <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
                {trackModules.map((m) => (<ModuleCard key={m.id} module={m} highlight={s.nextRef?.module.id === m.id}/>))}
              </div>
            </section>);
        })}
      </div>
    </div>);
}
