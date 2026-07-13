import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { Attempt } from "./progress";
import type { Note, Reminder, OpenScore } from "./notes";
import type { TutorTask } from "./tutor";

/**
 * Every interaction in the app (progress, notes, tutor tasks, scratchpad) lives
 * in a single Firestore document: users/{uid}/state/main. There is no local
 * cache — the Zustand stores are an optimistic-update reflection of this
 * document: hydrated once from Firestore on sign-in, written straight back to
 * Firestore on every interaction.
 */
export interface CloudState {
  // progress
  done: Record<string, boolean>;
  quizScores: Record<string, number>;
  exercisesDone: Record<string, boolean>;
  attempts: Record<string, Attempt[]>;
  lastVisited: Record<string, number>;
  solvedChallenges: Record<string, number>;
  // notes
  notes: Note[];
  bookmarks: Record<string, number>;
  reminders: Reminder[];
  openScores: Record<string, OpenScore>;
  // tutor
  tutorTasks: TutorTask[];
  // scratchpad
  scratchpad: string;
}

// The signed-in uid actions write to. Set exclusively by lib/sync.ts.
let currentUid: string | null = null;

// Debounce + merge writes so rapid-fire interactions (typing in the
// scratchpad, quickly toggling lessons) collapse into one Firestore write.
let pendingPatch: Partial<CloudState> = {};
let writeTimer: ReturnType<typeof setTimeout> | null = null;

/** Drops any unflushed write — used when switching users so a stale patch never lands on the wrong doc. */
function discardPendingWrite() {
  pendingPatch = {};
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
}

export function setCurrentUid(uid: string | null) {
  if (uid === currentUid) return;
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
  if (!r) return null;
  const snap = await getDoc(r);
  return snap.exists() ? (snap.data() as Partial<CloudState>) : null;
}

export function writeCloudState(uid: string | null, patch: Partial<CloudState>) {
  if (!uid) return;
  pendingPatch = { ...pendingPatch, ...patch };
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    const r = docRef(uid);
    const toWrite = pendingPatch;
    pendingPatch = {};
    writeTimer = null;
    if (!r) return;
    void setDoc(r, { ...toWrite, updatedAt: Date.now() }, { merge: true }).catch(() => {});
  }, 500);
}
