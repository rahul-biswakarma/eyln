import { Link, useParams } from "react-router-dom";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import { modulesForTrack, getModule, lessonPath, lessonKey, moduleProgress, trackIdOf } from "../content/registry";
import { getTrack } from "../content/tracks";
import { useProgress } from "../lib/progress";
import { ModuleIcon } from "./ModuleIcon";

export function Sidebar() {
  const { moduleId, lessonId } = useParams();
  const done = useProgress((s) => s.done);
  const current = moduleId ? getModule(moduleId) : undefined;
  if (!current) return <aside className="sidebar" />;

  const track = getTrack(trackIdOf(current));
  const siblings = modulesForTrack(trackIdOf(current));
  const accent = track?.accent ?? "var(--accent)";
  const firstUndone = current.lessons.find((l) => !done[lessonKey(current.id, l.id)]);

  return (
    <aside className="sidebar skill-tree" style={{ "--track-accent": accent } as React.CSSProperties}>
      <div className="st-head">
        <span className="st-ic"><ModuleIcon id={current.id} size={18} /></span>
        <div>
          <div className="st-track">{track?.title}</div>
          <div className="st-module">{current.title}</div>
        </div>
      </div>

      <div className="st-timeline">
        {current.lessons.map((l) => {
          const active = l.id === lessonId;
          const isDone = !!done[lessonKey(current.id, l.id)];
          const isNext = !isDone && firstUndone?.id === l.id;
          const state = isDone ? "done" : active ? "active" : isNext ? "next" : "upcoming";
          return (
            <Link
              key={l.id}
              to={lessonPath(current.id, l.id)}
              className={"st-node " + state}
            >
              <span className="st-marker">
                {isDone ? <CheckCircle size={17} weight="fill" /> : <Circle size={17} weight={active || isNext ? "bold" : "duotone"} />}
              </span>
              <span className="st-label">{l.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="st-modules">
        <div className="st-modules-label">{track?.title} track</div>
        {siblings.map((m) => {
          const p = moduleProgress(m, done);
          const isCurrent = m.id === current.id;
          return (
            <Link
              key={m.id}
              to={lessonPath(m.id, m.lessons[0].id)}
              className={"st-mod" + (isCurrent ? " current" : "")}
            >
              <span className="st-mod-ic"><ModuleIcon id={m.id} size={15} /></span>
              <span className="st-mod-name">{m.title}</span>
              <span className="st-mod-pct">{Math.round(p * 100)}%</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
