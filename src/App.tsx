import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./components/top-nav";
import { Sidebar } from "./components/sidebar";
import { TutorPanel } from "./components/tutor-panel";
import { SignInScreen } from "./components/sign-in-screen";
import { useReminderScheduler } from "./lib/reminders";
import { useAuth } from "./lib/auth";
export function App() {
    const loc = useLocation();
    const user = useAuth((s) => s.user);
    const ready = useAuth((s) => s.ready);
    useReminderScheduler();
    if (!ready) {
        return (<div className="signin-screen">
        <div className="signin-bg" aria-hidden/>
        <div className="auth-loading">Loading…</div>
      </div>);
    }
    if (!user)
        return <SignInScreen />;
    const inLesson = loc.pathname.startsWith("/m/");
    return (<div className="shell">
      <TopNav />
      <div className="layout">
        {inLesson && <Sidebar />}
        <main className="shell-main">
          <Outlet />
        </main>
        {inLesson && <TutorPanel />}
      </div>
    </div>);
}
