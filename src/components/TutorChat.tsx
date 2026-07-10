import { useState } from "react";
import { isLLMEnabled, chat, type ChatTurn } from "../lib/llm";

/**
 * Collapsible "ask about this lesson" chat, grounded in the lesson's title/summary.
 * Hidden behind a hint when no API key is set.
 */
export function TutorChat({ lessonTitle, lessonSummary }: { lessonTitle: string; lessonSummary: string }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const system = [
    "You are a friendly, precise tutor embedded in a course on building a 3D game engine in Odin + Metal (with WebGPU browser demos).",
    `The learner is on the lesson "${lessonTitle}": ${lessonSummary}`,
    "Answer their questions clearly and concretely, grounded in this lesson's topic. Prefer short answers with a small code snippet when useful. If they ask something off-topic for the course, gently redirect.",
  ].join("\n");

  if (!isLLMEnabled()) {
    return (
      <div className="notice" style={{ marginTop: "2.4rem" }}>
        <span className="lbl">Lesson tutor</span>
        Set <code>VITE_GEMINI_API_KEY</code> to ask questions about this lesson and get grounded answers.
      </div>
    );
  }

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    const next: ChatTurn[] = [...history, { role: "user", text: q }];
    setHistory(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await chat(next, { system, temperature: 0.4 });
      setHistory([...next, { role: "model", text: reply }]);
    } catch (e) {
      setHistory([...next, { role: "model", text: e instanceof Error ? e.message : String(e) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor">
      <button className="btn" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide tutor" : "✦ Ask about this lesson"}
      </button>
      {open && (
        <div className="tutor-panel card" style={{ marginTop: "0.8rem" }}>
          <div className="tutor-log">
            {history.length === 0 && (
              <div className="empty-note">Ask anything about "{lessonTitle}".</div>
            )}
            {history.map((t, i) => (
              <div key={i} className={"tutor-msg " + t.role}>
                <span className="who">{t.role === "user" ? "You" : "Tutor"}</span>
                <span className="body" style={{ whiteSpace: "pre-wrap" }}>{t.text}</span>
              </div>
            ))}
            {loading && <div className="empty-note">Tutor is typing…</div>}
          </div>
          <div className="row" style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem" }}>
            <input
              type="text"
              value={input}
              placeholder="e.g. Why is the perspective matrix non-linear?"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              style={{ flex: 1, background: "var(--surface-inset)", color: "var(--text)", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-sm)", padding: "0.6rem 0.85rem", fontFamily: "var(--sans)", fontSize: "0.9rem" }}
            />
            <button className="btn primary" onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
