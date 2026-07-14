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

// ── Local Tailwind class strings (former .rw-* rules from knowledge.css) ──────
const COVER_BASE = "grid place-items-center rounded-[5px] text-[rgba(255,255,255,0.92)] shrink-0 shadow-card overflow-hidden [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block";
const COVER_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "w-[34px] h-[48px]",
  md: "w-[52px] h-[74px]",
  lg: "w-[150px] h-[215px] rounded shadow-[0_12px_36px_rgba(0,0,0,0.45)]",
};
const LIB_TITLE = "[&_h1]:font-display [&_h1]:text-[2.1rem] [&_h1]:font-semibold [&_h1]:tracking-[-0.02em] [&_h1]:m-0";
const CARD_HEAD = "[&_h3]:m-0 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-[1.25] [&_h3]:whitespace-nowrap [&_h3]:overflow-hidden [&_h3]:text-ellipsis";

const HERO_PANEL = "flex flex-col gap-[0.8rem] pl-6 border-l border-border text-[0.82rem] w-full max-[720px]:border-l-0 max-[720px]:border-t max-[720px]:border-border max-[720px]:pl-0 max-[720px]:pt-[1.2rem]";
const HERO_PANEL_ROW = "flex justify-between items-center [&_.lbl]:text-text-faint [&_.lbl]:text-[0.74rem] [&_.lbl]:uppercase [&_.lbl]:tracking-[0.05em] [&_.val]:text-text [&_.val]:font-medium";
const STATUS_BADGE_COLOR: Record<ReadingStatus, string> = {
  reading: "text-accent border-accent", finished: "text-good border-good",
  paused: "text-warn border-warn", want: "text-text-dim border-border",
};
const HERO_STATUS_BADGE = (status: ReadingStatus) =>
  "font-mono text-[0.68rem] uppercase tracking-[0.05em] px-[0.6rem] py-[0.22rem] rounded-pill border bg-surface-inset leading-none cursor-pointer transition-all duration-200 ease-brand hover:!border-accent hover:!text-text hover:bg-surface-2 " +
  (STATUS_BADGE_COLOR[status] ?? "text-text-dim border-border");
const FINISHED_SUMMARY = "flex flex-col gap-[0.35rem] max-w-[320px] bg-surface border border-border rounded p-[0.9rem_1.1rem] [&_.journey-tag]:text-[0.64rem] [&_.journey-tag]:uppercase [&_.journey-tag]:tracking-[0.06em] [&_.journey-tag]:text-good [&_.journey-tag]:font-bold [&_.journey-date]:text-[0.8rem] [&_.journey-date]:text-text-dim [&_.journey-days]:text-[0.78rem] [&_.journey-days]:text-text-faint [&_.journey-days]:italic";
const MENU_DIVIDER = "h-px bg-border my-[0.3rem]";

const PROGRESS_DISPLAY = "flex flex-col gap-2 max-w-[360px]";
const PROGRESS_DISPLAY_HEADER = "flex justify-between items-baseline [&_.lbl]:text-[0.74rem] [&_.lbl]:uppercase [&_.lbl]:tracking-[0.05em] [&_.lbl]:text-text-faint [&_.pct]:font-display [&_.pct]:text-base [&_.pct]:font-bold [&_.pct]:text-text";
const PROGRESS_BAR_BG = "bg-surface-inset h-[6px] rounded-pill overflow-hidden border border-border";
const PROGRESS_BAR_FILL = "bg-accent h-full rounded-pill transition-[width] duration-300 ease-linear";
const PROGRESS_DISPLAY_FOOTER = "flex justify-between items-center mt-[0.15rem] [&_.pages]:text-[0.8rem] [&_.pages]:text-text-dim";
const PROGRESS_UPDATE_BTN = "bg-none border-none text-accent text-[0.78rem] font-semibold cursor-pointer p-0 transition-opacity duration-200 ease-brand hover:opacity-80";
const PROGRESS_EDIT = "flex flex-col gap-3 max-w-[320px] bg-surface border border-border rounded p-[1rem_1.1rem]";
const PROGRESS_EDIT_FIELDS = "flex items-center gap-2 [&_.field]:flex-1 [&_.field]:flex [&_.field]:flex-col [&_.field]:gap-[0.2rem] [&_.field_.lbl]:text-[0.66rem] [&_.field_.lbl]:uppercase [&_.field_.lbl]:tracking-[0.05em] [&_.field_.lbl]:text-text-faint [&_.field-sep]:text-text-faint [&_.field-sep]:mt-[0.9rem]";
const PROGRESS_EDIT_ACTIONS = "flex gap-2";
const PROGRESS_SAVE_BTN = "flex-1 p-[0.45rem] text-[0.78rem] font-semibold rounded-sm cursor-pointer text-center bg-accent text-on-accent border-none";
const PROGRESS_CANCEL_BTN = "flex-1 p-[0.45rem] text-[0.78rem] font-semibold rounded-sm cursor-pointer text-center bg-none border border-border text-text-dim hover:text-text hover:border-border-bright";

const OVERVIEW_SECTION_H4 = "[&_h4]:font-display [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-text [&_h4]:m-0 [&_h4]:mb-4";
const SUMMARY_LIST = "flex flex-col gap-[0.65rem]";
const SUMMARY_ROW = "flex justify-between items-center text-[0.86rem] pb-[0.4rem] border-b border-[rgba(255,255,255,0.03)] [&_.lbl]:text-text-dim [&_.val]:text-text [&_.val]:font-medium [&_.val.status-reading]:!text-accent [&_.val.status-finished]:!text-good [&_.val.status-paused]:!text-warn";
const SUMMARY_PROGRESS = "mt-[1.2rem] flex flex-col gap-[0.35rem] [&_.progress-percentage]:text-[0.74rem] [&_.progress-percentage]:text-text-faint [&_.progress-percentage]:text-right";
const FAVORITE_QUOTE_PANEL = "[&_.editorial-quote-container]:relative [&_.editorial-quote-container]:p-[1.8rem_1.8rem_1.5rem] [&_.editorial-quote-container]:bg-[radial-gradient(circle_at_10%_10%,rgba(255,176,0,0.04)_0%,transparent_60%)] [&_.editorial-quote-container]:border-l-2 [&_.editorial-quote-container]:border-accent [&_.editorial-quote-container]:flex [&_.editorial-quote-container]:flex-col [&_.editorial-quote-container]:gap-[0.8rem] [&_.editorial-quote-container]:rounded-[0_8px_8px_0] [&_.fav-star-icon]:text-accent [&_.fav-star-icon]:opacity-80 [&_.editorial-quote]:[font-family:Georgia,serif] [&_.editorial-quote]:italic [&_.editorial-quote]:text-[1.1rem] [&_.editorial-quote]:leading-[1.65] [&_.editorial-quote]:text-text [&_.editorial-quote]:m-0 [&_.editorial-quote-source]:font-mono [&_.editorial-quote-source]:text-[0.74rem] [&_.editorial-quote-source]:text-text-faint [&_.editorial-quote-source]:uppercase [&_.editorial-quote-source]:tracking-[0.04em]";
const SECTION_DIVIDER = "border-none border-b border-border my-10";
const PREVIEW_SECTION = "[&_.section-header-row]:flex [&_.section-header-row]:justify-between [&_.section-header-row]:items-baseline [&_.section-header-row]:mb-4 [&_h4]:font-display [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-text [&_h4]:m-0";
const VIEW_ALL_LINK = "bg-none border-none text-[0.78rem] font-medium text-accent cursor-pointer transition-opacity duration-200 ease-brand hover:underline hover:opacity-80";
const PREVIEW_LIST = "flex flex-col gap-[0.8rem]";
const VOCAB_PREVIEW_ITEM = "flex flex-col gap-[0.15rem] pb-[0.6rem] border-b border-[rgba(255,255,255,0.03)] [&_.word]:font-semibold [&_.word]:text-[0.9rem] [&_.word]:text-text [&_.meaning]:text-[0.82rem] [&_.meaning]:text-text-dim";
const NOTE_PREVIEW_ITEM = "flex flex-col gap-[0.15rem] pb-[0.6rem] border-b border-[rgba(255,255,255,0.03)] [&_.title]:font-semibold [&_.title]:text-[0.88rem] [&_.title]:text-text [&_.snippet]:text-[0.82rem] [&_.snippet]:text-text-dim [&_.snippet]:whitespace-nowrap [&_.snippet]:overflow-hidden [&_.snippet]:text-ellipsis";
const MUTED_TEXT = "text-[0.82rem] text-text-faint m-0";

const KINDLE_LIST = "flex flex-col";
const KINDLE_ROW = "flex flex-col gap-[0.6rem] py-[1.2rem] border-b border-border transition-opacity duration-200 ease-brand first:pt-0";
const KINDLE_ROW_FAV = "border-l-2 border-l-accent pl-[1.2rem]";
const KINDLE_META = "flex justify-between items-center font-mono text-[0.7rem] text-text-faint uppercase tracking-[0.05em]";
const KINDLE_TEXT = "[font-family:Georgia,serif] italic text-[1.05rem] leading-[1.6] text-text m-0";
const KINDLE_FOOT = "flex justify-between items-center gap-4 [&_.tags]:flex [&_.tags]:gap-[0.4rem] [&_.tags]:flex-wrap [&_.actions]:flex [&_.actions]:items-center [&_.actions]:gap-[0.4rem]";
const AI_OUT = "mt-[0.6rem] flex items-center gap-[0.4rem] text-[0.82rem] text-text-dim";

const VOCAB_TABLE_CONTAINER = "w-full overflow-x-auto";
const VOCAB_TABLE =
  "w-full border-collapse text-left " +
  "[&_th]:font-mono [&_th]:text-[0.68rem] [&_th]:uppercase [&_th]:tracking-[0.06em] [&_th]:text-text-faint [&_th]:p-[0.8rem_1rem] [&_th]:border-b [&_th]:border-border [&_th:first-child]:pl-0 [&_th.actions-header]:w-[80px] " +
  "max-[720px]:[&_th]:hidden max-[720px]:[&_td]:block max-[720px]:[&_td]:p-[0.5rem_0] max-[720px]:[&_td]:border-none max-[720px]:[&_td:first-child]:pt-4 max-[720px]:[&_td:last-child]:border-b max-[720px]:[&_td:last-child]:border-border max-[720px]:[&_td:last-child]:pb-4";
const VOCAB_ROW =
  "border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.01)] max-[720px]:border-none " +
  "[&_td]:p-4 [&_td]:align-top [&_td]:text-[0.88rem] [&_td:first-child]:pl-0 " +
  "[&_.vocab-word-cell_strong]:text-[0.95rem] [&_.vocab-word-cell_strong]:text-text " +
  "[&_.vocab-def-cell_.meaning]:m-0 [&_.vocab-def-cell_.meaning]:text-text-dim [&_.vocab-def-cell_.meaning]:leading-[1.5] [&_.vocab-def-cell_.example]:m-0 [&_.vocab-def-cell_.example]:mt-[0.25rem] [&_.vocab-def-cell_.example]:italic [&_.vocab-def-cell_.example]:text-[0.8rem] [&_.vocab-def-cell_.example]:text-text-faint " +
  "[&_.vocab-page-cell]:text-text-faint [&_.vocab-page-cell]:font-mono [&_.vocab-page-cell]:text-[0.78rem] [&_.vocab-status-cell]:!align-middle [&_.vocab-actions-cell]:!align-middle";
const VOCAB_ROW_ACTIONS = "flex items-center gap-[0.35rem] [&_button.danger:hover]:!text-bad";

const NOTES_NOTEBOOK = "flex flex-col gap-8";
const NOTEBOOK_GROUP = "flex flex-col gap-[0.8rem]";
const NOTEBOOK_GROUP_LABEL = "font-mono text-[0.68rem] uppercase tracking-[0.08em] text-text-faint m-0 pb-[0.4rem] border-b border-border";
const NOTEBOOK_ENTRIES = "flex flex-col";
const NOTEBOOK_ENTRY = "flex flex-col gap-2 py-[1.2rem] border-b border-[rgba(255,255,255,0.03)] last:border-b-0 [&_.entry-title]:font-display [&_.entry-title]:text-[0.95rem] [&_.entry-title]:font-semibold [&_.entry-title]:text-text [&_.entry-title]:m-0 [&_.entry-body]:text-[0.88rem] [&_.entry-body]:leading-[1.6] [&_.entry-body]:text-text-dim [&_.entry-body]:m-0 [&_.entry-body]:whitespace-pre-wrap [&_.entry-foot]:flex [&_.entry-foot]:justify-between [&_.entry-foot]:items-center [&_.entry-foot]:mt-[0.3rem] [&_.entry-date]:text-[0.72rem] [&_.entry-date]:text-text-faint";

const GITHUB_TIMELINE = "relative pl-[1.8rem] [&_.timeline-line]:absolute [&_.timeline-line]:left-[7px] [&_.timeline-line]:top-[6px] [&_.timeline-line]:bottom-[6px] [&_.timeline-line]:w-[2px] [&_.timeline-line]:bg-border";
const TIMELINE_NODE =
  "group relative flex gap-4 pb-8 last:pb-0 " +
  "[&_.timeline-dot-wrapper]:absolute [&_.timeline-dot-wrapper]:-left-[1.8rem] [&_.timeline-dot-wrapper]:top-[4px] [&_.timeline-dot-wrapper]:w-4 [&_.timeline-dot-wrapper]:h-4 [&_.timeline-dot-wrapper]:flex [&_.timeline-dot-wrapper]:items-center [&_.timeline-dot-wrapper]:justify-center " +
  "[&_.timeline-dot]:w-2 [&_.timeline-dot]:h-2 [&_.timeline-dot]:rounded-full [&_.timeline-dot]:bg-border-bright [&_.timeline-dot]:border-2 [&_.timeline-dot]:border-[var(--background)] [&_.timeline-dot]:z-[2] [&_.timeline-dot]:transition-all [&_.timeline-dot]:duration-200 [&_.timeline-dot]:ease-brand " +
  "group-hover:[&_.timeline-dot]:bg-accent group-hover:[&_.timeline-dot]:scale-[1.2] " +
  "[&_.timeline-content]:flex [&_.timeline-content]:flex-col [&_.timeline-content]:gap-[0.25rem] [&_.timeline-content]:flex-1 " +
  "[&_.timeline-header]:flex [&_.timeline-header]:justify-between [&_.timeline-header]:items-baseline [&_.timeline-header]:text-[0.86rem] [&_.timeline-header_.label]:font-semibold [&_.timeline-header_.label]:text-text [&_.timeline-header_.time]:text-[0.72rem] [&_.timeline-header_.time]:text-text-faint " +
  "[&_.detail]:text-[0.82rem] [&_.detail]:text-text-dim [&_.detail]:m-0 [&_.location]:font-mono [&_.location]:text-[0.72rem] [&_.location]:text-text-faint [&_.location]:uppercase";
const TIMELINE_NODE_STARTED = "[&_.timeline-dot]:!bg-accent [&_.timeline-dot]:shadow-[0_0_0_2px_var(--accent-soft)]";

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
  const cls = `${COVER_BASE} ${COVER_SIZE[size]}`;
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
        <div className={LIB_TITLE}>
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
          {/* Title block */}
          <div className="flex flex-col gap-[0.3rem]">
            <h1 className={rw.heroMainH1}>{book.title}</h1>
            <span className={rw.heroSub}>{[book.author, book.year].filter(Boolean).join(" · ")}</span>
          </div>

          {/* Rating + status — the single source of truth for both (24px below title) */}
          <div className="mt-6 flex items-center gap-3">
            <Stars value={book.rating ?? 0} onSet={(r) => updateBook(book.id, { rating: r })} />
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

          {/* Progress / finished journey (24px below rating) */}
          <div className="mt-6">
            {book.status === "finished" ? (
              <div className="rw-hero-finished-summary">
                <span className="journey-tag">Finished</span>
                {book.startedAt && <span className="journey-date">Started {formatDate(book.startedAt)}</span>}
                {book.finishedAt && <span className="journey-date">Finished {formatDate(book.finishedAt)}</span>}
                {journeyDays && <span className="journey-days">{journeyDays} day reading journey</span>}
              </div>
            ) : (
              <ProgressEditor book={book} stats={stats} onSet={(currentPage, totalPages) => updateBook(book.id, { currentPage, totalPages })} />
            )}
          </div>
        </div>

        {/* Right panel — contextual metrics only (no status/rating duplication) */}
        <div className="rw-hero-panel">
          {book.startedAt && (
            <div className="rw-hero-panel-row">
              <span className="lbl">Started</span>
              <span className="val">{formatDate(book.startedAt)}</span>
            </div>
          )}

          {book.status === "finished" && book.finishedAt ? (
            <div className="rw-hero-panel-row">
              <span className="lbl">Finished</span>
              <span className="val">{formatDate(book.finishedAt)}</span>
            </div>
          ) : (
            <div className="rw-hero-panel-row">
              <span className="lbl">Last read</span>
              <span className="val">{relativeDay(book.updatedAt, now)}</span>
            </div>
          )}

          <div className="rw-hero-panel-row">
            <span className="lbl">Pages</span>
            <span className="val">{book.currentPage ?? 0} / {book.totalPages ?? 0}</span>
          </div>

          <div className="rw-hero-panel-row">
            <span className="lbl">Sessions</span>
            <span className="val">{readingSessions}</span>
          </div>

          {stats.streak > 0 && (
            <div className="rw-hero-panel-row">
              <span className="lbl">Streak</span>
              <span className="val">{stats.streak} days</span>
            </div>
          )}
        </div>
      </header>

      {/* Knowledge stats — readable line, below the hero */}
      <div className="mb-8 flex items-center gap-3 text-[0.86rem] text-text-dim">
        <span><b className="font-semibold text-text">{stats.quoteCount}</b> Quotes</span>
        <span className="text-[rgba(255,255,255,0.15)]">•</span>
        <span><b className="font-semibold text-text">{stats.vocabCount}</b> Words</span>
        <span className="text-[rgba(255,255,255,0.15)]">•</span>
        <span><b className="font-semibold text-text">{stats.noteCount}</b> Notes</span>
        <span className="text-[rgba(255,255,255,0.15)]">•</span>
        <span><b className="font-semibold text-text">{readingSessions}</b> Sessions</span>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="rw-tabs">
        <div className={rw.tabsRow}>
          <TabsList unstyled className={rw.tabsList}>
            <TabsTrigger unstyled className={rw.tabsTrigger} value="overview">Overview</TabsTrigger>
            <TabsTrigger unstyled className={rw.tabsTrigger} value="quotes">Quotes ({stats.quoteCount})</TabsTrigger>
            <TabsTrigger unstyled className={rw.tabsTrigger} value="vocab">Words ({stats.vocabCount})</TabsTrigger>
            <TabsTrigger unstyled className={rw.tabsTrigger} value="notes">Notes ({stats.noteCount})</TabsTrigger>
            <TabsTrigger unstyled className={rw.tabsTrigger} value="timeline">Timeline</TabsTrigger>
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
