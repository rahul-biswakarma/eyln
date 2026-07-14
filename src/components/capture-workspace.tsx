import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagicWandIcon, QuotesIcon, TranslateIcon, SigmaIcon, CodeIcon, WarningOctagonIcon, NotePencilIcon, XIcon } from "@phosphor-icons/react";
import { CAPTURE_SHORTCUTS, detectCaptureKind, buildCapture, CAPTURE_KIND_TEMPLATE, captureNoteType, type CaptureKind, } from "../lib/capture";
import { FormulaBuilder } from "./formula-builder";
import { BookSearch } from "./book-search";
import { useBooks } from "../lib/books";
import type { NoteType } from "../lib/notes";
const SHORTCUT_ICON: Record<string, React.ReactNode> = {
    quote: <QuotesIcon size={17} weight="bold"/>,
    vocab: <TranslateIcon size={17} weight="bold"/>,
    formula: <SigmaIcon size={17} weight="bold"/>,
    code: <CodeIcon size={17} weight="bold"/>,
    mistake: <WarningOctagonIcon size={17} weight="bold"/>,
    capture: <NotePencilIcon size={17} weight="bold"/>,
};
const KIND_LABEL: Record<CaptureKind, string> = {
    note: "Note",
    formula: "Formula",
    code: "Code",
    quote: "Quote",
    vocab: "Vocabulary",
    mistake: "Mistake",
};
const GROUPS: {
    title: string;
    kinds: CaptureKind[];
}[] = [
    { title: "Reading", kinds: ["quote", "vocab"] },
    { title: "Engineering", kinds: ["formula", "code", "mistake"] },
    { title: "General", kinds: ["note"] },
];
export function CaptureWorkspace({ onClose, onSave, }: {
    onClose: () => void;
    onSave: (note: {
        body: string;
        tags: string[];
        type: NoteType;
        bookId?: string;
    }) => void;
}) {
    const [kind, setKind] = useState<CaptureKind | null>(null);
    const [text, setText] = useState("");
    const [source, setSource] = useState("");
    const [formula, setFormula] = useState("");
    const [bookId, setBookId] = useState<string>("");
    const [newBookTitle, setNewBookTitle] = useState("");
    const books = useBooks((s) => s.books);
    const addBook = useBooks((s) => s.addBook);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const detected = kind ?? (text.trim() ? detectCaptureKind(text) : null);
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);
    const openShortcut = (k: CaptureKind) => {
        setKind(k);
        setFormula(CAPTURE_KIND_TEMPLATE[k] ?? "");
        setText((prev) => prev || (k === "code" || k === "mistake" ? CAPTURE_KIND_TEMPLATE[k] ?? "" : prev));
        if (k !== "formula")
            textareaRef.current?.focus();
    };
    const canSave = kind === "formula" ? formula.trim().length > 0 : text.trim().length > 0;
    const handleSave = () => {
        const effectiveKind = kind ?? detectCaptureKind(text);
        const result = buildCapture(effectiveKind, { text, source, formula });
        if (!result)
            return;
        let linkedBookId = effectiveKind === "quote" || effectiveKind === "vocab" ? bookId : "";
        if (linkedBookId === "__new" && newBookTitle.trim()) {
            linkedBookId = addBook({ title: newBookTitle.trim(), status: "reading" });
        }
        else if (linkedBookId === "__new") {
            linkedBookId = "";
        }
        onSave({
            body: result.body,
            tags: result.tags,
            type: captureNoteType(effectiveKind),
            bookId: linkedBookId || undefined,
        });
    };
    return createPortal(<div className="capture-overlay" onClick={onClose}>
      <div className="capture-workspace" onClick={(e) => e.stopPropagation()}>
        <div className="capture-header">
          <span className="capture-kicker">Capture Knowledge</span>
          <button className="capture-close" onClick={onClose} aria-label="Close">
            <XIcon size={15}/>
          </button>
        </div>
        <p className="capture-prompt">What would you like to remember?</p>

        <div className="capture-input-wrap">
          {kind === "formula" ? (<FormulaBuilder value={formula} onChange={setFormula}/>) : (<textarea ref={textareaRef} className="capture-input" placeholder="Type, paste, or drag content here..." value={text} onChange={(e) => setText(e.target.value)} rows={4}/>)}

          {(kind === "quote" || kind === "vocab") && (<input type="text" className="capture-source" placeholder={kind === "quote" ? "Source — book, page (optional)" : "Source (optional)"} value={source} onChange={(e) => setSource(e.target.value)}/>)}

          {(detected === "quote" || detected === "vocab") && (<div className="capture-book-picker">
              <select className="capture-book-select" value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">No book</option>
                {books.map((b) => (<option key={b.id} value={b.id}>{b.title}</option>))}
                <option value="__new">+ New book…</option>
              </select>
              {bookId === "__new" && (<div className="capture-newbook">
                  <BookSearch placeholder="Search a book to attach…" onPick={(meta) => {
                    const id = addBook({ title: meta.title, author: meta.author, year: meta.year, coverUrl: meta.coverUrl, olKey: meta.key, status: "reading" });
                    setBookId(id);
                    setNewBookTitle("");
                  }}/>
                  <input type="text" className="capture-source" placeholder="…or type a title manually" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)}/>
                </div>)}
            </div>)}
        </div>

        <div className="capture-footer-row">
          <div className="capture-detect">
            {detected && (<span className="capture-detect-pill">
                <MagicWandIcon size={11} weight="fill"/> Detected as {KIND_LABEL[detected]}
              </span>)}
          </div>
          <div className="capture-actions">
            <button className="capture-save-btn" onClick={handleSave} disabled={!canSave}>
              Save
            </button>
          </div>
        </div>

        <div className="capture-shortcuts">
          {GROUPS.map((group) => (<div key={group.title} className="capture-group">
              <span className="capture-group-title">{group.title}</span>
              <div className="capture-cards">
                {CAPTURE_SHORTCUTS.filter((s) => group.kinds.includes(s.kind)).map((s) => (<button key={s.kind} className={`capture-card ${kind === s.kind ? "active" : ""}`} onClick={() => openShortcut(s.kind)}>
                    <span className="capture-card-ic">{SHORTCUT_ICON[s.icon]}</span>
                    <span className="capture-card-text">
                      <span className="capture-card-label">{s.label}</span>
                      <span className="capture-card-desc">{s.desc}</span>
                    </span>
                  </button>))}
              </div>
            </div>))}
        </div>
      </div>
    </div>, document.body);
}
