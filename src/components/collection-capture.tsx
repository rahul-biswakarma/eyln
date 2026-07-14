import { useState } from "react";
import {
  NotePencilIcon, SigmaIcon, WarningOctagonIcon, SparkleIcon, CodeIcon,
  StackIcon, LightbulbIcon, LinkSimpleIcon, PlusIcon, CaretRightIcon,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "./ui";
import { useNotes } from "../lib/notes";
import { rwCaptureSheet, rwCaptureChoice, rwForm, rwInput, rwFormSave, rwFormBack, rwSeg, rwSegBtn, rwCaptureBtn } from "./capture-styles";

/** Where the capture is happening — determines linkage + which kinds are offered. */
export type CaptureContext =
  | { view: "space"; moduleId?: string; spaceId?: string; spaceTitle: string }
  | { view: "project"; projectId: string; projectTitle: string };

type Mode = "note" | "formula" | "mistake" | "ai" | "code" | "architecture" | "idea" | "reference";

interface ModeDef { mode: Mode; icon: React.ReactNode; label: string; desc: string }

const SPACE_MODES: ModeDef[] = [
  { mode: "note", icon: <NotePencilIcon size={18} weight="duotone" />, label: "Note", desc: "A thought or explanation" },
  { mode: "formula", icon: <SigmaIcon size={18} weight="duotone" />, label: "Formula", desc: "An equation to remember" },
  { mode: "mistake", icon: <WarningOctagonIcon size={18} weight="duotone" />, label: "Mistake", desc: "A misconception + fix" },
  { mode: "ai", icon: <SparkleIcon size={18} weight="duotone" />, label: "AI Insight", desc: "Something the tutor clarified" },
  { mode: "code", icon: <CodeIcon size={18} weight="duotone" />, label: "Code Snippet", desc: "A useful reference" },
];
const PROJECT_MODES: ModeDef[] = [
  { mode: "architecture", icon: <StackIcon size={18} weight="duotone" />, label: "Architecture Note", desc: "A design decision" },
  { mode: "code", icon: <CodeIcon size={18} weight="duotone" />, label: "Code Snippet", desc: "Reusable code" },
  { mode: "idea", icon: <LightbulbIcon size={18} weight="duotone" />, label: "Idea", desc: "Something to try" },
  { mode: "reference", icon: <LinkSimpleIcon size={18} weight="duotone" />, label: "Reference", desc: "A link or source" },
];

/**
 * Context-aware capture. One button → an action sheet whose options depend on
 * the current collection, then a structured form. Everything is auto-linked to
 * the container (moduleId / spaceId / projectId) — no manual categorization.
 */
export function CollectionCapture({
  context, initialMode, triggerLabel = "Capture", triggerClassName = rwCaptureBtn,
}: {
  context: CaptureContext;
  initialMode?: Mode;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode | null>(initialMode ?? null);
  const addNote = useNotes((s) => s.addNote);

  const modes = context.view === "space" ? SPACE_MODES : PROJECT_MODES;
  const containerName = context.view === "space" ? context.spaceTitle : context.projectTitle;

  const close = () => {
    setOpen(false);
    setTimeout(() => setMode(initialMode ?? null), 200);
  };

  /** Common linkage stamped on every capture from this context. */
  const linkage = () =>
    context.view === "space"
      ? { moduleId: context.moduleId, spaceId: context.spaceId }
      : { projectId: context.projectId };

  const save = (fields: SaveFields) => {
    const link = linkage();
    if (mode === "note" || mode === "architecture") {
      addNote({ ...link, type: "note", body: fields.body.trim(), title: fields.title?.trim() || undefined,
        lesson: fields.lesson?.trim() || undefined,
        tags: mode === "architecture" ? ["architecture", ...fields.tags] : fields.tags });
    } else if (mode === "formula") {
      addNote({ ...link, type: "formula", body: `$$\n${fields.body.trim()}\n$$`, title: fields.title?.trim() || undefined,
        lesson: fields.lesson?.trim() || undefined, difficulty: fields.difficulty,
        tags: ["formula", ...fields.tags] });
    } else if (mode === "mistake") {
      addNote({ ...link, type: "mistake", body: fields.body.trim(), why: fields.why?.trim() || undefined,
        correction: fields.correction?.trim() || undefined, lesson: fields.lesson?.trim() || undefined,
        resolved: false, reviewCount: 0, tags: ["mistake"] });
    } else if (mode === "ai") {
      addNote({ ...link, type: "note", body: fields.body.trim(), title: fields.title?.trim() || undefined,
        tags: ["pinned", "text"] });
    } else if (mode === "code") {
      addNote({ ...link, type: "code", body: "```\n" + fields.body.trim() + "\n```", title: fields.title?.trim() || undefined,
        tags: ["code", ...fields.tags] });
    } else if (mode === "idea") {
      addNote({ ...link, type: "idea", body: fields.body.trim(), title: fields.title?.trim() || undefined, tags: ["idea"] });
    } else if (mode === "reference") {
      addNote({ ...link, type: "note", body: fields.body.trim(), title: fields.title?.trim() || undefined, tags: ["reference"] });
    }
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <button className={triggerClassName} onClick={() => setOpen(true)}>
        <PlusIcon size={13} weight="bold" /> {triggerLabel}
      </button>
      <DialogContent showCloseButton>
        {mode === null ? (
          <>
            <DialogTitle>Capture in {containerName}</DialogTitle>
            <div className={rwCaptureSheet}>
              {modes.map((m) => (
                <button key={m.mode} className={rwCaptureChoice} onClick={() => setMode(m.mode)}>
                  <span className="grid place-items-center text-accent">{m.icon}</span>
                  <span className="flex flex-1 flex-col"><span className="text-[0.9rem] font-medium text-text">{m.label}</span><span className="text-[0.74rem] text-text-faint">{m.desc}</span></span>
                  <CaretRightIcon size={14} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <CaptureForm mode={mode} onSave={save} onBack={initialMode ? undefined : () => setMode(null)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SaveFields {
  title?: string;
  body: string;
  lesson?: string;
  tags: string[];
  why?: string;
  correction?: string;
  difficulty?: 1 | 2 | 3;
}

const MODE_TITLE: Record<Mode, string> = {
  note: "Add note", formula: "Save formula", mistake: "Log mistake", ai: "Save AI insight",
  code: "Save snippet", architecture: "Architecture note", idea: "Capture idea", reference: "Add reference",
};

function parseTags(raw: string): string[] {
  return raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function CaptureForm({ mode, onSave, onBack }: { mode: Mode; onSave: (f: SaveFields) => void; onBack?: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lesson, setLesson] = useState("");
  const [tags, setTags] = useState("");
  const [why, setWhy] = useState("");
  const [correction, setCorrection] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);

  const showLesson = mode === "note" || mode === "formula" || mode === "mistake";
  const showTags = mode === "note" || mode === "formula" || mode === "code" || mode === "architecture";
  const bodyPlaceholder =
    mode === "formula" ? "LaTeX — e.g. \\vec{a}\\cdot\\vec{b}" :
    mode === "code" ? "Paste code…" :
    mode === "mistake" ? "What did you get wrong?" :
    mode === "reference" ? "URL or source…" :
    mode === "ai" ? "The insight or explanation to keep…" :
    "Write your note…";

  const valid = body.trim().length > 0;

  return (
    <>
      <DialogTitle>{MODE_TITLE[mode]}</DialogTitle>
      <div className={rwForm}>
        {mode !== "reference" && (
          <input className={rwInput} placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        )}
        <textarea className={rwInput} rows={mode === "code" ? 6 : 4} autoFocus placeholder={bodyPlaceholder} value={body} onChange={(e) => setBody(e.target.value)} />

        {mode === "mistake" && (
          <>
            <textarea className={rwInput} rows={2} placeholder="Why did it happen? (optional)" value={why} onChange={(e) => setWhy(e.target.value)} />
            <textarea className={rwInput} rows={2} placeholder="Correct explanation (optional)" value={correction} onChange={(e) => setCorrection(e.target.value)} />
          </>
        )}

        {mode === "formula" && (
          <div className={rwSeg}>
            {[1, 2, 3].map((d) => (
              <button key={d} className={rwSegBtn(difficulty === d)} onClick={() => setDifficulty(d as 1 | 2 | 3)}>
                {d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard"}
              </button>
            ))}
          </div>
        )}

        {showLesson && <input className={rwInput} placeholder="Lesson / section (optional)" value={lesson} onChange={(e) => setLesson(e.target.value)} />}
        {showTags && <input className={rwInput} placeholder="Tags, comma separated" value={tags} onChange={(e) => setTags(e.target.value)} />}

        <button className={rwFormSave} disabled={!valid} onClick={() => onSave({ title, body, lesson, tags: parseTags(tags), why, correction, difficulty })}>
          Save
        </button>
      </div>
      {onBack && <button className={rwFormBack} onClick={onBack}>← Back to capture</button>}
    </>
  );
}
