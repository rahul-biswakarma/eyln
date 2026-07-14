import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SparkleIcon, WarningOctagonIcon, GraphIcon } from "@phosphor-icons/react";
import { useNotes } from "../../lib/notes";
import { useBooks } from "../../lib/books";
import { useConcepts } from "../../lib/concepts";
import { useProgress } from "../../lib/progress";
import { buildKnowledgeGraph, type GraphNode } from "../../lib/graph";
import { KnowledgeGraphView } from "../../components/knowledge-graph";
import { allLessons, lessonPath, getModule } from "../../content/registry";
import { relativeTime } from "../../lib/stats";
import { analyzeKnowledgeGraph } from "../../lib/insights";
import { useTutor } from "../../lib/tutor";
const LEGEND = [
    { cls: "module", label: "Module" },
    { cls: "lesson", label: "Lesson" },
    { cls: "concept", label: "Concept" },
    { cls: "note", label: "Note" },
    { cls: "book", label: "Book" },
];
const INSP = "w-[260px] flex-shrink-0 overflow-y-auto rounded-sm border border-border bg-surface p-4";
const INSP_KIND = "font-mono text-[0.64rem] uppercase tracking-[0.06em] text-text-faint";
const INSP_H4 = "mx-0 mb-[0.6rem] mt-[0.3rem] text-[0.95rem] text-text";
const INSP_LINK = "text-[0.8rem] text-accent no-underline hover:underline";
const INSP_WHEN = "mt-[0.8rem] block text-[0.72rem] text-text-faint";
const INSP_CLOSE = "mb-4 inline-flex items-center gap-[0.35rem] border-none bg-transparent text-[0.78rem] text-text-dim transition-colors duration-200 ease-brand hover:text-accent cursor-pointer";
export function GraphView({ now }: {
    now: number;
}) {
    const notes = useNotes((s) => s.notes);
    const books = useBooks((s) => s.books);
    const concepts = useConcepts((s) => s.concepts);
    const done = useProgress((s) => s.done);
    const quizScores = useProgress((s) => s.quizScores);
    const exercisesDone = useProgress((s) => s.exercisesDone);
    const solvedChallenges = useProgress((s) => s.solvedChallenges);
    const addTasks = useTutor((s) => s.addTasks);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisMsg, setAnalysisMsg] = useState<string | null>(null);
    const graph = useMemo(() => buildKnowledgeGraph({ notes, books, concepts, done, quizScores, exercisesDone, solvedChallenges }), [notes, books, concepts, done, quizScores, exercisesDone, solvedChallenges]);
    const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
    const selected = selectedId ? nodeById.get(selectedId) ?? null : null;
    const weakCount = graph.nodes.filter((n) => n.weak).length;
    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysisMsg(null);
        try {
            const tasks = await analyzeKnowledgeGraph({ notes, books, concepts, done, quizScores });
            if (tasks.length) {
                addTasks(tasks);
                setAnalysisMsg(`Added ${tasks.length} insight${tasks.length === 1 ? "" : "s"} to your tutor tasks.`);
            }
            else {
                setAnalysisMsg("No new insights — your graph looks well covered.");
            }
        }
        catch {
            setAnalysisMsg("Couldn't analyze right now. Try again in a moment.");
        }
        finally {
            setAnalyzing(false);
        }
    };
    return (<div className="flex h-full flex-col p-[1.6rem_1.8rem]">
      <div className="flex items-start justify-between gap-4">
        <div className="mb-[1.4rem]">
          <h3 className="m-0 mb-[0.3rem] font-display text-[1.25rem] font-semibold text-text">Knowledge Graph</h3>
          <span className="text-[0.84rem] text-text-dim">
            The topics you've <strong>completed</strong> (lessons finished, questionary passed) plus your notes and books — connected.
            Node color shows mastery (green = strong, red = weak);
            {weakCount > 0 ? ` ${weakCount} weak spot${weakCount === 1 ? "" : "s"} highlighted.` : " nothing weak right now."}
          </span>
        </div>
        <button className="inline-flex items-center gap-[0.35rem] rounded-sm border-none bg-accent px-3 py-[0.45rem] text-[0.82rem] font-semibold text-on-accent transition duration-200 ease-brand hover:bg-highlight disabled:opacity-50" onClick={handleAnalyze} disabled={analyzing}>
          <SparkleIcon size={13} weight="fill"/> {analyzing ? "Analyzing…" : "Analyze my graph"}
        </button>
      </div>

      {analysisMsg && <div className="mt-[0.6rem] rounded-sm border border-accent bg-accent-soft px-[0.8rem] py-[0.5rem] text-[0.78rem] text-accent">{analysisMsg}</div>}

      <div className="my-[0.9rem] flex flex-wrap gap-4 text-[0.72rem] text-text-dim">
        {LEGEND.map((l) => (<span key={l.cls} className="inline-flex items-center gap-[0.35rem]">
            <span className={`kg-legend-dot inline-block h-[10px] w-[10px] rounded-full kg-node-${l.cls}`}/> {l.label}
          </span>))}
        <span className="inline-flex items-center gap-[0.35rem]"><WarningOctagonIcon size={12}/> ring = weak</span>
      </div>

      {graph.nodes.length === 0 ? (<div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-text-faint">
          <GraphIcon size={24} weight="duotone"/>
          <h4 className="m-0 font-display text-[0.95rem] text-text-dim">Your graph is empty</h4>
          <p className="max-w-[340px] text-[0.84rem]">Complete a lesson and pass its questionary — finished topics show up here, connected to your notes and books.</p>
        </div>) : (<div className="flex min-h-0 flex-1 gap-4">
        <div className="min-h-[420px] flex-1 overflow-hidden rounded-sm border border-border bg-surface-inset">
          <KnowledgeGraphView graph={graph} selectedId={selectedId} onSelect={setSelectedId}/>
        </div>
        {selected && <NodeInspector node={selected} now={now} onClose={() => setSelectedId(null)}/>}
      </div>)}
    </div>);
}
function NodeInspector({ node, now, onClose }: {
    node: GraphNode;
    now: number;
    onClose: () => void;
}) {
    const notes = useNotes((s) => s.notes);
    if (node.type === "note") {
        const n = notes.find((x) => x.id === node.ref?.noteId);
        return (<aside className={INSP}>
        <button className={INSP_CLOSE} onClick={onClose}>Close</button>
        <span className={INSP_KIND}>Note</span>
        <p className="text-[0.82rem] leading-[1.5] text-text">{n?.body.slice(0, 400)}</p>
        {n && <span className={INSP_WHEN}>{relativeTime(n.createdAt, now)}</span>}
      </aside>);
    }
    if (node.type === "module") {
        const m = node.ref?.moduleId ? getModule(node.ref.moduleId) : undefined;
        const lessons = m ? allLessons.filter((r) => r.module.id === m.id) : [];
        const relatedNotes = notes.filter((x) => x.moduleId === node.ref?.moduleId);
        return (<aside className={INSP}>
        <button className={INSP_CLOSE} onClick={onClose}>Close</button>
        <span className={INSP_KIND}>Module</span>
        <h4 className={INSP_H4}>{node.label}</h4>
        {typeof node.mastery === "number" && (<div className={`mb-[0.8rem] text-[0.76rem] ${node.weak ? "text-bad" : "text-good"}`}>
            Mastery: {Math.round(node.mastery * 100)}%{node.weak ? " · needs work" : ""}
          </div>)}
        <div className="flex flex-col gap-[0.3rem]">
          {lessons.map((r) => (<Link key={r.lesson.id} to={lessonPath(r.module.id, r.lesson.id)} className={INSP_LINK}>
              {r.lesson.title}
            </Link>))}
        </div>
        {relatedNotes.length > 0 && <span className={INSP_WHEN}>{relatedNotes.length} linked note(s)</span>}
      </aside>);
    }
    if (node.type === "lesson") {
        const key = node.ref?.lessonKey;
        const ref = allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
        return (<aside className={INSP}>
        <button className={INSP_CLOSE} onClick={onClose}>Close</button>
        <span className={INSP_KIND}>Lesson</span>
        <h4 className={INSP_H4}>{node.label}</h4>
        {ref && <Link to={lessonPath(ref.module.id, ref.lesson.id)} className={INSP_LINK}>Open lesson →</Link>}
      </aside>);
    }
    const bookNotes = node.type === "book" ? notes.filter((x) => x.bookId === node.ref?.bookId) : [];
    return (<aside className={INSP}>
      <button className={INSP_CLOSE} onClick={onClose}>Close</button>
      <span className={INSP_KIND}>{node.type === "book" ? "Book" : "Concept"}</span>
      <h4 className={INSP_H4}>{node.label}</h4>
      {node.type === "book" && <span className={INSP_WHEN}>{bookNotes.length} capture(s)</span>}
    </aside>);
}
