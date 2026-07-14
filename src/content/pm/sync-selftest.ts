import { getCachedModule, putCachedModule, clearContentCache } from "../../lib/content-store";
import type { CachedModule } from "./catalog-types";
import { sampleDoc } from "./sample-doc";

/**
 * Dev-only self-test for the IndexedDB content store + version-gate logic.
 * Runs the round-trip and version-comparison rules the sync layer relies on,
 * without needing a live Firebase backend. Returns human-readable results.
 */
export async function runSyncSelfTest(): Promise<string[]> {
    const out: string[] = [];
    const id = "__selftest__";
    await clearContentCache();

    const v1: CachedModule = { id, version: 1, updatedAt: 1000, lessons: { intro: sampleDoc } };
    await putCachedModule(v1);
    const got1 = await getCachedModule(id);
    out.push(got1?.version === 1 && !!got1.lessons.intro ? "✓ round-trip: stored + read v1" : "✗ round-trip failed");

    // Simulate the gate: catalog v1 vs cached v1 → no refetch.
    const catalogVersion = 1;
    const shouldRefetchSame = !got1 || got1.version < catalogVersion;
    out.push(!shouldRefetchSame ? "✓ gate: cached==catalog → no refetch" : "✗ gate: refetched when current");

    // Simulate the gate: catalog v2 ahead of cached v1 → refetch.
    const shouldRefetchNewer = !got1 || got1.version < 2;
    out.push(shouldRefetchNewer ? "✓ gate: cached<catalog → refetch" : "✗ gate: missed a newer version");

    // Overwrite with v2 and confirm it replaces.
    const v2: CachedModule = { id, version: 2, updatedAt: 2000, lessons: { intro: sampleDoc } };
    await putCachedModule(v2);
    const got2 = await getCachedModule(id);
    out.push(got2?.version === 2 ? "✓ overwrite: v2 replaced v1" : "✗ overwrite failed");

    await clearContentCache();
    const cleared = await getCachedModule(id);
    out.push(cleared === null ? "✓ clear: cache emptied" : "✗ clear failed");

    return out;
}
