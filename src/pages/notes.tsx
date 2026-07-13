import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Notebook, PushPin, PencilSimpleLine, Code as CodeIcon, Infinity as InfinityIcon,
  Microphone, Plus, Trash, MagnifyingGlass, Sparkle, Clock,
  BookmarkSimple, Check, Note as NoteIcon, X, CheckSquare, WarningOctagon
} from "@phosphor-icons/react";
import { useNotes, type Note } from "../lib/notes";
import { useProgress } from "../lib/progress";
import { allLessons, lessonPath } from "../content/registry";
import { relativeTime } from "../lib/stats";
import { ModuleIcon } from "../components/module-icon";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui";

function lessonForKey(key?: string) {
  if (!key) return undefined;
  return allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
}

// Compute active streak based on lastVisited timestamps
function computeStreak(lastVisited: Record<string, number>) {
  const timestamps = Object.values(lastVisited);
  if (timestamps.length === 0) return 0;

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

export function Notes() {
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
  const streak = useMemo(() => computeStreak(lastVisited), [lastVisited]);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Custom states for editing/creating
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editTags, setEditTags] = useState("");

  // Quick Create Dialog State
  const [isCreating, setIsCreating] = useState(false);
  const [newBody, setNewBody] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newType, setNewType] = useState<"custom" | "formula" | "code" | "mistake">("custom");
  const [newLessonKey, setNewLessonKey] = useState<string>("");

  // Voice Note Recording mock state
  const [isRecording, setIsRecording] = useState(false);
  const [waveWidths, setWaveWidths] = useState<number[]>([]);

  // Scratchpad content state
  const [scratchpadText, setScratchpadText] = useState(() => {
    return localStorage.getItem("eyln-scratchpad") ?? "";
  });

  const now = Date.now();

  useEffect(() => {
    localStorage.setItem("eyln-scratchpad", scratchpadText);
  }, [scratchpadText]);

  // Voice recorder simulation
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setWaveWidths(Array.from({ length: 15 }, () => Math.floor(Math.random() * 25) + 5));
      }, 100);
    } else {
      setWaveWidths([]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const bookmarkList = Object.entries(bookmarks).sort((a, b) => b[1] - a[1]);
  const activeReminders = reminders.filter((r) => !r.done).sort((a, b) => a.dueAt - b.dueAt);

  // Filter notes based on active sidebar tab
  const tabFilteredNotes = useMemo(() => {
    switch (activeTab) {
      case "pinned":
        // Pinned notes
        return notes.filter((n) => n.tags.includes("pinned"));
      case "custom":
        // Custom learner notes
        return notes.filter((n) => !n.tags.includes("pinned") && !n.tags.includes("mistake"));
      case "ai":
        // AI pinned explanations
        return notes.filter((n) => n.tags.includes("pinned"));
      case "formulas":
        // Pinned formulas or tagged formula
        return notes.filter((n) => n.tags.includes("formula") || n.body.includes("$$") || n.body.includes("$"));
      case "mistakes":
        // Mistakes tagged items
        return notes.filter((n) => n.tags.includes("mistake"));
      case "all":
      default:
        return notes;
    }
  }, [notes, activeTab]);

  // Apply search query and filters
  const filteredNotes = useMemo(() => {
    return tabFilteredNotes.filter((n) => {
      // Filter by tag
      if (selectedTag && !n.tags.includes(selectedTag)) return false;

      // Filter by type
      if (selectedType !== "all") {
        if (selectedType === "ai" && !n.tags.includes("pinned")) return false;
        if (selectedType === "custom" && n.tags.includes("pinned")) return false;
        if (selectedType === "formula" && !n.tags.includes("formula") && !n.body.includes("$$")) return false;
        if (selectedType === "mistake" && !n.tags.includes("mistake")) return false;
      }

      // Filter by text search
      if (searchQuery.trim()) {
        const text = (n.body + " " + (n.selectionText ?? "") + " " + n.tags.join(" ")).toLowerCase();
        if (!text.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [tabFilteredNotes, selectedTag, selectedType, searchQuery]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Auto-create a mock voice note transcription
    addNote({
      body: "🎙️ **Audio Note Transcription:** Remember that the cross product of two orthogonal unit vectors yields a third vector that is perpendicular to both, satisfying the right-hand rule system.",
      tags: ["audio", "linear-algebra", "formula"],
      lessonKey: newLessonKey || undefined
    });
  };

  const handleQuickNote = (type: "custom" | "formula" | "code" | "mistake") => {
    setNewType(type);
    if (type === "formula") {
      setNewBody("$$\n\\vec{a} \\times \\vec{b} = \\|\\vec{a}\\| \\|\\vec{b}\\| \\sin(\\theta) \\hat{n}\n$$");
      setNewTags("formula, math");
    } else if (type === "code") {
      setNewBody("```javascript\nfunction dotProduct(a, b) {\n  return a.x * b.x + a.y * b.y + a.z * b.z;\n}\n```");
      setNewTags("code, implementation");
    } else if (type === "mistake") {
      setNewBody("Mistake: Subtracted coordinates in wrong order when computing displacement vector.\n\nCorrection: Displacement is always target - origin (B - A), not origin - target.");
      setNewTags("mistake, debugging");
    } else {
      setNewBody("");
      setNewTags("");
    }
    setIsCreating(true);
  };

  const handleSaveNewNote = () => {
    if (!newBody.trim()) return;
    const tagsArr = newTags.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0);
    if (newType !== "custom" && !tagsArr.includes(newType)) {
      tagsArr.push(newType);
    }
    addNote({
      body: newBody.trim(),
      tags: tagsArr,
      lessonKey: newLessonKey || undefined
    });
    setNewBody("");
    setNewTags("");
    setNewLessonKey("");
    setIsCreating(false);
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

  return (
    <div className="notebook-shell">
      {/* Editorial Hero Banner */}
      <header className="nb-hero">
        <div className="nb-hero-header">
          <span className="nb-kicker">Personal Engineering Companion</span>
          <h1>Engineering Notebook</h1>
          <p className="nb-sub">
            Your personal engineering lexicon. Automatically captures highlights, pinned derivations, mistakes, and scheduled reviews.
          </p>
        </div>

        {/* Learning Statistics Display */}
        <div className="nb-stats">
          <div className="nb-stat-card">
            <span className="lbl">Streak</span>
            <span className="val"><Plus size={10} weight="bold" style={{ color: "var(--accent)", verticalAlign: "middle" }} /> {streak} days</span>
            <span className="desc">Active study chain</span>
          </div>
          <div className="nb-stat-card">
            <span className="lbl">Captured</span>
            <span className="val">{notes.length} notes</span>
            <span className="desc">Formulas, code, & AI insights</span>
          </div>
          <div className="nb-stat-card">
            <span className="lbl">Bookmarks</span>
            <span className="val">{bookmarkList.length} saves</span>
            <span className="desc">Flagged course chapters</span>
          </div>
          <div className="nb-stat-card">
            <span className="lbl">Review Queue</span>
            <span className="val">{activeReminders.length} items</span>
            <span className="desc">Spaced repetition queue</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className="nb-workspace">
        {/* Left Navigation Sidebar */}
        <aside className="nb-sidebar">
          <span className="sidebar-group-title">Knowledge Base</span>
          <nav className="sidebar-links">
            <button className={`sidebar-link ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              <Notebook size={16} /> All Notes <span className="badge">{notes.length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "pinned" ? "active" : ""}`} onClick={() => setActiveTab("pinned")}>
              <PushPin size={16} /> Favorites & Pinned <span className="badge">{notes.filter((n) => n.tags.includes("pinned")).length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}>
              <PencilSimpleLine size={16} /> My Notes <span className="badge">{notes.filter((n) => !n.tags.includes("pinned") && !n.tags.includes("mistake")).length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")}>
              <Sparkle size={16} /> AI Explanations <span className="badge">{notes.filter((n) => n.tags.includes("pinned")).length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "formulas" ? "active" : ""}`} onClick={() => setActiveTab("formulas")}>
              <InfinityIcon size={16} /> Formula Library <span className="badge">{notes.filter((n) => n.tags.includes("formula") || n.body.includes("$$")).length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "bookmarks" ? "active" : ""}`} onClick={() => setActiveTab("bookmarks")}>
              <BookmarkSimple size={16} /> Bookmarked Lessons <span className="badge">{bookmarkList.length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "reminders" ? "active" : ""}`} onClick={() => setActiveTab("reminders")}>
              <Clock size={16} /> Review Queue <span className="badge">{activeReminders.length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "mistakes" ? "active" : ""}`} onClick={() => setActiveTab("mistakes")}>
              <WarningOctagon size={16} /> My Mistakes <span className="badge">{notes.filter((n) => n.tags.includes("mistake")).length}</span>
            </button>
            <button className={`sidebar-link ${activeTab === "scratchpad" ? "active" : ""}`} onClick={() => setActiveTab("scratchpad")}>
              <CodeIcon size={16} /> Scratchpad
            </button>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <main className="nb-content">
          {activeTab === "scratchpad" ? (
            /* Scratchpad Workspace View */
            <div className="nb-scratchpad">
              <div className="scratchpad-header">
                <h3>Scratchpad</h3>
                <span className="desc">A sandboxed scratchpad for code snippets and math scratchwork. Auto-saved.</span>
              </div>
              <textarea
                value={scratchpadText}
                placeholder="Write temporary scripts, paste code outlines, or jot down notes here..."
                onChange={(e) => setScratchpadText(e.target.value)}
                autoFocus
              />
            </div>
          ) : activeTab === "bookmarks" ? (
            /* Bookmarked Lessons View */
            <div className="nb-bookmarks-view">
              <div className="view-header">
                <h3>Bookmarked Lessons</h3>
                <span className="desc">Flagged chapters from linear algebra, engine rendering, and math.</span>
              </div>
              {bookmarkList.length === 0 ? (
                <div className="nb-empty-state">
                  <BookmarkSimple size={24} weight="duotone" />
                  <h4>No Bookmarks Saved</h4>
                  <p>Click the bookmark icon in any course lesson to save reference material here.</p>
                </div>
              ) : (
                <div className="nb-timeline">
                  {bookmarkList.map(([key, at]) => {
                    const ref = lessonForKey(key);
                    if (!ref) return null;
                    return (
                      <Link key={key} className="nb-bookmark-card hover" to={lessonPath(ref.module.id, ref.lesson.id)}>
                        <span className="ic"><ModuleIcon id={ref.module.id} size={20} /></span>
                        <div className="meta">
                          <h4>{ref.lesson.title}</h4>
                          <span className="module">{ref.module.title}</span>
                        </div>
                        <span className="when">{relativeTime(at, now)}</span>
                        <button
                          className="remove-btn"
                          title="Remove bookmark"
                          onClick={(e) => { e.preventDefault(); toggleBookmark(key); }}
                        >
                          <X size={12} />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "reminders" ? (
            /* Reminders Review Queue View */
            <div className="nb-reminders-view">
              <div className="view-header">
                <h3>Review Queue</h3>
                <span className="desc">Spaced repetition checklist for formulas, highlights, and concepts.</span>
              </div>
              {activeReminders.length === 0 ? (
                <div className="nb-empty-state">
                  <CheckSquare size={24} weight="duotone" />
                  <h4>No Pending Reviews</h4>
                  <p>Your queue is completely clear. Good job! Add review tasks from any note card below.</p>
                </div>
              ) : (
                <div className="nb-timeline">
                  {activeReminders.map((r) => {
                    const overdue = r.dueAt <= now;
                    const ref = lessonForKey(r.lessonKey);
                    return (
                      <div className={`nb-reminder-card ${overdue ? "overdue" : ""}`} key={r.id}>
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
                          <button className="btn-done" onClick={() => completeReminder(r.id)}><Check size={12} /> Done</button>
                          <button className="btn-del" onClick={() => deleteReminder(r.id)}><Trash size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Regular Notes Feed Timeline */
            <div className="nb-notes-view">
              {/* Search & Filtering Toolbar */}
              <div className="nb-toolbar">
                <div className="nb-search">
                  <MagnifyingGlass size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search engineering logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-selects">
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="custom">Learner Notes</option>
                    <option value="ai">AI Concepts</option>
                    <option value="formula">Formulas</option>
                    <option value="mistake">Mistakes</option>
                  </select>
                </div>
              </div>

              {/* Tag filtering chips */}
              {allTags.length > 0 && (
                <div className="nb-tag-chips">
                  <span className={`chip ${selectedTag === null ? "active" : ""}`} onClick={() => setSelectedTag(null)}>#all</span>
                  {allTags.map((tag) => (
                    <span key={tag} className={`chip ${selectedTag === tag ? "active" : ""}`} onClick={() => setSelectedTag(tag)}>#{tag}</span>
                  ))}
                </div>
              )}

              {filteredNotes.length === 0 ? (
                <div className="nb-empty-state">
                  <Notebook size={24} weight="duotone" />
                  <h4>No Notes Found</h4>
                  <p>Pin explanations inside course sidebars or click the floating action button to create your first card.</p>
                </div>
              ) : (
                <div className="nb-notes-list">
                  {filteredNotes.map((note) => {
                    const ref = lessonForKey(note.lessonKey);
                    const isEditing = editingNoteId === note.id;
                    const isAI = note.tags.includes("pinned");

                    return (
                      <div className={`nb-note-card ${isAI ? "ai" : ""}`} key={note.id}>
                        {/* Note Header / Meta */}
                        <div className="card-header">
                          <span className="card-tag">
                            {isAI ? <Sparkle size={10} weight="fill" /> : <NoteIcon size={10} />}
                            {isAI ? "AI Insight" : "Note"}
                          </span>

                          {ref && (
                            <Link className="card-lesson-link" to={lessonPath(ref.module.id, ref.lesson.id)}>
                              <ModuleIcon id={ref.module.id} size={11} /> {ref.lesson.title}
                            </Link>
                          )}

                          <span className="card-date">{relativeTime(note.createdAt, now)}</span>
                        </div>

                        {/* Quoted Highlighted selection if exists */}
                        {note.selectionText && (
                          <blockquote className="card-quote">
                            “{note.selectionText}”
                          </blockquote>
                        )}

                        {/* Note Body */}
                        <div className="card-body">
                          {isEditing ? (
                            <div className="card-edit-form">
                              <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                rows={4}
                                autoFocus
                              />
                              <input
                                type="text"
                                placeholder="Tags (comma-separated)..."
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                              />
                              <div className="edit-buttons">
                                <button className="btn-cancel" onClick={() => setEditingNoteId(null)}>Cancel</button>
                                <button className="btn-save" onClick={() => handleSaveEdit(note.id)}>Save changes</button>
                              </div>
                            </div>
                          ) : (
                            <p className="card-text">{note.body}</p>
                          )}
                        </div>

                        {/* Card tags display */}
                        {!isEditing && note.tags.length > 0 && (
                          <div className="card-tags">
                            {note.tags.map((t) => (
                              <span key={t} className="tag-badge">#{t}</span>
                            ))}
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        {!isEditing && (
                          <div className="card-footer">
                            <button className="foot-btn" onClick={() => handleStartEdit(note)}>Edit</button>

                            {/* Spaced repetition reminder creation */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="foot-btn">Review Queue</button>
                              </PopoverTrigger>
                              <PopoverContent align="start" style={{ width: "160px" }}>
                                <div className="reminder-menu">
                                  <span className="menu-title">Schedule Review</span>
                                  <button onClick={() => handleQuickReminder(note, 1)}>Review Tomorrow</button>
                                  <button onClick={() => handleQuickReminder(note, 3)}>In 3 Days</button>
                                  <button onClick={() => handleQuickReminder(note, 7)}>In 1 Week</button>
                                </div>
                              </PopoverContent>
                            </Popover>

                            <button className="foot-btn danger" onClick={() => deleteNote(note.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) Menu */}
      <div className="nb-fab-container">
        <Popover>
          <PopoverTrigger asChild>
            <button className="nb-fab" aria-label="Add concept">
              <Plus size={20} weight="bold" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" style={{ width: "180px", marginBottom: "8px" }}>
            <div className="fab-menu">
              <button onClick={() => handleQuickNote("custom")}>📝 Quick Note</button>
              <button onClick={() => handleQuickNote("formula")}>🧮 Add Formula</button>
              <button onClick={() => handleQuickNote("code")}>💻 Code Snippet</button>
              <button onClick={() => handleQuickNote("mistake")}>⚠️ Log Mistake</button>
              <button onClick={handleStartRecording}>🎙️ Record Voice Note</button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick Create Dialog */}
      {isCreating && (
        <div className="custom-dialog-overlay" onClick={() => setIsCreating(false)}>
          <div className="custom-dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Create Notebook Card</h3>
              <button className="close-btn" onClick={() => setIsCreating(false)}><X size={15} /></button>
            </div>

            <div className="dialog-form">
              <label>Topic / Concept</label>
              <textarea
                placeholder="Write formula, explanation, or code..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={5}
                autoFocus
              />

              <label>Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. math, projection, wgsl"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />

              <label>Lesson Context (Optional)</label>
              <select value={newLessonKey} onChange={(e) => setNewLessonKey(e.target.value)}>
                <option value="">No context</option>
                {allLessons.map((l) => (
                  <option key={l.module.id + l.lesson.id} value={`${l.module.id}/${l.lesson.id}`}>
                    {l.lesson.title} ({l.module.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="dialog-footer">
              <button className="btn-cancel" onClick={() => setIsCreating(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveNewNote} disabled={!newBody.trim()}>Add Card</button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Note Recording overlay */}
      {isRecording && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog-content recording" style={{ width: "320px", textAlign: "center" }}>
            <div className="recording-header">
              <Microphone size={32} weight="fill" className="recording-icon" />
              <h3>Recording Audio</h3>
              <p>Companion is listening to transcribing speech...</p>
            </div>
            <div className="recording-wave">
              {waveWidths.map((width, idx) => (
                <span key={idx} className="wave-bar" style={{ height: `${width}px` }} />
              ))}
            </div>
            <button className="btn-stop-record" onClick={handleStopRecording}>Stop & Transcribe</button>
          </div>
        </div>
      )}
    </div>
  );
}
