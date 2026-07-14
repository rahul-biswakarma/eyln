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
    return (<div className="nb-graph-view">
      <div className="nb-graph-head">
        <div className="view-header">
          <h3>Knowledge Graph</h3>
          <span className="desc">
            The topics you've <strong>completed</strong> (lessons finished, questionary passed) plus your notes and books — connected.
            Node color shows mastery (green = strong, red = weak);
            {weakCount > 0 ? ` ${weakCount} weak spot${weakCount === 1 ? "" : "s"} highlighted.` : " nothing weak right now."}
          </span>
        </div>
        <button className="btn-new" onClick={handleAnalyze} disabled={analyzing}>
          <SparkleIcon size={13} weight="fill"/> {analyzing ? "Analyzing…" : "Analyze my graph"}
        </button>
      </div>

      {analysisMsg && <div className="nb-graph-msg">{analysisMsg}</div>}

      <div className="nb-graph-legend">
        {LEGEND.map((l) => (<span key={l.cls} className="kg-legend-item">
            <span className={`kg-legend-dot kg-node-${l.cls}`}/> {l.label}
          </span>))}
        <span className="kg-legend-item"><WarningOctagonIcon size={12}/> ring = weak</span>
      </div>

      {graph.nodes.length === 0 ? (<div className="nb-empty-state">
          <GraphIcon size={24} weight="duotone"/>
          <h4>Your graph is empty</h4>
          <p>Complete a lesson and pass its questionary — finished topics show up here, connected to your notes and books.</p>
        </div>) : (<div className="nb-graph-canvas-row">
        <div className="nb-graph-canvas">
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
        return (<aside className="nb-graph-inspector">
        <button className="nb-back-btn" onClick={onClose}>Close</button>
        <span className="kg-insp-kind">Note</span>
        <p className="kg-insp-body">{n?.body.slice(0, 400)}</p>
        {n && <span className="when">{relativeTime(n.createdAt, now)}</span>}
      </aside>);
    }
    if (node.type === "module") {
        const m = node.ref?.moduleId ? getModule(node.ref.moduleId) : undefined;
        const lessons = m ? allLessons.filter((r) => r.module.id === m.id) : [];
        const relatedNotes = notes.filter((x) => x.moduleId === node.ref?.moduleId);
        return (<aside className="nb-graph-inspector">
        <button className="nb-back-btn" onClick={onClose}>Close</button>
        <span className="kg-insp-kind">Module</span>
        <h4>{node.label}</h4>
        {typeof node.mastery === "number" && (<div className={`kg-insp-mastery ${node.weak ? "weak" : ""}`}>
            Mastery: {Math.round(node.mastery * 100)}%{node.weak ? " · needs work" : ""}
          </div>)}
        <div className="kg-insp-list">
          {lessons.map((r) => (<Link key={r.lesson.id} to={lessonPath(r.module.id, r.lesson.id)} className="kg-insp-link">
              {r.lesson.title}
            </Link>))}
        </div>
        {relatedNotes.length > 0 && <span className="when">{relatedNotes.length} linked note(s)</span>}
      </aside>);
    }
    if (node.type === "lesson") {
        const key = node.ref?.lessonKey;
        const ref = allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
        return (<aside className="nb-graph-inspector">
        <button className="nb-back-btn" onClick={onClose}>Close</button>
        <span className="kg-insp-kind">Lesson</span>
        <h4>{node.label}</h4>
        {ref && <Link to={lessonPath(ref.module.id, ref.lesson.id)} className="kg-insp-link">Open lesson →</Link>}
      </aside>);
    }
    const bookNotes = node.type === "book" ? notes.filter((x) => x.bookId === node.ref?.bookId) : [];
    return (<aside className="nb-graph-inspector">
      <button className="nb-back-btn" onClick={onClose}>Close</button>
      <span className="kg-insp-kind">{node.type === "book" ? "Book" : "Concept"}</span>
      <h4>{node.label}</h4>
      {node.type === "book" && <span className="when">{bookNotes.length} capture(s)</span>}
    </aside>);
}
