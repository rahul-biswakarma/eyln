import type { CachedModule, CachedChallenge } from "../content/pm/catalog-types";

/**
 * IndexedDB cache for cloud content. Stores whole modules (all lesson bodies)
 * and challenges, keyed by id, each carrying the `version` last synced. The
 * sync layer decides when to refetch by comparing this version to the catalog.
 */

const DB_NAME = "eyln-content";
const DB_VERSION = 1;
const MODULES = "modules";
const CHALLENGES = "challenges";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
        if (typeof indexedDB === "undefined") {
            resolve(null);
            return;
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(MODULES)) db.createObjectStore(MODULES, { keyPath: "id" });
            if (!db.objectStoreNames.contains(CHALLENGES)) db.createObjectStore(CHALLENGES, { keyPath: "id" });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
    return openDB().then(
        (db) =>
            new Promise<T | null>((resolve) => {
                if (!db) {
                    resolve(null);
                    return;
                }
                let result: T | null = null;
                const t = db.transaction(store, mode);
                const req = run(t.objectStore(store));
                req.onsuccess = () => {
                    result = req.result ?? null;
                };
                t.oncomplete = () => resolve(result);
                t.onerror = () => resolve(null);
                t.onabort = () => resolve(null);
            }),
    );
}

export function getCachedModule(id: string): Promise<CachedModule | null> {
    return tx<CachedModule>(MODULES, "readonly", (s) => s.get(id) as IDBRequest<CachedModule>);
}

export function putCachedModule(mod: CachedModule): Promise<unknown> {
    return tx(MODULES, "readwrite", (s) => s.put(mod));
}

export function getCachedChallenge(id: string): Promise<CachedChallenge | null> {
    return tx<CachedChallenge>(CHALLENGES, "readonly", (s) => s.get(id) as IDBRequest<CachedChallenge>);
}

export function putCachedChallenge(ch: CachedChallenge): Promise<unknown> {
    return tx(CHALLENGES, "readwrite", (s) => s.put(ch));
}

/** Wipe the content cache (e.g. on a schema/DB-version bump or manual reset). */
export function clearContentCache(): Promise<void> {
    return openDB().then(
        (db) =>
            new Promise<void>((resolve) => {
                if (!db) {
                    resolve();
                    return;
                }
                const t = db.transaction([MODULES, CHALLENGES], "readwrite");
                t.objectStore(MODULES).clear();
                t.objectStore(CHALLENGES).clear();
                t.oncomplete = () => resolve();
                t.onerror = () => resolve();
            }),
    );
}
