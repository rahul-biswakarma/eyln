import type { Note } from "./notes";
import { noteKind } from "./note-kind";

export interface ProjectCaptures {
  architecture: Note[]; // notes tagged "architecture"
  code: Note[];
  ideas: Note[];
  references: Note[];   // notes tagged "reference"
  all: Note[];
}

export function capturesForProject(projectId: string, allNotes: Note[]): ProjectCaptures {
  const all = allNotes.filter((n) => n.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt);
  const architecture: Note[] = [], code: Note[] = [], ideas: Note[] = [], references: Note[] = [];
  for (const n of all) {
    if (n.tags.includes("reference")) references.push(n);
    else if (n.tags.includes("architecture")) architecture.push(n);
    else if (noteKind(n) === "code") code.push(n);
    else if (noteKind(n) === "idea") ideas.push(n);
    else architecture.push(n); // default bucket for plain project notes
  }
  return { architecture, code, ideas, references, all };
}

export interface ProjectStats {
  architectureCount: number;
  codeCount: number;
  ideaCount: number;
  referenceCount: number;
  total: number;
  lastActivity: number | null;
}

export function projectStats(caps: ProjectCaptures): ProjectStats {
  return {
    architectureCount: caps.architecture.length,
    codeCount: caps.code.length,
    ideaCount: caps.ideas.length,
    referenceCount: caps.references.length,
    total: caps.all.length,
    lastActivity: caps.all[0]?.createdAt ?? null,
  };
}

export type ProjectEventKind = "architecture" | "code" | "idea" | "reference";
export interface ProjectEvent {
  kind: ProjectEventKind;
  at: number;
  label: string;
  detail?: string;
}

export function projectTimeline(caps: ProjectCaptures): ProjectEvent[] {
  const events: ProjectEvent[] = [];
  for (const n of caps.architecture) events.push({ kind: "architecture", at: n.createdAt, label: "Architecture note", detail: (n.title || n.body).slice(0, 80) });
  for (const n of caps.code) events.push({ kind: "code", at: n.createdAt, label: "Saved a snippet", detail: (n.title || n.body).replace(/```/g, "").slice(0, 80) });
  for (const n of caps.ideas) events.push({ kind: "idea", at: n.createdAt, label: "Captured an idea", detail: (n.title || n.body).slice(0, 80) });
  for (const n of caps.references) events.push({ kind: "reference", at: n.createdAt, label: "Added a reference", detail: (n.title || n.body).slice(0, 80) });
  return events.sort((a, b) => a.at - b.at);
}
