import { Link, NavLink, useNavigate } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { useNotes, dueReminders } from "../lib/notes";
import { computeStats } from "../lib/stats";
import { AuthButton } from "./AuthButton";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/curriculum", label: "Curriculum", end: false },
  { to: "/playground", label: "Playground", end: false },
  { to: "/notes", label: "Notes", end: false },
  { to: "/resources", label: "Resources", end: false },
];

export function TopNav() {
  const done = useProgress((s) => s.done);
  const reset = useProgress((s) => s.reset);
  const reminders = useNotes((s) => s.reminders);
  const navigate = useNavigate();
  const stats = computeStats(done);
  const level = 1 + Math.floor(stats.lessonsDone / 3); // 1 level per 3 lessons — real progress
  const due = dueReminders(reminders, Date.now()).length;

  return (
    <header className="topnav">
      <Link to="/" className="logo-mark" title="Forge — Engineering Academy">
        <span className="glyph">◆</span>
        <span>Forge</span>
      </Link>

      <nav className="segmented">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          className="icon-btn"
          title={due ? `${due} reminder(s) due` : "Reminders"}
          onClick={() => navigate("/notes")}
          style={{ position: "relative" }}
        >
          🔔
          {due > 0 && (
            <span
              style={{
                position: "absolute", top: -4, right: -4, minWidth: 16, height: 16,
                padding: "0 4px", borderRadius: 8, background: "var(--bad)", color: "#fff",
                fontSize: "0.62rem", fontFamily: "var(--mono)", display: "grid", placeItems: "center",
              }}
            >
              {due}
            </span>
          )}
        </button>
        <button
          className="icon-btn"
          title="Reset all progress"
          onClick={() => {
            if (confirm("Reset all progress? This clears completed lessons and quiz scores.")) {
              reset();
              navigate("/");
            }
          }}
        >
          ⟲
        </button>
        <div className="level-chip">
          <span>Lv {level}</span>
          <span className="lvl-badge">{stats.lessonsDone}</span>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
