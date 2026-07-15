import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { Attempt } from "./progress";
import type { Note, Reminder, OpenScore } from "./notes";
import type { TutorTask } from "./tutor";
import type { Book } from "./books";
import type { Concept } from "./concepts";
import type { Space } from "./spaces";
import type { Project } from "./projects";
import type { Conversation } from "./conversations";
export interface CloudState {
    done: Record<string, boolean>;
    quizScores: Record<string, number>;
    exercisesDone: Record<string, boolean>;
    attempts: Record<string, Attempt[]>;
    lastVisited: Record<string, number>;
    solvedChallenges: Record<string, number>;
    notes: Note[];
    bookmarks: Record<string, number>;
    reminders: Reminder[];
    openScores: Record<string, OpenScore>;
    books: Book[];
    concepts: Concept[];
    spaces: Space[];
    projects: Project[];
    conversations: Conversation[];
    tutorTasks: TutorTask[];
    scratchpad: string;
    bestStreak: number;
}
let currentUid: string | null = null;
let pendingPatch: Partial<CloudState> = {};
let writeTimer: ReturnType<typeof setTimeout> | null = null;
function discardPendingWrite() {
    pendingPatch = {};
    if (writeTimer) {
        clearTimeout(writeTimer);
        writeTimer = null;
    }
}
export function setCurrentUid(uid: string | null) {
    if (uid === currentUid)
        return;
    discardPendingWrite();
    currentUid = uid;
}
export function getCurrentUid(): string | null {
    return currentUid;
}
function docRef(uid: string) {
    const db = getDb();
    return db ? doc(db, "users", uid, "state", "main") : null;
}
export async function fetchCloudState(uid: string): Promise<Partial<CloudState> | null> {
    const r = docRef(uid);
    if (!r)
        return null;
    const snap = await getDoc(r);
    return snap.exists() ? (snap.data() as Partial<CloudState>) : null;
}
export function writeCloudState(uid: string | null, patch: Partial<CloudState>) {
    if (!uid)
        return;
    pendingPatch = { ...pendingPatch, ...patch };
    if (writeTimer)
        clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
        const r = docRef(uid);
        const toWrite = pendingPatch;
        pendingPatch = {};
        writeTimer = null;
        if (!r)
            return;
        void setDoc(r, { ...toWrite, updatedAt: Date.now() }, { merge: true }).catch(() => { });
    }, 500);
}
