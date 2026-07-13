import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import {
  challengesForTrack, challengesByTopic, PRACTICE_TRACKS, challenges, trackOf,
  type PracticeTrack,
} from "../content/challenges";
import type { PracticeTrackId } from "../content/types";
import { CodeChallenge } from "../components/CodeChallenge";
import { useProgress } from "../lib/progress";

export function Practice() {
  const solved = useProgress((s) => s.solvedChallenges);
  const [params] = useSearchParams();
  // Deep-link: /practice?c=<challengeId> preselects that challenge + its track.
  const linked = params.get("c");
  const linkedChallenge = linked ? challenges.find((c) => c.id === linked) : undefined;
  const [trackId, setTrackId] = useState<PracticeTrackId>(
    linkedChallenge ? trackOf(linkedChallenge) : "dsa"
  );
  const trackList = useMemo(() => challengesForTrack(trackId), [trackId]);
  const [activeId, setActiveId] = useState(linkedChallenge?.id ?? trackList[0]?.id);

  const active = trackList.find((c) => c.id === activeId) ?? trackList[0];
  const activeIdx = trackList.findIndex((c) => c.id === active.id);
  const solvedCount = trackList.filter((c) => solved[c.id]).length;
  const pct = trackList.length ? solvedCount / trackList.length : 0;
  const nextUp = trackList[activeIdx + 1];
  const track = PRACTICE_TRACKS.find((t) => t.id === trackId) as PracticeTrack;

  function switchTrack(id: PracticeTrackId) {
    setTrackId(id);
    setActiveId(challengesForTrack(id)[0]?.id);
  }

  return (
    <div className="practice-shell">
      <aside className="practice-sidebar">
        <div className="track-switch">
          {PRACTICE_TRACKS.map((t) => (
            <button
              key={t.id}
              className={"track-tab" + (t.id === trackId ? " active" : "")}
              onClick={() => switchTrack(t.id)}
            >
              {t.id === "dsa" ? "DSA" : t.id === "engine" ? "Engine" : "Math"}
            </button>
          ))}
        </div>

        <div className="track-panel">
          <div className="tp-grid" aria-hidden />
          <div className="tp-eyebrow">Practice Track</div>
          <div className="tp-name">{track.title}</div>

          <div className="tp-segments">
            {trackList.map((c, i) => (
              <span key={c.id} className={"tp-seg" + (solved[c.id] ? " done" : "") + (i === activeIdx ? " current" : "")} />
            ))}
          </div>
          <div className="tp-pct-row">
            <span className="tp-pct">{Math.round(pct * 100)}%</span>
            <span className="tp-mission">Mission {activeIdx + 1} of {trackList.length}</span>
          </div>

          {nextUp && (
            <button className="tp-cta" onClick={() => setActiveId(nextUp.id)}>
              {solved[active.id] ? "Continue" : "Skip ahead"} <ArrowRight size={15} weight="bold" />
            </button>
          )}
        </div>

        <nav className="ps-list">
          {challengesByTopic(trackId).map((group) => {
            const groupSolved = group.items.filter((c) => solved[c.id]).length;
            return (
              <div key={group.topic} className="ps-group">
                <div className="ps-group-head">
                  <span>{group.topic}</span>
                  <span className="ps-group-count">{groupSolved}/{group.items.length}</span>
                </div>
                {group.items.map((c) => (
                  <button
                    key={c.id}
                    className={"ps-item" + (c.id === activeId ? " active" : "") + (solved[c.id] ? " solved" : "")}
                    onClick={() => setActiveId(c.id)}
                  >
                    <span className={"pi-dot " + c.difficulty.toLowerCase()} />
                    <span className="ps-item-title">{c.title}</span>
                    {solved[c.id] && <CheckCircle size={15} weight="fill" className="pi-check" />}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="practice-main">
        <CodeChallenge key={active.id} challenge={active} missionIndex={activeIdx + 1} missionTotal={trackList.length} />
      </main>
    </div>
  );
}
