import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  id: string;
  
  lessonKey?: string;
  moduleId?: string;
  
  selectionText?: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
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
  updateNote: (id: string, patch: Partial<Pick<Note, "body" | "tags">>) => void;
  deleteNote: (id: string) => void;

  toggleBookmark: (lessonKey: string) => void;

  addReminder: (r: Omit<Reminder, "id" | "createdAt" | "done" | "notified">) => void;
  completeReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  markNotified: (id: string) => void;

  recordOpenScore: (exerciseId: string, score: number) => void;
}

let seq = 0;
const uid = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      bookmarks: {},
      reminders: [],
      openScores: {},

      addNote: (n) =>
        set((s) => {
          const now = Date.now();
          return { notes: [{ ...n, id: uid(), createdAt: now, updatedAt: now }, ...s.notes] };
        }),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
          ),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      toggleBookmark: (key) =>
        set((s) => {
          const next = { ...s.bookmarks };
          if (next[key]) delete next[key];
          else next[key] = Date.now();
          return { bookmarks: next };
        }),

      addReminder: (r) =>
        set((s) => ({
          reminders: [
            { ...r, id: uid(), createdAt: Date.now(), done: false, notified: false },
            ...s.reminders,
          ],
        })),
      completeReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: true } : r)),
        })),
      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      markNotified: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, notified: true } : r)),
        })),

      recordOpenScore: (exerciseId, score) =>
        set((s) => {
          const prev = s.openScores[exerciseId];
          if (prev && prev.score >= score) return s;
          return { openScores: { ...s.openScores, [exerciseId]: { score, at: Date.now() } } };
        }),
    }),
    { name: "forge-notes" }
  )
);

/** Reminders that are due (or overdue) and not yet completed. */
export function dueReminders(reminders: Reminder[], now: number): Reminder[] {
  return reminders
    .filter((r) => !r.done && r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}
