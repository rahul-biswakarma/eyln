import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircleIcon, CircleIcon, ListChecksIcon, CaretDoubleLeftIcon, CaretDoubleRightIcon } from "@phosphor-icons/react";
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
    if (!current)
        return <aside className="sidebar"/>;
    const onQuestionary = loc.pathname.endsWith("/questionary");
    const track = getTrack(trackIdOf(current));
    const siblings = modulesForTrack(trackIdOf(current));
    const accent = track?.accent ?? "var(--accent)";
    const firstUndone = current.lessons.find((l) => !done[lessonKey(current.id, l.id)]);
    const collapseBtn = "flex-none grid place-items-center w-[28px] h-[28px] cursor-pointer rounded-[8px] border border-border bg-transparent text-text-faint transition-colors duration-200 ease-brand hover:text-text hover:border-border-bright";
    if (collapsed) {
        return (<aside className="sidebar collapsed" style={{ "--track-accent": accent } as React.CSSProperties}>
        <button className={collapseBtn} onClick={toggleSidebar} aria-label="Expand sidebar" title="Expand">
          <CaretDoubleRightIcon size={16} weight="bold"/>
        </button>
        <span className="st-ic rail" title={current.title}><ModuleIcon id={current.id} size={18}/></span>
      </aside>);
    }
    const nodeBase = "st-node relative flex items-center gap-[0.7rem] pr-[0.6rem] py-[0.5rem] text-[0.86rem] transition-colors duration-200 ease-brand";
    const markerBase = "st-marker relative w-[20px] flex-none grid place-items-center z-[1]";
    return (<aside className="sidebar" style={{ "--track-accent": accent } as React.CSSProperties}>
      <div className="flex items-center gap-[0.7rem] pt-[1.6rem] px-[1.1rem] pb-[1rem] shrink-0">
        <span className="st-ic"><ModuleIcon id={current.id} size={18}/></span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-faint">{track?.title}</div>
          <div className="font-display font-semibold text-[0.98rem] text-text mt-[0.1rem]">{current.title}</div>
        </div>
        <button className={collapseBtn} onClick={toggleSidebar} aria-label="Collapse sidebar" title="Collapse">
          <CaretDoubleLeftIcon size={16} weight="bold"/>
        </button>
      </div>

      <div className="st-body">
        <div className="relative pl-[0.4rem]">
          {current.lessons.map((l) => {
            const active = l.id === lessonId;
            const isDone = !!done[lessonKey(current.id, l.id)];
            const isNext = !isDone && firstUndone?.id === l.id;
            const nodeState = isDone
                ? "done text-text-dim hover:text-text"
                : active
                    ? "text-highlight font-medium"
                    : isNext
                        ? "text-text-dim hover:text-text"
                        : "text-text-dim hover:text-text opacity-60";
            const markerColor = isDone
                ? "text-good"
                : active || isNext
                    ? "text-[var(--track-accent)]"
                    : "text-text-faint";
            return (<Link key={l.id} to={lessonPath(current.id, l.id)} className={`${nodeBase} ${nodeState}`}>
                <span className={`${markerBase} ${markerColor}`}>
                  {isDone ? <CheckCircleIcon size={17} weight="fill"/> : <CircleIcon size={17} weight={active || isNext ? "bold" : "duotone"}/>}
                </span>
                <span className="flex-1 min-w-0 leading-[1.35]">{l.title}</span>
              </Link>);
        })}

          {moduleHasQuestionary(current) && (<Link to={questionaryPath(current.id)} className={`${nodeBase} mt-[0.4rem] font-medium ${onQuestionary ? "text-highlight" : "text-text-dim hover:text-text opacity-60"}`}>
              <span className={`${markerBase} text-[var(--track-accent)]`}><ListChecksIcon size={17} weight="duotone"/></span>
              <span className="flex-1 min-w-0 leading-[1.35]">Questionary</span>
            </Link>)}
        </div>

        <div className="mt-[1.8rem] pt-[1.2rem] border-t border-border">
          <div className="font-mono text-[0.6rem] tracking-[0.14em] uppercase text-text-faint px-[0.4rem] pb-[0.5rem]">{track?.title} track</div>
          {siblings.map((m) => {
            const p = moduleProgress(m, done);
            const isCurrent = m.id === current.id;
            return (<Link key={m.id} to={lessonPath(m.id, m.lessons[0].id)} className={`flex items-center gap-[0.6rem] p-[0.5rem] rounded-sm text-[0.82rem] transition-colors duration-200 ease-brand hover:bg-surface ${isCurrent ? "text-[var(--track-accent)]" : "text-text-dim hover:text-text"}`}>
                <span className="flex-none opacity-85"><ModuleIcon id={m.id} size={15}/></span>
                <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{m.title}</span>
                <span className="font-mono text-[0.68rem] text-text-faint flex-none">{Math.round(p * 100)}%</span>
              </Link>);
        })}
        </div>
      </div>
    </aside>);
}
