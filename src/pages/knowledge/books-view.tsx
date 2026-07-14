import { useMemo, useState } from "react";
import {
  BookOpenIcon, StarIcon, TrashIcon, CaretLeftIcon, QuotesIcon, TranslateIcon, NotePencilIcon,
  MagnifyingGlassIcon, ClockIcon, DotsThreeIcon, SparkleIcon,
  CircleNotchIcon, PlayIcon, CheckCircleIcon, ArrowRightIcon,
} from "@phosphor-icons/react";
import { useBooks, type Book, type ReadingStatus } from "../../lib/books";
import { useNotes, type Note, type VocabStatus } from "../../lib/notes";
import { relativeTime } from "../../lib/stats";
import {
  capturesForBook, bookStats, favoriteQuote, readingTimeline, groupNotesByPage, searchReading,
  cleanQuote, relativeDay, formatDate, type BookCaptures, type BookStats, type SearchHit,
} from "../../lib/reading";
import { BookSearch } from "../../components/book-search";
import { BookCapture } from "../../components/book-capture";
import { Tabs, TabsList, TabsTrigger, TabsContent, Popover, PopoverTrigger, PopoverContent } from "../../components/ui";
import { generate, isLLMEnabled } from "../../lib/llm";
import type { BookMetadata } from "../../lib/book-metadata";
import * as rw from "./rw-styles";

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
    <span className={rw.stars}>
      {[1, 2, 3, 4, 5].map((r) => (
        <button key={r} className={rw.star(value >= r)} disabled={!onSet}
          onClick={() => onSet?.(value === r ? 0 : r)} aria-label={`${r} stars`}>
          <StarIcon size={14} weight={value >= r ? "fill" : "regular"} />
        </button>
      ))}
    </span>
  );
}

export function BooksView({ now, focusId, onConsumeFocus }: { now: number; focusId?: string | null; onConsumeFocus?: () => void }) {
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

  const counts = useMemo(() => {
    const m = new Map<string, BookCaptures>();
    for (const b of books) m.set(b.id, capturesForBook(b.id, notes));
    return m;
  }, [books, notes]);

  const effectiveId = focusId ?? selectedId;
  const selected = effectiveId ? books.find((b) => b.id === effectiveId) ?? null : null;
  if (selected) return <BookDetail book={selected} now={now} onBack={() => { setSelectedId(null); onConsumeFocus?.(); }} />;

  const filtered = statusFilter === "all" ? books : books.filter((b) => b.status === statusFilter);

  return (
    <div className={rw.library}>
      <header className={rw.libHeader}>
        <div className="rw-lib-title">
          <h1 className={rw.libTitleH1}>Books</h1>
          <span className={rw.libSub}>{books.length} {books.length === 1 ? "book" : "books"} in your library</span>
        </div>
        <BookSearch onPick={handlePickMetadata} placeholder="Add a book by title or author…" />
      </header>

      <div className={rw.libSearch}>
        <MagnifyingGlassIcon size={15} />
        <input className={rw.libSearchInput} placeholder="Search across books, quotes, words and notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {query.trim() ? (
        <SearchResults hits={searchHits} onOpen={(id) => { setQuery(""); setSelectedId(id); }} />
      ) : (
        <>
          <div className={rw.filters}>
            <button className={rw.filter(statusFilter === "all")} onClick={() => setStatusFilter("all")}>All</button>
            {STATUS_ORDER.map((s) => (
              <button key={s} className={rw.filter(statusFilter === s)} onClick={() => setStatusFilter(s)}>
                {STATUS_ICON[s]} {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={rw.empty}>
              <BookOpenIcon size={26} weight="duotone" />
              <h4 className={rw.emptyH4}>{books.length === 0 ? "Start your library" : "Nothing here yet"}</h4>
              <p className={rw.emptyP}>{books.length === 0 ? "Search a title above to add your first book with its cover." : "No books with this status."}</p>
            </div>
          ) : (
            <div className={rw.grid}>
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
    <button className={rw.card} onClick={onOpen}>
      <CoverArt book={book} size="md" />
      <div className={rw.cardBody}>
        <div className="rw-card-head">
          <h3 className={rw.cardHeadH3}>{book.title}</h3>
          {book.author && <span className={rw.cardAuthor}>{book.author}</span>}
        </div>

        {stats.progress != null && (
          <div className={rw.progress}>
            <div className={rw.progressBar}><span className={rw.progressBarFill} style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
            <span className={rw.progressLbl}>
              {Math.round(stats.progress * 100)}%
              {book.currentPage != null && book.totalPages ? ` · ${book.currentPage} / ${book.totalPages} pages` : ""}
            </span>
          </div>
        )}

        <div className={rw.cardMeta}>
          <span className={rw.status(book.status)}>{STATUS_ICON[book.status]} {STATUS_LABEL[book.status]}</span>
          {book.rating ? <Stars value={book.rating} /> : null}
        </div>

        <div className={rw.cardStats}>
          <span className={rw.cardStatItem}><QuotesIcon size={12} /> {stats.quoteCount}</span>
          <span className={rw.cardStatItem}><TranslateIcon size={12} /> {stats.vocabCount}</span>
          <span className={rw.cardStatItem}><NotePencilIcon size={12} /> {stats.noteCount}</span>
          <span className={rw.cardWhen}><ClockIcon size={12} /> {relativeTime(book.updatedAt, now)}</span>
        </div>
      </div>
    </button>
  );
}

function SearchResults({ hits, onOpen }: { hits: SearchHit[]; onOpen: (bookId: string) => void }) {
  if (hits.length === 0) return <div className={rw.empty}><MagnifyingGlassIcon size={24} weight="duotone" /><h4 className={rw.emptyH4}>No matches</h4><p className={rw.emptyP}>Nothing found across your books, quotes, words or notes.</p></div>;
  const ICON: Record<SearchHit["kind"], React.ReactNode> = {
    book: <BookOpenIcon size={14} />, quote: <QuotesIcon size={14} />, vocab: <TranslateIcon size={14} />, note: <NotePencilIcon size={14} />,
  };
  return (
    <div className={rw.searchResults}>
      {hits.map((h, i) => (
        <button key={i} className={rw.searchHit} onClick={() => onOpen(h.bookId)}>
          <span className={rw.hitIc}>{ICON[h.kind]}</span>
          <span className={rw.hitBody}>
            <span className={rw.hitKind}>{h.kind}</span>
            <span className={rw.hitText}>{h.text}</span>
            {h.kind !== "book" && <span className={rw.hitBook}>{h.bookTitle}</span>}
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

  const [activeSubTab, setActiveSubTab] = useState("overview");

  const readingSessions = useMemo(() => {
    const sessionDays = new Set(captures.all.map((n) => new Date(n.createdAt).toDateString()));
    if (book.startedAt) sessionDays.add(new Date(book.startedAt).toDateString());
    if (book.finishedAt) sessionDays.add(new Date(book.finishedAt).toDateString());
    return sessionDays.size;
  }, [captures.all, book.startedAt, book.finishedAt]);

  const journeyDays = book.startedAt && book.finishedAt ? Math.max(1, Math.ceil((book.finishedAt - book.startedAt) / (24 * 60 * 60 * 1000))) : null;

  return (
    <div className={rw.detail}>
      <button className={rw.back} onClick={onBack}><CaretLeftIcon size={14} /> Library</button>

      <header className={rw.hero}>
        <div className="rw-hero-left">
          <CoverArt book={book} size="lg" />
        </div>
        <div className={rw.heroMain}>
          <h1 className={rw.heroMainH1}>{book.title}</h1>
          <span className={rw.heroSub}>{[book.author, book.year].filter(Boolean).join(" · ")}</span>

          <div className="rw-hero-meta-row">
            <Stars value={book.rating ?? 0} onSet={(r) => updateBook(book.id, { rating: r })} />
            <span className="dot">•</span>
            <Popover>
              <PopoverTrigger asChild>
                <button className={`rw-hero-status-badge status-${book.status} clickable`}>
                  {STATUS_LABEL[book.status]}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" style={{ width: 160 }}>
                <div className={rw.menu}>
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      className={`${rw.menuBtn()}${book.status === s ? " active" : ""}`}
                      onClick={() => {
                        const patch: Parameters<typeof updateBook>[1] = { status: s };
                        if (s === "reading" && !book.startedAt) patch.startedAt = now;
                        if (s === "finished" && !book.finishedAt) patch.finishedAt = now;
                        updateBook(book.id, patch);
                      }}
                    >
                      {STATUS_ICON[s]}
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                  <div className="rw-menu-divider" />
                  <button className={rw.menuBtn(true)} onClick={() => { deleteBook(book.id); onBack(); }}>
                    <TrashIcon size={12} /> Delete book
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="rw-hero-stats-horizontal">
            <span>📖 {stats.quoteCount} Quotes</span>
            <span className="dot">•</span>
            <span>📝 {stats.noteCount} Notes</span>
            <span className="dot">•</span>
            <span>🔤 {stats.vocabCount} Words</span>
            <span className="dot">•</span>
            <span>🔥 {readingSessions} Sessions</span>
          </div>

          <div className="rw-hero-last-read">
            Last read · {relativeDay(book.updatedAt, now)}
          </div>

          {book.status === "finished" ? (
            <div className="rw-hero-finished-summary">
              <span className="journey-tag">Finished</span>
              {book.startedAt && <span className="journey-date">Started {formatDate(book.startedAt)}</span>}
              {book.finishedAt && <span className="journey-date">Finished {formatDate(book.finishedAt)}</span>}
              {journeyDays && <span className="journey-days">{journeyDays} day reading journey</span>}
            </div>
          ) : (
            <div className="rw-hero-progress-section">
              <ProgressEditor book={book} stats={stats} onSet={(currentPage, totalPages) => updateBook(book.id, { currentPage, totalPages })} />
            </div>
          )}
        </div>

        <div className="rw-hero-panel">
          <div className="rw-hero-panel-row">
            <span className="lbl">Status</span>
            <span className="val">{STATUS_LABEL[book.status]}</span>
          </div>

          <div className="rw-hero-panel-row">
            <span className="lbl">Rating</span>
            <span className="val">
              <Stars value={book.rating ?? 0} onSet={(r) => updateBook(book.id, { rating: r })} />
            </span>
          </div>

          {book.startedAt && (
            <div className="rw-hero-panel-row">
              <span className="lbl">Started</span>
              <span className="val">{formatDate(book.startedAt)}</span>
            </div>
          )}

          {book.status === "finished" && book.finishedAt && (
            <div className="rw-hero-panel-row">
              <span className="lbl">Finished</span>
              <span className="val">{formatDate(book.finishedAt)}</span>
            </div>
          )}

          <div className="rw-hero-panel-row">
            <span className="lbl">Pages</span>
            <span className="val">{book.currentPage ?? 0} / {book.totalPages ?? 0}</span>
          </div>

          {stats.streak > 0 && (
            <div className="rw-hero-panel-row">
              <span className="lbl">Streak</span>
              <span className="val">{stats.streak} days</span>
            </div>
          )}
        </div>
      </header>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="rw-tabs">
        <div className={rw.tabsRow}>
          <TabsList className={rw.tabsList}>
            <TabsTrigger className={rw.tabsTrigger} value="overview">Overview</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="quotes">Quotes ({stats.quoteCount})</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="vocab">Words ({stats.vocabCount})</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="notes">Notes ({stats.noteCount})</TabsTrigger>
            <TabsTrigger className={rw.tabsTrigger} value="timeline">Timeline</TabsTrigger>
          </TabsList>
          {activeSubTab === "overview" && <BookCapture bookId={book.id} />}
          {activeSubTab === "quotes" && <BookCapture bookId={book.id} initialMode="quote" triggerLabel="Add Quote" />}
          {activeSubTab === "vocab" && <BookCapture bookId={book.id} initialMode="vocab" triggerLabel="Add Word" />}
          {activeSubTab === "notes" && <BookCapture bookId={book.id} initialMode="note" triggerLabel="Add Note" />}
        </div>

        <TabsContent className={rw.tabsContent} value="overview">
          <OverviewTab book={book} captures={captures} stats={stats} onSwitchTab={setActiveSubTab} />
        </TabsContent>
        <TabsContent className={rw.tabsContent} value="quotes">
          <QuotesTab book={book} captures={captures} now={now} />
        </TabsContent>
        <TabsContent className={rw.tabsContent} value="vocab">
          <VocabTab book={book} captures={captures} />
        </TabsContent>
        <TabsContent className={rw.tabsContent} value="notes">
          <NotesTab captures={captures} now={now} />
        </TabsContent>
        <TabsContent className={rw.tabsContent} value="timeline">
          <TimelineTab book={book} captures={captures} now={now} />
        </TabsContent>
      </Tabs>
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
        <div className="rw-progress-edit-fields">
          <div className="field">
            <span className="lbl">Page</span>
            <input className={rw.input} type="number" placeholder="Current" value={cur} onChange={(e) => setCur(e.target.value)} />
          </div>
          <div className="field-sep">/</div>
          <div className="field">
            <span className="lbl">Total</span>
            <input className={rw.input} type="number" placeholder="Total" value={tot} onChange={(e) => setTot(e.target.value)} />
          </div>
        </div>
        <div className="rw-progress-edit-actions">
          <button className="rw-progress-save-btn" onClick={() => { onSet(parseInt(cur, 10) || 0, parseInt(tot, 10) || 0); setEditing(false); }}>Save</button>
          <button className="rw-progress-cancel-btn" onClick={() => { setCur(String(book.currentPage ?? "")); setTot(String(book.totalPages ?? "")); setEditing(false); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rw-progress-display">
      <div className="rw-progress-display-header">
        <span className="lbl">Progress</span>
        <span className="pct">{stats.progress != null ? `${Math.round(stats.progress * 100)}%` : "0%"}</span>
      </div>
      <div className="rw-progress-bar-wrapper">
        <div className="rw-progress-bar-bg">
          <div className="rw-progress-bar-fill" style={{ width: `${stats.progress != null ? Math.round(stats.progress * 100) : 0}%` }} />
        </div>
      </div>
      <div className="rw-progress-display-footer">
        <span className="pages">{book.currentPage ?? 0} / {book.totalPages ?? 0} pages</span>
        <button className="rw-progress-update-btn" onClick={() => setEditing(true)}>Update</button>
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────

function OverviewTab({ book, captures, stats, onSwitchTab }: { book: Book; captures: BookCaptures; stats: BookStats; onSwitchTab: (tab: string) => void }) {
  const fav = favoriteQuote(captures);
  const recentWords = captures.vocab.slice(0, 4);
  const recentNotes = captures.notes.slice(0, 3);

  const readingSessions = useMemo(() => {
    const sessionDays = new Set(captures.all.map((n) => new Date(n.createdAt).toDateString()));
    if (book.startedAt) sessionDays.add(new Date(book.startedAt).toDateString());
    if (book.finishedAt) sessionDays.add(new Date(book.finishedAt).toDateString());
    return sessionDays.size;
  }, [captures.all, book.startedAt, book.finishedAt]);

  return (
    <div className={rw.overview}>
      <div className={rw.overviewGrid}>
        {/* Left Column: Reading Summary */}
        <section className="rw-overview-section reading-summary">
          <h4>Reading Summary</h4>
          <div className="summary-list">
            <div className="summary-row">
              <span className="lbl">Status</span>
              <span className={`val status-${book.status}`}>{STATUS_LABEL[book.status]}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Started</span>
              <span className="val">{book.startedAt ? formatDate(book.startedAt) : "—"}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Finished</span>
              <span className="val">{book.finishedAt ? formatDate(book.finishedAt) : "—"}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Pages</span>
              <span className="val">
                {book.currentPage != null && book.totalPages
                  ? `${book.currentPage} of ${book.totalPages}`
                  : "—"}
              </span>
            </div>
            <div className="summary-row">
              <span className="lbl">Reading Sessions</span>
              <span className="val">{readingSessions}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Streak</span>
              <span className="val">{stats.streak} days</span>
            </div>
            <div className="summary-row">
              <span className="lbl">Rating</span>
              <span className="val">{book.rating ? `${book.rating} / 5` : "—"}</span>
            </div>
          </div>
          {stats.progress != null && (
            <div className="summary-progress-container">
              <div className={rw.progressBarLg}><span className={rw.progressBarFill} style={{ width: `${Math.round(stats.progress * 100)}%` }} /></div>
              <span className="progress-percentage">{Math.round(stats.progress * 100)}% completed</span>
            </div>
          )}
        </section>

        {/* Right Column: Favorite Quote */}
        {fav && (
          <section className="rw-overview-section favorite-quote-panel">
            <h4>Favorite Quote</h4>
            <div className="editorial-quote-container">
              <StarIcon size={14} weight="fill" className="fav-star-icon" />
              <blockquote className="editorial-quote">"{cleanQuote(fav.body)}"</blockquote>
              <span className="editorial-quote-source">
                {fav.page ? `Page ${fav.page}` : ""}
                {fav.chapter ? ` · ${fav.chapter}` : ""}
              </span>
            </div>
          </section>
        )}
      </div>

      <hr className="section-divider" />

      {/* Previews Row */}
      <div className={rw.overviewGrid}>
        {/* Vocabulary Preview */}
        <section className="rw-preview-section">
          <div className="section-header-row">
            <h4>Vocabulary Preview</h4>
            <button className="view-all-link" onClick={() => onSwitchTab("vocab")}>View all →</button>
          </div>
          <div className="preview-list">
            {recentWords.length ? recentWords.map((w) => (
              <div key={w.id} className="vocab-preview-item">
                <span className="word">{w.word ?? w.body}</span>
                {w.meaning && <span className="meaning">{w.meaning}</span>}
              </div>
            )) : <p className="muted-text">No words learned yet.</p>}
          </div>
        </section>

        {/* Notes Preview */}
        <section className="rw-preview-section">
          <div className="section-header-row">
            <h4>Recent Reflections</h4>
            <button className="view-all-link" onClick={() => onSwitchTab("notes")}>View all →</button>
          </div>
          <div className="preview-list">
            {recentNotes.length ? recentNotes.map((n) => (
              <div key={n.id} className="note-preview-item">
                {n.title && <span className="title">{n.title}</span>}
                <span className="snippet">{n.body.slice(0, 90)}...</span>
              </div>
            )) : <p className="muted-text">No notes captured yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Quotes tab ────────────────────────────────────────────────────────────

function QuotesTab({ book, captures, now }: { book: Book; captures: BookCaptures; now: number }) {
  if (captures.quotes.length === 0) return <EmptyTab icon={<QuotesIcon size={24} weight="duotone" />} title="No quotes yet" hint="Capture a passage worth keeping." bookId={book.id} mode="quote" />;
  return (
    <div className="rw-kindle-quotes-list">
      {captures.quotes.map((q) => <QuoteRow key={q.id} note={q} now={now} allQuotes={captures.quotes} />)}
    </div>
  );
}

function QuoteRow({ note, now, allQuotes }: { note: Note; now: number; allQuotes: Note[] }) {
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
    <article className={`rw-kindle-row ${note.favorite ? "fav" : ""}`}>
      <div className="rw-kindle-meta">
        <span className="location">
          {note.chapter ? note.chapter : ""}
          {note.page != null ? (note.chapter ? ` · Page ${note.page}` : `Page ${note.page}`) : ""}
        </span>
        <span className="date">{relativeDay(note.createdAt, now)}</span>
      </div>
      <p className="rw-kindle-text">"{cleanQuote(note.body)}"</p>
      <div className="rw-kindle-foot">
        <div className="tags">
          {(note.tags ?? []).filter((t) => t !== "quote").map((t) => <span key={t} className={rw.tag}>#{t}</span>)}
        </div>
        <div className="actions">
          <button className={rw.iconBtn(note.favorite)} onClick={() => updateNote(note.id, { favorite: !note.favorite })} aria-label="Favorite">
            <StarIcon size={13} weight={note.favorite ? "fill" : "regular"} />
          </button>
          {isLLMEnabled() && (
            <Popover>
              <PopoverTrigger asChild><button className={rw.iconBtn()} aria-label="AI actions"><SparkleIcon size={13} weight="fill" /></button></PopoverTrigger>
              <PopoverContent align="end" style={{ width: 170 }}>
                <div className={rw.menu}>
                  <button className={rw.menuBtn()} onClick={() => runAI("explain")}>Explain quote</button>
                  <button className={rw.menuBtn()} onClick={() => runAI("connect")}>Connect to another</button>
                  <button className={rw.menuBtn()} onClick={() => runAI("themes")}>Summarize themes</button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Popover>
            <PopoverTrigger asChild><button className={rw.iconBtn()} aria-label="More"><DotsThreeIcon size={15} weight="bold" /></button></PopoverTrigger>
            <PopoverContent align="end" style={{ width: 120 }}>
              <div className={rw.menu}><button className={rw.menuBtn(true)} onClick={() => deleteNote(note.id)}><TrashIcon size={12} /> Delete</button></div>
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

function VocabTab({ book, captures }: { book: Book; captures: BookCaptures }) {
  if (captures.vocab.length === 0) return <EmptyTab icon={<TranslateIcon size={24} weight="duotone" />} title="No words yet" hint="Add a word you learned from this book." bookId={book.id} mode="vocab" />;
  return (
    <div className="rw-vocab-table-container">
      <table className="rw-vocab-table">
        <thead>
          <tr>
            <th>Word</th>
            <th>Definition & Example</th>
            <th>Location</th>
            <th>Status</th>
            <th className="actions-header"></th>
          </tr>
        </thead>
        <tbody>
          {captures.vocab.map((v) => <VocabTableRow key={v.id} note={v} />)}
        </tbody>
      </table>
    </div>
  );
}

function VocabTableRow({ note }: { note: Note }) {
  const reviewVocab = useNotes((s) => s.reviewVocab);
  const deleteNote = useNotes((s) => s.deleteNote);
  const status = note.vocabStatus ?? "learning";

  return (
    <tr className="rw-vocab-row">
      <td className="vocab-word-cell">
        <strong>{note.word ?? note.body}</strong>
      </td>
      <td className="vocab-def-cell">
        {note.meaning && <p className="meaning">{note.meaning}</p>}
        {note.example && <p className="example">“{note.example}”</p>}
      </td>
      <td className="vocab-page-cell">
        {note.page != null ? `Page ${note.page}` : "—"}
      </td>
      <td className="vocab-status-cell">
        <span className={rw.vocabStatus(status)}>{VOCAB_LABEL[status]}</span>
      </td>
      <td className="vocab-actions-cell">
        <div className="vocab-row-actions">
          <Popover>
            <PopoverTrigger asChild>
              <button className={rw.iconBtn()} aria-label="Review status"><ClockIcon size={13} /></button>
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: 140 }}>
              <div className={rw.menu}>
                {VOCAB_ORDER.map((s) => (
                  <button key={s} className={`${rw.menuBtn()}${status === s ? " active" : ""}`} onClick={() => reviewVocab(note.id, s)}>{VOCAB_LABEL[s]}</button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button className={`${rw.iconBtn()} danger`} onClick={() => deleteNote(note.id)} aria-label="Delete"><TrashIcon size={12} /></button>
        </div>
      </td>
    </tr>
  );
}

// ── Notes tab ────────────────────────────────────────────────────────────

function NotesTab({ captures, now }: { captures: BookCaptures; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  const groups = useMemo(() => groupNotesByPage(captures.notes), [captures.notes]);
  if (captures.notes.length === 0) return <EmptyTab icon={<NotePencilIcon size={24} weight="duotone" />} title="No notes yet" hint="Reflections and ideas grouped by page appear here." bookId={captures.all[0]?.bookId ?? ""} mode="note" />;
  return (
    <div className="rw-notes-notebook">
      {groups.map((g) => (
        <section key={g.label} className="rw-notebook-group">
          <h5 className="rw-notebook-group-label">{g.label}</h5>
          <div className="rw-notebook-entries">
            {g.notes.map((n) => (
              <div key={n.id} className="rw-notebook-entry">
                {n.title && <h4 className="entry-title">{n.title}</h4>}
                <p className="entry-body">{n.body}</p>
                <div className="entry-foot">
                  <span className="entry-date">{relativeDay(n.createdAt, now)}</span>
                  <button className={`${rw.iconBtn()} danger`} onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Timeline tab ────────────────────────────────────────────────────────────

function TimelineTab({ book, captures, now }: { book: Book; captures: BookCaptures; now: number }) {
  const events = useMemo(() => readingTimeline(book, captures), [book, captures]);
  if (events.length === 0) return <EmptyTab icon={<ClockIcon size={24} weight="duotone" />} title="No history yet" hint="Your reading journey will replay here." bookId={book.id} mode="quote" />;
  return (
    <div className="rw-github-timeline">
      <div className="timeline-line"></div>
      {events.map((e, i) => (
        <div key={i} className={`rw-timeline-node k-${e.kind}`}>
          <div className="timeline-dot-wrapper">
            <span className="timeline-dot"></span>
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="label">{e.label}</span>
              <span className="time">{relativeDay(e.at, now)}</span>
            </div>
            {e.detail && <p className="detail">{e.detail}</p>}
            {e.page != null && <span className="location">Page {e.page}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyTab({ icon, title, hint, bookId, mode }: { icon: React.ReactNode; title: string; hint: string; bookId: string; mode: "quote" | "vocab" | "note" }) {
  return (
    <div className={rw.empty}>
      {icon}
      <h4 className={rw.emptyH4}>{title}</h4>
      <p className={rw.emptyP}>{hint}</p>
      {bookId && <BookCapture bookId={bookId} initialMode={mode} />}
    </div>
  );
}
