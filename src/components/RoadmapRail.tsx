import { useNavigate } from "react-router-dom";
import { getModule, moduleProgress, lessonPath, lessonKey } from "../content/registry";
import { useProgress } from "../lib/progress";

const NODE_ICON: Record<string, string> = {
  triangle: "🔺",
  camera: "🎥",
  terrain: "🏔️",
  "spline-wall": "🧱",
};

/** The capstone journey: triangle → camera → terrain → walls, with node states. */
export function RoadmapRail() {
  const done = useProgress((s) => s.done);
  const navigate = useNavigate();
  const rendering = getModule("rendering");
  if (!rendering) return null;

  // "rendering" is unlocked once its dependency modules are complete.
  const depsMet = rendering.dependsOn.every((depId) => {
    const dep = getModule(depId);
    return dep ? moduleProgress(dep, done) >= 1 : true;
  });

  // Current = first not-done capstone lesson.
  const currentIdx = rendering.lessons.findIndex((l) => !done[lessonKey("rendering", l.id)]);

  return (
    <div className="roadmap">
      {rendering.lessons.map((l, i) => {
        const isDone = !!done[lessonKey("rendering", l.id)];
        const isCurrent = i === currentIdx;
        const locked = !depsMet && !isDone;
        const cls = "road-node" + (isDone ? " done" : isCurrent ? " current" : locked ? " locked" : "");
        return (
          <div
            key={l.id}
            className={cls}
            style={{ cursor: locked ? "default" : "pointer" }}
            onClick={() => !locked && navigate(lessonPath("rendering", l.id))}
            title={locked ? "Finish the prerequisite modules to unlock" : l.title}
          >
            <div className="bead">{isDone ? "✓" : locked ? "🔒" : NODE_ICON[l.id] ?? "●"}</div>
            <div className="rl-title">{l.title.replace(/^Step \d+ — /, "")}</div>
            <div className="rl-sub">{isDone ? "done" : isCurrent ? "up next" : locked ? "locked" : `${l.minutes}m`}</div>
          </div>
        );
      })}
    </div>
  );
}
