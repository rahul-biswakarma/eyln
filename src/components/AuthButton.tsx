import { useState } from "react";
import { useAuth } from "../lib/auth";
import { isFirebaseEnabled } from "../lib/firebase";

export function AuthButton() {
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const signIn = useAuth((s) => s.signIn);
  const signOut = useAuth((s) => s.signOut);
  const [open, setOpen] = useState(false);

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
    <div className="auth-wrap" onMouseLeave={() => setOpen(false)}>
      <button className="auth-btn" onClick={() => setOpen((o) => !o)} title={user.email ?? "Account"}>
        {user.photoURL ? (
          <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-initial">{initial}</span>
        )}
      </button>
      {open && (
        <div className="auth-menu card">
          <div className="auth-id">
            <div className="auth-name">{user.name ?? "Signed in"}</div>
            {user.email && <div className="auth-email">{user.email}</div>}
          </div>
          <div className="auth-synced">✓ Progress synced to the cloud</div>
          <button className="btn" onClick={() => { setOpen(false); void signOut(); }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
