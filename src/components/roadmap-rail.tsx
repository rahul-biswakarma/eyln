import { useNavigate } from "react-router-dom";
import { getModule, moduleProgress, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";
import { TriangleIcon, VideoCameraIcon, MountainsIcon, WallIcon, CheckIcon, LockIcon, type Icon } from "@phosphor-icons/react";
const NODE_ICON: Record<string, Icon> = {
    triangle: TriangleIcon,
    camera: VideoCameraIcon,
    terrain: MountainsIcon,
    "spline-wall": WallIcon,
};
export function RoadmapRail() {
    const done = useProgress((s) => s.done);
    const navigate = useNavigate();
    const rendering = getModule("rendering");
    if (!rendering)
        return null;
    const depsMet = rendering.dependsOn.every((depId) => {
        const dep = getModule(depId);
        return dep ? moduleProgress(dep, done) >= 1 : true;
    });
    const currentIdx = rendering.lessons.findIndex((l) => !done[lessonKey("rendering", l.id)]);
    const nodeBase = "group flex-1 min-w-[150px] flex flex-col items-center text-center relative px-[0.4rem] before:content-[''] before:absolute before:top-[24px] before:left-[-50%] before:w-full before:h-px before:z-[1] first:before:hidden";
    const beadBase = "w-[48px] h-[48px] rounded-[14px] grid place-items-center text-[1.15rem] border z-[2] transition-[transform,box-shadow,border-color] duration-200 ease-brand group-hover:-translate-y-[2px]";
    return (<div className="flex items-stretch gap-0 overflow-x-auto py-[0.6rem]">
      {rendering.lessons.map((l, i) => {
            const isDone = !!done[lessonKey("rendering", l.id)];
            const isCurrent = i === currentIdx;
            const locked = !depsMet && !isDone;
            const connector = isDone || isCurrent
                ? "before:bg-accent before:shadow-[0_0_8px_rgba(255,176,0,0.5)]"
                : "before:bg-border-bright";
            const nodeCls = `${nodeBase} ${connector}${locked ? " opacity-40" : ""}`;
            const beadState = isDone
                ? "bg-[image:var(--accent-grad)] border-transparent text-on-accent shadow-[0_6px_22px_rgba(255,138,0,0.38)]"
                : isCurrent
                    ? "bg-surface-2 border-accent text-accent shadow-[0_0_0_4px_var(--accent-soft),0_0_18px_rgba(255,176,0,0.42)]"
                    : "bg-surface-2 border-border-bright";
            return (<div key={l.id} className={nodeCls} style={{ cursor: locked ? "default" : "pointer" }} onClick={() => !locked && navigate(lessonPath("rendering", l.id))} title={locked ? "Finish the prerequisite modules to unlock" : l.title}>
            <div className={`${beadBase} ${beadState}`}>
              {isDone ? <CheckIcon size={22} weight="bold"/> : locked ? <LockIcon size={20} weight="duotone"/> : (() => {
                    const Ic = NODE_ICON[l.id];
                    return Ic ? <Ic size={22} weight="duotone"/> : "●";
                })()}
            </div>
            <div className="font-display text-[0.82rem] font-medium mt-[0.7rem] text-text">{l.title.replace(/^Step \d+ — /, "")}</div>
            <div className="text-[0.68rem] text-text-faint font-mono uppercase tracking-[0.08em] mt-[0.15rem]">{isDone ? "done" : isCurrent ? "up next" : locked ? "locked" : `${l.minutes}m`}</div>
          </div>);
        })}
    </div>);
}
