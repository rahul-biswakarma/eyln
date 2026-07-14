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
    <div className="book-search">
      <div className="book-search-input">
        {loading ? <CircleNotchIcon size={14} className="spin animate-spin" /> : <MagnifyingGlassIcon size={14} />}
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="book-search-results">
          {results.map((r) => (
            <button key={r.key} className="book-search-result" onClick={() => pick(r)}>
              {r.coverUrl ? (
                <img src={r.coverUrl} alt="" loading="lazy" />
              ) : (
                <span className="book-search-nocover"><BookOpenIcon size={16} weight="duotone" /></span>
              )}
              <span className="book-search-meta">
                <span className="title">{r.title}</span>
                <span className="sub">{[r.author, r.year].filter(Boolean).join(" · ")}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
