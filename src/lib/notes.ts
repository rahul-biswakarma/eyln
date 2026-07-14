import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
function save(patch: Record<string, unknown>) {
    writeCloudState(getCurrentUid(), patch);
}
export type NoteType = "note" | "formula" | "code" | "mistake" | "quote" | "vocab" | "idea";
/** Spaced-repetition state for a vocabulary capture. */
export type VocabStatus = "learning" | "review" | "mastered";
export interface Note {
    id: string;
    lessonKey?: string;
    moduleId?: string;
    selectionText?: string;
    body: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
    type?: NoteType;
    bookId?: string;
    conceptIds?: string[];
    linkedNoteIds?: string[];
    // Book-capture fields (all optional, backward-compatible).
    title?: string;        // heading for a Note capture
    page?: number;         // page number a capture came from
    chapter?: string;      // chapter label
    favorite?: boolean;    // starred quote
    word?: string;         // vocab: the term
    meaning?: string;      // vocab: definition
    example?: string;      // vocab: usage sentence
    vocabStatus?: VocabStatus;
    reviewCount?: number;  // times reviewed (spaced repetition)
    lastReviewedAt?: number;
}
export interface Reminder {
    id: string;
    lessonKey?: string;
    note: string;
    dueAt: number;
    createdAt: number;
    done: boolean;
    notified: boolean;
}
export interface OpenScore {
    score: number;
    at: number;
}
interface NotesState {
    notes: Note[];
    bookmarks: Record<string, number>;
    reminders: Reminder[];
    openScores: Record<string, OpenScore>;
    addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
    updateNote: (id: string, patch: Partial<Pick<Note, "body" | "tags" | "type" | "bookId" | "conceptIds" | "linkedNoteIds" | "title" | "page" | "chapter" | "favorite" | "word" | "meaning" | "example" | "vocabStatus" | "reviewCount" | "lastReviewedAt">>) => void;
    deleteNote: (id: string) => void;
    linkNotes: (a: string, b: string) => void;
    /** Cycle a vocab note through its review, bumping the spaced-repetition counters. */
    reviewVocab: (id: string, status: VocabStatus) => void;
    toggleBookmark: (lessonKey: string) => void;
    addReminder: (r: Omit<Reminder, "id" | "createdAt" | "done" | "notified">) => void;
    completeReminder: (id: string) => void;
    deleteReminder: (id: string) => void;
    markNotified: (id: string) => void;
    recordOpenScore: (exerciseId: string, score: number) => void;
}
let seq = 0;
const uid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;
const EMPTY_NOTES = {
    notes: [] as Note[],
    bookmarks: {} as Record<string, number>,
    reminders: [] as Reminder[],
    openScores: {} as Record<string, OpenScore>,
};
export const useNotes = create<NotesState>()((set) => ({
    ...EMPTY_NOTES,
    addNote: (n) => {
        set((s) => {
            const now = Date.now();
            const notes = [{ ...n, id: uid(), createdAt: now, updatedAt: now }, ...s.notes];
            save({ notes });
            return { notes };
        });
    },
    updateNote: (id, patch) => {
        set((s) => {
            const notes = s.notes.map((n) => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n);
            save({ notes });
            return { notes };
        });
    },
    deleteNote: (id) => {
        set((s) => {
            const notes = s.notes
                .filter((n) => n.id !== id)
                .map((n) => n.linkedNoteIds?.includes(id)
                ? { ...n, linkedNoteIds: n.linkedNoteIds.filter((x) => x !== id) }
                : n);
            save({ notes });
            return { notes };
        });
    },
    linkNotes: (a, b) => {
        if (a === b)
            return;
        set((s) => {
            const addLink = (n: Note, other: string): Note => {
                const links = n.linkedNoteIds ?? [];
                if (links.includes(other))
                    return n;
                return { ...n, linkedNoteIds: [...links, other], updatedAt: Date.now() };
            };
            const notes = s.notes.map((n) => n.id === a ? addLink(n, b) : n.id === b ? addLink(n, a) : n);
            save({ notes });
            return { notes };
        });
    },
    reviewVocab: (id, status) => {
        set((s) => {
            const now = Date.now();
            const notes = s.notes.map((n) => n.id === id
                ? { ...n, vocabStatus: status, reviewCount: (n.reviewCount ?? 0) + 1, lastReviewedAt: now, updatedAt: now }
                : n);
            save({ notes });
            return { notes };
        });
    },
    toggleBookmark: (key) => {
        set((s) => {
            const next = { ...s.bookmarks };
            if (next[key])
                delete next[key];
            else
                next[key] = Date.now();
            save({ bookmarks: next });
            return { bookmarks: next };
        });
    },
    addReminder: (r) => {
        set((s) => {
            const reminders = [
                { ...r, id: uid(), createdAt: Date.now(), done: false, notified: false },
                ...s.reminders,
            ];
            save({ reminders });
            return { reminders };
        });
    },
    completeReminder: (id) => {
        set((s) => {
            const reminders = s.reminders.map((r) => (r.id === id ? { ...r, done: true } : r));
            save({ reminders });
            return { reminders };
        });
    },
    deleteReminder: (id) => {
        set((s) => {
            const reminders = s.reminders.filter((r) => r.id !== id);
            save({ reminders });
            return { reminders };
        });
    },
    markNotified: (id) => {
        set((s) => {
            const reminders = s.reminders.map((r) => (r.id === id ? { ...r, notified: true } : r));
            save({ reminders });
            return { reminders };
        });
    },
    recordOpenScore: (exerciseId, score) => {
        set((s) => {
            const prev = s.openScores[exerciseId];
            if (prev && prev.score >= score)
                return s;
            const openScores = { ...s.openScores, [exerciseId]: { score, at: Date.now() } };
            save({ openScores });
            return { openScores };
        });
    },
}));
export function hydrateNotes(data: Partial<NotesState> | null) {
    useNotes.setState({ ...EMPTY_NOTES, ...data });
}
export function dueReminders(reminders: Reminder[], now: number): Reminder[] {
    return reminders
        .filter((r) => !r.done && r.dueAt <= now)
        .sort((a, b) => a.dueAt - b.dueAt);
}
