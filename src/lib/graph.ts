import { modules, allLessons, lessonKey } from "../content/registry";
import type { Note } from "./notes";
import type { Book } from "./books";
import type { Concept } from "./concepts";
import { noteKind } from "./note-kind";
import { conceptMastery, isWeak } from "./mastery";
import { moduleComplete, lessonComplete } from "./completion";
export type GraphNodeType = "module" | "lesson" | "concept" | "note" | "book";
export type EdgeType = "prereq" | "contains" | "about" | "from-book" | "related";
export interface GraphNode {
    id: string;
    type: GraphNodeType;
    label: string;
    mastery?: number;
    weak?: boolean;
    degree: number;
    ref?: {
        moduleId?: string;
        lessonKey?: string;
        noteId?: string;
        bookId?: string;
        conceptId?: string;
    };
}
export interface GraphEdge {
    source: string;
    target: string;
    type: EdgeType;
    derived: boolean;
}
export interface KnowledgeGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
const moduleNodeId = (id: string) => `module:${id}`;
const lessonNodeId = (key: string) => `lesson:${key}`;
const noteNodeId = (id: string) => `note:${id}`;
const bookNodeId = (id: string) => `book:${id}`;
const conceptNodeId = (id: string) => `concept:${id}`;
export function buildKnowledgeGraph(inputs: {
    notes: Note[];
    books: Book[];
    concepts: Concept[];
    done: Record<string, boolean>;
    quizScores: Record<string, number>;
    exercisesDone: Record<string, boolean>;
    solvedChallenges: Record<string, number>;
}): KnowledgeGraph {
    const { notes, books, concepts, done, quizScores, exercisesDone, solvedChallenges } = inputs;
    const progress = { done, quizScores, exercisesDone, solvedChallenges };
    const nodes = new Map<string, GraphNode>();
    const edges: GraphEdge[] = [];
    const addNode = (n: Omit<GraphNode, "degree">) => {
        if (!nodes.has(n.id))
            nodes.set(n.id, { ...n, degree: 0 });
        return nodes.get(n.id)!;
    };
    const addEdge = (source: string, target: string, type: EdgeType, derived: boolean) => {
        if (!nodes.has(source) || !nodes.has(target))
            return;
        edges.push({ source, target, type, derived });
        nodes.get(source)!.degree++;
        nodes.get(target)!.degree++;
    };
    // Only surface what the learner has actually finished: a module appears
    // once its chapter review (exercises + quizzes + capstone) is complete;
    // a lesson appears once it's done and its quiz/exercises are cleared.
    for (const m of modules) {
        if (!moduleComplete(m, progress)) continue;
        const mastery = conceptMastery(m.id, done, quizScores, notes);
        addNode({
            id: moduleNodeId(m.id),
            type: "module",
            label: m.title,
            mastery,
            weak: isWeak(mastery),
            ref: { moduleId: m.id },
        });
    }
    for (const m of modules) {
        for (const dep of m.dependsOn) {
            // addEdge no-ops unless both module nodes exist (i.e. both complete).
            addEdge(moduleNodeId(dep), moduleNodeId(m.id), "prereq", true);
        }
    }
    for (const r of allLessons) {
        if (!lessonComplete(r.module, r.lesson, progress)) continue;
        const key = lessonKey(r.module.id, r.lesson.id);
        addNode({
            id: lessonNodeId(key),
            type: "lesson",
            label: r.lesson.title,
            mastery: done[key] ? 1 : quizScores[key],
            ref: { moduleId: r.module.id, lessonKey: key },
        });
        // Attach lesson to its module only if the module also made the cut;
        // otherwise the lesson stands alone (still a completed node).
        addEdge(moduleNodeId(r.module.id), lessonNodeId(key), "contains", true);
    }
    const conceptById = new Map(concepts.map((c) => [c.id, c]));
    for (const c of concepts) {
        if (c.kind !== "custom")
            continue;
        addNode({ id: conceptNodeId(c.id), type: "concept", label: c.label, ref: { conceptId: c.id } });
    }
    for (const c of concepts) {
        if (c.kind !== "custom" || !c.prereqIds)
            continue;
        for (const p of c.prereqIds) {
            const target = conceptById.get(p) ? conceptNodeId(p) : null;
            if (target)
                addEdge(conceptNodeId(c.id), conceptNodeId(p), "prereq", false);
        }
    }
    for (const b of books) {
        addNode({ id: bookNodeId(b.id), type: "book", label: b.title, ref: { bookId: b.id } });
    }
    const conceptByLabel = new Map<string, string>();
    for (const m of modules)
        conceptByLabel.set(m.title.toLowerCase(), moduleNodeId(m.id));
    for (const c of concepts)
        if (c.kind === "custom")
            conceptByLabel.set(c.label.toLowerCase(), conceptNodeId(c.id));
    for (const n of notes) {
        const kind = noteKind(n);
        const nodeId = noteNodeId(n.id);
        addNode({
            id: nodeId,
            type: "note",
            label: n.body.replace(/[#*`$_]/g, "").trim().slice(0, 40) || kind,
            ref: { noteId: n.id },
        });
        if (n.lessonKey)
            addEdge(nodeId, lessonNodeId(n.lessonKey), "about", true);
        else if (n.moduleId)
            addEdge(nodeId, moduleNodeId(n.moduleId), "about", true);
        if (n.bookId)
            addEdge(nodeId, bookNodeId(n.bookId), "from-book", false);
        for (const cid of n.conceptIds ?? []) {
            const target = conceptById.get(cid) ? conceptNodeId(cid) : null;
            if (target)
                addEdge(nodeId, target, "about", false);
        }
        for (const tag of n.tags) {
            const target = conceptByLabel.get(tag.toLowerCase());
            if (target)
                addEdge(nodeId, target, "about", true);
        }
        for (const other of n.linkedNoteIds ?? []) {
            if (n.id < other)
                addEdge(nodeId, noteNodeId(other), "related", false);
        }
    }
    return { nodes: Array.from(nodes.values()), edges };
}
