import type { Book } from "./books";
import type { Note } from "./notes";
import { noteKind } from "./note-kind";

const DAY = 24 * 60 * 60 * 1000;

/** Notes belonging to a book, split by kind. Source of truth stays the notes store. */
export interface BookCaptures {
  quotes: Note[];
  vocab: Note[];
  notes: Note[]; // everything that isn't a quote or vocab
  all: Note[];
}

export function capturesForBook(bookId: string, allNotes: Note[]): BookCaptures {
  const all = allNotes.filter((n) => n.bookId === bookId).sort((a, b) => b.createdAt - a.createdAt);
  const quotes: Note[] = [];
  const vocab: Note[] = [];
  const notes: Note[] = [];
  for (const n of all) {
    const k = noteKind(n);
    if (k === "quote") quotes.push(n);
    else if (k === "vocab") vocab.push(n);
    else notes.push(n);
  }
  return { quotes, vocab, notes, all };
}

export interface BookStats {
  quoteCount: number;
  vocabCount: number;
  noteCount: number;
  progress: number | null; // 0..1 from currentPage/totalPages
  streak: number; // consecutive days with a capture, counting back from today
  estimatedFinish: number | null; // ms timestamp, from reading pace
}

export function bookStats(book: Book, captures: BookCaptures, now: number): BookStats {
  const progress =
    book.totalPages && book.totalPages > 0 && book.currentPage != null
      ? Math.max(0, Math.min(1, book.currentPage / book.totalPages))
      : null;

  // Streak: distinct capture days, counting back from today (or yesterday).
  const days = new Set<number>();
  for (const n of captures.all) days.add(Math.floor(n.createdAt / DAY));
  let streak = 0;
  let cursor = Math.floor(now / DAY);
  if (!days.has(cursor)) cursor -= 1;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }

  // Estimated finish: linear extrapolation of pages/day since start.
  let estimatedFinish: number | null = null;
  if (book.status === "reading" && book.startedAt && book.currentPage && book.totalPages && book.currentPage < book.totalPages) {
    const elapsedDays = Math.max(1, (now - book.startedAt) / DAY);
    const pace = book.currentPage / elapsedDays; // pages per day
    if (pace > 0.1) {
      const remaining = book.totalPages - book.currentPage;
      estimatedFinish = now + (remaining / pace) * DAY;
    }
  }

  return {
    quoteCount: captures.quotes.length,
    vocabCount: captures.vocab.length,
    noteCount: captures.notes.length,
    progress,
    streak,
    estimatedFinish,
  };
}

/** The starred quote, else the most recent one. */
export function favoriteQuote(captures: BookCaptures): Note | null {
  return captures.quotes.find((q) => q.favorite) ?? captures.quotes[0] ?? null;
}

// ── Timeline ──────────────────────────────────────────────────────────────

export type ReadingEventKind = "started" | "quote" | "vocab" | "note" | "finished";
export interface ReadingEvent {
  kind: ReadingEventKind;
  at: number;
  label: string;
  detail?: string;
  page?: number;
}

/** Chronological reading journey: start → captures → finish. */
export function readingTimeline(book: Book, captures: BookCaptures): ReadingEvent[] {
  const events: ReadingEvent[] = [];
  if (book.startedAt) events.push({ kind: "started", at: book.startedAt, label: "Started reading", detail: book.title });
  for (const n of captures.all) {
    const k = noteKind(n);
    if (k === "quote") events.push({ kind: "quote", at: n.createdAt, label: "Captured a quote", detail: cleanQuote(n.body).slice(0, 80), page: n.page });
    else if (k === "vocab") events.push({ kind: "vocab", at: n.createdAt, label: "Learned a word", detail: n.word ?? n.body.slice(0, 40), page: n.page });
    else events.push({ kind: "note", at: n.createdAt, label: n.title ? `Note · ${n.title}` : "Added a reflection", detail: n.body.slice(0, 80), page: n.page });
  }
  if (book.finishedAt) events.push({ kind: "finished", at: book.finishedAt, label: "Finished book", detail: book.title });
  return events.sort((a, b) => a.at - b.at);
}

// ── Notes grouped by page/chapter ───────────────────────────────────────────

export interface NoteGroup {
  label: string;
  sort: number; // page number (or Infinity for un-paged)
  notes: Note[];
}

export function groupNotesByPage(notes: Note[]): NoteGroup[] {
  const map = new Map<string, NoteGroup>();
  for (const n of notes) {
    const label = n.chapter ? n.chapter : n.page != null ? `Page ${n.page}` : "Ending thoughts";
    const sort = n.page ?? (n.chapter ? -1 : Infinity);
    const g = map.get(label) ?? { label, sort, notes: [] };
    g.notes.push(n);
    map.set(label, g);
  }
  return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
}

// ── Unified search across books + captures ──────────────────────────────────

export type SearchHitKind = "book" | "quote" | "vocab" | "note";
export interface SearchHit {
  kind: SearchHitKind;
  bookId: string;
  bookTitle: string;
  text: string;
  noteId?: string;
}

export function searchReading(query: string, books: Book[], allNotes: Note[]): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  const titleById = new Map(books.map((b) => [b.id, b.title]));

  for (const b of books) {
    if (b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)) {
      hits.push({ kind: "book", bookId: b.id, bookTitle: b.title, text: b.author ? `${b.title} · ${b.author}` : b.title });
    }
  }
  for (const n of allNotes) {
    if (!n.bookId) continue;
    const hay = [n.body, n.word, n.meaning, n.example, n.title, n.chapter, ...(n.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) continue;
    const k = noteKind(n);
    const kind: SearchHitKind = k === "quote" ? "quote" : k === "vocab" ? "vocab" : "note";
    hits.push({
      kind,
      bookId: n.bookId,
      bookTitle: titleById.get(n.bookId) ?? "",
      noteId: n.id,
      text: kind === "vocab" ? (n.word ?? n.body) : kind === "quote" ? cleanQuote(n.body) : n.title ?? n.body,
    });
  }
  return hits.slice(0, 40);
}

/** Strip the wrapping quotation marks / trailing attribution that buildCapture adds. */
export function cleanQuote(body: string): string {
  const m = body.match(/^"([\s\S]*?)"(?:\s*\n\n—\s*.+)?$/);
  return (m ? m[1] : body.replace(/^"|"$/g, "")).trim();
}

export function relativeDay(ms: number, now: number): string {
  const d = Math.floor((now - ms) / DAY);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
