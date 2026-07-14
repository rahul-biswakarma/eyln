import { Link } from "react-router-dom";
import type { Track } from "../content/types";
import { modulesForTrack, lessonsForTrack, nextLessonInTrack, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";
import { TrackIcon } from "./module-icon";
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
    return (<Link className="card track-card hover" to={next ? lessonPath(next.module.id, next.lesson.id) : "/curriculum"} style={{ "--track-accent": track.accent } as React.CSSProperties}>
      <div className="mb-[1.1rem] flex items-center gap-[0.9rem]">
        <span className="tc-glyph"><TrackIcon id={track.id} size={26}/></span>
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
          <div className="pbar mb-[0.6rem] !h-[5px]">
            <i style={{ width: `${Math.max(pct * 100, 6)}%`, background: track.accent, boxShadow: `0 0 10px ${track.accent}80` }}/>
          </div>
        </>) : (<div className="py-2 text-[0.82rem]" style={{ color: track.accent }}>
          Begin with <b className="font-semibold">{next?.lesson.title}</b>
        </div>)}

      <div className="tc-cta">
        {complete ? "Review track" : started ? "Continue" : "Start track"} →
      </div>
    </Link>);
}
