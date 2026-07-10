import { Link, useParams } from "react-router-dom";
import { modulesForTrack, lessonPath, lessonKey, moduleProgress } from "../content/registry";
import { tracks } from "../content/tracks";
import { useProgress } from "../lib/progress";
import { ProgressRing } from "./ProgressRing";

export function Sidebar() {
  const { moduleId, lessonId } = useParams();
  const done = useProgress((s) => s.done);

  return (
    <aside className="sidebar">
      {tracks.map((track) => {
        const trackModules = modulesForTrack(track.id);
        if (trackModules.length === 0) return null;
        return (
          <div key={track.id} className="side-track" style={{ "--track-accent": track.accent } as React.CSSProperties}>
            <div className="side-track-label">
              <span className="tg">{track.icon}</span>
              {track.title}
            </div>
            {trackModules.map((m) => (
              <div className="mod-group" key={m.id}>
                <div className="mod-title">
                  <span className="ic">{m.icon}</span>
                  <span>{m.title}</span>
                  <span className="ring"><ProgressRing value={moduleProgress(m, done)} size={26} stroke={3} showText={false} /></span>
                </div>
                {m.lessons.map((l) => {
                  const active = m.id === moduleId && l.id === lessonId;
                  const isDone = done[lessonKey(m.id, l.id)];
                  return (
                    <Link
                      key={l.id}
                      to={lessonPath(m.id, l.id)}
                      className={"les-link" + (active ? " active" : "") + (isDone ? " done" : "")}
                    >
                      <span className="dot" />
                      <span>{l.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
