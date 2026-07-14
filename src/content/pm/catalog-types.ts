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
    /** Storage prefix for this version's lesson bodies: `content/{id}/v{version}`. */
    contentPath: string;
}

/** Firestore: `challenges/{challengeId}` — metadata; body (prompt/tests) in Storage. */
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
    contentPath: string;
}

/** Storage: `content/{moduleId}/v{version}/{lessonId}.json` */
export interface LessonBody {
    id: string;
    moduleId: string;
    doc: PMDoc;
}

/** Storage: `challenges/v{version}/{challengeId}.json` — the full challenge. */
export type ChallengeBody = CodeChallenge;

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
