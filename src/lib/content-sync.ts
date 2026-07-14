import { getBytes, ref as storageRef } from "firebase/storage";
import { getStorageClient } from "./firebase";
import { fetchModuleDoc, fetchChallengeDoc } from "./content-catalog";
import { getCachedModule, putCachedModule, getCachedChallenge, putCachedChallenge } from "./content-store";
import type { CachedModule, LessonBody, ModuleDoc, ChallengeDoc } from "../content/pm/catalog-types";
import type { PMDoc } from "../content/pm/types";
import type { CodeChallenge } from "../content/types";

/**
 * Version-gated content sync.
 *
 *   open a module/lesson:
 *     - read cached copy from IndexedDB
 *     - if missing OR cached.version < catalog.version → fetch fresh from Storage,
 *       write to IndexedDB, return it
 *     - else return the cached copy
 *   offline (catalog fetch fails) → serve whatever is cached (may be stale)
 */

async function readJSON<T>(path: string): Promise<T | null> {
    const storage = getStorageClient();
    if (!storage) return null;
    const bytes = await getBytes(storageRef(storage, path));
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as T;
}

/** Fetch every lesson body for a module version and assemble a cache entry. */
async function downloadModule(doc: ModuleDoc): Promise<CachedModule> {
    const lessons: Record<string, PMDoc> = {};
    await Promise.all(
        doc.lessons.map(async (l) => {
            const body = await readJSON<LessonBody>(`${doc.contentPath}/${l.id}.json`);
            if (body) lessons[l.id] = body.doc;
        }),
    );
    return { id: doc.id, version: doc.version, updatedAt: doc.updatedAt, lessons };
}

/**
 * Return the cached module, refreshing from Storage if the catalog version is
 * ahead of (or the cache is missing) the local copy. Pass a already-fetched
 * `catalogDoc` to avoid a redundant Firestore read when the caller has it.
 */
export async function syncModule(moduleId: string, catalogDoc?: ModuleDoc | null): Promise<CachedModule | null> {
    const cached = await getCachedModule(moduleId);
    let doc = catalogDoc;
    if (doc === undefined) {
        try {
            doc = await fetchModuleDoc(moduleId);
        } catch {
            doc = null; // offline / read failure
        }
    }
    // No catalog info → serve stale cache if we have it.
    if (!doc) return cached;
    // Cache is current.
    if (cached && cached.version >= doc.version) return cached;
    // Refetch.
    try {
        const fresh = await downloadModule(doc);
        await putCachedModule(fresh);
        return fresh;
    } catch {
        return cached; // Storage failure → fall back to stale cache
    }
}

/** Get a single lesson's PM doc, syncing its module first. */
export async function getLessonDoc(
    moduleId: string,
    lessonId: string,
    catalogDoc?: ModuleDoc | null,
): Promise<PMDoc | null> {
    const mod = await syncModule(moduleId, catalogDoc);
    return mod?.lessons[lessonId] ?? null;
}

/** Version-gated challenge sync (single object per challenge). */
export async function syncChallenge(challengeId: string, catalogDoc?: ChallengeDoc | null): Promise<CodeChallenge | null> {
    const cached = await getCachedChallenge(challengeId);
    let doc = catalogDoc;
    if (doc === undefined) {
        try {
            doc = await fetchChallengeDoc(challengeId);
        } catch {
            doc = null;
        }
    }
    if (!doc) return cached?.body ?? null;
    if (cached && cached.version >= doc.version) return cached.body;
    try {
        const body = await readJSON<CodeChallenge>(`${doc.contentPath}/${doc.id}.json`);
        if (!body) return cached?.body ?? null;
        await putCachedChallenge({ id: doc.id, version: doc.version, body });
        return body;
    } catch {
        return cached?.body ?? null;
    }
}
