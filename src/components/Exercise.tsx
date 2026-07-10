import { useState } from "react";
import type { Exercise as ExerciseType, ExerciseResult } from "../content/types";

export function Exercise({ ex }: { ex: ExerciseType }) {
  const [value, setValue] = useState(ex.starter);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const multiline = ex.kind === "wgsl" || ex.kind === "ts";

  return (
    <div className="exercise">
      <h4>⚒️ Exercise</h4>
      <p style={{ marginTop: 0 }}>{ex.prompt}</p>
      {multiline ? (
        <textarea rows={8} value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
      ) : (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
      )}
      <div className="row">
        <button className="btn primary" onClick={() => setResult(ex.validate(value))}>
          Check
        </button>
        {ex.hint && (
          <button className="btn" onClick={() => setShowHint((h) => !h)}>
            {showHint ? "Hide hint" : "Hint"}
          </button>
        )}
      </div>
      {showHint && ex.hint && (
        <div className="notice">
          <span className="lbl">Hint</span>
          {ex.hint}
        </div>
      )}
      {result && (
        <div className={"result " + (result.pass ? "pass" : "fail")}>
          {result.pass ? "✓ " : "✗ "}
          {result.message}
        </div>
      )}
    </div>
  );
}
