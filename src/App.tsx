import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { Sidebar } from "./components/Sidebar";

export function App() {
  const loc = useLocation();
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
