import { Link } from "react-router-dom";
import type { Track } from "../content/types";
import { modulesForTrack, lessonsForTrack, nextLessonInTrack, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";
import { TrackIcon } from "./module-icon";

export function TrackCard({ track }: { track: Track }) {
  const done = useProgress((s) => s.done);
  const mods = modulesForTrack(track.id);
  const lessons = lessonsForTrack(track.id);
  const doneCount = lessons.filter((r) => done[lessonKey(r.module.id, r.lesson.id)]).length;
  const pct = lessons.length ? doneCount / lessons.length : 0;
  const started = doneCount > 0;
  const next = nextLessonInTrack(track.id, done);
  const complete = pct >= 1;

  return (
    <Link
      className="card track-card hover"
      to={next ? lessonPath(next.module.id, next.lesson.id) : "/curriculum"}
      style={{ "--track-accent": track.accent } as React.CSSProperties}
    >
      <div className="tc-top">
        <span className="tc-glyph"><TrackIcon id={track.id} size={26} /></span>
        <div className="tc-head">
          <div className="kicker">Track</div>
          <h3>{track.title}</h3>
        </div>
      </div>
      <p className="tc-blurb">{track.blurb}</p>

      <div className="tc-meta">
        <span>{mods.length} modules</span>
        <span>·</span>
        <span>{lessons.length} lessons</span>
      </div>

      {started ? (
        <>
          <div className="pbar-row">
            <span>{complete ? "Complete" : "In progress"}</span>
            <span>{doneCount}/{lessons.length}</span>
          </div>
          <div className="pbar">
            <i style={{ width: `${Math.max(pct * 100, 6)}%`, background: track.accent, boxShadow: `0 0 10px ${track.accent}80` }} />
          </div>
        </>
      ) : (
        <div className="tc-cue" style={{ color: track.accent }}>
          Begin with <b>{next?.lesson.title}</b>
        </div>
      )}

      <div className="tc-cta">
        {complete ? "Review track" : started ? "Continue" : "Start track"} →
      </div>
    </Link>
  );
}
