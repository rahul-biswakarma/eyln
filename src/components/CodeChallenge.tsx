import { useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { CheckCircle, XCircle, Play, Lightbulb, ArrowClockwise } from "@phosphor-icons/react";
import type { CodeChallenge as Challenge } from "../content/types";
import { useProgress } from "../lib/progress";
import { ensureForgeTheme, FORGE_MONACO_THEME } from "../lib/monacoSetup";

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
  const [tab, setTab] = useState<"tests" | "output">("tests");
  const workerRef = useRef<Worker | null>(null);
  const recordChallenge = useProgress((s) => s.recordChallenge);

  const onMount: OnMount = (_editor, monaco) => {
    ensureForgeTheme(monaco);
    monaco.editor.setTheme(FORGE_MONACO_THEME);
  };

  function run() {
    setRunning(true);
    setResults(null);
    setError(null);
    setTab("output");

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
    <div className="ch-split">
      <div className="ch-pane ch-problem">
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

        <div className="ch-examples">
          <div className="fld-lbl">Examples</div>
          {challenge.tests.slice(0, 3).map((t, i) => (
            <div key={i} className="ch-example">
              <div><span className="ex-k">Input</span> <code>{t.args.map((a) => JSON.stringify(a)).join(", ")}</code></div>
              <div><span className="ex-k">Output</span> <code>{JSON.stringify(t.expected)}</code></div>
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
      </div>

      <div className="ch-pane ch-workspace">
        <div className="ch-editor-bar">
          <span className="ch-lang">JavaScript</span>
          <div className="ch-editor-tools">
            <button className="icon-btn sm" title="Reset code" onClick={() => setCode(challenge.starter)}>
              <ArrowClockwise size={15} weight="bold" />
            </button>
          </div>
        </div>

        <div className="ch-editor-wrap">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme={FORGE_MONACO_THEME}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            onMount={onMount}
            options={{
              fontSize: 13,
              fontFamily: "var(--mono)",
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

        <div className="ch-console">
          <div className="ch-console-tabs">
            <button className={"ch-ctab" + (tab === "tests" ? " active" : "")} onClick={() => setTab("tests")}>
              Test cases
            </button>
            <button className={"ch-ctab" + (tab === "output" ? " active" : "")} onClick={() => setTab("output")}>
              Result
              {results && <span className={"ch-score " + (allPass ? "pass" : "fail")}>{passCount}/{total}</span>}
            </button>
            <div className="ch-console-actions">
              {challenge.hint && (
                <button className="btn sm" onClick={() => setShowHint((h) => !h)}>
                  <Lightbulb size={14} weight="duotone" /> Hint
                </button>
              )}
              {challenge.solution && (
                <button className="btn sm" onClick={() => setShowSolution((s) => !s)}>
                  {showSolution ? "Hide" : "Solution"}
                </button>
              )}
              <button className="btn primary sm" onClick={run} disabled={running}>
                <Play size={13} weight="fill" /> {running ? "Running…" : "Run"}
              </button>
            </div>
          </div>

          <div className="ch-console-body">
            {tab === "tests" && (
              <div className="ch-cases">
                {challenge.tests.map((t, i) => (
                  <div key={i} className="ch-case idle">
                    <code className="ch-args">{challenge.fnName}({t.args.map((a) => JSON.stringify(a)).join(", ")})</code>
                    <span className="ch-got">expected {JSON.stringify(t.expected)}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "output" && (
              <>
                {!results && !error && <div className="empty-note" style={{ padding: "0.5rem 0" }}>Run your code to see results.</div>}
                {error && <div className="ch-error"><XCircle size={16} weight="fill" /> {error}</div>}
                {results && (
                  <div className="ch-cases">
                    {allPass && (
                      <div className="ch-solved"><CheckCircle size={18} weight="fill" /> Accepted — all {total} tests passed!</div>
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
                            <span className="ch-got">→ {r.got} {!r.passed && <em>(expected {JSON.stringify(t.expected)})</em>}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
