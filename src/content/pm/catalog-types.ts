import type { TrackId } from "../types";
import type { PMDoc } from "./types";
import type { CodeChallenge } from "../types";

/**
 * Cloud catalog shapes. Firestore holds metadata + version pointers (light,
 * queried to render lists); Firebase Storage holds the heavy per-lesson PM JSON.
 */

/** Firestore: `tracks/{trackId}` */
export interface TrackDoc {
    id: TrackId;
    title: string;
    blurb: string;
    icon: string;
    accent: string;
    order: number;
}

/** A lesson's index entry, stored inline on the module doc (no body). */
export interface LessonMeta {
    id: string;
    title: string;
    minutes: number;
    summary: string;
    /** Whether this lesson has a quiz or exercises (drives questionary listing). */
    hasQuestions?: boolean;
}

/** Firestore: `modules/{moduleId}` */
export interface ModuleDoc {
    id: string;
    trackId: TrackId;
    title: string;
    blurb: string;
    icon: string;
    dependsOn: string[];
    order: number;
    lessons: LessonMeta[];
    /** Monotonic version; IndexedDB refetches when its cached copy is behind. */
    version: number;
    updatedAt: number;
}

/**
 * Firestore: `moduleContent/{moduleId}` — the heavy lesson bodies for a module,
 * kept in a separate doc from the light `modules/{id}` catalog entry so listing
 * courses doesn't pull every lesson. Well under Firestore's 1 MiB/doc limit
 * (largest module ~55 KB). `version` mirrors the catalog doc's version.
 */
export interface ModuleContentDoc {
    id: string;
    version: number;
    /** lessonId -> PM doc */
    lessons: Record<string, PMDoc>;
}

/** Firestore: `challenges/{challengeId}` — metadata + inlined body (challenges
 *  are tiny, ~2.5 KB max, so the full CodeChallenge is stored on the doc). */
export interface ChallengeDoc {
    id: string;
    title: string;
    difficulty: CodeChallenge["difficulty"];
    topic: string;
    practiceTrack?: CodeChallenge["practiceTrack"];
    source?: string;
    tags: string[];
    version: number;
    updatedAt: number;
    /** The full challenge (prompt, starter, tests, hint, solution) as a JSON
     *  string — Firestore forbids nested arrays (tests[].args), so it can't be
     *  stored as a live object. The client JSON.parses this on read. */
    bodyJson: string;
}

/** What IndexedDB caches per module: the doc's version + all lesson bodies. */
export interface CachedModule {
    id: string;
    version: number;
    updatedAt: number;
    /** lessonId -> PM doc */
    lessons: Record<string, PMDoc>;
}

/** What IndexedDB caches per challenge. */
export interface CachedChallenge {
    id: string;
    version: number;
    body: CodeChallenge;
}
