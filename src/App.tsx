import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./components/top-nav";
import { Sidebar } from "./components/sidebar";
import { TutorPanel } from "./components/tutor-panel";
import { SignInScreen } from "./components/sign-in-screen";
import { useReminderScheduler } from "./lib/reminders";
import { useAuth } from "./lib/auth";
import { useSync } from "./lib/sync";
export function App() {
    const loc = useLocation();
    const user = useAuth((s) => s.user);
    const ready = useAuth((s) => s.ready);
    const loaded = useSync((s) => s.loaded);
    useReminderScheduler();
    if (!ready || (user && !loaded)) {
        return (<div className="min-h-screen grid place-items-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(900px_640px_at_70%_-10%,rgba(255,138,0,0.14),transparent_60%),radial-gradient(760px_520px_at_10%_110%,rgba(255,176,0,0.07),transparent_60%),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:auto,auto,58px_58px,58px_58px]" aria-hidden/>
        <div className="relative z-[1] font-mono text-text-dim tracking-[0.1em]">Loading…</div>
      </div>);
    }
    if (!user)
        return <SignInScreen />;
    const inLesson = loc.pathname.startsWith("/m/");
    return (<div className="w-screen h-screen h-[100dvh] overflow-hidden flex flex-col">
      <TopNav />
      <div className="flex items-stretch flex-1 min-h-0 overflow-hidden">
        {inLesson && <Sidebar />}
        <main className="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        {inLesson && <TutorPanel />}
      </div>
    </div>);
}
