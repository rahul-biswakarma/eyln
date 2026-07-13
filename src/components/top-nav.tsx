import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell } from "@phosphor-icons/react";
import { useProgress } from "../lib/progress";
import { useNotes, dueReminders } from "../lib/notes";
import { computeStats } from "../lib/stats";
import { levelFor } from "../lib/badges";
import { AuthButton } from "./auth-button";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/curriculum", label: "Curriculum", end: false },
  { to: "/practice", label: "Practice", end: false },
  { to: "/notes", label: "Notes", end: false },
];

export function TopNav() {
  const done = useProgress((s) => s.done);
  const reminders = useNotes((s) => s.reminders);
  const navigate = useNavigate();
  const stats = computeStats(done);
  const level = levelFor(stats.lessonsDone);
  const due = dueReminders(reminders, Date.now()).length;

  return (
    <header className="topnav">
      <Link to="/" className="logo-mark" title="Eyln — Engineering Academy">
        <span className="glyph">◆</span>
        <span>Eyln</span>
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
          <Bell size={19} weight="duotone" />
          {due > 0 && <span className="nav-badge">{due}</span>}
        </button>
        <Link to="/profile" className="level-chip" title="Your profile">
          <span>Lv {level}</span>
          <span className="lvl-badge">{stats.lessonsDone}</span>
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
