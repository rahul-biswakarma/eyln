import { useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  CheckCircle, XCircle, CircleNotch, Circle, Play, Lightbulb,
  ArrowClockwise, Trophy, Clock, Lightning,
} from "@phosphor-icons/react";
import type { CodeChallenge as Challenge } from "../content/types";
import { EST_MINUTES, xpForChallenge } from "../content/challenges";
import { useProgress } from "../lib/progress";
import { ensureEylnTheme, EYLN_MONACO_THEME } from "../lib/monacoSetup";

interface CaseResult {
  index: number;
  passed: boolean;
  got?: string;
  error?: string;
}

type CaseStatus = "waiting" | "running" | "pass" | "fail";

const RUN_TIMEOUT_MS = 4000;

export function CodeChallenge({
  challenge,
  missionIndex,
  missionTotal,
}: {
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
      const data = e.data as { ok: boolean; error?: string; results?: CaseResult[] };
      if (!data.ok) {
        setRunning(false);
        setError(data.error ?? "Unknown error");
        setStatuses(challenge.tests.map(() => "fail"));
        return;
      }
      const res = data.results ?? [];
      setResults(res);

      // Reveal each test result sequentially for a "running" feel.
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

  return (
    <div className={"mission" + (celebrate ? " celebrate" : "")}>
      {celebrate && (
        <div className="mission-complete" role="status">
          <Trophy size={40} weight="duotone" />
          <div className="mc-title">Mission Complete</div>
          <div className="mc-xp">+{xp} XP</div>
          {missionIndex < missionTotal && <div className="mc-next">Next mission unlocked →</div>}
        </div>
      )}

      <div className="mission-body">
        <section className="mission-brief">
          <div className="mb-kicker">Mission {missionIndex} / {missionTotal}</div>
          <h1 className="mb-title">{challenge.title}</h1>
          <div className="mb-meta">
            <span className={"mb-diff " + challenge.difficulty.toLowerCase()}>{challenge.difficulty}</span>
            <span className="dot">·</span>
            {challenge.tags.join(" · ")}
            <span className="dot">·</span>
            <Clock size={13} weight="duotone" /> {EST_MINUTES[challenge.difficulty]} min
            <span className="dot">·</span>
            <Lightning size={13} weight="duotone" /> {xp} XP
          </div>

          <div className="mb-prompt" dangerouslySetInnerHTML={{ __html: challenge.prompt }} />

          <div className="mb-examples">
            {challenge.tests.slice(0, 3).map((t, i) => (
              <div key={i} className="mb-example">
                <span className="ex-n">Example {i + 1}</span>
                <div className="ex-line"><span className="ex-k">Input</span><code>{t.args.map((a) => JSON.stringify(a)).join(", ")}</code></div>
                <div className="ex-line"><span className="ex-k">Output</span><code>{JSON.stringify(t.expected)}</code></div>
              </div>
            ))}
          </div>

          {showHint && challenge.hint && (
            <div className="notice"><span className="lbl">Hint</span>{challenge.hint}</div>
          )}
          {showSolution && challenge.solution && (
            <div className="ch-solution">
              <div className="fld-lbl">Reference solution</div>
              <pre><code>{challenge.solution}</code></pre>
            </div>
          )}
        </section>

        <section className="mission-workspace">
          <div className="ws-editorbar">
            <span className={"ws-dot" + (running ? " run" : "")} />
            <span className="ws-file">{challenge.fnName}.js</span>
            <span className="ws-status">
              {running ? "Executing…" : results ? (allPass ? "All checks passed" : `${passCount}/${total} passing`) : "Ready"}
            </span>
            <button className="icon-btn sm" title="Reset to starter code" onClick={() => setCode(challenge.starter)}>
              <ArrowClockwise size={15} weight="bold" />
            </button>
          </div>

          <div className="ws-editor">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme={EYLN_MONACO_THEME}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              onMount={onMount}
              options={{
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
              }}
            />
          </div>

          <div className="ws-console">
            <div className="ws-console-head">
              <span className="wc-label">Test Console</span>
              {results && !error && (
                <span className={"wc-badge " + (allPass ? "pass" : "fail")}>
                  {allPass ? <CheckCircle size={13} weight="fill" /> : <XCircle size={13} weight="fill" />}
                  {passCount}/{total}
                </span>
              )}
            </div>

            <div className="ws-console-body">
              {error && <div className="ch-error"><XCircle size={16} weight="fill" /> {error}</div>}
              <div className="ws-cases">
                {challenge.tests.map((t, i) => {
                  const st = statuses[i];
                  const r = results?.find((x) => x.index === i);
                  return (
                    <div key={i} className={"ws-case " + st}>
                      <span className="wc-ic">
                        {st === "pass" && <CheckCircle size={16} weight="fill" />}
                        {st === "fail" && <XCircle size={16} weight="fill" />}
                        {st === "running" && <CircleNotch size={16} weight="bold" className="spin" />}
                        {st === "waiting" && <Circle size={16} weight="duotone" />}
                      </span>
                      <code className="wc-call">{challenge.fnName}({t.args.map((a) => JSON.stringify(a)).join(", ")})</code>
                      <span className="wc-out">
                        {st === "fail" && r?.error ? `threw ${r.error}`
                          : st === "fail" && r ? `got ${r.got}`
                          : `→ ${JSON.stringify(t.expected)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ws-actionbar">
              {challenge.hint && (
                <button className="btn ghost sm" onClick={() => setShowHint((h) => !h)}>
                  <Lightbulb size={14} weight="duotone" /> Hint
                </button>
              )}
              {challenge.solution && (
                <button className="btn ghost sm" onClick={() => setShowSolution((s) => !s)}>
                  {showSolution ? "Hide solution" : "Solution"}
                </button>
              )}
              <div className="ab-spacer" />
              <button className="btn sm" onClick={() => setCode(challenge.starter)}>Reset</button>
              <button className="btn primary sm run-btn" onClick={run} disabled={running}>
                <Play size={13} weight="fill" /> {running ? "Running…" : "Run tests"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
