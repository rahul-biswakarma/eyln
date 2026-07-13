import type { Note } from "./notes";

export type NoteKind = "ai" | "formula" | "code" | "mistake" | "voice" | "note";

export function noteKind(note: Note): NoteKind {
  if (note.tags.includes("mistake")) return "mistake";
  if (note.tags.includes("audio")) return "voice";
  if (note.tags.includes("pinned")) return "ai";
  if (note.tags.includes("formula") || /\$\$?[^$]+\$\$?/.test(note.body)) return "formula";
  if (note.tags.includes("code") || /```/.test(note.body)) return "code";
  return "note";
}

export const NOTE_KIND_META: Record<NoteKind, { label: string; accent: string }> = {
  ai: { label: "AI Insight", accent: "violet" },
  formula: { label: "Formula", accent: "amber" },
  code: { label: "Code", accent: "blue" },
  mistake: { label: "Mistake", accent: "red" },
  voice: { label: "Voice Memo", accent: "green" },
  note: { label: "Note", accent: "neutral" },
};

/** First non-empty, human-scannable line for compressed card previews. */
export function notePreviewLine(note: Note, kind: NoteKind): string {
  const stripped = note.body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/[#*`_]/g, "")
    .trim();

  if (kind === "mistake") {
    const correction = note.body.match(/Correction:\s*([^\n]+)/i);
    if (correction) return correction[1].trim();
  }

  const firstLine = stripped.split("\n").find((l) => l.trim().length > 0);
  return (firstLine ?? note.body.trim()).slice(0, 140);
}

/** Extracts the first fenced code block, if any, for a code preview. */
export function noteCodeBlock(note: Note): { lang: string; code: string } | null {
  const match = note.body.match(/```(\w*)\n([\s\S]*?)```/);
  if (!match) return null;
  return { lang: match[1] || "typescript", code: match[2].trim() };
}

/** Extracts the first `$$...$$` (or `$...$`) formula, if any. */
export function noteFormula(note: Note): string | null {
  const block = note.body.match(/\$\$([\s\S]*?)\$\$/);
  if (block) return block[1].trim();
  const inline = note.body.match(/\$([^$]+)\$/);
  return inline ? inline[1].trim() : null;
}
