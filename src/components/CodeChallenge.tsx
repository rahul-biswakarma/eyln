import { useRef, useState } from "react";
import { CheckCircle, XCircle, Play, Lightbulb } from "@phosphor-icons/react";
import type { CodeChallenge as Challenge } from "../content/types";
import { useProgress } from "../lib/progress";

interface CaseResult {
  index: number;
  passed: boolean;
  got?: string;
  error?: string;
}

const RUN_TIMEOUT_MS = 4000;

export function CodeChallenge({ challenge }: { challenge: Challenge }) {
  const [code, setCode] = useState(challenge.starter);
  const [results, setResults] = useState<CaseResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const recordChallenge = useProgress((s) => s.recordChallenge);

  function run() {
    setRunning(true);
    setResults(null);
    setError(null);

    const worker = new Worker(new URL("../lib/runnerWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    const timer = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      setRunning(false);
      setError("Timed out (possible infinite loop). Execution stopped after 4s.");
    }, RUN_TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(timer);
      worker.terminate();
      workerRef.current = null;
      setRunning(false);
      const data = e.data as { ok: boolean; error?: string; results?: CaseResult[] };
      if (!data.ok) {
        setError(data.error ?? "Unknown error");
        return;
      }
      const res = data.results ?? [];
      setResults(res);
      if (res.length > 0 && res.every((r) => r.passed)) {
        recordChallenge(challenge.id);
      }
    };

    worker.postMessage({ code, fnName: challenge.fnName, tests: challenge.tests });
  }

  const passCount = results?.filter((r) => r.passed).length ?? 0;
  const total = challenge.tests.length;
  const allPass = results !== null && passCount === total;

  return (
    <div className="challenge">
      <div className="ch-head">
        <div className="ch-title">
          <h3>{challenge.title}</h3>
          <span className={"ch-diff " + challenge.difficulty.toLowerCase()}>{challenge.difficulty}</span>
        </div>
        <div className="ch-tags">
          {challenge.source && <span className="ch-source">{challenge.source}</span>}
          {challenge.tags.map((t) => (
            <span key={t} className="ch-tag">{t}</span>
          ))}
        </div>
      </div>

      <div className="ch-prompt" dangerouslySetInnerHTML={{ __html: challenge.prompt }} />

      <textarea
        className="code-input ch-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={Math.min(20, code.split("\n").length + 2)}
      />

      <div className="ch-actions">
        <button className="btn primary" onClick={run} disabled={running}>
          <Play size={15} weight="fill" /> {running ? "Running…" : "Run tests"}
        </button>
        {challenge.hint && (
          <button className="btn" onClick={() => setShowHint((h) => !h)}>
            <Lightbulb size={15} weight="duotone" /> {showHint ? "Hide hint" : "Hint"}
          </button>
        )}
        {challenge.solution && (
          <button className="btn" onClick={() => setShowSolution((s) => !s)}>
            {showSolution ? "Hide solution" : "Solution"}
          </button>
        )}
        {results && (
          <span className={"ch-score " + (allPass ? "pass" : "fail")}>
            {passCount}/{total} passed
          </span>
        )}
      </div>

      {showHint && challenge.hint && (
        <div className="notice"><span className="lbl">Hint</span>{challenge.hint}</div>
      )}

      {error && (
        <div className="ch-error"><XCircle size={16} weight="fill" /> {error}</div>
      )}

      {results && (
        <div className="ch-cases">
          {allPass && (
            <div className="ch-solved"><CheckCircle size={18} weight="fill" /> Solved — all tests pass!</div>
          )}
          {results.map((r) => {
            const t = challenge.tests[r.index];
            return (
              <div key={r.index} className={"ch-case " + (r.passed ? "pass" : "fail")}>
                {r.passed ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                <code className="ch-args">{challenge.fnName}({t.args.map((a) => JSON.stringify(a)).join(", ")})</code>
                {r.error ? (
                  <span className="ch-got">threw: {r.error}</span>
                ) : (
                  <span className="ch-got">
                    → {r.got} {!r.passed && <em>(expected {JSON.stringify(t.expected)})</em>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showSolution && challenge.solution && (
        <div className="ch-solution">
          <div className="fld-lbl">Reference solution</div>
          <pre><code>{challenge.solution}</code></pre>
        </div>
      )}
    </div>
  );
}
