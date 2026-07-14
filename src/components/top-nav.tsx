import { Link, NavLink, useNavigate } from "react-router-dom";
import { BellIcon } from "@phosphor-icons/react";
import { useProgress } from "../lib/progress";
import { useNotes, dueReminders } from "../lib/notes";
import { computeStats } from "../lib/stats";
import { levelFor } from "../lib/badges";
import { AuthButton } from "./auth-button";
const NAV = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/curriculum", label: "Curriculum", end: false },
    { to: "/practice", label: "Practice", end: false },
    { to: "/knowledge", label: "Knowledge", end: false },
];
export function TopNav() {
    const done = useProgress((s) => s.done);
    const reminders = useNotes((s) => s.reminders);
    const navigate = useNavigate();
    const stats = computeStats(done);
    const level = levelFor(stats.lessonsDone);
    const due = dueReminders(reminders, Date.now()).length;
    return (<header className="sticky top-0 z-40 flex items-center gap-[1.5rem] py-[1rem] px-[clamp(1.2rem,4vw,3rem)] bg-[linear-gradient(180deg,rgba(11,11,14,0.88),rgba(11,11,14,0.42))] [backdrop-filter:blur(16px)_saturate(130%)] border-b border-border">
      <Link to="/" className="inline-flex items-center gap-[0.6rem] flex-none text-text font-display font-semibold tracking-[0.02em] text-[1.02rem]" title="Eyln — Engineering Academy">
        <span className="grid place-items-center w-[34px] h-[34px] rounded-sm text-[0.95rem] text-accent bg-[radial-gradient(120%_120%_at_30%_20%,rgba(255,176,0,0.26),rgba(255,138,0,0.05))] border border-border-glow shadow-[inset_0_0_14px_rgba(255,176,0,0.22)]">◆</span>
        <span>Eyln</span>
      </Link>

      <nav className="my-0 ml-[1rem] mr-auto flex items-center gap-[0.4rem]">
        {NAV.map((n) => (<NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `relative inline-flex items-center gap-[0.45rem] px-[0.9rem] py-[0.55rem] text-[0.9rem] font-medium transition-colors duration-200 ease-brand after:content-[''] after:absolute after:left-[0.9rem] after:right-[0.9rem] after:bottom-[-2px] after:h-[2px] after:rounded-[2px] after:bg-[var(--accent-line)] after:origin-center after:transition-transform after:duration-200 after:ease-brand after:shadow-[0_0_12px_rgba(255,176,0,0.7)] ${isActive ? "text-text after:scale-x-100" : "text-text-dim hover:text-text after:scale-x-0"}`}>
            {n.label}
          </NavLink>))}
      </nav>

      <div className="flex items-center gap-[10px]">
        <button className="relative w-[38px] h-[38px] flex-none grid place-items-center cursor-pointer rounded-[10px] bg-surface border border-border text-text-dim text-[1rem] transition-[color,border-color,background,box-shadow] duration-200 ease-brand hover:text-accent hover:border-border-glow hover:bg-surface-2 hover:shadow-[0_0_0_1px_rgba(255,176,0,0.16),0_6px_20px_rgba(255,138,0,0.18)]" title={due ? `${due} reminder(s) due` : "Reminders"} onClick={() => navigate("/knowledge")}>
          <BellIcon size={19} weight="duotone"/>
          {due > 0 && <span className="absolute top-[-4px] right-[-4px] grid place-items-center min-w-[16px] h-[16px] px-[4px] rounded-[8px] bg-bad text-white text-[0.62rem] font-mono">{due}</span>}
        </button>
        <Link to="/profile" className="flex items-center gap-[0.55rem] pl-[14px] pr-[5px] py-[5px] rounded-pill bg-surface border border-border text-[0.78rem] text-text-dim font-mono tracking-[0.04em]" title="Your profile">
          <span>Lv</span>
          <span className="grid place-items-center w-[28px] h-[28px] rounded-[8px] font-bold text-on-accent bg-[var(--accent-grad)] text-[0.78rem] font-display">{level}</span>
        </Link>
        <AuthButton />
      </div>
    </header>);
}
