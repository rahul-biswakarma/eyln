import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NotebookIcon, PushPinIcon, PencilSimpleLineIcon, SigmaIcon, CodeIcon, MicrophoneIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, SparkleIcon, ClockIcon, BookmarkSimpleIcon, CheckIcon, XIcon, CheckSquareIcon, WarningOctagonIcon, DotsThreeIcon, QuotesIcon, TranslateIcon, LightbulbIcon, BookOpenIcon, GraphIcon, GraduationCapIcon, StackIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useNotes, type Note, type NoteType } from "../../lib/notes";
import { useProgress } from "../../lib/progress";
import { useScratchpad } from "../../lib/scratchpad";
import { useBooks } from "../../lib/books";
import { useSpaces } from "../../lib/spaces";
import { useProjects } from "../../lib/projects";
import { useConversations } from "../../lib/conversations";
import { BooksView } from "./books-view";
import { GraphView } from "./graph-view";
import { SpacesView } from "./spaces-view";
import { ProjectsView } from "./projects-view";
import { allLessons, lessonPath } from "../../content/registry";
import { relativeTime } from "../../lib/stats";
import { groupByTimeline } from "../../lib/timeline";
import { noteKind, notePreviewLine, noteCodeBlock, noteFormula, NOTE_KIND_META, type NoteKind } from "../../lib/note-kind";
import { searchKnowledge, type KnowledgeResult } from "../../lib/knowledge-search";
import * as rw from "./rw-styles";
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
// ── Shared local Tailwind class strings (former .nb-* rules) ──────
const EMPTY_STATE = "text-center py-16 px-8 border border-dashed border-border rounded-[18px] max-w-[480px] my-8 mx-auto";
const EMPTY_SVG = "text-text-faint mb-4 inline-block";
const EMPTY_H4 = "font-display text-[1.05rem] font-semibold m-0 mb-2 text-text";
const EMPTY_P = "text-[0.84rem] text-text-dim leading-[1.5] m-0";
const TAG_CHIP = (active: boolean) =>
  "cursor-pointer px-[0.6rem] py-[0.2rem] rounded-xs font-mono text-[0.76rem] border transition-all duration-200 ease-brand " +
  (active ? "bg-accent-soft text-highlight border-border-glow" : "text-text-faint bg-surface border-border hover:text-text hover:border-border-bright");
// Per-note-type left-accent color (former .nb-note-card.accent-*).
const NOTE_ACCENT: Record<string, string> = {
  amber: "var(--accent)", red: "var(--bad)", violet: "#A98CFF", blue: "#5B9DFF",
  green: "var(--good)", teal: "#4FD1C5", pink: "#FF7EB6", lime: "#B4E44D", neutral: "var(--border-bright)",
};
const REMINDER_MENU_BTN = "flex items-center gap-[0.4rem] w-full bg-transparent border-none text-left px-[0.6rem] py-2 rounded-xs text-text-dim font-sans text-[0.8rem] cursor-pointer transition-[background] duration-200 ease-brand hover:bg-[rgba(255,255,255,0.05)] hover:text-text";
const HOVER_BTN = "bg-surface-2 border border-border rounded-[5px] text-text-faint p-[0.3rem] grid place-items-center cursor-pointer transition-all duration-200 ease-brand hover:text-text hover:border-border-bright hover:bg-surface";
// Knowledge is organized around learning SOURCES, not note types.
// The sidebar has only three regions: Workspace, Collections, Knowledge Graph.
const WORKSPACE_ITEMS: {
  tab: string;
  icon: React.ReactNode;
  label: string;
  count: (n: Note[], r: number) => number;
}[] = [
    { tab: "all", icon: <NotebookIcon size={16} />, label: "Recent", count: (n) => n.length },
    { tab: "pinned", icon: <PushPinIcon size={16} />, label: "Pinned", count: (n) => n.filter((x) => x.tags.includes("pinned")).length },
    { tab: "reminders", icon: <ClockIcon size={16} />, label: "Review Queue", count: (_n, r) => r },
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
  const spaces = useSpaces((s) => s.spaces);
  const projects = useProjects((s) => s.projects);
  const conversations = useConversations((s) => s.conversations);
  const streak = useMemo(() => computeStreak(lastVisited), [lastVisited]);
  const [activeTab, setActiveTab] = useState<string>("spaces");
  // Global search + deep-link focus into a specific collection item.
  const [globalQuery, setGlobalQuery] = useState("");
  const [focusTarget, setFocusTarget] = useState<{ view: "space" | "book" | "project"; id: string } | null>(null);
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
  const globalResults = useMemo(
    () => (globalQuery.trim() ? searchKnowledge(globalQuery, { notes, books, spaces, projects, conversations }) : []),
    [globalQuery, notes, books, spaces, projects, conversations]
  );
  const openResult = (r: KnowledgeResult) => {
    setGlobalQuery("");
    setFocusTarget(r.target);
    setActiveTab(r.target.view === "book" ? "books" : r.target.view === "project" ? "projects" : "spaces");
  };
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
  return (<div className={rw.shell}>

    <div className={rw.workspace}>

      <aside className={rw.sidebar}>
        <span className={rw.sidebarGroupTitle}>Workspace</span>
        <nav className={rw.sidebarLinks}>
          {WORKSPACE_ITEMS.map((item) => { const a = activeTab === item.tab; return (<button key={item.tab} className={rw.sidebarLink(a)} onClick={() => { setFocusTarget(null); setActiveTab(item.tab); }}>
            {item.icon} {item.label} <span className={rw.sidebarBadge(a)}>{item.count(notes, activeReminders.length)}</span>
          </button>); })}
        </nav>

        <span className={rw.sidebarGroupTitle}>Collections</span>
        <nav className={rw.sidebarLinks}>
          <button className={rw.sidebarLink(activeTab === "spaces")} onClick={() => { setFocusTarget(null); setActiveTab("spaces"); }}>
            <GraduationCapIcon size={16} /> Learning Spaces
          </button>
          <button className={rw.sidebarLink(activeTab === "books")} onClick={() => { setFocusTarget(null); setActiveTab("books"); }}>
            <BookOpenIcon size={16} /> Books <span className={rw.sidebarBadge(activeTab === "books")}>{books.length}</span>
          </button>
          <button className={rw.sidebarLink(activeTab === "projects")} onClick={() => { setFocusTarget(null); setActiveTab("projects"); }}>
            <StackIcon size={16} /> Projects <span className={rw.sidebarBadge(activeTab === "projects")}>{projects.length}</span>
          </button>
          <button className={rw.sidebarLink(activeTab === "scratchpad")} onClick={() => { setFocusTarget(null); setActiveTab("scratchpad"); }}>
            <CodeIcon size={16} /> Scratchpad
          </button>
        </nav>

        <span className={rw.sidebarGroupTitle}>Explore</span>
        <nav className={rw.sidebarLinks}>
          <button className={rw.sidebarLink(activeTab === "graph")} onClick={() => { setFocusTarget(null); setActiveTab("graph"); }}>
            <GraphIcon size={16} /> Knowledge Graph
          </button>
          <button className={rw.sidebarLink(activeTab === "bookmarks")} onClick={() => { setFocusTarget(null); setActiveTab("bookmarks"); }}>
            <BookmarkSimpleIcon size={16} /> Bookmarks <span className={rw.sidebarBadge(activeTab === "bookmarks")}>{bookmarkList.length}</span>
          </button>
        </nav>
      </aside>


      <main className={rw.content}>

        {globalQuery.trim() ? (<div className={rw.gsResults}>
          {globalResults.length === 0 ? (<div className={rw.empty}>
            <MagnifyingGlassIcon size={24} weight="duotone" />
            <h4 className={rw.emptyH4}>No matches</h4>
            <p className={rw.emptyP}>Nothing found across your learning spaces, books, projects, notes or conversations.</p>
          </div>) : globalResults.map((r, i) => (<button key={i} className={rw.searchHit} onClick={() => openResult(r)}>
            <span className={rw.hitIc}><ResultIcon kind={r.kind} /></span>
            <span className={rw.hitBody}>
              <span className={rw.hitKind}>{r.kind}</span>
              <span className={rw.hitText}>{r.title}</span>
              {r.detail && <span className={rw.hitBook}>{r.detail}</span>}
            </span>
            <ArrowRightIcon size={13} />
          </button>))}
        </div>) :
          activeTab === "spaces" ? (<SpacesView now={now} focusId={focusTarget?.view === "space" ? focusTarget.id : null} onConsumeFocus={() => setFocusTarget(null)} />)
            : activeTab === "projects" ? (<ProjectsView now={now} focusId={focusTarget?.view === "project" ? focusTarget.id : null} onConsumeFocus={() => setFocusTarget(null)} />)
              : activeTab === "graph" ? (<GraphView now={now} />) : activeTab === "books" ? (<BooksView now={now} focusId={focusTarget?.view === "book" ? focusTarget.id : null} onConsumeFocus={() => setFocusTarget(null)} />) : activeTab === "scratchpad" ? (<div className="flex flex-col h-full">
                <div className={rw.viewHeader}>
                  <h3 className={rw.viewHeaderH3}>Scratchpad</h3>
                  <span className={rw.viewHeaderDesc}>A sandboxed scratchpad for code snippets and math scratchwork. Auto-saved.</span>
                </div>
                <textarea className="flex-1 w-full bg-surface-inset border border-border rounded-sm p-[1.1rem] font-mono text-[0.86rem] text-text focus:outline-none resize-none" value={scratchpadText} placeholder="Write temporary scripts, paste code outlines, or jot down notes here..." onChange={(e) => setScratchpadText(e.target.value)} autoFocus />
              </div>) : activeTab === "bookmarks" ? (<div>
                <div className={rw.viewHeader}>
                  <h3 className={rw.viewHeaderH3}>Bookmarked Lessons</h3>
                  <span className={rw.viewHeaderDesc}>Flagged chapters from linear algebra, engine rendering, and math.</span>
                </div>
                {bookmarkList.length === 0 ? (<div className={EMPTY_STATE}>
                  <BookmarkSimpleIcon size={24} weight="duotone" className={EMPTY_SVG} />
                  <h4 className={EMPTY_H4}>No Bookmarks Saved</h4>
                  <p className={EMPTY_P}>Click the bookmark icon in any course lesson to save reference material here.</p>
                </div>) : (<div className="flex flex-col gap-[0.6rem]">
                  {bookmarkList.map(([key, at]) => {
                    const ref = lessonForKey(key);
                    if (!ref)
                      return null;
                    return (<Link key={key} className="group relative flex items-center gap-4 bg-surface border border-border rounded-sm px-[1.1rem] py-[0.8rem] text-text no-underline transition-all duration-200 ease-brand hover:-translate-y-px hover:border-border-bright hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]" to={lessonPath(ref.module.id, ref.lesson.id)}>
                      <span className="text-accent"><ModuleIcon id={ref.module.id} size={20} /></span>
                      <div className="flex-1">
                        <h4 className="font-display text-[0.9rem] m-0 mb-[0.15rem]">{ref.lesson.title}</h4>
                        <span className="text-[0.76rem] text-text-faint">{ref.module.title}</span>
                      </div>
                      <span className="font-mono text-[0.72rem] text-text-faint mr-6">{relativeTime(at, now)}</span>
                      <button className="absolute right-[0.8rem] top-1/2 -translate-y-1/2 bg-transparent border-none text-text-faint cursor-pointer grid place-items-center w-5 h-5 rounded-[4px] hover:text-accent hover:bg-[rgba(255,255,255,0.05)]" title="Remove bookmark" onClick={(e) => { e.preventDefault(); toggleBookmark(key); }}>
                        <XIcon size={12} />
                      </button>
                    </Link>);
                  })}
                </div>)}
              </div>) : activeTab === "reminders" ? (<div>
                <div className={rw.viewHeader}>
                  <h3 className={rw.viewHeaderH3}>Review Queue</h3>
                  <span className={rw.viewHeaderDesc}>Spaced repetition checklist for formulas, highlights, vocabulary, and concepts.</span>
                </div>
                {activeReminders.length === 0 ? (<div className={EMPTY_STATE}>
                  <CheckSquareIcon size={24} weight="duotone" className={EMPTY_SVG} />
                  <h4 className={EMPTY_H4}>No Pending Reviews</h4>
                  <p className={EMPTY_P}>Your queue is completely clear. Good job! Add review tasks from any note card below.</p>
                </div>) : (<div className="flex flex-col gap-[0.6rem]">
                  {activeReminders.map((r) => {
                    const overdue = r.dueAt <= now;
                    const ref = lessonForKey(r.lessonKey);
                    return (<div className={`flex items-center gap-4 bg-surface border border-border rounded-sm px-[1.1rem] py-[0.8rem] ${overdue ? "border-l-[3px] border-l-warn" : ""}`} key={r.id}>
                      <span className="text-[1.25rem]">{overdue ? "🔔" : "⏰"}</span>
                      <div className="flex-1">
                        <p className="m-0 mb-[0.2rem] text-[0.88rem] text-text">{r.note}</p>
                        <span className="text-[0.76rem] text-text-faint">
                          {overdue ? "Due: " : "Review in: "}
                          {relativeTime(overdue ? r.dueAt : now, overdue ? now : r.dueAt)}
                          {ref && ` · ${ref.module.title}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {ref && <Link className="text-[0.8rem] text-accent no-underline mr-[0.4rem] hover:underline" to={lessonPath(ref.module.id, ref.lesson.id)}>Open Lesson</Link>}
                        <button className="bg-surface-2 border border-border rounded-[4px] px-2 py-[0.3rem] text-[0.74rem] text-text-dim cursor-pointer inline-flex items-center gap-[0.25rem] transition-all duration-200 ease-brand hover:bg-accent-soft hover:text-highlight hover:border-border-glow" onClick={() => completeReminder(r.id)}><CheckIcon size={12} /> Done</button>
                        <button className="bg-surface-2 border border-border rounded-[4px] px-2 py-[0.3rem] text-[0.74rem] text-text-dim cursor-pointer inline-flex items-center gap-[0.25rem] transition-all duration-200 ease-brand hover:bg-[rgba(255,92,92,0.1)] hover:text-[#ff5c5c] hover:border-[rgba(255,92,92,0.2)]" onClick={() => deleteReminder(r.id)}><TrashIcon size={12} /></button>
                      </div>
                    </div>);
                  })}
                </div>)}
              </div>) : (<div className={rw.notesView}>
                <div className={rw.workspaceHeader}>
                  <div className={rw.titleRow}>
                    <h1 className={rw.titleRowH1}>Knowledge</h1>
                    <div className={`${rw.statsQuiet} [&_svg]:mr-[0.25rem] [&_svg]:text-text-faint`}>
                      <span className="inline-flex items-center"><SparkleIcon size={12} weight="fill" style={{ color: "var(--accent)" }} /> {streak}d streak</span>
                      <span className="inline-flex items-center text-[rgba(255,255,255,0.15)]">•</span>
                      <span className="inline-flex items-center"><NotebookIcon size={12} /> {notes.length} notes</span>
                      <span className="inline-flex items-center text-[rgba(255,255,255,0.15)]">•</span>
                      <span className="inline-flex items-center"><BookmarkSimpleIcon size={12} /> {bookmarkList.length} saved</span>
                      <span className="inline-flex items-center text-[rgba(255,255,255,0.15)]">•</span>
                      <span className="inline-flex items-center"><ClockIcon size={12} /> {activeReminders.length} review</span>
                    </div>
                  </div>


                  <div className={rw.toolbar}>
                    <div className={rw.search}>
                      <MagnifyingGlassIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
                      <input type="text" className="w-full bg-surface-inset border border-border rounded-sm py-[0.45rem] pr-3 pl-8 font-sans text-[0.84rem] text-text focus:outline-none transition-all duration-200 ease-brand focus:border-border-glow focus:shadow-[0_0_10px_rgba(255,176,0,0.1)]" placeholder="Search your knowledge..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button className="inline-flex items-center gap-[0.35rem] bg-accent text-on-accent border-none rounded-sm px-3 py-[0.45rem] font-sans text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 ease-brand hover:bg-highlight hover:shadow-[0_0_0_3px_var(--accent-soft)]" onClick={() => setIsCapturing(true)}>
                        <PlusIcon size={13} weight="bold" /> Capture
                      </button>
                    </div>
                  </div>


                  {allTags.length > 0 && (<div className={rw.tagChips}>
                    <span className={TAG_CHIP(selectedTag === null)} onClick={() => setSelectedTag(null)}>#all</span>
                    {allTags.map((tag) => (<span key={tag} className={TAG_CHIP(selectedTag === tag)} onClick={() => setSelectedTag(tag)}>#{tag}</span>))}
                  </div>)}
                </div>

                {filteredNotes.length === 0 ? (<div className={EMPTY_STATE}>
                  <NotebookIcon size={24} weight="duotone" className={EMPTY_SVG} />
                  <h4 className={EMPTY_H4}>Nothing Here Yet</h4>
                  <p className={EMPTY_P}>Pin explanations inside course sidebars, or use the Capture button above to add your first entry.</p>
                </div>) : (<div className="py-0 px-[1.4rem] flex flex-col gap-[1.4rem]">
                  {timelineGroups.map(([label, group]) => (<section key={label} className="flex flex-col gap-2">
                    <h5 className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-text-faint m-0 pb-[0.3rem] border-b border-border">{label}</h5>
                    <div className="grid grid-cols-1 gap-[0.4rem]">
                      {group.map((note) => (<NoteCard key={note.id} note={note} now={now} isEditing={editingNoteId === note.id} editBody={editBody} editTags={editTags} setEditBody={setEditBody} setEditTags={setEditTags} onStartEdit={() => handleStartEdit(note)} onCancelEdit={() => setEditingNoteId(null)} onSaveEdit={() => handleSaveEdit(note.id)} onDelete={() => deleteNote(note.id)} onQuickReminder={(days) => handleQuickReminder(note, days)} />))}
                    </div>
                  </section>))}
                </div>)}
              </div>)}
      </main>
    </div>

    {isCapturing && (<CaptureWorkspace onClose={() => setIsCapturing(false)} onSave={handleSaveCapture} />)}
  </div>);
}
function ResultIcon({ kind }: { kind: KnowledgeResult["kind"] }) {
  switch (kind) {
    case "space": return <GraduationCapIcon size={14} />;
    case "book": return <BookOpenIcon size={14} />;
    case "project": return <StackIcon size={14} />;
    case "formula": return <SigmaIcon size={14} />;
    case "mistake": return <WarningOctagonIcon size={14} />;
    case "code": return <CodeIcon size={14} />;
    case "quote": return <QuotesIcon size={14} />;
    case "vocab": return <TranslateIcon size={14} />;
    case "ai":
    case "conversation": return <SparkleIcon size={14} />;
    default: return <NotebookIcon size={14} />;
  }
}
const KIND_ICON: Record<NoteKind, React.ReactNode> = {
  ai: <SparkleIcon size={11} weight="fill" />,
  formula: <SigmaIcon size={11} weight="bold" />,
  code: <CodeIcon size={11} weight="bold" />,
  mistake: <WarningOctagonIcon size={11} weight="bold" />,
  voice: <MicrophoneIcon size={11} weight="bold" />,
  quote: <QuotesIcon size={11} weight="bold" />,
  vocab: <TranslateIcon size={11} weight="bold" />,
  idea: <LightbulbIcon size={11} weight="bold" />,
  note: <PencilSimpleLineIcon size={11} />,
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
  return (<div className="group relative bg-surface border border-border border-l-2 border-l-[var(--type-accent)] rounded-sm px-[0.9rem] py-[0.7rem] transition-all duration-200 ease-brand hover:border-border-bright" style={{ ["--type-accent" as any]: NOTE_ACCENT[meta.accent] ?? "var(--border)" }}>
    <div className="flex items-center gap-2 text-[0.68rem] text-text-faint mb-[0.4rem]">
      <span className="inline-flex items-center gap-[0.25rem] text-[var(--type-accent)] font-medium uppercase tracking-[0.03em]">{KIND_ICON[kind]} {meta.label}</span>
      {ref && (<Link className="text-text-dim no-underline inline-flex items-center gap-[0.25rem] hover:text-accent hover:underline" to={lessonPath(ref.module.id, ref.lesson.id)}>
        <ModuleIcon id={ref.module.id} size={11} /> {ref.lesson.title}
      </Link>)}
      <span className="ml-auto font-mono">{relativeTime(note.createdAt, now)}</span>
    </div>

    {note.selectionText && (<blockquote className="border-l-2 border-border-bright pl-[0.7rem] m-0 mb-[0.5rem] italic text-[0.82rem] text-text-faint leading-[1.4]">"{note.selectionText}"</blockquote>)}

    <div>
      {isEditing ? (<div>
        <textarea className="w-full bg-surface-inset border border-border rounded-sm p-[0.6rem] font-sans text-[0.88rem] text-text focus:outline-none mb-2" value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} autoFocus />
        <input type="text" className="w-full bg-surface-inset border border-border rounded-sm px-[0.6rem] py-[0.45rem] font-mono text-[0.78rem] text-text focus:outline-none mb-3" placeholder="Tags (comma-separated)..." value={editTags} onChange={(e) => setEditTags(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="bg-surface-2 border border-border rounded-[4px] px-3 py-[0.35rem] text-[0.78rem] text-text-dim cursor-pointer" onClick={onCancelEdit}>Cancel</button>
          <button className="bg-accent text-[var(--background)] border-none rounded-[4px] px-3 py-[0.35rem] text-[0.78rem] font-medium cursor-pointer hover:bg-accent-bright" onClick={onSaveEdit}>Save changes</button>
        </div>
      </div>) : formula ? (<div className="py-[0.3rem] text-[0.95rem]">
        <MBlock>{formula}</MBlock>
      </div>) : codeBlock ? (<div className="[&_.codeblock]:mt-[0.1rem] [&_.codeblock]:mb-0 [&_.codeblock]:text-[0.78rem] [&_.codeblock]:max-h-[140px] [&_.codeblock]:overflow-auto"><ShikiCode code={codeBlock.code} lang={codeBlock.lang as any} /></div>) : quote ? (<div className="relative pl-[1.6rem]">
        <QuotesIcon size={16} weight="fill" className="absolute left-0 top-[0.1rem] text-[var(--type-accent)] opacity-60" />
        <p className="m-0 mb-[0.3rem] font-display italic text-[0.94rem] text-text leading-[1.5]">{quote.quote}</p>
        {quote.source && <span className="font-mono text-[0.72rem] text-text-faint">{quote.source}</span>}
      </div>) : vocab ? (<div className="flex flex-col gap-[0.15rem]">
        <span className="font-display text-base font-semibold text-[var(--type-accent)]">{vocab.word}</span>
        {vocab.definition && <span className="text-[0.84rem] text-text-dim leading-[1.5]">{vocab.definition}</span>}
      </div>) : (<p className="m-0 text-[0.86rem] text-text-dim leading-[1.5] whitespace-pre-wrap overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
        {kind === "mistake" ? <span className="text-bad font-semibold text-[0.78rem]">What I misunderstood — </span> : null}
        <InlineNoteText text={preview} />
      </p>)}
    </div>

    {!isEditing && note.tags.length > 0 && (<div className="flex flex-wrap gap-[0.3rem] mt-[0.5rem]">
      {note.tags.map((t) => (<span key={t} className="font-mono text-[0.68rem] text-accent bg-[rgba(255,176,0,0.05)] px-[0.35rem] py-[0.05rem] rounded-[4px]">#{t}</span>))}
    </div>)}

    {!isEditing && (<div className="absolute top-[0.6rem] right-[0.7rem] flex items-center gap-[0.2rem] opacity-0 transition-opacity duration-150 ease-linear group-hover:opacity-100">
      <button className={HOVER_BTN} title="Edit" onClick={onStartEdit}><PencilSimpleLineIcon size={13} /></button>
      <Popover>
        <PopoverTrigger asChild>
          <button className={HOVER_BTN} title="Schedule review"><ClockIcon size={13} /></button>
        </PopoverTrigger>
        <PopoverContent align="end" style={{ width: "160px" }}>
          <div className="flex flex-col gap-[0.2rem]">
            <span className="font-mono text-[0.64rem] uppercase text-text-faint tracking-[0.06em] px-[0.5rem] pb-[0.4rem]">Schedule Review</span>
            <button className={REMINDER_MENU_BTN} onClick={() => onQuickReminder(1)}>Review Tomorrow</button>
            <button className={REMINDER_MENU_BTN} onClick={() => onQuickReminder(3)}>In 3 Days</button>
            <button className={REMINDER_MENU_BTN} onClick={() => onQuickReminder(7)}>In 1 Week</button>
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <button className={HOVER_BTN} title="More"><DotsThreeIcon size={15} weight="bold" /></button>
        </PopoverTrigger>
        <PopoverContent align="end" style={{ width: "120px" }}>
          <div className="flex flex-col gap-[0.2rem]">
            <button onClick={onDelete} className={`${REMINDER_MENU_BTN} hover:!text-[#ff5c5c] hover:!bg-[rgba(255,92,92,0.1)]`}><TrashIcon size={12} /> Delete</button>
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
