import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NotebookIcon, PushPinIcon, PencilSimpleLineIcon, SigmaIcon, CodeIcon, MicrophoneIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, SparkleIcon, ClockIcon, BookmarkSimpleIcon, CheckIcon, XIcon, CheckSquareIcon, WarningOctagonIcon, DotsThreeIcon, QuotesIcon, TranslateIcon, LightbulbIcon, BookOpenIcon, GraphIcon } from "@phosphor-icons/react";
import { useNotes, type Note, type NoteType } from "../../lib/notes";
import { useProgress } from "../../lib/progress";
import { useScratchpad } from "../../lib/scratchpad";
import { useBooks } from "../../lib/books";
import { BooksView } from "./books-view";
import { GraphView } from "./graph-view";
import { allLessons, lessonPath } from "../../content/registry";
import { relativeTime } from "../../lib/stats";
import { groupByTimeline } from "../../lib/timeline";
import { noteKind, notePreviewLine, noteCodeBlock, noteFormula, NOTE_KIND_META, type NoteKind } from "../../lib/note-kind";
import { ModuleIcon } from "../../components/module-icon";
import { M, MBlock } from "../../components/math";
import { Code as ShikiCode } from "../../components/code-block";
import { CaptureWorkspace } from "../../components/capture-workspace";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui";
function lessonForKey(key?: string) {
    if (!key)
        return undefined;
    return allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
}
function computeStreak(lastVisited: Record<string, number>) {
    const timestamps = Object.values(lastVisited);
    if (timestamps.length === 0)
        return 0;
    const dates = new Set(timestamps.map((ts) => new Date(ts).toDateString()));
    let streak = 0;
    let current = new Date();
    if (!dates.has(current.toDateString())) {
        current.setDate(current.getDate() - 1);
        if (!dates.has(current.toDateString())) {
            return 0;
        }
    }
    while (dates.has(current.toDateString())) {
        streak++;
        current.setDate(current.getDate() - 1);
    }
    return streak;
}
const SIDEBAR_GROUPS: {
    title: string;
    items: {
        tab: string;
        icon: React.ReactNode;
        label: string;
        count: (n: Note[], r: number) => number;
    }[];
}[] = [
    {
        title: "Workspace",
        items: [
            { tab: "all", icon: <NotebookIcon size={16}/>, label: "Recent", count: (n) => n.length },
            { tab: "pinned", icon: <PushPinIcon size={16}/>, label: "Pinned", count: (n) => n.filter((x) => x.tags.includes("pinned")).length },
            { tab: "reminders", icon: <ClockIcon size={16}/>, label: "Review Queue", count: (_n, r) => r },
        ],
    },
    {
        title: "Engineering",
        items: [
            { tab: "ai", icon: <SparkleIcon size={16}/>, label: "AI Notes", count: (n) => n.filter((x) => x.tags.includes("pinned")).length },
            { tab: "mistakes", icon: <WarningOctagonIcon size={16}/>, label: "Mistakes", count: (n) => n.filter((x) => x.tags.includes("mistake")).length },
            { tab: "formulas", icon: <SigmaIcon size={16}/>, label: "Formula Library", count: (n) => n.filter((x) => noteKind(x) === "formula").length },
            { tab: "code", icon: <CodeIcon size={16}/>, label: "CodeIcon Snippets", count: (n) => n.filter((x) => noteKind(x) === "code").length },
        ],
    },
    {
        title: "Reading",
        items: [
            { tab: "quotes", icon: <QuotesIcon size={16}/>, label: "QuotesIcon", count: (n) => n.filter((x) => noteKind(x) === "quote").length },
            { tab: "vocab", icon: <TranslateIcon size={16}/>, label: "Vocabulary", count: (n) => n.filter((x) => noteKind(x) === "vocab").length },
        ],
    },
    {
        title: "Personal",
        items: [
            { tab: "ideas", icon: <LightbulbIcon size={16}/>, label: "Ideas", count: (n) => n.filter((x) => noteKind(x) === "idea").length },
            { tab: "custom", icon: <PencilSimpleLineIcon size={16}/>, label: "My Notes", count: (n) => n.filter((x) => !x.tags.includes("pinned") && !x.tags.includes("mistake")).length },
        ],
    },
];
export function Knowledge() {
    const notes = useNotes((s) => s.notes);
    const bookmarks = useNotes((s) => s.bookmarks);
    const reminders = useNotes((s) => s.reminders);
    const addNote = useNotes((s) => s.addNote);
    const deleteNote = useNotes((s) => s.deleteNote);
    const updateNote = useNotes((s) => s.updateNote);
    const toggleBookmark = useNotes((s) => s.toggleBookmark);
    const addReminder = useNotes((s) => s.addReminder);
    const completeReminder = useNotes((s) => s.completeReminder);
    const deleteReminder = useNotes((s) => s.deleteReminder);
    const lastVisited = useProgress((s) => s.lastVisited);
    const books = useBooks((s) => s.books);
    const streak = useMemo(() => computeStreak(lastVisited), [lastVisited]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editBody, setEditBody] = useState("");
    const [editTags, setEditTags] = useState("");
    const [isCapturing, setIsCapturing] = useState(false);
    const scratchpadText = useScratchpad((s) => s.text);
    const setScratchpadText = useScratchpad((s) => s.setText);
    const now = Date.now();
    const allTags = useMemo(() => {
        const set = new Set<string>();
        for (const n of notes) {
            for (const t of n.tags) {
                set.add(t);
            }
        }
        return Array.from(set);
    }, [notes]);
    const bookmarkList = Object.entries(bookmarks).sort((a, b) => b[1] - a[1]);
    const activeReminders = reminders.filter((r) => !r.done).sort((a, b) => a.dueAt - b.dueAt);
    const tabFilteredNotes = useMemo(() => {
        switch (activeTab) {
            case "pinned":
                return notes.filter((n) => n.tags.includes("pinned"));
            case "custom":
                return notes.filter((n) => !n.tags.includes("pinned") && !n.tags.includes("mistake"));
            case "ai":
                return notes.filter((n) => n.tags.includes("pinned"));
            case "formulas":
                return notes.filter((n) => noteKind(n) === "formula");
            case "code":
                return notes.filter((n) => noteKind(n) === "code");
            case "mistakes":
                return notes.filter((n) => n.tags.includes("mistake"));
            case "quotes":
                return notes.filter((n) => noteKind(n) === "quote");
            case "vocab":
                return notes.filter((n) => noteKind(n) === "vocab");
            case "ideas":
                return notes.filter((n) => noteKind(n) === "idea");
            case "all":
            default:
                return notes;
        }
    }, [notes, activeTab]);
    const filteredNotes = useMemo(() => {
        return tabFilteredNotes.filter((n) => {
            if (selectedTag && !n.tags.includes(selectedTag))
                return false;
            if (searchQuery.trim()) {
                const text = (n.body + " " + (n.selectionText ?? "") + " " + n.tags.join(" ")).toLowerCase();
                if (!text.includes(searchQuery.toLowerCase()))
                    return false;
            }
            return true;
        });
    }, [tabFilteredNotes, selectedTag, searchQuery]);
    const timelineGroups = useMemo(() => groupByTimeline(filteredNotes, (n) => n.createdAt, now), [filteredNotes, now]);
    const handleSaveCapture = (note: {
        body: string;
        tags: string[];
        type: NoteType;
        bookId?: string;
    }) => {
        addNote(note);
        setIsCapturing(false);
    };
    const handleSaveEdit = (noteId: string) => {
        const tagsArr = editTags.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
        updateNote(noteId, {
            body: editBody.trim(),
            tags: tagsArr
        });
        setEditingNoteId(null);
    };
    const handleStartEdit = (note: Note) => {
        setEditingNoteId(note.id);
        setEditBody(note.body);
        setEditTags(note.tags.join(", "));
    };
    const handleQuickReminder = (note: Note, days: number) => {
        addReminder({
            lessonKey: note.lessonKey,
            note: `Review Note: ${note.body.slice(0, 45).replace(/[#*`$_]/g, "")}...`,
            dueAt: Date.now() + days * 24 * 60 * 60 * 1000
        });
    };
    return (<div className="notebook-shell">
      
      <div className="nb-workspace">
        
        <aside className="nb-sidebar">
          {SIDEBAR_GROUPS.map((group) => (<div key={group.title}>
              <span className="sidebar-group-title">{group.title}</span>
              <nav className="sidebar-links">
                {group.items.map((item) => (<button key={item.tab} className={`sidebar-link ${activeTab === item.tab ? "active" : ""}`} onClick={() => setActiveTab(item.tab)}>
                    {item.icon} {item.label} <span className="badge">{item.count(notes, activeReminders.length)}</span>
                  </button>))}
              </nav>
            </div>))}

          <span className="sidebar-group-title">Collections</span>
          <nav className="sidebar-links">
            <button className={`sidebar-link ${activeTab === "graph" ? "active" : ""}`} onClick={() => setActiveTab("graph")}>
              <GraphIcon size={16}/> Knowledge Graph
            </button>
            <button className={`sidebar-link ${activeTab === "books" ? "active" : ""}`} onClick={() => setActiveTab("books")}>
              <BookOpenIcon size={16}/> Books <span className="badge">{books.length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "bookmarks" ? "active" : ""}`} onClick={() => setActiveTab("bookmarks")}>
              <BookmarkSimpleIcon size={16}/> Bookmarked Lessons <span className="badge">{bookmarkList.length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "scratchpad" ? "active" : ""}`} onClick={() => setActiveTab("scratchpad")}>
              <CodeIcon size={16}/> Scratchpad
            </button>
          </nav>
        </aside>

        
        <main className="nb-content">
          {activeTab === "graph" ? (<GraphView now={now}/>) : activeTab === "books" ? (<BooksView now={now}/>) : activeTab === "scratchpad" ? (<div className="nb-scratchpad">
              <div className="scratchpad-header">
                <h3>Scratchpad</h3>
                <span className="desc">A sandboxed scratchpad for code snippets and math scratchwork. Auto-saved.</span>
              </div>
              <textarea value={scratchpadText} placeholder="Write temporary scripts, paste code outlines, or jot down notes here..." onChange={(e) => setScratchpadText(e.target.value)} autoFocus/>
            </div>) : activeTab === "bookmarks" ? (<div className="nb-bookmarks-view">
              <div className="view-header">
                <h3>Bookmarked Lessons</h3>
                <span className="desc">Flagged chapters from linear algebra, engine rendering, and math.</span>
              </div>
              {bookmarkList.length === 0 ? (<div className="nb-empty-state">
                  <BookmarkSimpleIcon size={24} weight="duotone"/>
                  <h4>No Bookmarks Saved</h4>
                  <p>Click the bookmark icon in any course lesson to save reference material here.</p>
                </div>) : (<div className="nb-timeline">
                  {bookmarkList.map(([key, at]) => {
                    const ref = lessonForKey(key);
                    if (!ref)
                        return null;
                    return (<Link key={key} className="nb-bookmark-card hover" to={lessonPath(ref.module.id, ref.lesson.id)}>
                        <span className="ic"><ModuleIcon id={ref.module.id} size={20}/></span>
                        <div className="meta">
                          <h4>{ref.lesson.title}</h4>
                          <span className="module">{ref.module.title}</span>
                        </div>
                        <span className="when">{relativeTime(at, now)}</span>
                        <button className="remove-btn" title="Remove bookmark" onClick={(e) => { e.preventDefault(); toggleBookmark(key); }}>
                          <XIcon size={12}/>
                        </button>
                      </Link>);
                })}
                </div>)}
            </div>) : activeTab === "reminders" ? (<div className="nb-reminders-view">
              <div className="view-header">
                <h3>Review Queue</h3>
                <span className="desc">Spaced repetition checklist for formulas, highlights, vocabulary, and concepts.</span>
              </div>
              {activeReminders.length === 0 ? (<div className="nb-empty-state">
                  <CheckSquareIcon size={24} weight="duotone"/>
                  <h4>No Pending Reviews</h4>
                  <p>Your queue is completely clear. Good job! Add review tasks from any note card below.</p>
                </div>) : (<div className="nb-timeline">
                  {activeReminders.map((r) => {
                    const overdue = r.dueAt <= now;
                    const ref = lessonForKey(r.lessonKey);
                    return (<div className={`nb-reminder-card ${overdue ? "overdue" : ""}`} key={r.id}>
                        <span className="ic">{overdue ? "🔔" : "⏰"}</span>
                        <div className="meta">
                          <p className="note">{r.note}</p>
                          <span className="due">
                            {overdue ? "Due: " : "Review in: "}
                            {relativeTime(overdue ? r.dueAt : now, overdue ? now : r.dueAt)}
                            {ref && ` · ${ref.module.title}`}
                          </span>
                        </div>
                        <div className="actions">
                          {ref && <Link className="action-link" to={lessonPath(ref.module.id, ref.lesson.id)}>Open Lesson</Link>}
                          <button className="btn-done" onClick={() => completeReminder(r.id)}><CheckIcon size={12}/> Done</button>
                          <button className="btn-del" onClick={() => deleteReminder(r.id)}><TrashIcon size={12}/></button>
                        </div>
                      </div>);
                })}
                </div>)}
            </div>) : (<div className="nb-notes-view">
              <div className="nb-workspace-header">
                <div className="nb-title-row">
                  <h1>Knowledge</h1>
                  <div className="nb-stats-quiet">
                    <span><SparkleIcon size={12} weight="fill" style={{ color: "var(--accent)" }}/> {streak}d streak</span>
                    <span className="dot">•</span>
                    <span><NotebookIcon size={12}/> {notes.length} notes</span>
                    <span className="dot">•</span>
                    <span><BookmarkSimpleIcon size={12}/> {bookmarkList.length} saved</span>
                    <span className="dot">•</span>
                    <span><ClockIcon size={12}/> {activeReminders.length} review</span>
                  </div>
                </div>

                
                <div className="nb-toolbar">
                  <div className="nb-search">
                    <MagnifyingGlassIcon size={14} className="search-icon"/>
                    <input type="text" placeholder="Search your knowledge..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                  </div>

                  <div className="nb-toolbar-right">
                    <button className="btn-new" onClick={() => setIsCapturing(true)}>
                      <PlusIcon size={13} weight="bold"/> Capture
                    </button>
                  </div>
                </div>

                
                {allTags.length > 0 && (<div className="nb-tag-chips">
                    <span className={`chip ${selectedTag === null ? "active" : ""}`} onClick={() => setSelectedTag(null)}>#all</span>
                    {allTags.map((tag) => (<span key={tag} className={`chip ${selectedTag === tag ? "active" : ""}`} onClick={() => setSelectedTag(tag)}>#{tag}</span>))}
                  </div>)}
              </div>

              {filteredNotes.length === 0 ? (<div className="nb-empty-state">
                  <NotebookIcon size={24} weight="duotone"/>
                  <h4>Nothing Here Yet</h4>
                  <p>Pin explanations inside course sidebars, or use the Capture button above to add your first entry.</p>
                </div>) : (<div className="nb-notes-timeline">
                  {timelineGroups.map(([label, group]) => (<section key={label} className="nb-day-group">
                      <h5 className="nb-day-label">{label}</h5>
                      <div className="nb-notes-list">
                        {group.map((note) => (<NoteCard key={note.id} note={note} now={now} isEditing={editingNoteId === note.id} editBody={editBody} editTags={editTags} setEditBody={setEditBody} setEditTags={setEditTags} onStartEdit={() => handleStartEdit(note)} onCancelEdit={() => setEditingNoteId(null)} onSaveEdit={() => handleSaveEdit(note.id)} onDelete={() => deleteNote(note.id)} onQuickReminder={(days) => handleQuickReminder(note, days)}/>))}
                      </div>
                    </section>))}
                </div>)}
            </div>)}
        </main>
      </div>

      {isCapturing && (<CaptureWorkspace onClose={() => setIsCapturing(false)} onSave={handleSaveCapture}/>)}
    </div>);
}
const KIND_ICON: Record<NoteKind, React.ReactNode> = {
    ai: <SparkleIcon size={11} weight="fill"/>,
    formula: <SigmaIcon size={11} weight="bold"/>,
    code: <CodeIcon size={11} weight="bold"/>,
    mistake: <WarningOctagonIcon size={11} weight="bold"/>,
    voice: <MicrophoneIcon size={11} weight="bold"/>,
    quote: <QuotesIcon size={11} weight="bold"/>,
    vocab: <TranslateIcon size={11} weight="bold"/>,
    idea: <LightbulbIcon size={11} weight="bold"/>,
    note: <PencilSimpleLineIcon size={11}/>,
};
function splitQuoteAndSource(body: string): {
    quote: string;
    source: string | null;
} {
    const match = body.match(/^"([\s\S]*?)"\s*(?:\n\n—\s*(.+))?$/);
    if (match)
        return { quote: match[1].trim(), source: match[2]?.trim() ?? null };
    return { quote: body.replace(/^"|"$/g, ""), source: null };
}
function splitVocabWordAndDefinition(body: string): {
    word: string;
    definition: string;
} {
    const match = body.match(/^([^—\-\n]+?)\s*[—-]\s*([\s\S]+)$/);
    if (match)
        return { word: match[1].trim(), definition: match[2].trim() };
    return { word: body.trim(), definition: "" };
}
function NoteCard({ note, now, isEditing, editBody, editTags, setEditBody, setEditTags, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onQuickReminder, }: {
    note: Note;
    now: number;
    isEditing: boolean;
    editBody: string;
    editTags: string;
    setEditBody: (v: string) => void;
    setEditTags: (v: string) => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDelete: () => void;
    onQuickReminder: (days: number) => void;
}) {
    const kind = noteKind(note);
    const meta = NOTE_KIND_META[kind];
    const ref = lessonForKey(note.lessonKey);
    const preview = notePreviewLine(note, kind);
    const codeBlock = kind === "code" ? noteCodeBlock(note) : null;
    const formula = kind === "formula" ? noteFormula(note) : null;
    const quote = kind === "quote" ? splitQuoteAndSource(note.body) : null;
    const vocab = kind === "vocab" ? splitVocabWordAndDefinition(note.body) : null;
    return (<div className={`nb-note-card accent-${meta.accent}`}>
      <div className="card-header">
        <span className="card-tag">{KIND_ICON[kind]} {meta.label}</span>
        {ref && (<Link className="card-lesson-link" to={lessonPath(ref.module.id, ref.lesson.id)}>
            <ModuleIcon id={ref.module.id} size={11}/> {ref.lesson.title}
          </Link>)}
        <span className="card-date">{relativeTime(note.createdAt, now)}</span>
      </div>

      {note.selectionText && (<blockquote className="card-quote">"{note.selectionText}"</blockquote>)}

      <div className="card-body">
        {isEditing ? (<div className="card-edit-form">
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} autoFocus/>
            <input type="text" placeholder="Tags (comma-separated)..." value={editTags} onChange={(e) => setEditTags(e.target.value)}/>
            <div className="edit-buttons">
              <button className="btn-cancel" onClick={onCancelEdit}>Cancel</button>
              <button className="btn-save" onClick={onSaveEdit}>Save changes</button>
            </div>
          </div>) : formula ? (<div className="card-formula-preview">
            <MBlock>{formula}</MBlock>
          </div>) : codeBlock ? (<ShikiCode code={codeBlock.code} lang={codeBlock.lang as any}/>) : quote ? (<div className="card-quote-preview">
            <QuotesIcon size={16} weight="fill" className="quote-mark"/>
            <p className="quote-text">{quote.quote}</p>
            {quote.source && <span className="quote-source">{quote.source}</span>}
          </div>) : vocab ? (<div className="card-vocab-preview">
            <span className="vocab-word">{vocab.word}</span>
            {vocab.definition && <span className="vocab-def">{vocab.definition}</span>}
          </div>) : (<p className="card-text">
            {kind === "mistake" ? <span className="card-mistake-lbl">What I misunderstood — </span> : null}
            <InlineNoteText text={preview}/>
          </p>)}
      </div>

      {!isEditing && note.tags.length > 0 && (<div className="card-tags">
          {note.tags.map((t) => (<span key={t} className="tag-badge">#{t}</span>))}
        </div>)}

      {!isEditing && (<div className="card-hover-actions">
          <button className="hover-btn" title="Edit" onClick={onStartEdit}><PencilSimpleLineIcon size={13}/></button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="hover-btn" title="Schedule review"><ClockIcon size={13}/></button>
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: "160px" }}>
              <div className="reminder-menu">
                <span className="menu-title">Schedule Review</span>
                <button onClick={() => onQuickReminder(1)}>Review Tomorrow</button>
                <button onClick={() => onQuickReminder(3)}>In 3 Days</button>
                <button onClick={() => onQuickReminder(7)}>In 1 Week</button>
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button className="hover-btn" title="More"><DotsThreeIcon size={15} weight="bold"/></button>
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: "120px" }}>
              <div className="reminder-menu">
                <button onClick={onDelete} className="danger"><TrashIcon size={12}/> Delete</button>
              </div>
            </PopoverContent>
          </Popover>
        </div>)}
    </div>);
}
function InlineNoteText({ text }: {
    text: string;
}) {
    const parts = text.split(/(\$[^$]+\$)/g);
    return (<>
      {parts.map((part, i) => part.startsWith("$") && part.endsWith("$")
            ? <M key={i}>{part.slice(1, -1)}</M>
            : <span key={i}>{part}</span>)}
    </>);
}
