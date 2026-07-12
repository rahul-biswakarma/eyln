import { useEffect, useRef, useState } from "react";
import {
  Sparkle, X, PaperPlaneRight, Lightbulb, Compass, Path, ClipboardText, CircleNotch,
} from "@phosphor-icons/react";
import { isLLMEnabled, chat, generate, parseJSON, type ChatTurn } from "../lib/llm";
import { buildLearnerContext } from "../lib/learnerContext";
import { useTutor, type TutorTaskKind } from "../lib/tutor";
import { useUI } from "../lib/ui";

interface ExtractJSON {
  tasks: { kind: TutorTaskKind; text: string; topic?: string }[];
}

const QUICK = [
  { key: "explain", label: "Explain this", icon: Lightbulb,
    prompt: "Explain the core idea of this page simply, then a touch more precisely. Keep it short." },
  { key: "struggle", label: "Where am I struggling", icon: Compass,
    prompt: "Based on my progress and recent wrong answers, where am I struggling most? Be specific and encouraging." },
  { key: "next", label: "What should I learn next", icon: Path,
    prompt: "Given where I am, what should I focus on or learn next, and why? Recommend concrete next steps." },
] as const;

/** Docked AI tutor. Reads its page context + open state from the UI store, so
 *  the App shell can render it as a layout column beside the main content. */
export function TutorPanel() {
  const context = useUI((s) => s.tutorContext);
  const open = useUI((s) => s.tutorOpen);
  const openTutor = useUI((s) => s.openTutor);
  const closeTutor = useUI((s) => s.closeTutor);

  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const addTasks = useTutor((s) => s.addTasks);

  const sourceId = context?.sourceId;
  const title = context?.title ?? "";

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [history, loading]);

  // New conversation when the page changes.
  useEffect(() => {
    setHistory([]);
    setCaptured(0);
  }, [sourceId, title]);

  // No context (not on a tutor-enabled page) → render nothing.
  if (!context) return null;
  const ctx = context; // narrowed, stable within this render for closures below

  const enabled = isLLMEnabled();

  const system = [
    "You are an expert, encouraging AI tutor embedded in an engineering academy that teaches 3D graphics/engine programming, DSA, and the mathematics beneath them.",
    `The learner is on the ${ctx.scope}: "${ctx.title}".`,
    ctx.summary ? `Summary: ${ctx.summary}` : "",
    ctx.body ? `Page content (for grounding):\n${ctx.body.slice(0, 4000)}` : "",
    "Here is what we know about the learner's progress:",
    buildLearnerContext(),
    "Answer concretely and briefly, grounded in this page. Use a short code/math snippet only when it truly helps.",
  ].filter(Boolean).join("\n");

  /** After a reply, mine the exchange for durable tutor insights (best-effort). */
  async function captureInsights(turns: ChatTurn[]) {
    try {
      const transcript = turns.slice(-6).map((t) => `${t.role === "user" ? "Learner" : "Tutor"}: ${t.text}`).join("\n");
      const prompt = [
        "From this tutoring exchange, extract durable insights about the learner as a JSON object.",
        'Shape: {"tasks":[{"kind":"struggle"|"review"|"next"|"content-gap","text":string,"topic"?:string}]}',
        "- struggle: a concept the learner finds hard.",
        "- review: something worth revisiting.",
        "- next: a recommended next topic/step.",
        "- content-gap: a topic the course should explain better or add.",
        "Only include clear, specific, useful items (0-4 total). Empty array if none. No prose, JSON only.",
        `Context page: ${ctx.title}`,
        `Exchange:\n${transcript}`,
      ].join("\n");
      const raw = await generate(prompt, { temperature: 0.2 });
      const parsed = parseJSON<ExtractJSON>(raw);
      if (parsed?.tasks?.length) {
        addTasks(parsed.tasks.map((t) => ({ ...t, source: ctx.title })));
        setCaptured((c) => c + parsed.tasks.length);
      }
    } catch {
      /* insight capture is best-effort; never block the chat */
    }
  }

  async function ask(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: ChatTurn[] = [...history, { role: "user", text: q }];
    setHistory(next);
    setInput("");
    setLoading(true);
    try {
      const reply = await chat(next, { system, temperature: 0.4 });
      const withReply: ChatTurn[] = [...next, { role: "model", text: reply }];
      setHistory(withReply);
      void captureInsights(withReply);
    } catch (e) {
      setHistory([...next, { role: "model", text: e instanceof Error ? e.message : String(e) }]);
    } finally {
      setLoading(false);
    }
  }

  // Collapsed: a slim vertical rail docked to the right that reopens the panel.
  if (!open) {
    return (
      <button className="tutor-rail" onClick={openTutor} aria-label="Open AI tutor">
        <Sparkle size={18} weight="fill" />
        <span className="tutor-rail-label">AI Tutor</span>
      </button>
    );
  }

  return (
    <aside className="tutor-panel" aria-label="AI tutor">
      <header className="tp-head">
        <div className="tp-head-t">
          <Sparkle size={16} weight="fill" /> AI Tutor
        </div>
        <button className="icon-btn" onClick={closeTutor} aria-label="Collapse tutor">
          <X size={16} weight="bold" />
        </button>
      </header>

        <div className="tp-context">
          <span className="tp-context-scope">{context.scope}</span>
          <span className="tp-context-title">{context.title}</span>
        </div>

        {!enabled ? (
          <div className="tp-disabled">
            Configure Firebase to chat with the tutor and get answers grounded in this page and your progress.
          </div>
        ) : (
          <>
            <div className="tp-log" ref={logRef}>
              {history.length === 0 && (
                <div className="tp-intro">
                  <p>I can explain this page, spot where you’re struggling, and suggest what to learn next. What I notice gets saved to your tutor tasks.</p>
                </div>
              )}
              {history.map((t, i) => (
                <div key={i} className={"tp-msg " + t.role}>
                  <span className="tp-who">{t.role === "user" ? "You" : "Tutor"}</span>
                  <div className="tp-body">{t.text}</div>
                </div>
              ))}
              {loading && <div className="tp-typing"><CircleNotch size={15} weight="bold" className="spin" /> Thinking…</div>}
              {captured > 0 && (
                <div className="tp-captured">
                  <ClipboardText size={14} weight="duotone" /> Saved {captured} insight{captured === 1 ? "" : "s"} to your tutor tasks.
                </div>
              )}
            </div>

            <div className="tp-quick">
              {QUICK.map((a) => (
                <button key={a.key} className="tp-quick-btn" onClick={() => ask(a.prompt)} disabled={loading}>
                  <a.icon size={15} weight="duotone" /> {a.label}
                </button>
              ))}
            </div>

            <div className="tp-compose">
              <input
                type="text"
                value={input}
                placeholder={`Ask about ${ctx.title}…`}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") ask(input); }}
              />
              <button className="icon-btn send" onClick={() => ask(input)} disabled={loading || !input.trim()} aria-label="Send">
                <PaperPlaneRight size={17} weight="fill" />
              </button>
            </div>
          </>
        )}
    </aside>
  );
}
