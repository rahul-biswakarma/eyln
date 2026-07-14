import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
function save(patch: Record<string, unknown>) {
    writeCloudState(getCurrentUid(), patch);
}
export interface Concept {
    id: string;
    label: string;
    kind: "module" | "custom";
    moduleId?: string;
    prereqIds?: string[];
    createdAt: number;
    updatedAt: number;
}
interface ConceptsState {
    concepts: Concept[];
    addConcept: (label: string, prereqIds?: string[]) => string;
    updateConcept: (id: string, patch: Partial<Pick<Concept, "label" | "prereqIds">>) => void;
    deleteConcept: (id: string) => void;
}
let seq = 0;
const uid = () => `c-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const EMPTY_CONCEPTS = { concepts: [] as Concept[] };
export const useConcepts = create<ConceptsState>()((set) => ({
    ...EMPTY_CONCEPTS,
    addConcept: (label, prereqIds) => {
        const now = Date.now();
        const id = `c:${uid()}`;
        set((s) => {
            const concepts = [
                { id, label: label.trim(), kind: "custom" as const, prereqIds, createdAt: now, updatedAt: now },
                ...s.concepts,
            ];
            save({ concepts });
            return { concepts };
        });
        return id;
    },
    updateConcept: (id, patch) => {
        set((s) => {
            const concepts = s.concepts.map((c) => c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c);
            save({ concepts });
            return { concepts };
        });
    },
    deleteConcept: (id) => {
        set((s) => {
            const concepts = s.concepts
                .filter((c) => c.id !== id)
                .map((c) => c.prereqIds?.includes(id)
                ? { ...c, prereqIds: c.prereqIds.filter((x) => x !== id) }
                : c);
            save({ concepts });
            return { concepts };
        });
    },
}));
export function hydrateConcepts(data: {
    concepts?: Concept[];
} | null) {
    useConcepts.setState({ concepts: data?.concepts ?? [] });
}
