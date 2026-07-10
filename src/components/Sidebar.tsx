import { Link, useParams } from "react-router-dom";
import { modules, lessonPath, lessonKey, moduleProgress } from "../content/registry";
import { useProgress } from "../lib/progress";
import { ProgressRing } from "./ProgressRing";

export function Sidebar() {
  const { moduleId, lessonId } = useParams();
  const done = useProgress((s) => s.done);

  return (
    <aside className="sidebar">
      {modules.map((m) => (
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
    </aside>
  );
}
