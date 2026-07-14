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
    const [pos, setPos] = useState<{
        top: number;
        right: number;
    }>({ top: 0, right: 0 });
    useLayoutEffect(() => {
        if (!open || !btnRef.current)
            return;
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
    useEffect(() => {
        if (!open)
            return;
        const onDown = (e: MouseEvent) => {
            const t = e.target as Node;
            if (btnRef.current?.contains(t) || menuRef.current?.contains(t))
                return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);
    if (!isFirebaseEnabled())
        return null;
    if (!ready)
        return <div className="w-[38px] h-[38px] flex-none p-0 grid place-items-center rounded-full overflow-hidden bg-surface-2 border border-border" aria-hidden/>;
    if (!user) {
        return (<button className="btn py-2 px-[1.05rem]" onClick={signIn} title="Sign in to sync your progress">
        Sign in
      </button>);
    }
    const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();
    return (<div className="relative">
      <button ref={btnRef} className="w-[38px] h-[38px] flex-none p-0 cursor-pointer grid place-items-center rounded-full overflow-hidden bg-surface border border-border-bright transition-[border-color,box-shadow] duration-200 ease-brand hover:border-border-glow hover:shadow-[0_0_0_3px_var(--accent-soft)]" onClick={() => setOpen((o) => !o)} title={user.email ?? "Account"} aria-haspopup="menu" aria-expanded={open}>
        {user.photoURL ? (<img className="w-full h-full object-cover" src={user.photoURL} alt="" referrerPolicy="no-referrer"/>) : (<span className="font-display font-semibold text-accent text-[0.9rem]">{initial}</span>)}
      </button>

      {open &&
            createPortal(<div ref={menuRef} className="auth-menu card fixed z-[80] w-[248px] p-[1.1rem] grid gap-[0.7rem] border border-border-bright shadow-[var(--shadow-lg),0_0_0_1px_rgba(255,176,0,0.08)]" role="menu" style={{ top: pos.top, right: pos.right }}>
            <div className="leading-[1.35]">
              <div className="font-display font-semibold text-text">{user.name ?? "Signed in"}</div>
              {user.email && <div className="text-[0.76rem] text-text-faint font-mono break-all">{user.email}</div>}
            </div>
            <div className="text-[0.76rem] text-good font-mono">✓ Progress synced to the cloud</div>
            <Link className="btn primary w-full justify-center" to="/profile" onClick={() => setOpen(false)}>
              View profile
            </Link>
            <button className="btn w-full justify-center" onClick={() => { setOpen(false); void signOut(); }}>
              Sign out
            </button>
          </div>, document.body)}
    </div>);
}
