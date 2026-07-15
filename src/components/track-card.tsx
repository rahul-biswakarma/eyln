import type { Track } from "../content/types";
import { modulesForTrack, lessonsForTrack, nextLessonInTrack, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";
import { TrackIcon } from "./module-icon";
import { Card } from "./ui";
export function TrackCard({ track }: {
    track: Track;
}) {
    const done = useProgress((s) => s.done);
    const mods = modulesForTrack(track.id);
    const lessons = lessonsForTrack(track.id);
    const doneCount = lessons.filter((r) => done[lessonKey(r.module.id, r.lesson.id)]).length;
    const pct = lessons.length ? doneCount / lessons.length : 0;
    const started = doneCount > 0;
    const next = nextLessonInTrack(track.id, done);
    const complete = pct >= 1;
    return (<Card as="a" href={next ? lessonPath(next.module.id, next.lesson.id) : "/curriculum"}
      className="group flex flex-col p-[1.7rem]
        after:content-[''] after:absolute after:top-0 after:inset-x-0 after:h-[3px] after:opacity-60 after:transition-opacity after:duration-200 after:ease-brand after:bg-[linear-gradient(90deg,var(--track-accent),transparent_80%)] hover:after:opacity-100
        hover:!border-[color-mix(in_srgb,var(--track-accent)_40%,var(--border-bright))]
        hover:shadow-[var(--shadow),0_0_0_1px_color-mix(in_srgb,var(--track-accent)_22%,transparent)]"
      style={{ "--track-accent": track.accent } as React.CSSProperties}>
      <div className="mb-[1.1rem] flex items-center gap-[0.9rem]">
        <span className="w-[50px] h-[50px] flex-none grid place-items-center text-[1.35rem] rounded-[14px] text-[var(--track-accent)]
          bg-[radial-gradient(120%_120%_at_30%_20%,color-mix(in_srgb,var(--track-accent)_26%,transparent),transparent_70%),var(--surface-inset)]
          border border-[color-mix(in_srgb,var(--track-accent)_34%,var(--border))]"><TrackIcon id={track.id} size={26}/></span>
        <div>
          <div className="mb-[0.3rem] font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--track-accent)_70%,var(--text-faint))]">Track</div>
          <h3 className="m-0 font-display text-[1.2rem]">{track.title}</h3>
        </div>
      </div>
      <p className="mb-[1.2rem] text-[0.88rem] leading-[1.6] text-text-dim">{track.blurb}</p>

      <div className="mb-4 flex gap-2 font-mono text-[0.72rem] text-text-faint">
        <span>{mods.length} modules</span>
        <span>·</span>
        <span>{lessons.length} lessons</span>
      </div>

      {started ? (<>
          <div className="mt-[0.2rem] mb-[0.5rem] flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.06em] text-text-faint">
            <span>{complete ? "Complete" : "In progress"}</span>
            <span>{doneCount}/{lessons.length}</span>
          </div>
          <div className="mb-[0.6rem] h-[5px] rounded-[3px] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] overflow-hidden relative">
            <i className="block h-full rounded-[3px] transition-[width] duration-[600ms] ease-brand" style={{ width: `${Math.max(pct * 100, 6)}%`, background: track.accent, boxShadow: `0 0 10px ${track.accent}80` }}/>
          </div>
        </>) : (<div className="py-2 text-[0.82rem]" style={{ color: track.accent }}>
          Begin with <b className="font-semibold">{next?.lesson.title}</b>
        </div>)}

      <div className="mt-auto pt-[1.2rem] font-display font-semibold text-[0.85rem] text-[var(--track-accent)] transition-[gap] duration-200 ease-brand">
        {complete ? "Review track" : started ? "Continue" : "Start track"} →
      </div>
    </Card>);
}
