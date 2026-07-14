/**
 * Book metadata lookup via the Open Library API — free, keyless, CORS-enabled.
 * https://openlibrary.org/dev/docs/api/search
 */
export interface BookMetadata {
  key: string; // Open Library work key, e.g. "/works/OL45804W"
  title: string;
  author?: string;
  year?: number;
  coverUrl?: string; // medium cover
  coverId?: number;
}

const SEARCH_URL = "https://openlibrary.org/search.json";

/** Cover image URL from an Open Library cover id. size: S | M | L. */
export function coverUrlFromId(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

/**
 * Search Open Library by free text (title and/or author). Returns the top
 * matches with cover art. Returns [] on any network/parse failure so callers
 * can degrade to manual entry.
 */
export async function searchBooks(query: string, limit = 6, signal?: AbortSignal): Promise<BookMetadata[]> {
  const q = query.trim();
  if (!q) return [];
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    fields: "key,title,author_name,first_publish_year,cover_i",
  });
  try {
    const res = await fetch(`${SEARCH_URL}?${params}`, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      docs?: Array<{
        key: string;
        title: string;
        author_name?: string[];
        first_publish_year?: number;
        cover_i?: number;
      }>;
    };
    return (data.docs ?? [])
      .filter((d) => d.title)
      .map((d) => ({
        key: d.key,
        title: d.title,
        author: d.author_name?.[0],
        year: d.first_publish_year,
        coverId: d.cover_i,
        coverUrl: d.cover_i ? coverUrlFromId(d.cover_i, "M") : undefined,
      }));
  } catch {
    return [];
  }
}
