import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";
import { SignInScreen } from "./components/SignInScreen";
import { useReminderScheduler } from "./lib/reminders";
import { useAuth } from "./lib/auth";
import { isFirebaseEnabled } from "./lib/firebase";

export function App() {
  const loc = useLocation();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  // Scan reminders on an interval + tab focus; fires notifications when due.
  useReminderScheduler();

  // Auth gate: the app is only accessible once signed in.
  if (isFirebaseEnabled()) {
    if (!ready) {
      return (
        <div className="signin-screen">
          <div className="signin-bg" aria-hidden />
          <div className="auth-loading">Loading…</div>
        </div>
      );
    }
    if (!user) return <SignInScreen />;
  }

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
