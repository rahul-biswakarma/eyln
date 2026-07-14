import { useState } from "react";
import { QuotesIcon, TranslateIcon, NotePencilIcon, StarIcon, PlusIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "./ui";
import { useNotes, type VocabStatus } from "../lib/notes";

type CaptureMode = "quote" | "vocab" | "note";

/**
 * Reading capture: one primary button opens an action sheet (Quote / Vocabulary /
 * Note); choosing one swaps to a dedicated structured form inside the same panel.
 * Captures are stored as book-linked notes so they surface everywhere else.
 */
export function BookCapture({ bookId, initialMode }: { bookId: string; initialMode?: CaptureMode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CaptureMode | null>(initialMode ?? null);
  const addNote = useNotes((s) => s.addNote);

  const close = () => {
    setOpen(false);
    // reset after the panel animates out
    setTimeout(() => setMode(initialMode ?? null), 200);
  };

  const saveQuote = (f: { quote: string; page?: number; chapter?: string; tags: string[]; favorite: boolean }) => {
    addNote({
      bookId,
      type: "quote",
      body: `"${f.quote.trim()}"`,
      tags: ["quote", ...f.tags],
      page: f.page,
      chapter: f.chapter || undefined,
      favorite: f.favorite || undefined,
    });
    close();
  };
  const saveVocab = (f: { word: string; meaning: string; example?: string; page?: number; status: VocabStatus }) => {
    addNote({
      bookId,
      type: "vocab",
      body: f.meaning.trim() ? `${f.word.trim()} — ${f.meaning.trim()}` : f.word.trim(),
      tags: ["vocab"],
      word: f.word.trim(),
      meaning: f.meaning.trim() || undefined,
      example: f.example?.trim() || undefined,
      page: f.page,
      vocabStatus: f.status,
      reviewCount: 0,
    });
    close();
  };
  const saveNote = (f: { title?: string; content: string; tags: string[]; page?: number }) => {
    addNote({
      bookId,
      type: "note",
      body: f.content.trim(),
      tags: f.tags,
      title: f.title?.trim() || undefined,
      page: f.page,
    });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <button className="rw-capture-btn" onClick={() => setOpen(true)}>
        <PlusIcon size={15} weight="bold" /> Capture
      </button>
      <DialogContent showCloseButton>
        {mode === null ? (
          <>
            <DialogTitle>Capture from this book</DialogTitle>
            <div className="rw-capture-sheet">
              <button className="rw-capture-choice" onClick={() => setMode("quote")}>
                <span className="ic"><QuotesIcon size={18} weight="duotone" /></span>
                <span className="txt"><span className="t">Quote</span><span className="d">A passage worth keeping</span></span>
                <CaretRightIcon size={14} />
              </button>
              <button className="rw-capture-choice" onClick={() => setMode("vocab")}>
                <span className="ic"><TranslateIcon size={18} weight="duotone" /></span>
                <span className="txt"><span className="t">Vocabulary</span><span className="d">A word you learned</span></span>
                <CaretRightIcon size={14} />
              </button>
              <button className="rw-capture-choice" onClick={() => setMode("note")}>
                <span className="ic"><NotePencilIcon size={18} weight="duotone" /></span>
                <span className="txt"><span className="t">Note</span><span className="d">A reflection or idea</span></span>
                <CaretRightIcon size={14} />
              </button>
            </div>
          </>
        ) : mode === "quote" ? (
          <QuoteForm onSave={saveQuote} onBack={initialMode ? undefined : () => setMode(null)} />
        ) : mode === "vocab" ? (
          <VocabForm onSave={saveVocab} onBack={initialMode ? undefined : () => setMode(null)} />
        ) : (
          <NoteForm onSave={saveNote} onBack={initialMode ? undefined : () => setMode(null)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function parseTags(raw: string): string[] {
  return raw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
}
function toPage(raw: string): number | undefined {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function FormShell({ title, onBack, children }: { title: string; onBack?: () => void; children: React.ReactNode }) {
  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <div className="rw-form">{children}</div>
      {onBack && (
        <button className="rw-form-back" onClick={onBack}>← Back to capture</button>
      )}
    </>
  );
}

function QuoteForm({ onSave, onBack }: { onSave: (f: { quote: string; page?: number; chapter?: string; tags: string[]; favorite: boolean }) => void; onBack?: () => void }) {
  const [quote, setQuote] = useState("");
  const [page, setPage] = useState("");
  const [chapter, setChapter] = useState("");
  const [tags, setTags] = useState("");
  const [favorite, setFavorite] = useState(false);
  return (
    <FormShell title="Capture quote" onBack={onBack}>
      <textarea className="rw-input" rows={4} autoFocus placeholder="Paste the passage…" value={quote} onChange={(e) => setQuote(e.target.value)} />
      <div className="rw-row">
        <input className="rw-input" placeholder="Page" value={page} onChange={(e) => setPage(e.target.value)} inputMode="numeric" />
        <input className="rw-input" placeholder="Chapter (optional)" value={chapter} onChange={(e) => setChapter(e.target.value)} />
      </div>
      <input className="rw-input" placeholder="Tags, comma separated" value={tags} onChange={(e) => setTags(e.target.value)} />
      <button className={`rw-fav-toggle ${favorite ? "on" : ""}`} onClick={() => setFavorite((v) => !v)}>
        <StarIcon size={14} weight={favorite ? "fill" : "regular"} /> {favorite ? "Favorite" : "Mark favorite"}
      </button>
      <button className="rw-form-save" disabled={!quote.trim()} onClick={() => onSave({ quote, page: toPage(page), chapter, tags: parseTags(tags), favorite })}>Save quote</button>
    </FormShell>
  );
}

function VocabForm({ onSave, onBack }: { onSave: (f: { word: string; meaning: string; example?: string; page?: number; status: VocabStatus }) => void; onBack?: () => void }) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [page, setPage] = useState("");
  const [status, setStatus] = useState<VocabStatus>("learning");
  const STATUSES: VocabStatus[] = ["learning", "review", "mastered"];
  const LABEL: Record<VocabStatus, string> = { learning: "Learning", review: "Needs review", mastered: "Mastered" };
  return (
    <FormShell title="Add vocabulary" onBack={onBack}>
      <input className="rw-input" autoFocus placeholder="Word" value={word} onChange={(e) => setWord(e.target.value)} />
      <textarea className="rw-input" rows={2} placeholder="Meaning" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
      <textarea className="rw-input" rows={2} placeholder="Example sentence (optional)" value={example} onChange={(e) => setExample(e.target.value)} />
      <div className="rw-row">
        <input className="rw-input" placeholder="Page" value={page} onChange={(e) => setPage(e.target.value)} inputMode="numeric" />
      </div>
      <div className="rw-seg">
        {STATUSES.map((s) => (
          <button key={s} className={`rw-seg-btn ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>{LABEL[s]}</button>
        ))}
      </div>
      <button className="rw-form-save" disabled={!word.trim()} onClick={() => onSave({ word, meaning, example, page: toPage(page), status })}>Save word</button>
    </FormShell>
  );
}

function NoteForm({ onSave, onBack }: { onSave: (f: { title?: string; content: string; tags: string[]; page?: number }) => void; onBack?: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [page, setPage] = useState("");
  return (
    <FormShell title="Add note" onBack={onBack}>
      <input className="rw-input" autoFocus placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="rw-input" rows={5} placeholder="Your reflection…" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="rw-row">
        <input className="rw-input" placeholder="Linked page" value={page} onChange={(e) => setPage(e.target.value)} inputMode="numeric" />
        <input className="rw-input" placeholder="Tags, comma separated" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <button className="rw-form-save" disabled={!content.trim()} onClick={() => onSave({ title, content, tags: parseTags(tags), page: toPage(page) })}>Save note</button>
    </FormShell>
  );
}
