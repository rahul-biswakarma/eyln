import { fetchModuleDoc, fetchModuleContent, fetchChallengeDoc } from "./content-catalog";
import { getCachedModule, putCachedModule, getCachedChallenge, putCachedChallenge } from "./content-store";
import type { CachedModule, ModuleDoc, ChallengeDoc } from "../content/pm/catalog-types";
import type { PMDoc } from "../content/pm/types";
import type { CodeChallenge } from "../content/types";

/**
 * Version-gated content sync (Firestore-backed, free tier — no Storage).
 *
 *   open a module/lesson:
 *     - read cached copy from IndexedDB
 *     - if missing OR cached.version < catalog.version → fetch the module's
 *       content doc from Firestore, write to IndexedDB, return it
 *     - else return the cached copy
 *   offline (catalog fetch fails) → serve whatever is cached (may be stale)
 */

/** Fetch a module's lesson bodies (one Firestore doc) and build a cache entry. */
async function downloadModule(doc: ModuleDoc): Promise<CachedModule | null> {
    const content = await fetchModuleContent(doc.id);
    if (!content) return null;
    return { id: doc.id, version: doc.version, updatedAt: doc.updatedAt, lessons: content.lessons ?? {} };
}

/**
 * Return the cached module, refreshing from Firestore if the catalog version is
 * ahead of (or the cache is missing) the local copy. Pass an already-fetched
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
        if (!fresh) return cached; // content doc missing → keep stale cache
        await putCachedModule(fresh);
        return fresh;
    } catch {
        return cached; // read failure → fall back to stale cache
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

/** Version-gated challenge sync. The full challenge is inlined on the Firestore
 *  doc, so no separate body fetch is needed. */
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
    if (!doc.bodyJson) return cached?.body ?? null;
    let body: CodeChallenge;
    try {
        body = JSON.parse(doc.bodyJson) as CodeChallenge;
    } catch {
        return cached?.body ?? null;
    }
    await putCachedChallenge({ id: doc.id, version: doc.version, body });
    return body;
}
