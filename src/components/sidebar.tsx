import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle, Circle, ListChecks, CaretDoubleLeft, CaretDoubleRight } from "@phosphor-icons/react";
import { modulesForTrack, getModule, lessonPath, lessonKey, questionaryPath, moduleHasQuestionary, moduleProgress, trackIdOf } from "../content/registry";
import { getTrack } from "../content/tracks";
import { useProgress } from "../lib/progress";
import { useUI } from "../lib/ui";
import { ModuleIcon } from "./module-icon";

export function Sidebar() {
  const { moduleId, lessonId } = useParams();
  const loc = useLocation();
  const done = useProgress((s) => s.done);
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const current = moduleId ? getModule(moduleId) : undefined;
  if (!current) return <aside className="sidebar" />;

  const onQuestionary = loc.pathname.endsWith("/questionary");

  const track = getTrack(trackIdOf(current));
  const siblings = modulesForTrack(trackIdOf(current));
  const accent = track?.accent ?? "var(--accent)";
  const firstUndone = current.lessons.find((l) => !done[lessonKey(current.id, l.id)]);

  // Collapsed → slim rail: module icon + expand button.
  if (collapsed) {
    return (
      <aside className="sidebar skill-tree collapsed" style={{ "--track-accent": accent } as React.CSSProperties}>
        <button className="st-collapse" onClick={toggleSidebar} aria-label="Expand sidebar" title="Expand">
          <CaretDoubleRight size={16} weight="bold" />
        </button>
        <span className="st-ic rail" title={current.title}><ModuleIcon id={current.id} size={18} /></span>
      </aside>
    );
  }

  return (
    <aside className="sidebar skill-tree" style={{ "--track-accent": accent } as React.CSSProperties}>
      <div className="st-head">
        <span className="st-ic"><ModuleIcon id={current.id} size={18} /></span>
        <div className="st-head-txt">
          <div className="st-track">{track?.title}</div>
          <div className="st-module">{current.title}</div>
        </div>
        <button className="st-collapse" onClick={toggleSidebar} aria-label="Collapse sidebar" title="Collapse">
          <CaretDoubleLeft size={16} weight="bold" />
        </button>
      </div>

      <div className="st-body">
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

          {moduleHasQuestionary(current) && (
            <Link
              to={questionaryPath(current.id)}
              className={"st-node questionary " + (onQuestionary ? "active" : "upcoming")}
            >
              <span className="st-marker"><ListChecks size={17} weight="duotone" /></span>
              <span className="st-label">Questionary</span>
            </Link>
          )}
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
      </div>
    </aside>
  );
}
