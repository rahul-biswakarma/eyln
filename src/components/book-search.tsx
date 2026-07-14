import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, CircleNotchIcon, BookOpenIcon } from "@phosphor-icons/react";
import { searchBooks, type BookMetadata } from "../lib/book-metadata";

/**
 * Debounced Open Library search box. Calls onPick with the chosen metadata
 * (title, author, cover, year). Purely presentational otherwise — the parent
 * decides what to do with the pick (create a book, prefill a form, etc.).
 */
export function BookSearch({
  onPick,
  placeholder = "Search a book by title or author…",
  autoFocus,
}: {
  onPick: (meta: BookMetadata) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const found = await searchBooks(q, 6, controller.signal);
      if (!controller.signal.aborted) {
        setResults(found);
        setLoading(false);
        setOpen(true);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  const pick = (meta: BookMetadata) => {
    onPick(meta);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="book-search relative">
      <div className="flex items-center gap-2 bg-surface-inset border border-border rounded-sm px-[0.7rem] text-text-dim focus-within:border-accent">
        {loading ? <CircleNotchIcon size={14} className="spin animate-spin" /> : <MagnifyingGlassIcon size={14} />}
        <input
          type="text"
          className="flex-1 bg-transparent border-none text-text py-[0.6rem] text-[0.85rem] focus:outline-none"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 top-[calc(100%+4px)] left-0 right-0 bg-surface-2 border border-border-bright rounded-sm shadow-card overflow-x-hidden overflow-y-auto max-h-[340px]">
          {results.map((r) => (
            <button
              key={r.key}
              className="flex gap-[0.7rem] items-center w-full text-left bg-transparent border-b border-b-border py-[0.55rem] px-[0.7rem] cursor-pointer transition-colors duration-200 ease-brand last:border-b-0 hover:bg-accent-soft"
              onClick={() => pick(r)}
            >
              {r.coverUrl ? (
                <img src={r.coverUrl} alt="" loading="lazy" className="w-8 h-[46px] object-cover rounded-[3px] shrink-0 shadow-card" />
              ) : (
                <span className="grid place-items-center w-8 h-[46px] rounded-[3px] bg-surface-inset text-text-faint shrink-0"><BookOpenIcon size={16} weight="duotone" /></span>
              )}
              <span className="flex flex-col min-w-0">
                <span className="text-[0.82rem] text-text whitespace-nowrap overflow-hidden text-ellipsis">{r.title}</span>
                <span className="text-[0.72rem] text-text-dim">{[r.author, r.year].filter(Boolean).join(" · ")}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
