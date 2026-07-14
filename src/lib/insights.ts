import { modules, allLessons, lessonKey, getModule } from "../content/registry";
import { buildLearnerContext } from "./learnerContext";
import { conceptMastery, isWeak } from "./mastery";
import { noteKind } from "./note-kind";
import { generate, parseJSON, isLLMEnabled } from "./llm";
import type { Note } from "./notes";
import type { Book } from "./books";
import type { Concept } from "./concepts";
import type { TutorTaskKind } from "./tutor";
export interface GraphInputs {
    notes: Note[];
    books: Book[];
    concepts: Concept[];
    done: Record<string, boolean>;
    quizScores: Record<string, number>;
}
interface InsightsJSON {
    tasks: {
        kind: TutorTaskKind;
        text: string;
        topic?: string;
    }[];
}
export function buildKnowledgeContext(inputs: GraphInputs): string {
    const { notes, books, concepts, done, quizScores } = inputs;
    const lines: string[] = [buildLearnerContext()];
    const mastery = modules.map((m) => ({ m, v: conceptMastery(m.id, done, quizScores, notes) }));
    const weak = mastery.filter(({ v }) => isWeak(v)).sort((a, b) => a.v - b.v).slice(0, 6);
    if (weak.length) {
        lines.push(`Weak concepts (mastery < 60%): ${weak.map(({ m, v }) => `${m.title} (${Math.round(v * 100)}%)`).join(", ")}.`);
    }
    const masteryById = new Map(mastery.map(({ m, v }) => [m.id, v]));
    const nextUp: string[] = [];
    for (const m of modules) {
        const started = m.lessons.some((l) => done[lessonKey(m.id, l.id)]);
        if (started)
            continue;
        const prereqsReady = m.dependsOn.length > 0 && m.dependsOn.every((d) => (masteryById.get(d) ?? 0) >= 0.6);
        if (prereqsReady)
            nextUp.push(m.title);
    }
    if (nextUp.length)
        lines.push(`Ready to start (prereqs mastered): ${nextUp.slice(0, 5).join(", ")}.`);
    const reading = books.filter((b) => b.status === "reading").map((b) => b.title);
    if (reading.length)
        lines.push(`Currently reading: ${reading.join(", ")}.`);
    const orphanReading = notes.filter((n) => !n.bookId && (noteKind(n) === "quote" || noteKind(n) === "vocab")).length;
    if (orphanReading > 0)
        lines.push(`${orphanReading} reading capture(s) not linked to any book.`);
    const mistakeByModule = new Map<string, number>();
    for (const n of notes) {
        if (noteKind(n) === "mistake" && n.moduleId) {
            mistakeByModule.set(n.moduleId, (mistakeByModule.get(n.moduleId) ?? 0) + 1);
        }
    }
    const mistakeHot = [...mistakeByModule.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, c]) => `${getModule(id)?.title ?? id} (${c})`);
    if (mistakeHot.length)
        lines.push(`Most-recorded mistakes by module: ${mistakeHot.join(", ")}.`);
    if (concepts.some((c) => c.kind === "custom")) {
        lines.push(`Custom concepts defined: ${concepts.filter((c) => c.kind === "custom").length}.`);
    }
    lines.push(`Totals: ${notes.length} notes, ${books.length} books, ${allLessons.length} lessons in curriculum.`);
    return lines.join("\n");
}
export async function analyzeKnowledgeGraph(inputs: GraphInputs): Promise<Array<{
    kind: TutorTaskKind;
    text: string;
    topic?: string;
    source?: string;
}>> {
    if (!isLLMEnabled())
        return [];
    const context = buildKnowledgeContext(inputs);
    const prompt = [
        "You analyze a learner's personal knowledge graph for a course on building a 3D game engine (Odin + Metal), plus DSA and math.",
        "From the state below, produce durable, specific insights as a JSON object.",
        'Shape: {"tasks":[{"kind":"struggle"|"review"|"next"|"content-gap","text":string,"topic"?:string}]}',
        "- struggle: a concept the learner is weak in or keeps making mistakes on.",
        "- review: something worth revisiting to consolidate.",
        "- next: a recommended next topic whose prerequisites are already mastered.",
        "- content-gap: a topic under-covered by the learner's notes/books.",
        "Ground every item in the data. 3-6 items. No prose, JSON only.",
        "",
        "Learner knowledge state:",
        context,
    ].join("\n");
    const raw = await generate(prompt, { temperature: 0.3 });
    const parsed = parseJSON<InsightsJSON>(raw);
    if (!parsed?.tasks?.length)
        return [];
    return parsed.tasks.map((t) => ({ ...t, source: "Knowledge Graph" }));
}
