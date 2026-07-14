import { useMemo, useState } from "react";
import {
  BookOpenIcon, StarIcon, TrashIcon, CaretLeftIcon, QuotesIcon, TranslateIcon, NotePencilIcon,
  MagnifyingGlassIcon, FireIcon, CalendarBlankIcon, ClockIcon, DotsThreeIcon, SparkleIcon,
  CircleNotchIcon, FlagCheckeredIcon, PlayIcon, CheckCircleIcon, ArrowRightIcon,
} from "@phosphor-icons/react";
import { useBooks, type Book, type ReadingStatus } from "../../lib/books";
import { useNotes, type Note, type VocabStatus } from "../../lib/notes";
import { relativeTime } from "../../lib/stats";
import {
  capturesForBook, bookStats, favoriteQuote, readingTimeline, groupNotesByPage, searchReading,
  cleanQuote, relativeDay, formatDate, type BookCaptures, type BookStats, type ReadingEvent, type SearchHit,
} from "../../lib/reading";
import { BookSearch } from "../../components/book-search";
import { BookCapture } from "../../components/book-capture";
import { Tabs, TabsList, TabsTrigger, TabsContent, Popover, PopoverTrigger, PopoverContent } from "../../components/ui";
import { generate, isLLMEnabled } from "../../lib/llm";
import type { BookMetadata } from "../../lib/book-metadata";

const STATUS_LABEL: Record<ReadingStatus, string> = {
  reading: "Reading", finished: "Finished", want: "Want to Read", paused: "Paused",
};
const STATUS_ORDER: ReadingStatus[] = ["reading", "finished", "want", "paused"];
const STATUS_ICON: Record<ReadingStatus, React.ReactNode> = {
  reading: <PlayIcon size={11} weight="fill" />,
  finished: <CheckCircleIcon size={11} weight="fill" />,
  want: <BookOpenIcon size={11} weight="fill" />,
  paused: <ClockIcon size={11} weight="fill" />,
};

const SWATCHES = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899", "#84cc16", "#a855f7", "#ef4444"];
function coverColor(book: Book): string {
  if (book.coverColor) return book.coverColor;
  let h = 0;
  for (const ch of book.title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}
function CoverArt({ book, size = "sm" }: { book: Book; size?: "sm" | "md" | "lg" }) {
  const cls = `rw-cover rw-cover-${size}`;
  if (book.coverUrl) return <span className={cls}><img src={book.coverUrl} alt="" loading="lazy" /></span>;
  return (
    <span className={cls} style={{ background: coverColor(book) }}>
      <BookOpenIcon size={size === "lg" ? 30 : size === "md" ? 22 : 18} weight="duotone" />
    </span>
  );
}

function Stars({ value, onSet }: { value: number; onSet?: (r: number) => void }) {
  return (
    <span className="rw-stars">
      {[1, 2, 3, 4, 5].map((r) => (
        <button key={r} className={`rw-star ${value >= r ? "on" : ""}`} disabled={!onSet}
          onClick={() => onSet?.(value === r ? 0 : r)} aria-label={`${r} stars`}>
          <StarIcon size={14} weight={value >= r ? "fill" : "regular"} />
        </button>
      ))}
    </span>
  );
}

export function BooksView({ now }: { now: number }) {
  const books = useBooks((s) => s.books);
  const addBook = useBooks((s) => s.addBook);
  const notes = useNotes((s) => s.notes);

  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const handlePickMetadata = (meta: BookMetadata) => {
    addBook({ title: meta.title, author: meta.author, year: meta.year, coverUrl: meta.coverUrl, olKey: meta.key, status: "want" });
  };

  const searchHits = useMemo(() => (query.trim() ? searchReading(query, books, notes) : []), [query, books, notes]);

  const selected = selectedId ? books.find((b) => b.id === selectedId) ?? null : null;
  if (selected) return <BookDetail book={selected} now={now} onBack={() => setSelectedId(null)} />;

  const filtered = statusFilter === "all" ? books : books.filter((b) => b.status === statusFilter);
  const counts = useMemo(() => {
    const m = new Map<string, BookCaptures>();
    for (const b of books) m.set(b.id, capturesForBook(b.id, notes));
    return m;
  }, [books, notes]);

  return (
    <div className="rw-library">
      <header className="rw-lib-header">
        <div className="rw-lib-title">
          <h1>Books</h1>
          <span className="rw-lib-sub">{books.length} {books.length === 1 ? "book" : "books"} in your library</span>
        </div>
        <BookSearch onPick={handlePickMetadata} placeholder="Add a book by title or author…" />
      </header>

      <div className="rw-lib-search">
        <MagnifyingGlassIcon size={15} />
        <input placeholder="Search across books, quotes, words and notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {query.trim() ? (
        <SearchResults hits={searchHits} onOpen={(id) => { setQuery(""); setSelectedId(id); }} />
      ) : (
        <>
          <div className="rw-filters">
            <button className={`rw-filter ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All</button>
            {STATUS_ORDER.map((s) => (
              <button key={s} className={`rw-filter ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
                {STATUS_ICON[s]} {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rw-empty">
              <BookOpenIcon size={26} weight="duotone" />
              <h4>{books.length === 0 ? "Start your library" : "Nothing here yet"}</h4>
              <p>{books.length === 0 ? "Search a title above to add your first book with its cover." : "No books with this status."}</p>
            </div>
          ) : (
            <div className="rw-grid">
              {filtered.map((b) => {
                const caps = counts.get(b.id)!;
                const st = bookStats(b, caps, now);
                return <LibraryCard key={b.id} book={b} stats={st} now={now} onOpen={() => setSelectedId(b.id)} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LibraryCard({ book, stats, now, onOpen }: { book: Book; stats: BookStats; now: number; onOpen: () => void }) {
  return (
    <button className="rw-card" onClick={onOpen}>
      <CoverArt book={book} size="md" />
      <div className="rw-card-body">
        <div className="rw-card-head">
          <h3>{book.title}</h3>
          {book.author && <span className="rw-card-author">{book.author}</span>}
        </div>

        {stats.progress != null && (
          <div className="rw-progress">
            <div className="rw-progress-bar"><span style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
            <span className="rw-progress-lbl">
              {Math.round(stats.progress * 100)}%
              {book.currentPage != null && book.totalPages ? ` · ${book.currentPage} / ${book.totalPages} pages` : ""}
            </span>
          </div>
        )}

        <div className="rw-card-meta">
          <span className={`rw-status rw-status-${book.status}`}>{STATUS_ICON[book.status]} {STATUS_LABEL[book.status]}</span>
          {book.rating ? <Stars value={book.rating} /> : null}
        </div>

        <div className="rw-card-stats">
          <span><QuotesIcon size={12} /> {stats.quoteCount}</span>
          <span><TranslateIcon size={12} /> {stats.vocabCount}</span>
          <span><NotePencilIcon size={12} /> {stats.noteCount}</span>
          <span className="rw-card-when"><ClockIcon size={12} /> {relativeTime(book.updatedAt, now)}</span>
        </div>
      </div>
    </button>
  );
}

function SearchResults({ hits, onOpen }: { hits: SearchHit[]; onOpen: (bookId: string) => void }) {
  if (hits.length === 0) return <div className="rw-empty"><MagnifyingGlassIcon size={24} weight="duotone" /><h4>No matches</h4><p>Nothing found across your books, quotes, words or notes.</p></div>;
  const ICON: Record<SearchHit["kind"], React.ReactNode> = {
    book: <BookOpenIcon size={14} />, quote: <QuotesIcon size={14} />, vocab: <TranslateIcon size={14} />, note: <NotePencilIcon size={14} />,
  };
  return (
    <div className="rw-search-results">
      {hits.map((h, i) => (
        <button key={i} className="rw-search-hit" onClick={() => onOpen(h.bookId)}>
          <span className="rw-hit-ic">{ICON[h.kind]}</span>
          <span className="rw-hit-body">
            <span className="rw-hit-kind">{h.kind}</span>
            <span className="rw-hit-text">{h.text}</span>
            {h.kind !== "book" && <span className="rw-hit-book">{h.bookTitle}</span>}
          </span>
          <ArrowRightIcon size={13} />
        </button>
      ))}
    </div>
  );
}

// ── Detail ──────────────────────────────────────────────────────────────────

function BookDetail({ book, now, onBack }: { book: Book; now: number; onBack: () => void }) {
  const notes = useNotes((s) => s.notes);
  const updateBook = useBooks((s) => s.updateBook);
  const deleteBook = useBooks((s) => s.deleteBook);

  const captures = useMemo(() => capturesForBook(book.id, notes), [book.id, notes]);
  const stats = useMemo(() => bookStats(book, captures, now), [book, captures, now]);

  return (
    <div className="rw-detail">
      <button className="rw-back" onClick={onBack}><CaretLeftIcon size={14} /> Library</button>

      <header className="rw-hero">
        <CoverArt book={book} size="lg" />
        <div className="rw-hero-main">
          <h1>{book.title}</h1>
          <span className="rw-hero-sub">{[book.author, book.year].filter(Boolean).join(" · ")}</span>

          <div className="rw-hero-controls">
            <select className="rw-select" value={book.status} onChange={(e) => {
              const status = e.target.value as ReadingStatus;
              const patch: Parameters<typeof updateBook>[1] = { status };
              if (status === "reading" && !book.startedAt) patch.startedAt = now;
              if (status === "finished" && !book.finishedAt) patch.finishedAt = now;
              updateBook(book.id, patch);
            }}>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <Stars value={book.rating ?? 0} onSet={(r) => updateBook(book.id, { rating: r })} />
            <Popover>
              <PopoverTrigger asChild><button className="rw-icon-btn" aria-label="More"><DotsThreeIcon size={16} weight="bold" /></button></PopoverTrigger>
              <PopoverContent align="end" style={{ width: 150 }}>
                <div className="rw-menu">
                  <button className="danger" onClick={() => { deleteBook(book.id); onBack(); }}><TrashIcon size={12} /> Delete book</button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <ProgressEditor book={book} stats={stats} onSet={(currentPage, totalPages) => updateBook(book.id, { currentPage, totalPages })} />
        </div>

        <div className="rw-quickstats">
          <QuickStat icon={<QuotesIcon size={15} />} value={stats.quoteCount} label="Quotes" />
          <QuickStat icon={<TranslateIcon size={15} />} value={stats.vocabCount} label="Words" />
          <QuickStat icon={<NotePencilIcon size={15} />} value={stats.noteCount} label="Notes" />
          <QuickStat icon={<FireIcon size={15} />} value={stats.streak} label="Day streak" />
          {stats.estimatedFinish && (
            <QuickStat icon={<FlagCheckeredIcon size={15} />} value={relativeDay(stats.estimatedFinish, now).replace("ago", "")} label="Est. finish" />
          )}
        </div>
      </header>

      <Tabs defaultValue="overview" className="rw-tabs">
        <div className="rw-tabs-row">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="vocab">Vocabulary</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <BookCapture bookId={book.id} />
        </div>

        <TabsContent value="overview"><OverviewTab book={book} captures={captures} stats={stats} now={now} /></TabsContent>
        <TabsContent value="quotes"><QuotesTab book={book} captures={captures} now={now} /></TabsContent>
        <TabsContent value="vocab"><VocabTab book={book} captures={captures} now={now} /></TabsContent>
        <TabsContent value="notes"><NotesTab captures={captures} now={now} /></TabsContent>
        <TabsContent value="timeline"><TimelineTab book={book} captures={captures} now={now} /></TabsContent>
      </Tabs>
    </div>
  );
}

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="rw-quickstat">
      <span className="rw-qs-ic">{icon}</span>
      <span className="rw-qs-val">{value}</span>
      <span className="rw-qs-lbl">{label}</span>
    </div>
  );
}

function ProgressEditor({ book, stats, onSet }: { book: Book; stats: BookStats; onSet: (current: number, total: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [cur, setCur] = useState(String(book.currentPage ?? ""));
  const [tot, setTot] = useState(String(book.totalPages ?? ""));
  if (editing) {
    return (
      <div className="rw-progress-edit">
        <input className="rw-input sm" placeholder="Page" value={cur} inputMode="numeric" onChange={(e) => setCur(e.target.value)} />
        <span>/</span>
        <input className="rw-input sm" placeholder="Total" value={tot} inputMode="numeric" onChange={(e) => setTot(e.target.value)} />
        <button className="rw-mini-save" onClick={() => { onSet(parseInt(cur, 10) || 0, parseInt(tot, 10) || 0); setEditing(false); }}>Save</button>
      </div>
    );
  }
  return (
    <button className="rw-hero-progress" onClick={() => setEditing(true)}>
      {stats.progress != null ? (
        <>
          <div className="rw-progress-bar lg"><span style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
          <span className="rw-progress-lbl">{Math.round(stats.progress * 100)}% · {book.currentPage} / {book.totalPages} pages</span>
        </>
      ) : (
        <span className="rw-progress-lbl muted">Set reading progress →</span>
      )}
    </button>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────

function OverviewTab({ book, captures, stats, now }: { book: Book; captures: BookCaptures; stats: BookStats; now: number }) {
  const fav = favoriteQuote(captures);
  const recentWords = captures.vocab.slice(0, 4);
  const recentNotes = captures.notes.slice(0, 3);
  return (
    <div className="rw-overview">
      <section className="rw-panel">
        <h4>Reading progress</h4>
        {stats.progress != null ? (
          <>
            <div className="rw-progress-bar lg"><span style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
            <p className="rw-panel-line">{Math.round(stats.progress * 100)}% complete · {book.currentPage} of {book.totalPages} pages</p>
          </>
        ) : <p className="rw-panel-line muted">No progress tracked yet.</p>}
        <div className="rw-dates">
          <span><CalendarBlankIcon size={13} /> Started {book.startedAt ? formatDate(book.startedAt) : "—"}</span>
          <span><FlagCheckeredIcon size={13} /> Finished {book.finishedAt ? formatDate(book.finishedAt) : "—"}</span>
        </div>
      </section>

      {fav && (
        <section className="rw-panel">
          <h4><StarIcon size={13} weight="fill" /> Favorite quote</h4>
          <blockquote className="rw-fav-quote">{cleanQuote(fav.body)}</blockquote>
          {fav.page && <span className="rw-panel-meta">p. {fav.page}</span>}
        </section>
      )}

      <div className="rw-overview-cols">
        <section className="rw-panel">
          <h4>Recently learned words</h4>
          {recentWords.length ? recentWords.map((w) => (
            <div key={w.id} className="rw-mini-word"><strong>{w.word ?? w.body}</strong>{w.meaning && <span>{w.meaning}</span>}</div>
          )) : <p className="rw-panel-line muted">No words yet.</p>}
        </section>
        <section className="rw-panel">
          <h4>Recent notes</h4>
          {recentNotes.length ? recentNotes.map((n) => (
            <div key={n.id} className="rw-mini-note">{n.title && <strong>{n.title}</strong>}<span>{n.body.slice(0, 90)}</span></div>
          )) : <p className="rw-panel-line muted">No notes yet.</p>}
        </section>
      </div>

      <section className="rw-panel">
        <h4>Reading statistics</h4>
        <div className="rw-statgrid">
          <div><span className="v">{stats.quoteCount}</span><span className="l">Quotes</span></div>
          <div><span className="v">{stats.vocabCount}</span><span className="l">Words</span></div>
          <div><span className="v">{stats.noteCount}</span><span className="l">Notes</span></div>
          <div><span className="v">{stats.streak}</span><span className="l">Day streak</span></div>
          <div><span className="v">{book.rating ?? "—"}</span><span className="l">Rating</span></div>
          <div><span className="v">{relativeTime(book.updatedAt, now)}</span><span className="l">Last read</span></div>
        </div>
      </section>
    </div>
  );
}

// ── Quotes tab ────────────────────────────────────────────────────────────

function QuotesTab({ book, captures, now }: { book: Book; captures: BookCaptures; now: number }) {
  if (captures.quotes.length === 0) return <EmptyTab icon={<QuotesIcon size={24} weight="duotone" />} title="No quotes yet" hint="Capture a passage worth keeping." bookId={book.id} mode="quote" />;
  return (
    <div className="rw-cards-col">
      {captures.quotes.map((q) => <QuoteCard key={q.id} note={q} now={now} allQuotes={captures.quotes} />)}
    </div>
  );
}

function QuoteCard({ note, now, allQuotes }: { note: Note; now: number; allQuotes: Note[] }) {
  const updateNote = useNotes((s) => s.updateNote);
  const deleteNote = useNotes((s) => s.deleteNote);
  const [ai, setAi] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runAI = async (kind: "explain" | "themes" | "connect") => {
    setLoading(true); setAi(null);
    const text = cleanQuote(note.body);
    const prompt =
      kind === "explain" ? `Explain this quote in 2-3 sentences — what it means and why it resonates:\n\n"${text}"`
      : kind === "themes" ? `In 2-3 sentences, summarize the themes in this quote:\n\n"${text}"`
      : `Here is a quote:\n"${text}"\n\nHere are other quotes from the same book:\n${allQuotes.filter((q) => q.id !== note.id).slice(0, 6).map((q) => `- ${cleanQuote(q.body)}`).join("\n")}\n\nWhich one connects most and why? 2-3 sentences.`;
    try { setAi(await generate(prompt, { temperature: 0.4 })); } catch { setAi("Couldn't generate right now."); } finally { setLoading(false); }
  };

  return (
    <article className={`rw-quote-card ${note.favorite ? "fav" : ""}`}>
      <QuotesIcon size={16} weight="fill" className="rw-quote-mark" />
      <p className="rw-quote-text">{cleanQuote(note.body)}</p>
      <div className="rw-quote-foot">
        <div className="rw-quote-meta">
          {note.page != null && <span>p. {note.page}</span>}
          {note.chapter && <span>{note.chapter}</span>}
          {(note.tags ?? []).filter((t) => t !== "quote").map((t) => <span key={t} className="rw-tag">#{t}</span>)}
          <span className="rw-quote-date">{relativeDay(note.createdAt, now)}</span>
        </div>
        <div className="rw-quote-actions">
          <button className={`rw-icon-btn ${note.favorite ? "on" : ""}`} onClick={() => updateNote(note.id, { favorite: !note.favorite })} aria-label="Favorite">
            <StarIcon size={13} weight={note.favorite ? "fill" : "regular"} />
          </button>
          {isLLMEnabled() && (
            <Popover>
              <PopoverTrigger asChild><button className="rw-icon-btn" aria-label="AI actions"><SparkleIcon size={13} weight="fill" /></button></PopoverTrigger>
              <PopoverContent align="end" style={{ width: 170 }}>
                <div className="rw-menu">
                  <button onClick={() => runAI("explain")}>Explain quote</button>
                  <button onClick={() => runAI("connect")}>Connect to another</button>
                  <button onClick={() => runAI("themes")}>Summarize themes</button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Popover>
            <PopoverTrigger asChild><button className="rw-icon-btn" aria-label="More"><DotsThreeIcon size={15} weight="bold" /></button></PopoverTrigger>
            <PopoverContent align="end" style={{ width: 120 }}>
              <div className="rw-menu"><button className="danger" onClick={() => deleteNote(note.id)}><TrashIcon size={12} /> Delete</button></div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {loading && <div className="rw-ai-out"><CircleNotchIcon size={13} className="spin animate-spin" /> Thinking…</div>}
      {ai && <div className="rw-ai-out"><SparkleIcon size={12} weight="fill" /> {ai}</div>}
    </article>
  );
}

// ── Vocabulary tab ──────────────────────────────────────────────────────────

const VOCAB_LABEL: Record<VocabStatus, string> = { learning: "Learning", review: "Needs Review", mastered: "Mastered" };
const VOCAB_ORDER: VocabStatus[] = ["learning", "review", "mastered"];

function VocabTab({ book, captures, now }: { book: Book; captures: BookCaptures; now: number }) {
  if (captures.vocab.length === 0) return <EmptyTab icon={<TranslateIcon size={24} weight="duotone" />} title="No words yet" hint="Add a word you learned from this book." bookId={book.id} mode="vocab" />;
  return (
    <div className="rw-vocab-grid">
      {captures.vocab.map((v) => <VocabCard key={v.id} note={v} now={now} />)}
    </div>
  );
}

function VocabCard({ note, now }: { note: Note; now: number }) {
  const reviewVocab = useNotes((s) => s.reviewVocab);
  const deleteNote = useNotes((s) => s.deleteNote);
  const status = note.vocabStatus ?? "learning";
  return (
    <article className="rw-vocab-card">
      <div className="rw-vocab-head">
        <h4>{note.word ?? note.body}</h4>
        <span className={`rw-vocab-status s-${status}`}>{VOCAB_LABEL[status]}</span>
      </div>
      {note.meaning && <p className="rw-vocab-meaning">{note.meaning}</p>}
      {note.example && <p className="rw-vocab-example">“{note.example}”</p>}
      <div className="rw-vocab-foot">
        <span className="rw-vocab-meta">
          {note.page != null && <>p. {note.page} · </>}
          {note.reviewCount ? `${note.reviewCount} reviews` : "not reviewed"}
          {note.lastReviewedAt ? ` · ${relativeDay(note.lastReviewedAt, now)}` : ""}
        </span>
      </div>
      <div className="rw-vocab-review">
        {VOCAB_ORDER.map((s) => (
          <button key={s} className={`rw-seg-btn ${status === s ? "active" : ""}`} onClick={() => reviewVocab(note.id, s)}>{VOCAB_LABEL[s]}</button>
        ))}
        <button className="rw-icon-btn" onClick={() => deleteNote(note.id)} aria-label="Delete"><TrashIcon size={12} /></button>
      </div>
    </article>
  );
}

// ── Notes tab ────────────────────────────────────────────────────────────

function NotesTab({ captures, now }: { captures: BookCaptures; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  const groups = useMemo(() => groupNotesByPage(captures.notes), [captures.notes]);
  if (captures.notes.length === 0) return <EmptyTab icon={<NotePencilIcon size={24} weight="duotone" />} title="No notes yet" hint="Reflections and ideas grouped by page appear here." bookId={captures.all[0]?.bookId ?? ""} mode="note" />;
  return (
    <div className="rw-notes">
      {groups.map((g) => (
        <section key={g.label} className="rw-note-group">
          <h5 className="rw-note-group-label">{g.label}</h5>
          {g.notes.map((n) => (
            <div key={n.id} className="rw-note-card">
              {n.title && <span className="rw-note-title">{n.title}</span>}
              <p className="rw-note-body">{n.body}</p>
              <div className="rw-note-foot">
                <span className="rw-note-date">{relativeDay(n.createdAt, now)}</span>
                <button className="rw-icon-btn" onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

// ── Timeline tab ────────────────────────────────────────────────────────────

const EVENT_ICON: Record<ReadingEvent["kind"], React.ReactNode> = {
  started: <PlayIcon size={13} weight="fill" />,
  quote: <QuotesIcon size={13} weight="fill" />,
  vocab: <TranslateIcon size={13} weight="fill" />,
  note: <NotePencilIcon size={13} weight="fill" />,
  finished: <FlagCheckeredIcon size={13} weight="fill" />,
};

function TimelineTab({ book, captures, now }: { book: Book; captures: BookCaptures; now: number }) {
  const events = useMemo(() => readingTimeline(book, captures), [book, captures]);
  if (events.length === 0) return <EmptyTab icon={<ClockIcon size={24} weight="duotone" />} title="No history yet" hint="Your reading journey will replay here." bookId={book.id} mode="quote" />;
  return (
    <div className="rw-timeline">
      {events.map((e, i) => (
        <div key={i} className={`rw-tl-event k-${e.kind}`}>
          <span className="rw-tl-ic">{EVENT_ICON[e.kind]}</span>
          <div className="rw-tl-body">
            <span className="rw-tl-label">{e.label}</span>
            {e.detail && <span className="rw-tl-detail">{e.detail}</span>}
            <span className="rw-tl-meta">{relativeDay(e.at, now)}{e.page != null ? ` · p. ${e.page}` : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyTab({ icon, title, hint, bookId, mode }: { icon: React.ReactNode; title: string; hint: string; bookId: string; mode: "quote" | "vocab" | "note" }) {
  return (
    <div className="rw-empty">
      {icon}
      <h4>{title}</h4>
      <p>{hint}</p>
      {bookId && <BookCapture bookId={bookId} initialMode={mode} />}
    </div>
  );
}
