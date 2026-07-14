import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProgress } from "../lib/progress";
import { lessonPath } from "../content/registry";
import { computeCoachSignals, ruleBasedRecommendation, coachPrompt } from "../lib/coach";
import { isLLMEnabled, generate } from "../lib/llm";
import { Card, Badge, buttonClass } from "./ui";
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
        if (!isLLMEnabled())
            return;
        setLoading(true);
        generate(coachPrompt(sig), { temperature: 0.5 })
            .then((t) => {
            if (!cancelled)
                setAiText(t.trim());
        })
            .catch(() => {
            if (!cancelled)
                setAiText(null);
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [sig.streak, sig.weakModules.length, sig.staleLessons.length, sig.next?.lesson.id]);
    const recommendation = aiText ?? ruleBasedRecommendation(sig);
    return (<Card>
      <div className="flex items-center gap-2 mb-[0.8rem]">
        <span className="text-[1.1rem]">✦</span>
        <strong>Study coach</strong>
        {isLLMEnabled() && <Badge className="ml-auto">AI</Badge>}
      </div>

      <div className="flex gap-[1.2rem] mb-[0.9rem]">
        <Metric label="Streak" value={`${sig.streak}d`}/>
        <Metric label="Weak areas" value={String(sig.weakModules.length)}/>
        <Metric label="To revisit" value={String(sig.staleLessons.length)}/>
      </div>

      <p className="text-text-dim text-[0.9rem] m-0 mb-[0.6rem]">
        {loading ? "Thinking about your next move…" : recommendation}
      </p>

      {sig.next && (<Link className={buttonClass("primary")} to={lessonPath(sig.next.module.id, sig.next.lesson.id)}>
          Go to {sig.next.lesson.title} →
        </Link>)}

      {!isLLMEnabled() && (<div className="text-text-faint text-[0.86rem] pt-4 px-[0.3rem]">
          Configure Firebase to unlock personalized AI coaching.
        </div>)}
    </Card>);
}
function Metric({ label, value }: {
    label: string;
    value: string;
}) {
    return (<div>
      <div className="text-[1.3rem] font-display text-text">{value}</div>
      <div className="text-[0.7rem] font-mono text-text-faint uppercase tracking-[0.1em]">
        {label}
      </div>
    </div>);
}
