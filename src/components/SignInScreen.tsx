import { useAuth } from "../lib/auth";

/** Full-screen gate shown until the user signs in. */
export function SignInScreen() {
  const signIn = useAuth((s) => s.signIn);
  const error = useAuth((s) => s.error);

  return (
    <div className="signin-screen">
      <div className="signin-bg" aria-hidden />
      <div className="signin-card card">
        <div className="signin-mark">◆</div>
        <div className="eyebrow">Forge · Engineering Academy</div>
        <h1>Sign in to begin</h1>
        <p className="signin-sub">
          Your progress, notes, and reminders sync to your account and follow you across
          devices. Sign in with Google to enter the academy.
        </p>

        <button className="btn primary signin-google" onClick={signIn}>
          <span className="g-mark">G</span>
          Continue with Google
        </button>

        {error && <div className="signin-error">{error}</div>}

        <div className="signin-foot">
          Three tracks · 23 modules · 110 lessons — a 3D engine, data structures &amp;
          algorithms, and the mathematics underneath.
        </div>
      </div>
    </div>
  );
}
