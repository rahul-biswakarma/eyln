import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { lessonPath } from "../content/registry";
import { computeCoachSignals, ruleBasedRecommendation, coachPrompt } from "../lib/coach";
import { isLLMEnabled, generate } from "../lib/llm";

export function CoachCard() {
  const done = useProgress((s) => s.done);
  const quizScores = useProgress((s) => s.quizScores);
  const lastVisited = useProgress((s) => s.lastVisited);

  const now = Date.now();
  const sig = computeCoachSignals(done, quizScores, lastVisited, now);

  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isLLMEnabled()) return;
    setLoading(true);
    generate(coachPrompt(sig), { temperature: 0.5 })
      .then((t) => {
        if (!cancelled) setAiText(t.trim());
      })
      .catch(() => {
        if (!cancelled) setAiText(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    
  }, [sig.streak, sig.weakModules.length, sig.staleLessons.length, sig.next?.lesson.id]);

  const recommendation = aiText ?? ruleBasedRecommendation(sig);

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.8rem" }}>
        <span style={{ fontSize: "1.1rem" }}>✦</span>
        <strong>Study coach</strong>
        {isLLMEnabled() && <span className="badge" style={{ marginLeft: "auto" }}>AI</span>}
      </div>

      <div style={{ display: "flex", gap: "1.2rem", marginBottom: "0.9rem" }}>
        <Metric label="Streak" value={`${sig.streak}d`} />
        <Metric label="Weak areas" value={String(sig.weakModules.length)} />
        <Metric label="To revisit" value={String(sig.staleLessons.length)} />
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", margin: "0 0 0.6rem" }}>
        {loading ? "Thinking about your next move…" : recommendation}
      </p>

      {sig.next && (
        <Link className="btn primary" to={lessonPath(sig.next.module.id, sig.next.lesson.id)}>
          Go to {sig.next.lesson.title} →
        </Link>
      )}

      {!isLLMEnabled() && (
        <div className="empty-note" style={{ paddingBottom: 0 }}>
          Configure Firebase to unlock personalized AI coaching.
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "1.3rem", fontFamily: "var(--display)", color: "var(--text)" }}>{value}</div>
      <div style={{ fontSize: "0.7rem", fontFamily: "var(--mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
    </div>
  );
}
