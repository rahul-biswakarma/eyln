import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { challengesForTrack, challengesByTopic, PRACTICE_TRACKS, challenges, trackOf, type PracticeTrack, } from "../../content/challenges";
import type { PracticeTrackId } from "../../content/types";
import { CodeChallenge } from "../../components/code-challenge";
import { useProgress } from "../../lib/progress";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui";
export function Practice() {
    const solved = useProgress((s) => s.solvedChallenges);
    const [params] = useSearchParams();
    const linked = params.get("c");
    const linkedChallenge = linked ? challenges.find((c) => c.id === linked) : undefined;
    const [trackId, setTrackId] = useState<PracticeTrackId>(linkedChallenge ? trackOf(linkedChallenge) : "dsa");
    const trackList = useMemo(() => challengesForTrack(trackId), [trackId]);
    const [activeId, setActiveId] = useState(linkedChallenge?.id ?? trackList[0]?.id);
    const active = trackList.find((c) => c.id === activeId) ?? trackList[0];
    const activeIdx = trackList.findIndex((c) => c.id === active.id);
    const solvedCount = trackList.filter((c) => solved[c.id]).length;
    const pct = trackList.length ? solvedCount / trackList.length : 0;
    const track = PRACTICE_TRACKS.find((t) => t.id === trackId) as PracticeTrack;
    function switchTrack(id: PracticeTrackId) {
        setTrackId(id);
        setActiveId(challengesForTrack(id)[0]?.id);
    }
    return (<div className="grid grid-cols-[264px_1fr] h-[calc(100vh-70px)] max-[860px]:grid-cols-1 max-[860px]:h-auto">
      <aside className="border-r border-border p-[1.4rem_1rem] overflow-y-auto flex flex-col gap-[1.4rem] max-[860px]:hidden">
        <Tabs value={trackId} onValueChange={(v) => switchTrack(v as PracticeTrackId)}>
          <TabsList className="track-switch">
            {PRACTICE_TRACKS.map((t) => (<TabsTrigger key={t.id} value={t.id} className="track-tab">
                {t.id === "dsa" ? "DSA" : t.id === "engine" ? "Engine" : "Math"}
              </TabsTrigger>))}
          </TabsList>
        </Tabs>

        <div className="track-panel relative overflow-hidden isolate flex-none p-[1.4rem_1.3rem] rounded-[18px] border border-border bg-surface bg-[linear-gradient(180deg,rgba(255,176,0,0.05),transparent_42%)] shadow-[0_6px_24px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-200 ease-brand">
          <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(circle_at_80%_0%,#000,transparent_70%)]"/>
          <div className="font-mono text-[0.64rem] tracking-[0.18em] uppercase text-accent">Practice Track</div>
          <div className="font-display text-[1.5rem] font-semibold tracking-[-0.01em] mt-1 mb-[1.2rem]">{track.title}</div>

          <div className="flex gap-[3px]">
            {trackList.map((c, i) => (<span key={c.id} className={"tp-seg flex-1 h-[6px] rounded-[2px] bg-surface-inset transition-[background,box-shadow] duration-[400ms] ease-brand" + (solved[c.id] ? " [background:var(--accent-grad)] shadow-[0_0_8px_rgba(255,176,0,0.45)]" : "") + (i === activeIdx ? " current" : "")}/>))}
          </div>
          <div className="flex items-baseline justify-between mt-[0.6rem]">
            <span className="font-display text-[1.15rem] font-semibold text-text">{Math.round(pct * 100)}%</span>
            <span className="font-mono text-[0.7rem] text-text-faint tracking-[0.03em]">Mission {activeIdx + 1} of {trackList.length}</span>
          </div>

        </div>

        <nav className="flex flex-col gap-[0.9rem] flex-none">
          {challengesByTopic(trackId).map((group) => {
            const groupSolved = group.items.filter((c) => solved[c.id]).length;
            return (<div key={group.topic} className="flex flex-col gap-[0.1rem]">
                <div className="flex items-center justify-between font-mono text-[0.64rem] tracking-[0.14em] uppercase text-text-faint p-[0.2rem_0.7rem_0.4rem]">
                  <span>{group.topic}</span>
                  <span className="text-accent opacity-80">{groupSolved}/{group.items.length}</span>
                </div>
                {group.items.map((c) => {
                  const diff = c.difficulty.toLowerCase();
                  const dot = diff === "easy" ? "bg-good" : diff === "medium" ? "bg-warn" : "bg-bad";
                  const active = c.id === activeId;
                  return (<button key={c.id} className={"flex items-center gap-[0.6rem] text-left cursor-pointer w-full p-[0.5rem_0.7rem] rounded-sm bg-transparent border-0 text-[0.85rem] relative transition-[background,color] duration-200 ease-brand" + (active ? " bg-accent-soft text-highlight" : " text-text-dim hover:bg-surface hover:text-text")} onClick={() => setActiveId(c.id)}>
                    <span className={"w-[7px] h-[7px] rounded-full flex-none " + dot}/>
                    <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{c.title}</span>
                    {solved[c.id] && <CheckCircleIcon size={15} weight="fill" className="text-good flex-none"/>}
                  </button>);
                })}
              </div>);
        })}
        </nav>
      </aside>

      <main className="min-w-0 p-[1rem_clamp(1rem,2.5vw,1.6rem)_1rem_1.25rem] flex h-full min-h-0 overflow-hidden max-[860px]:h-auto max-[860px]:overflow-visible">
        <CodeChallenge key={active.id} challenge={active} missionIndex={activeIdx + 1} missionTotal={trackList.length}/>
      </main>
    </div>);
}
