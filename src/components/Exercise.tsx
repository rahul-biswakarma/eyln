import { useState } from "react";
import type { Exercise as ExerciseType, ExerciseResult } from "../content/types";
import { isLLMEnabled, generate, parseJSON } from "../lib/llm";
import { useNotes } from "../lib/notes";

interface GradeJSON {
  pass: boolean;
  score: number; 
  feedback: string;
}

export function Exercise({ ex }: { ex: ExerciseType }) {
  const [value, setValue] = useState(ex.starter);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [grading, setGrading] = useState(false);
  const recordOpenScore = useNotes((s) => s.recordOpenScore);

  const isOpen = ex.kind === "open" || ex.kind === "code-open";
  const multiline = ex.kind === "wgsl" || ex.kind === "ts" || ex.kind === "code-open";

  async function check() {
    
    if (isOpen) {
      if (!isLLMEnabled()) {
        setResult({
          pass: false,
          message: "AI grading is off.",
          feedback:
            "Configure Firebase to have your answer graded with feedback. For now, compare your answer against the hint and the lesson above.",
        });
        return;
      }
      setGrading(true);
      setResult(null);
      try {
        const prompt = [
          "You are grading a learner's answer for a course on building a 3D game engine in Odin + Metal.",
          "Grade fairly but rigorously. Reply ONLY with JSON: {\"pass\": boolean, \"score\": number 0..1, \"feedback\": string}.",
          "Keep feedback to 2-4 sentences: what was right, what to fix.",
          "",
          `QUESTION: ${ex.prompt}`,
          ex.rubric ? `RUBRIC: ${ex.rubric}` : "",
          `LEARNER ANSWER:\n${value}`,
        ].join("\n");
        const raw = await generate(prompt, { temperature: 0.2 });
        const parsed = parseJSON<GradeJSON>(raw);
        if (parsed) {
          recordOpenScore(ex.id, Math.max(0, Math.min(1, parsed.score)));
          setResult({ pass: parsed.pass, message: parsed.pass ? "Passed" : "Not yet", feedback: parsed.feedback });
        } else {
          setResult({ pass: false, message: "Couldn't parse the grade — here's the raw feedback:", feedback: raw });
        }
      } catch (e) {
        setResult({ pass: false, message: "Grading failed.", feedback: e instanceof Error ? e.message : String(e) });
      } finally {
        setGrading(false);
      }
      return;
    }
    // Deterministic kinds.
    if (ex.validate) setResult(ex.validate(value));
  }

  return (
    <div className="exercise">
      <h4>⚒️ Exercise{isOpen && <span className="badge" style={{ marginLeft: 8 }}>AI-graded</span>}</h4>
      <p style={{ marginTop: 0 }}>{ex.prompt}</p>
      {multiline ? (
        <textarea rows={8} value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
      ) : (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
      )}
      <div className="row">
        <button className="btn primary" onClick={check} disabled={grading}>
          {grading ? "Grading…" : "Check"}
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
          {result.feedback && (
            <div style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap", color: "var(--text-dim)" }}>
              {result.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
