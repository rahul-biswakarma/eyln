import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { CheckCircleIcon, XCircleIcon, CircleNotchIcon, CircleIcon, PlayIcon, LightbulbIcon, ArrowClockwiseIcon, TrophyIcon, ClockIcon, LightningIcon } from "@phosphor-icons/react";
import type { CodeChallenge as Challenge } from "../content/types";
import { EST_MINUTES, xpForChallenge } from "../content/challenges";
import { useProgress } from "../lib/progress";
import { ensureEylnTheme, EYLN_MONACO_THEME } from "../lib/monacoSetup";
import { Button } from "./ui";
interface CaseResult {
    index: number;
    passed: boolean;
    got?: string;
    error?: string;
}
type CaseStatus = "waiting" | "running" | "pass" | "fail";
const RUN_TIMEOUT_MS = 4000;
export function CodeChallenge({ challenge, missionIndex, missionTotal, }: {
    challenge: Challenge;
    missionIndex: number;
    missionTotal: number;
}) {
    const [code, setCode] = useState(challenge.starter);
    const [statuses, setStatuses] = useState<CaseStatus[]>(() => challenge.tests.map(() => "waiting"));
    const [results, setResults] = useState<CaseResult[] | null>(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [celebrate, setCelebrate] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const revealTimers = useRef<number[]>([]);
    const recordChallenge = useProgress((s) => s.recordChallenge);
    const alreadySolved = useProgress((s) => !!s.solvedChallenges[challenge.id]);
    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            revealTimers.current.forEach(clearTimeout);
        };
    }, []);
    const onMount: OnMount = (_editor, monaco) => {
        ensureEylnTheme(monaco);
        monaco.editor.setTheme(EYLN_MONACO_THEME);
    };
    function resetRunState() {
        revealTimers.current.forEach(clearTimeout);
        revealTimers.current = [];
        setResults(null);
        setError(null);
        setCelebrate(false);
        setStatuses(challenge.tests.map(() => "running"));
    }
    function run() {
        setRunning(true);
        resetRunState();
        const worker = new Worker(new URL("../lib/runnerWorker.ts", import.meta.url), { type: "module" });
        workerRef.current = worker;
        const timer = setTimeout(() => {
            worker.terminate();
            workerRef.current = null;
            setRunning(false);
            setError("Timed out (possible infinite loop). Execution stopped after 4s.");
            setStatuses(challenge.tests.map(() => "fail"));
        }, RUN_TIMEOUT_MS);
        worker.onmessage = (e: MessageEvent) => {
            clearTimeout(timer);
            worker.terminate();
            workerRef.current = null;
            const data = e.data as {
                ok: boolean;
                error?: string;
                results?: CaseResult[];
            };
            if (!data.ok) {
                setRunning(false);
                setError(data.error ?? "Unknown error");
                setStatuses(challenge.tests.map(() => "fail"));
                return;
            }
            const res = data.results ?? [];
            setResults(res);
            res.forEach((r, i) => {
                const t = window.setTimeout(() => {
                    setStatuses((prev) => {
                        const next = [...prev];
                        next[r.index] = r.passed ? "pass" : "fail";
                        return next;
                    });
                    if (i === res.length - 1) {
                        setRunning(false);
                        const allPass = res.length > 0 && res.every((x) => x.passed);
                        if (allPass) {
                            const wasNew = !alreadySolved;
                            recordChallenge(challenge.id);
                            if (wasNew) {
                                setCelebrate(true);
                                window.setTimeout(() => setCelebrate(false), 2600);
                            }
                        }
                    }
                }, 220 * (i + 1));
                revealTimers.current.push(t);
            });
        };
        worker.postMessage({ code, fnName: challenge.fnName, tests: challenge.tests });
    }
    const passCount = results?.filter((r) => r.passed).length ?? 0;
    const total = challenge.tests.length;
    const allPass = results !== null && passCount === total && statuses.every((s) => s === "pass");
    const xp = xpForChallenge(challenge);
    return (<div className="relative flex-1 min-h-0 w-full">
      {celebrate && (<div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-[0.4rem] text-center bg-[radial-gradient(circle_at_50%_45%,rgba(255,138,0,0.16),rgba(11,11,14,0.86)_60%)] backdrop-blur-[4px] rounded-[16px] animate-[fade_0.3s_var(--ease)_both]" role="status">
          <TrophyIcon size={40} weight="duotone" className="text-accent animate-[pop-in_0.5s_var(--ease)_both] [filter:drop-shadow(0_0_18px_rgba(255,176,0,0.5))]"/>
          <div className="font-display text-[1.8rem] font-semibold text-text">Mission Complete</div>
          <div className="font-mono text-[1.3rem] font-bold text-accent animate-[pop-in_0.5s_var(--ease)_0.15s_both]">+{xp} XP</div>
          {missionIndex < missionTotal && <div className="font-mono text-[0.8rem] text-text-dim mt-[0.5rem]">Next mission unlocked →</div>}
        </div>)}

      <div className="h-full grid grid-cols-[1fr_1.2fr] gap-4 min-h-0 max-[900px]:grid-cols-1 max-[900px]:h-auto">
        <section className="border border-border rounded-[16px] overflow-hidden flex flex-col min-h-0 p-[1.6rem_1.7rem] overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%),var(--surface)]">
          <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-accent mb-[0.7rem]">Mission {missionIndex} / {missionTotal}</div>
          <h1 className="m-0 mb-[0.9rem] text-[1.7rem]">{challenge.title}</h1>
          <div className="flex items-center gap-[0.4rem] flex-wrap font-mono text-[0.74rem] text-text-dim mb-[1.6rem] [&_svg]:text-accent [&_svg]:align-[-0.15em]">
            <span className={"font-semibold " + (challenge.difficulty.toLowerCase() === "easy" ? "text-good" : challenge.difficulty.toLowerCase() === "medium" ? "text-warn" : "text-bad")}>{challenge.difficulty}</span>
            <span className="text-text-faint opacity-60 mx-[0.15rem]">·</span>
            {challenge.tags.join(" · ")}
            <span className="text-text-faint opacity-60 mx-[0.15rem]">·</span>
            <ClockIcon size={13} weight="duotone"/> {EST_MINUTES[challenge.difficulty]} min
            <span className="text-text-faint opacity-60 mx-[0.15rem]">·</span>
            <LightningIcon size={13} weight="duotone"/> {xp} XP
          </div>

          <div className="text-text-dim text-[0.95rem] leading-[1.7] mb-[1.6rem] [&_code]:bg-surface-inset [&_code]:border [&_code]:border-border [&_code]:py-[0.1em] [&_code]:px-[0.4em] [&_code]:rounded-[5px] [&_code]:text-highlight [&_code]:text-[0.86em]" dangerouslySetInnerHTML={{ __html: challenge.prompt }}/>

          <div className="flex flex-col gap-[0.7rem]">
            {challenge.tests.slice(0, 3).map((t, i) => (<div key={i} className="bg-surface-inset rounded-sm p-[0.8rem_1rem] font-mono text-[0.8rem]">
                <span className="block text-[0.64rem] uppercase tracking-[0.1em] text-text-faint mb-[0.5rem]">Example {i + 1}</span>
                <div className="flex gap-[0.6rem] py-[0.1rem] [&_code]:text-highlight"><span className="text-text-faint w-[52px] flex-none">Input</span><code>{t.args.map((a) => JSON.stringify(a)).join(", ")}</code></div>
                <div className="flex gap-[0.6rem] py-[0.1rem] [&_code]:text-highlight"><span className="text-text-faint w-[52px] flex-none">Output</span><code>{JSON.stringify(t.expected)}</code></div>
              </div>))}
          </div>

          {showHint && challenge.hint && (<div className="notice"><span className="lbl">Hint</span>{challenge.hint}</div>)}
          {showSolution && challenge.solution && (<div className="mt-[1.4rem]">
              <div className="fld-lbl">Reference solution</div>
              <pre className="bg-surface-inset border border-border rounded-sm p-[1rem_1.1rem] overflow-x-auto font-mono text-[0.8rem] leading-[1.6] text-text-dim"><code>{challenge.solution}</code></pre>
            </div>)}
        </section>

        <section className="border border-border rounded-[16px] overflow-hidden flex flex-col min-h-0 bg-surface-inset">
          <div className="flex items-center gap-[0.6rem] p-[0.6rem_0.9rem] border-b border-border flex-none">
            <span className={"w-[9px] h-[9px] rounded-full flex-none transition-[background] duration-200 ease-brand " + (running ? "bg-accent shadow-[0_0_8px_var(--accent)] animate-[pulse_1s_ease-in-out_infinite]" : "bg-text-faint")}/>
            <span className="font-mono text-[0.78rem] text-text">{challenge.fnName}.js</span>
            <span className="font-mono text-[0.72rem] text-text-faint ml-auto">
              {running ? "Executing…" : results ? (allPass ? "All checks passed" : `${passCount}/${total} passing`) : "Ready"}
            </span>
            <button className="w-[30px] h-[30px] flex-none grid place-items-center cursor-pointer rounded-[10px] bg-surface border border-border text-text-dim text-[0.85rem] transition-[color,border-color,background,box-shadow] duration-200 ease-brand hover:text-accent hover:border-border-glow hover:bg-surface-2 hover:shadow-[0_0_0_1px_rgba(255,176,0,0.16),0_6px_20px_rgba(255,138,0,0.18)]" title="Reset to starter code" onClick={() => setCode(challenge.starter)}>
              <ArrowClockwiseIcon size={15} weight="bold"/>
            </button>
          </div>

          <div className="flex-1 min-h-[220px] [&_.monaco-editor]:rounded-none [&_.monaco-editor_.overflow-guard]:rounded-none">
            <Editor height="100%" defaultLanguage="javascript" theme={EYLN_MONACO_THEME} value={code} onChange={(v) => setCode(v ?? "")} onMount={onMount} options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 14, bottom: 14 },
            lineNumbersMinChars: 3,
            renderLineHighlight: "line",
            smoothScrolling: true,
            tabSize: 2,
            automaticLayout: true,
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}/>
          </div>

          <div className="flex-none border-t border-border bg-surface flex flex-col max-h-[46%]">
            <div className="flex items-center justify-between p-[0.6rem_0.9rem] border-b border-border flex-none">
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-text-faint">Test Console</span>
              {results && !error && (<span className={"inline-flex items-center gap-[0.35rem] font-mono text-[0.72rem] font-semibold py-[0.15rem] px-[0.5rem] rounded-[6px] " + (allPass ? "text-good bg-[rgba(70,217,138,0.14)]" : "text-warn bg-[rgba(255,211,92,0.14)]")}>
                  {allPass ? <CheckCircleIcon size={13} weight="fill"/> : <XCircleIcon size={13} weight="fill"/>}
                  {passCount}/{total}
                </span>)}
            </div>

            <div className="p-[0.7rem_0.9rem] overflow-y-auto">
              {error && <div className="flex items-center gap-[0.5rem] font-mono text-[0.8rem] text-bad bg-[rgba(255,92,92,0.1)] border border-[rgba(255,92,92,0.28)] rounded-sm p-[0.7rem_0.9rem] mb-[0.6rem]"><XCircleIcon size={16} weight="fill"/> {error}</div>}
              <div className="flex flex-col gap-[0.4rem]">
                {challenge.tests.map((t, i) => {
            const st = statuses[i];
            const r = results?.find((x) => x.index === i);
            const caseCls = st === "waiting" ? "border-l-transparent opacity-60"
                : st === "running" ? "border-l-accent"
                : st === "pass" ? "border-l-good"
                : "border-l-bad bg-[rgba(255,92,92,0.06)]";
            const icCls = st === "running" ? "text-accent" : st === "pass" ? "text-good" : st === "fail" ? "text-bad" : "text-text-faint";
            return (<div key={i} className={"flex items-center gap-[0.6rem] font-mono text-[0.76rem] p-[0.5rem_0.7rem] rounded-sm bg-surface-inset border-l-2 text-text-dim transition-[border-color,background] duration-200 ease-brand animate-[rise_0.24s_var(--ease)_both] " + caseCls}>
                      <span className={"flex-none grid place-items-center " + icCls}>
                        {st === "pass" && <CheckCircleIcon size={16} weight="fill"/>}
                        {st === "fail" && <XCircleIcon size={16} weight="fill"/>}
                        {st === "running" && <CircleNotchIcon size={16} weight="bold" className="spin"/>}
                        {st === "waiting" && <CircleIcon size={16} weight="duotone"/>}
                      </span>
                      <code className="text-text">{challenge.fnName}({t.args.map((a) => JSON.stringify(a)).join(", ")})</code>
                      <span className={"ml-auto " + (st === "fail" ? "text-bad" : "text-text-faint")}>
                        {st === "fail" && r?.error ? `threw ${r.error}`
                    : st === "fail" && r ? `got ${r.got}`
                        : `→ ${JSON.stringify(t.expected)}`}
                      </span>
                    </div>);
        })}
              </div>
            </div>

            <div className="flex items-center gap-[0.5rem] p-[0.7rem_0.9rem] border-t border-border flex-none">
              {challenge.hint && (<Button variant="ghost" size="sm" onClick={() => setShowHint((h) => !h)}>
                  <LightbulbIcon size={14} weight="duotone"/> Hint
                </Button>)}
              {challenge.solution && (<Button variant="ghost" size="sm" onClick={() => setShowSolution((s) => !s)}>
                  {showSolution ? "Hide solution" : "Solution"}
                </Button>)}
              <div className="flex-1"/>
              <Button size="sm" onClick={() => setCode(challenge.starter)}>Reset</Button>
              <Button variant="primary" size="sm" className="shadow-[0_0_0_1px_rgba(255,176,0,0.2),0_6px_20px_rgba(255,138,0,0.3)]" onClick={run} disabled={running}>
                <PlayIcon size={13} weight="fill"/> {running ? "Running…" : "Run tests"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>);
}
