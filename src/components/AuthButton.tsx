import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { isFirebaseEnabled } from "../lib/firebase";

export function AuthButton() {
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const signIn = useAuth((s) => s.signIn);
  const signOut = useAuth((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // Anchor the floating menu to the avatar button (fixed to the viewport).
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect();
      setPos({ top: r.bottom + 14, right: Math.max(12, window.innerWidth - r.right) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  // Dismiss on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isFirebaseEnabled()) return null;
  if (!ready) return <div className="auth-btn skeleton" aria-hidden />;

  if (!user) {
    return (
      <button className="btn auth-signin" onClick={signIn} title="Sign in to sync your progress">
        Sign in
      </button>
    );
  }

  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="auth-wrap">
      <button
        ref={btnRef}
        className="auth-btn"
        onClick={() => setOpen((o) => !o)}
        title={user.email ?? "Account"}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-initial">{initial}</span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="auth-menu card"
            role="menu"
            style={{ top: pos.top, right: pos.right }}
          >
            <div className="auth-id">
              <div className="auth-name">{user.name ?? "Signed in"}</div>
              {user.email && <div className="auth-email">{user.email}</div>}
            </div>
            <div className="auth-synced">✓ Progress synced to the cloud</div>
            <Link className="btn primary auth-menu-btn" to="/profile" onClick={() => setOpen(false)}>
              View profile
            </Link>
            <button className="btn auth-menu-btn" onClick={() => { setOpen(false); void signOut(); }}>
              Sign out
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
