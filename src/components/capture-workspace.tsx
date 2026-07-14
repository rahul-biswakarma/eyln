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
    return createPortal(<div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[min(14vh,140px)] bg-[rgba(6,6,9,0.6)] backdrop-blur-[6px]" onClick={onClose}>
      <div className="w-[min(600px,92vw)] max-h-[calc(100vh-min(14vh,140px)-2rem)] overflow-y-auto bg-surface border border-border-bright rounded-[20px] shadow-[0_30px_90px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.02)] pt-[1.6rem] pr-[1.7rem] pb-[1.4rem] pl-[1.7rem] animate-[capture-rise_0.22s_var(--ease)_both]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-[0.3rem]">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-accent">Capture Knowledge</span>
          <button className="bg-transparent border-none text-text-faint cursor-pointer w-[26px] h-[26px] grid place-items-center rounded-full transition duration-200 ease-brand hover:text-text hover:bg-[rgba(255,255,255,0.06)]" onClick={onClose} aria-label="Close">
            <XIcon size={15}/>
          </button>
        </div>
        <p className="font-display text-[1.3rem] font-semibold text-text mt-[0.1rem] mx-0 mb-[1.1rem]">What would you like to remember?</p>

        <div className="flex flex-col gap-[0.5rem]">
          {kind === "formula" ? (<FormulaBuilder value={formula} onChange={setFormula}/>) : (<textarea ref={textareaRef} className="w-full bg-surface-inset border border-border rounded py-[0.85rem] px-[1rem] font-sans text-[0.96rem] leading-[1.55] text-text outline-none resize-none transition-[border-color,box-shadow] duration-200 ease-brand focus:border-border-glow focus:shadow-[0_0_0_3px_var(--accent-soft)]" placeholder="Type, paste, or drag content here..." value={text} onChange={(e) => setText(e.target.value)} rows={4}/>)}

          {(kind === "quote" || kind === "vocab") && (<input type="text" className="w-full bg-surface-inset border border-border rounded-sm py-[0.55rem] px-[0.8rem] font-sans text-[0.84rem] text-text outline-none focus:border-border-glow" placeholder={kind === "quote" ? "Source — book, page (optional)" : "Source (optional)"} value={source} onChange={(e) => setSource(e.target.value)}/>)}

          {(detected === "quote" || detected === "vocab") && (<div className="flex gap-2 mt-2">
              <select className="flex-1 bg-surface-inset border border-border rounded-sm text-text px-[0.6rem] py-2 text-[0.82rem] font-sans focus:outline-none focus:border-accent" value={bookId} onChange={(e) => setBookId(e.target.value)}>
                <option value="">No book</option>
                {books.map((b) => (<option key={b.id} value={b.id}>{b.title}</option>))}
                <option value="__new">+ New book…</option>
              </select>
              {bookId === "__new" && (<div className="mt-2 [&_.book-search]:m-0 [&_.book-search]:mb-[0.4rem]">
                  <BookSearch placeholder="Search a book to attach…" onPick={(meta) => {
                    const id = addBook({ title: meta.title, author: meta.author, year: meta.year, coverUrl: meta.coverUrl, olKey: meta.key, status: "reading" });
                    setBookId(id);
                    setNewBookTitle("");
                  }}/>
                  <input type="text" className="w-full bg-surface-inset border border-border rounded-sm py-[0.55rem] px-[0.8rem] font-sans text-[0.84rem] text-text outline-none focus:border-border-glow" placeholder="…or type a title manually" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)}/>
                </div>)}
            </div>)}
        </div>

        <div className="flex items-center justify-between gap-[0.8rem] mt-[0.8rem]">
          <div className="min-h-[22px]">
            {detected && (<span className="inline-flex items-center gap-[0.35rem] font-mono text-[0.72rem] text-highlight bg-accent-soft border border-border-glow rounded-pill py-[0.25rem] px-[0.65rem] animate-[fade_0.15s_var(--ease)_both]">
                <MagicWandIcon size={11} weight="fill"/> Detected as {KIND_LABEL[detected]}
              </span>)}
          </div>
          <div className="flex items-center gap-[0.5rem]">
            <button className="bg-accent text-on-accent border-none rounded-sm py-[0.5rem] px-[1.1rem] text-[0.86rem] font-semibold cursor-pointer transition duration-200 ease-brand enabled:hover:bg-highlight disabled:opacity-40 disabled:cursor-not-allowed" onClick={handleSave} disabled={!canSave}>
              Save
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[1rem] mt-[1.3rem] pt-[1.2rem] border-t border-border">
          {GROUPS.map((group) => (<div key={group.title} className="flex flex-col gap-[0.5rem]">
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-text-faint">{group.title}</span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[0.6rem]">
                {CAPTURE_SHORTCUTS.filter((s) => group.kinds.includes(s.kind)).map((s) => (<button key={s.kind} className={`flex items-start gap-[0.6rem] border rounded-sm py-[0.7rem] px-[0.8rem] text-left cursor-pointer transition-[transform,border-color,background] duration-200 ease-brand hover:-translate-y-px ${kind === s.kind ? "border-border-glow bg-accent-soft" : "border-border bg-surface-2 hover:border-border-bright hover:bg-surface"}`} onClick={() => openShortcut(s.kind)}>
                    <span className="text-accent shrink-0 mt-[0.1rem]">{SHORTCUT_ICON[s.icon]}</span>
                    <span className="flex flex-col gap-[0.15rem] min-w-0">
                      <span className="text-[0.84rem] font-medium text-text">{s.label}</span>
                      <span className="text-[0.72rem] text-text-faint leading-[1.35]">{s.desc}</span>
                    </span>
                  </button>))}
              </div>
            </div>))}
        </div>
      </div>
    </div>, document.body);
}
