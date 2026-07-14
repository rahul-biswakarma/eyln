import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  NotePencilIcon, SigmaIcon, WarningOctagonIcon, SparkleIcon, CodeIcon, BookmarkSimpleIcon,
  ClockIcon, FireIcon, CaretLeftIcon, PlusIcon, TrashIcon, DotsThreeIcon, GraduationCapIcon,
  StackIcon, CheckCircleIcon, ArrowRightIcon, ChatCircleDotsIcon,
} from "@phosphor-icons/react";
import { useNotes, type Note } from "../../lib/notes";
import { useSpaces, type SpaceKind } from "../../lib/spaces";
import { useConversations, type Conversation } from "../../lib/conversations";
import { useProgress } from "../../lib/progress";
import {
  unifiedSpaces, capturesForSpace, spaceStats, groupNotesByLesson, spaceTimeline,
  conversationsForSpace, bookmarksForSpace, type UnifiedSpace, type SpaceCaptures, type SpaceStats, type SpaceEvent,
} from "../../lib/spaces-model";
import { allLessons, lessonPath } from "../../content/registry";
import { relativeTime } from "../../lib/stats";
import { relativeDay, formatDate } from "../../lib/reading";
import { noteKind } from "../../lib/note-kind";
import { ModuleIcon } from "../../components/module-icon";
import { MBlock } from "../../components/math";
import { CollectionCapture, type CaptureContext } from "../../components/collection-capture";
import { Tabs, TabsList, TabsTrigger, TabsContent, Popover, PopoverTrigger, PopoverContent } from "../../components/ui";
import * as rw from "./rw-styles";

const KIND_LABEL: Record<SpaceKind, string> = {
  course: "Course", playlist: "Playlist", subject: "Subject", topic: "Topic", other: "Space",
};

function SpaceIcon({ space, size = 20 }: { space: UnifiedSpace; size?: number }) {
  if (space.kind === "module" && space.moduleId) return <ModuleIcon id={space.moduleId} size={size} />;
  return <GraduationCapIcon size={size} weight="duotone" />;
}

export function SpacesView({ now, focusId, onConsumeFocus }: { now: number; focusId?: string | null; onConsumeFocus?: () => void }) {
  const notes = useNotes((s) => s.notes);
  const customSpaces = useSpaces((s) => s.spaces);
  const addSpace = useSpaces((s) => s.addSpace);
  const conversations = useConversations((s) => s.conversations);
  const done = useProgress((s) => s.done);
  const bookmarks = useNotes((s) => s.bookmarks);

  const spaces = useMemo(() => unifiedSpaces(customSpaces), [customSpaces]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState<SpaceKind>("course");

  // Honor a focus request from global search (open a specific space).
  const effectiveId = focusId ?? selectedId;
  const selected = effectiveId ? spaces.find((s) => s.id === effectiveId) ?? null : null;

  if (selected) {
    return (
      <SpaceDetail
        space={selected}
        now={now}
        onBack={() => { setSelectedId(null); onConsumeFocus?.(); }}
      />
    );
  }

  // Only surface module spaces that have activity, plus all custom spaces.
  const stats = new Map<string, SpaceStats>();
  const caps = new Map<string, SpaceCaptures>();
  for (const s of spaces) {
    const c = capturesForSpace(s, notes);
    caps.set(s.id, c);
    stats.set(s.id, spaceStats(s, c, conversations, bookmarks, done, customSpaces.find((cs) => cs.id === s.id), now));
  }
  const visible = spaces.filter((s) => {
    if (s.kind === "custom") return true;
    const st = stats.get(s.id)!;
    return (st.progress ?? 0) > 0 || st.noteCount > 0 || st.formulaCount > 0 || st.mistakeCount > 0 || st.aiCount > 0 || st.bookmarkCount > 0;
  });

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    const id = addSpace({ title: t, kind: newKind });
    setNewTitle(""); setAdding(false); setSelectedId(id);
  };

  return (
    <div className={rw.library}>
      <header className={rw.libHeader}>
        <div className="rw-lib-title">
          <h1 className={rw.libTitleH1}>Learning Spaces</h1>
          <span className={rw.libSub}>Everything you're learning, organized by source</span>
        </div>
        <button className={rw.captureBtn} onClick={() => setAdding((v) => !v)}><PlusIcon size={13} weight="bold" /> New Space</button>
      </header>

      {adding && (
        <div className={rw.newspace}>
          <input className={rw.input} autoFocus placeholder="Space name — CS50, a playlist, a topic…" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <select className={rw.select} value={newKind} onChange={(e) => setNewKind(e.target.value as SpaceKind)}>
            {(Object.keys(KIND_LABEL) as SpaceKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
          <button className={rw.formSave} disabled={!newTitle.trim()} onClick={handleAdd}>Create</button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className={rw.empty}>
          <GraduationCapIcon size={26} weight="duotone" />
          <h4 className={rw.emptyH4}>No active spaces yet</h4>
          <p className={rw.emptyP}>Study a curriculum module or create a space for anything you're learning elsewhere.</p>
        </div>
      ) : (
        <div className={rw.grid}>
          {visible.map((s) => (
            <SpaceCard key={s.id} space={s} stats={stats.get(s.id)!} now={now} onOpen={() => setSelectedId(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SpaceCard({ space, stats, now, onOpen }: { space: UnifiedSpace; stats: SpaceStats; now: number; onOpen: () => void }) {
  return (
    <button className={rw.card} onClick={onOpen}>
      <span className={rw.spaceIc}><SpaceIcon space={space} size={22} /></span>
      <div className={rw.cardBody}>
        <div className="rw-card-head">
          <h3 className={rw.cardHeadH3}>{space.title}</h3>
          <span className={rw.cardAuthor}>{space.kind === "module" ? "Curriculum" : "Custom space"}</span>
        </div>

        {stats.progress != null && (
          <div className={rw.progress}>
            <div className={rw.progressBar}><span className={rw.progressBarFill} style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
            <span className={rw.progressLbl}>
              {Math.round(stats.progress * 100)}%{stats.lessonsTotal ? ` · ${stats.lessonsDone}/${stats.lessonsTotal} lessons` : ""}
            </span>
          </div>
        )}

        <div className={rw.cardStats}>
          <span className={rw.cardStatItem}><NotePencilIcon size={12} /> {stats.noteCount}</span>
          <span className={rw.cardStatItem}><SigmaIcon size={12} /> {stats.formulaCount}</span>
          <span className={rw.cardStatItem}><WarningOctagonIcon size={12} /> {stats.mistakeCount}</span>
          <span className={rw.cardStatItem}><SparkleIcon size={12} /> {stats.aiCount}</span>
          {stats.lastActivity && <span className={rw.cardWhen}><ClockIcon size={12} /> {relativeTime(stats.lastActivity, now)}</span>}
        </div>
      </div>
    </button>
  );
}

// ── Detail ──────────────────────────────────────────────────────────────────

function SpaceDetail({ space, now, onBack }: { space: UnifiedSpace; now: number; onBack: () => void }) {
  const notes = useNotes((s) => s.notes);
  const customSpaces = useSpaces((s) => s.spaces);
  const deleteSpace = useSpaces((s) => s.deleteSpace);
  const conversations = useConversations((s) => s.conversations);
  const done = useProgress((s) => s.done);
  const bookmarks = useNotes((s) => s.bookmarks);
  const lastVisited = useProgress((s) => s.lastVisited);

  const caps = useMemo(() => capturesForSpace(space, notes), [space, notes]);
  const customSpace = customSpaces.find((s) => s.id === space.id);
  const stats = useMemo(
    () => spaceStats(space, caps, conversations, bookmarks, done, customSpace, now),
    [space, caps, conversations, bookmarks, done, customSpace, now]
  );

  const captureContext: CaptureContext = space.kind === "module"
    ? { view: "space", moduleId: space.moduleId, spaceTitle: space.title }
    : { view: "space", spaceId: space.id, spaceTitle: space.title };

  return (
    <div className={rw.detail}>
      <button className={rw.back} onClick={onBack}><CaretLeftIcon size={14} /> Learning Spaces</button>

      <header className={rw.hero}>
        <span className={rw.spaceIcLg}><SpaceIcon space={space} size={30} /></span>
        <div className={rw.heroMain}>
          <h1 className={rw.heroMainH1}>{space.title}</h1>
          <span className={rw.heroSub}>{space.kind === "module" ? "Curriculum module" : "Custom Learning Space"}</span>
          {stats.progress != null && (
            <div className={rw.heroProgress} style={{ cursor: "default" }}>
              <div className={rw.progressBarLg}><span className={rw.progressBarFill} style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
              <span className={rw.progressLbl}>{Math.round(stats.progress * 100)}% · {stats.lessonsDone}/{stats.lessonsTotal} lessons</span>
            </div>
          )}
          {space.kind === "custom" && (
            <div className={rw.heroControls}>
              <Popover>
                <PopoverTrigger asChild><button className={rw.iconBtn()} aria-label="More"><DotsThreeIcon size={16} weight="bold" /></button></PopoverTrigger>
                <PopoverContent align="start" style={{ width: 150 }}>
                  <div className={rw.menu}><button className={rw.menuBtn(true)} onClick={() => { deleteSpace(space.id); onBack(); }}><TrashIcon size={12} /> Delete space</button></div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className={rw.quickstats}>
          <QS icon={<NotePencilIcon size={15} />} value={stats.noteCount} label="Notes" />
          <QS icon={<SigmaIcon size={15} />} value={stats.formulaCount} label="Formulas" />
          <QS icon={<WarningOctagonIcon size={15} />} value={stats.mistakeCount} label="Mistakes" />
          <QS icon={<SparkleIcon size={15} />} value={stats.aiCount} label="AI" />
          <QS icon={<FireIcon size={15} />} value={stats.streak} label="Streak" />
        </div>
      </header>

      <Tabs defaultValue="overview" className="rw-tabs">
        <div className={rw.tabsRow}>
          <TabsList className={rw.tabsList}>
            <TabsTrigger className={rw.tabsTrigger} value="overview">Overview</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="notes">Notes</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="formulas">Formulas</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="mistakes">Mistakes</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="ai">AI</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <CollectionCapture context={captureContext} />
        </div>

        <TabsContent className={rw.tabsContent} value="overview"><OverviewTab space={space} caps={caps} stats={stats} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="notes"><NotesTab space={space} caps={caps} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="formulas"><FormulasTab caps={caps} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="mistakes"><MistakesTab caps={caps} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="ai"><AITab space={space} caps={caps} conversations={conversations} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="bookmarks"><BookmarksTab space={space} bookmarks={bookmarks} now={now} /></TabsContent>
        <TabsContent className={rw.tabsContent} value="timeline"><TimelineTab space={space} caps={caps} conversations={conversations} bookmarks={bookmarks} lastVisited={lastVisited} now={now} /></TabsContent>
      </Tabs>
    </div>
  );
}

function QS({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className={rw.quickstat}><span className={rw.qsIc}>{icon}</span><span className={rw.qsVal}>{value}</span><span className={rw.qsLbl}>{label}</span></div>;
}

// ── Overview ──────────────────────────────────────────────────────────────

function OverviewTab({ caps, stats, now }: { space: UnifiedSpace; caps: SpaceCaptures; stats: SpaceStats; now: number }) {
  const recent = caps.all.slice(0, 5);
  return (
    <div className={rw.overview}>
      <section className={rw.panel}>
        <h4 className={rw.panelH4}>Progress</h4>
        {stats.progress != null ? (
          <>
            <div className={rw.progressBarLg}><span className={rw.progressBarFill} style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
            <p className={rw.panelLine}>{stats.lessonsDone} of {stats.lessonsTotal} lessons complete</p>
          </>
        ) : <p className={rw.panelLineMuted}>No lesson progress tracked for this space.</p>}
      </section>

      <section className={rw.panel}>
        <h4 className={rw.panelH4}>Knowledge captured</h4>
        <div className={rw.statgrid}>
          <div><span className={rw.statgridV}>{stats.noteCount}</span><span className={rw.statgridL}>Notes</span></div>
          <div><span className={rw.statgridV}>{stats.formulaCount}</span><span className={rw.statgridL}>Formulas</span></div>
          <div><span className={rw.statgridV}>{stats.mistakeCount}</span><span className={rw.statgridL}>Mistakes</span></div>
          <div><span className={rw.statgridV}>{stats.aiCount}</span><span className={rw.statgridL}>AI convos</span></div>
          <div><span className={rw.statgridV}>{stats.bookmarkCount}</span><span className={rw.statgridL}>Bookmarks</span></div>
          <div><span className={rw.statgridV}>{stats.streak}</span><span className={rw.statgridL}>Day streak</span></div>
        </div>
      </section>

      <section className={rw.panel}>
        <h4 className={rw.panelH4}>Recent captures</h4>
        {recent.length ? recent.map((n) => (
          <div key={n.id} className={rw.miniNote}>
            <strong>{NOTE_ICON[noteKind(n)]} {n.title || labelFor(n)}</strong>
            <span>{relativeDay(n.createdAt, now)}</span>
          </div>
        )) : <p className={rw.panelLineMuted}>Nothing captured yet. Use Capture to add your first note.</p>}
      </section>

      <section className={rw.panel}>
        <h4 className={rw.panelH4}>Last activity</h4>
        <p className={rw.panelLine}>{stats.lastActivity ? formatDate(stats.lastActivity) : "—"}</p>
      </section>
    </div>
  );
}

const NOTE_ICON: Record<string, React.ReactNode> = {
  formula: <SigmaIcon size={12} />, mistake: <WarningOctagonIcon size={12} />, code: <CodeIcon size={12} />,
  ai: <SparkleIcon size={12} />, note: <NotePencilIcon size={12} />, idea: <NotePencilIcon size={12} />,
  quote: <NotePencilIcon size={12} />, vocab: <NotePencilIcon size={12} />, voice: <NotePencilIcon size={12} />,
};
function labelFor(n: Note): string {
  return (n.body || "").replace(/[#*`$_]/g, "").replace(/```/g, "").trim().slice(0, 60) || noteKind(n);
}

// ── Notes (grouped by lesson) ─────────────────────────────────────────────

function NotesTab({ space, caps, now }: { space: UnifiedSpace; caps: SpaceCaptures; now: number }) {
  const groups = useMemo(() => groupNotesByLesson(space, caps.notes), [space, caps.notes]);
  if (caps.notes.length === 0) return <Empty label="No notes yet" hint="Notes you capture here are grouped by lesson." />;
  return (
    <div className={rw.notes}>
      {groups.map((g) => (
        <section key={g.label} className={rw.noteGroup}>
          <h5 className={rw.noteGroupLabel}>{g.label}</h5>
          {g.notes.map((n) => <NoteRow key={n.id} note={n} now={now} />)}
        </section>
      ))}
    </div>
  );
}

function NoteRow({ note, now }: { note: Note; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  return (
    <div className={rw.noteCard}>
      {note.title && <span className={rw.noteTitle}>{note.title}</span>}
      <p className={rw.noteBody}>{note.body}</p>
      <div className={rw.noteFoot}>
        <span className={rw.noteDate}>{relativeDay(note.createdAt, now)}</span>
        <button className={rw.iconBtn()} onClick={() => deleteNote(note.id)} aria-label="Delete"><TrashIcon size={12} /></button>
      </div>
    </div>
  );
}

// ── Formulas ──────────────────────────────────────────────────────────────

const DIFF_LABEL: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

function FormulasTab({ caps, now }: { caps: SpaceCaptures; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  if (caps.formulas.length === 0) return <Empty label="No formulas yet" hint="Capture equations you want to remember." />;
  return (
    <div className={rw.vocabGrid}>
      {caps.formulas.map((n) => {
        const latex = n.body.replace(/\$\$/g, "").trim();
        return (
          <article key={n.id} className={rw.formulaCard}>
            <div className={rw.formulaRender}><MBlock>{latex}</MBlock></div>
            {n.title && <p className={rw.formulaTitle}>{n.title}</p>}
            <div className={rw.formulaFoot}>
              <span className={rw.formulaMeta}>
                {n.lesson && <span>{n.lesson}</span>}
                {n.difficulty && <span className={rw.diff(n.difficulty as 1 | 2 | 3)}>{DIFF_LABEL[n.difficulty]}</span>}
                {(n.tags ?? []).filter((t) => t !== "formula").map((t) => <span key={t} className={rw.tag}>#{t}</span>)}
                <span className={rw.noteDate}>{relativeDay(n.createdAt, now)}</span>
              </span>
              <button className={rw.iconBtn()} onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

// ── Mistakes ──────────────────────────────────────────────────────────────

function MistakesTab({ caps, now }: { caps: SpaceCaptures; now: number }) {
  if (caps.mistakes.length === 0) return <Empty label="No mistakes logged" hint="Turn every mistake into a learning artifact." />;
  return <div className={rw.cardsCol}>{caps.mistakes.map((n) => <MistakeCard key={n.id} note={n} now={now} />)}</div>;
}

function MistakeCard({ note, now }: { note: Note; now: number }) {
  const updateNote = useNotes((s) => s.updateNote);
  const deleteNote = useNotes((s) => s.deleteNote);
  const resolved = !!note.resolved;
  return (
    <article className={rw.mistakeCard(resolved)}>
      <div className={rw.mistakeHead}>
        <span className={rw.mistakeBadge(resolved)}><WarningOctagonIcon size={13} weight="fill" /> Mistake</span>
        <button className={rw.resolve(resolved)} onClick={() => updateNote(note.id, { resolved: !resolved })}>
          <CheckCircleIcon size={13} weight={resolved ? "fill" : "regular"} /> {resolved ? "Resolved" : "Mark resolved"}
        </button>
      </div>
      <p className={rw.mistakeWhat}>{note.body}</p>
      {note.why && <div className={rw.mistakeLine}><span className={rw.mistakeLineLbl}>Why</span><span>{note.why}</span></div>}
      {note.correction && <div className={rw.mistakeLine}><span className={rw.mistakeLineLbl}>Correct</span><span>{note.correction}</span></div>}
      <div className={rw.noteFoot}>
        <span className={rw.noteDate}>
          {note.lesson ? `${note.lesson} · ` : ""}{relativeDay(note.createdAt, now)}
          {note.reviewCount ? ` · reviewed ${note.reviewCount}×` : ""}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button className={rw.iconBtn()} onClick={() => updateNote(note.id, { reviewCount: (note.reviewCount ?? 0) + 1 })} aria-label="Reviewed"><ArrowRightIcon size={12} /></button>
          <button className={rw.iconBtn()} onClick={() => deleteNote(note.id)} aria-label="Delete"><TrashIcon size={12} /></button>
        </div>
      </div>
    </article>
  );
}

// ── AI conversations ──────────────────────────────────────────────────────

function AITab({ space, caps, conversations, now }: { space: UnifiedSpace; caps: SpaceCaptures; conversations: Conversation[]; now: number }) {
  const [q, setQ] = useState("");
  const convos = useMemo(() => conversationsForSpace(space, conversations), [space, conversations]);
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return convos;
    return convos.filter((c) => (c.title + " " + c.turns.map((t) => t.text).join(" ")).toLowerCase().includes(query));
  }, [convos, q]);

  const hasAny = convos.length > 0 || caps.ai.length > 0;
  if (!hasAny) return <Empty label="No AI conversations" hint="Save a tutor chat with “Save conversation”, or pin an AI insight." />;

  return (
    <div className={rw.ai}>
      {convos.length > 0 && (
        <div className={rw.libSearch} style={{ marginBottom: "1rem" }}>
          <ChatCircleDotsIcon size={15} />
          <input className={rw.libSearchInput} placeholder="Search conversations…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      )}
      {filtered.map((c) => <ConversationCard key={c.id} convo={c} now={now} />)}
      {caps.ai.map((n) => (
        <article key={n.id} className="rw-quote-card">
          <span className="rw-quote-date"><SparkleIcon size={12} weight="fill" /> Pinned insight · {relativeDay(n.createdAt, now)}</span>
          <p className={rw.noteBody} style={{ marginTop: 6 }}>{n.body.replace(/```/g, "")}</p>
        </article>
      ))}
    </div>
  );
}

function ConversationCard({ convo, now }: { convo: Conversation; now: number }) {
  const del = useConversations((s) => s.deleteConversation);
  const [open, setOpen] = useState(false);
  return (
    <article className={rw.convoCard}>
      <button className={rw.convoHead} onClick={() => setOpen((v) => !v)}>
        <SparkleIcon size={14} weight="fill" />
        <span className={rw.convoTitle}>{convo.title}</span>
        <span className={rw.convoMeta}>{convo.turns.length} messages · {relativeDay(convo.updatedAt, now)}</span>
      </button>
      {open && (
        <div className={rw.convoBody}>
          {convo.turns.map((t, i) => (
            <div key={i} className={rw.convoTurn}>
              <span className={rw.convoWho(t.role === "user")}>{t.role === "user" ? "You" : "Tutor"}</span>
              <p>{t.text}</p>
            </div>
          ))}
          <button className={rw.iconBtn()} onClick={() => del(convo.id)} aria-label="Delete conversation"><TrashIcon size={12} /> </button>
        </div>
      )}
    </article>
  );
}

// ── Bookmarks ──────────────────────────────────────────────────────────────

function BookmarksTab({ space, bookmarks, now }: { space: UnifiedSpace; bookmarks: Record<string, number>; now: number }) {
  const list = bookmarksForSpace(space, bookmarks);
  if (list.length === 0) return <Empty label="No bookmarks" hint="Bookmark a lesson from the course to pin it here." />;
  return (
    <div className={rw.notes}>
      {list.map(([key, at]) => {
        const ref = allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
        if (!ref) return null;
        return (
          <Link key={key} to={lessonPath(ref.module.id, ref.lesson.id)} className={rw.searchHit}>
            <span className={rw.hitIc}><BookmarkSimpleIcon size={14} /></span>
            <span className={rw.hitBody}><span className={rw.hitText}>{ref.lesson.title}</span><span className={rw.hitBook}>{relativeTime(at, now)}</span></span>
            <ArrowRightIcon size={13} />
          </Link>
        );
      })}
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────

const EVENT_ICON: Record<SpaceEvent["kind"], React.ReactNode> = {
  lesson: <GraduationCapIcon size={13} weight="fill" />,
  note: <NotePencilIcon size={13} weight="fill" />,
  formula: <SigmaIcon size={13} weight="fill" />,
  mistake: <WarningOctagonIcon size={13} weight="fill" />,
  code: <CodeIcon size={13} weight="fill" />,
  ai: <SparkleIcon size={13} weight="fill" />,
  bookmark: <BookmarkSimpleIcon size={13} weight="fill" />,
};

function TimelineTab({ space, caps, conversations, bookmarks, lastVisited, now }: {
  space: UnifiedSpace; caps: SpaceCaptures; conversations: Conversation[];
  bookmarks: Record<string, number>; lastVisited: Record<string, number>; now: number;
}) {
  const events = useMemo(
    () => spaceTimeline(space, caps, conversations, bookmarks, lastVisited),
    [space, caps, conversations, bookmarks, lastVisited]
  );
  if (events.length === 0) return <Empty label="No history yet" hint="Your learning journey in this space will replay here." />;
  return (
    <div className={rw.timeline}>
      {events.map((e, i) => (
        <div key={i} className={`${rw.tlEvent} k-${e.kind}`}>
          <span className={rw.tlIc}>{EVENT_ICON[e.kind]}</span>
          <div className={rw.tlBody}>
            <span className={rw.tlLabel}>{e.label}</span>
            {e.detail && <span className={rw.tlDetail}>{e.detail}</span>}
            <span className={rw.tlMeta}>{relativeDay(e.at, now)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ label, hint }: { label: string; hint: string }) {
  return <div className={rw.empty}><StackIcon size={24} weight="duotone" /><h4 className={rw.emptyH4}>{label}</h4><p className={rw.emptyP}>{hint}</p></div>;
}
