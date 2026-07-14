import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "./firebase";
import type { ChallengeDoc, ModuleDoc, TrackDoc } from "../content/pm/catalog-types";

/**
 * Firestore reads for the content catalog. These are the lightweight metadata
 * docs used to render course/module lists; lesson bodies live in Storage and
 * are fetched lazily by the sync layer.
 */

export async function fetchTracks(): Promise<TrackDoc[]> {
    const db = getDb();
    if (!db) return [];
    const snap = await getDocs(query(collection(db, "tracks"), orderBy("order")));
    return snap.docs.map((d) => d.data() as TrackDoc);
}

export async function fetchModules(): Promise<ModuleDoc[]> {
    const db = getDb();
    if (!db) return [];
    const snap = await getDocs(query(collection(db, "modules"), orderBy("order")));
    return snap.docs.map((d) => d.data() as ModuleDoc);
}

export async function fetchModuleDoc(moduleId: string): Promise<ModuleDoc | null> {
    const db = getDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, "modules", moduleId));
    return snap.exists() ? (snap.data() as ModuleDoc) : null;
}

export async function fetchChallengeDocs(): Promise<ChallengeDoc[]> {
    const db = getDb();
    if (!db) return [];
    const snap = await getDocs(collection(db, "challenges"));
    return snap.docs.map((d) => d.data() as ChallengeDoc);
}

export async function fetchChallengeDoc(challengeId: string): Promise<ChallengeDoc | null> {
    const db = getDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, "challenges", challengeId));
    return snap.exists() ? (snap.data() as ChallengeDoc) : null;
}
