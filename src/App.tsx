import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { useReminderScheduler } from "./lib/reminders";

export function App() {
  const loc = useLocation();
  // Scan reminders on an interval + tab focus; fires notifications when due.
  useReminderScheduler();
  // Sidebar only inside a lesson (route /m/:module/:lesson).
  const inLesson = loc.pathname.startsWith("/m/");
  return (
    <div className="shell">
      <TopNav />
      <div className="layout">
        {inLesson && <Sidebar />}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
