import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";

function save(patch: Record<string, unknown>) {
  writeCloudState(getCurrentUid(), patch);
}

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
      const notes = s.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
      );
      save({ notes });
      return { notes };
    });
  },
  deleteNote: (id) => {
    set((s) => {
      const notes = s.notes.filter((n) => n.id !== id);
      save({ notes });
      return { notes };
    });
  },

  toggleBookmark: (key) => {
    set((s) => {
      const next = { ...s.bookmarks };
      if (next[key]) delete next[key];
      else next[key] = Date.now();
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
      if (prev && prev.score >= score) return s;
      const openScores = { ...s.openScores, [exerciseId]: { score, at: Date.now() } };
      save({ openScores });
      return { openScores };
    });
  },
}));

/** Replace the store contents with cloud data — used only by lib/sync.ts. */
export function hydrateNotes(data: Partial<NotesState> | null) {
  useNotes.setState({ ...EMPTY_NOTES, ...data });
}

/** Reminders that are due (or overdue) and not yet completed. */
export function dueReminders(reminders: Reminder[], now: number): Reminder[] {
  return reminders
    .filter((r) => !r.done && r.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}
