import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
function save(patch: Record<string, unknown>) {
    writeCloudState(getCurrentUid(), patch);
}
export type ReadingStatus = "reading" | "finished" | "want" | "paused";
export interface Book {
    id: string;
    title: string;
    author?: string;
    status: ReadingStatus;
    coverColor?: string;
    coverUrl?: string; // cover image from Open Library (falls back to coverColor swatch)
    year?: number; // first publish year, from metadata lookup
    olKey?: string; // Open Library work key, for dedup / future enrichment
    rating?: number;
    totalPages?: number; // for reading-progress %
    currentPage?: number;
    startedAt?: number;
    finishedAt?: number;
    createdAt: number;
    updatedAt: number;
}
interface BooksState {
    books: Book[];
    addBook: (b: Omit<Book, "id" | "createdAt" | "updatedAt">) => string;
    updateBook: (id: string, patch: Partial<Pick<Book, "title" | "author" | "status" | "coverColor" | "coverUrl" | "year" | "rating" | "totalPages" | "currentPage" | "startedAt" | "finishedAt">>) => void;
    deleteBook: (id: string) => void;
}
let seq = 0;
const uid = () => `b-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const EMPTY_BOOKS = { books: [] as Book[] };
export const useBooks = create<BooksState>()((set) => ({
    ...EMPTY_BOOKS,
    addBook: (b) => {
        const now = Date.now();
        const id = uid();
        set((s) => {
            const books = [{ ...b, id, createdAt: now, updatedAt: now }, ...s.books];
            save({ books });
            return { books };
        });
        return id;
    },
    updateBook: (id, patch) => {
        set((s) => {
            const books = s.books.map((b) => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b);
            save({ books });
            return { books };
        });
    },
    deleteBook: (id) => {
        set((s) => {
            const books = s.books.filter((b) => b.id !== id);
            save({ books });
            return { books };
        });
    },
}));
export function hydrateBooks(data: {
    books?: Book[];
} | null) {
    useBooks.setState({ books: data?.books ?? [] });
}
