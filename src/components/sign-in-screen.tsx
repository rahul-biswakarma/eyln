import { useAuth } from "../lib/auth";
import { Card, buttonClass } from "./ui";
export function SignInScreen() {
    const signIn = useAuth((s) => s.signIn);
    const error = useAuth((s) => s.error);
    return (<div className="min-h-screen grid place-items-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(900px_640px_at_70%_-10%,rgba(255,138,0,0.14),transparent_60%),radial-gradient(760px_520px_at_10%_110%,rgba(255,176,0,0.07),transparent_60%),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[length:auto,auto,58px_58px,58px_58px]" aria-hidden/>
      <Card className="relative z-[1] w-[min(440px,100%)] py-[2.6rem] px-[2.4rem] text-left">
        <div className="w-[52px] h-[52px] grid place-items-center mb-[1.4rem] rounded-[14px] text-[1.2rem] text-accent border border-border-glow bg-[radial-gradient(120%_120%_at_30%_20%,rgba(255,176,0,0.26),rgba(255,138,0,0.05))] shadow-[inset_0_0_14px_rgba(255,176,0,0.22)]">◆</div>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-text-faint">Eyln · Engineering Academy</div>
        <h1 className="mt-[0.5rem] mb-[0.8rem] text-[clamp(1.7rem,3vw,2.1rem)]">Sign in to begin</h1>
        <p className="text-text-dim text-[0.95rem] leading-[1.6] mt-0 mb-[1.8rem]">
          Your progress, notes, and reminders sync to your account and follow you across
          devices. Sign in with Google to enter the academy.
        </p>

        <button className={buttonClass("primary", "default", "w-full justify-center py-[0.8rem] px-[1.3rem] text-[0.95rem]")} onClick={signIn}>
          <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-white text-[#1a1205] font-display font-bold text-[0.8rem]">G</span>
          Continue with Google
        </button>

        {error && <div className="mt-4 font-mono text-[0.78rem] text-bad bg-[rgba(255,92,92,0.1)] border border-[rgba(255,92,92,0.28)] rounded-sm py-[0.6rem] px-[0.8rem] break-words">{error}</div>}

        <div className="mt-[1.8rem] pt-[1.4rem] border-t border-border text-[0.8rem] text-text-faint leading-[1.55]">
          Three tracks · 23 modules · 110 lessons — a 3D engine, data structures &amp;
          algorithms, and the mathematics underneath.
        </div>
      </Card>
    </div>);
}
