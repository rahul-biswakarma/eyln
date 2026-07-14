import type { NoteType } from "./notes";
export type CaptureKind = "note" | "formula" | "code" | "quote" | "vocab" | "mistake";
export function captureNoteType(kind: CaptureKind): NoteType {
    return kind;
}
export function detectCaptureKind(text: string): CaptureKind {
    const t = text.trim();
    if (!t)
        return "note";
    if (/```/.test(t))
        return "code";
    if (/\$\$[^$]+\$\$|\\[a-zA-Z]+\{|\\(frac|sqrt|sum|int|vec|hat)\b/.test(t))
        return "formula";
    if (/\bmistake\b/i.test(t) && /\bcorrect(ion)?\b/i.test(t))
        return "mistake";
    if (/^["“].+["”]$/.test(t) || /^["“]/.test(t))
        return "quote";
    if (/^[a-zA-Z][a-zA-Z\s'-]{1,28}\s[—-]\s.{6,}/.test(t) && t.split("\n").length === 1)
        return "vocab";
    return "note";
}
export interface CaptureShortcut {
    kind: CaptureKind;
    icon: string;
    label: string;
    desc: string;
    group: "Reading" | "Engineering" | "General";
    disabled?: boolean;
}
export const CAPTURE_SHORTCUTS: CaptureShortcut[] = [
    { kind: "quote", icon: "quote", label: "Save Quote", desc: "A passage worth remembering", group: "Reading" },
    { kind: "vocab", icon: "vocab", label: "New Word", desc: "Add a word to your vocabulary", group: "Reading" },
    { kind: "formula", icon: "formula", label: "Formula", desc: "Compose and save an equation", group: "Engineering" },
    { kind: "code", icon: "code", label: "Code Snippet", desc: "Store a useful reference", group: "Engineering" },
    { kind: "mistake", icon: "mistake", label: "Mistake", desc: "Record a misconception", group: "Engineering" },
    { kind: "note", icon: "capture", label: "Quick Capture", desc: "Any idea, thought, or spark", group: "General" },
];
export const CAPTURE_KIND_TEMPLATE: Partial<Record<CaptureKind, string>> = {
    code: "function dotProduct(a, b) {\n  return a.x * b.x + a.y * b.y + a.z * b.z;\n}",
    mistake: "Mistake: Subtracted coordinates in wrong order when computing displacement vector.\n\nCorrection: Displacement is always target - origin (B - A), not origin - target.",
    formula: "\\vec{a} \\times \\vec{b} = \\|\\vec{a}\\| \\|\\vec{b}\\| \\sin(\\theta) \\hat{n}",
};
export function buildCapture(kind: CaptureKind, fields: {
    text: string;
    source: string;
    formula: string;
}): {
    body: string;
    tags: string[];
} | null {
    const text = fields.text.trim();
    if (kind === "formula") {
        if (!fields.formula.trim())
            return null;
        return { body: `$$\n${fields.formula.trim()}\n$$`, tags: ["formula"] };
    }
    if (kind === "code") {
        if (!text)
            return null;
        return { body: `\`\`\`javascript\n${text}\n\`\`\``, tags: ["code"] };
    }
    if (kind === "quote") {
        if (!text)
            return null;
        const body = `"${text}"${fields.source.trim() ? `\n\n— ${fields.source.trim()}` : ""}`;
        return { body, tags: ["quote"] };
    }
    if (kind === "vocab") {
        if (!text)
            return null;
        const body = fields.source.trim() ? `${text}\n\nSource: ${fields.source.trim()}` : text;
        return { body, tags: ["vocab"] };
    }
    if (kind === "mistake") {
        if (!text)
            return null;
        return { body: text, tags: ["mistake"] };
    }
    if (!text)
        return null;
    return { body: text, tags: [] };
}
