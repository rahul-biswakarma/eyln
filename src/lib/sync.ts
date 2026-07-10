// Cloud sync: mirror the progress + notes stores to Firestore, one doc per user.
// On sign-in we merge cloud data into local (union of completions, best scores,
// newest notes), push the merged result up, then keep writing local changes to
// the cloud (debounced). Sign-out detaches the writer. All of this is inert when
// Firebase isn't configured, so the app still runs fully on localStorage.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "./auth";
import { useProgress } from "./progress";
import { useNotes, type Note, type Reminder, type OpenScore } from "./notes";

interface CloudDoc {
  done?: Record<string, boolean>;
  quizScores?: Record<string, number>;
  lastVisited?: Record<string, number>;
  notes?: Note[];
  bookmarks?: Record<string, number>;
  reminders?: Reminder[];
  openScores?: Record<string, OpenScore>;
  updatedAt?: number;
}

function maxMerge(a: Record<string, number> = {}, b: Record<string, number> = {}) {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

function orMerge(a: Record<string, boolean> = {}, b: Record<string, boolean> = {}) {
  const out: Record<string, boolean> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = out[k] || v;
  return out;
}

function mergeById<T extends { id: string; updatedAt?: number; createdAt?: number }>(
  a: T[] = [],
  b: T[] = []
): T[] {
  const byId = new Map<string, T>();
  for (const item of [...a, ...b]) {
    const prev = byId.get(item.id);
    const stamp = (x: T) => x.updatedAt ?? x.createdAt ?? 0;
    if (!prev || stamp(item) >= stamp(prev)) byId.set(item.id, item);
  }
  return [...byId.values()];
}

function mergeOpenScores(a: Record<string, OpenScore> = {}, b: Record<string, OpenScore> = {}) {
  const out: Record<string, OpenScore> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (!out[k] || v.score > out[k].score) out[k] = v;
  }
  return out;
}

/** Current local state flattened into the cloud shape. */
function localSnapshot(): CloudDoc {
  const p = useProgress.getState();
  const n = useNotes.getState();
  return {
    done: p.done,
    quizScores: p.quizScores,
    lastVisited: p.lastVisited,
    notes: n.notes,
    bookmarks: n.bookmarks,
    reminders: n.reminders,
    openScores: n.openScores,
  };
}

function userDocRef(uid: string) {
  const db = getDb();
  if (!db) return null;
  return doc(db, "users", uid, "state", "main");
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let unsubProgress: (() => void) | null = null;
let unsubNotes: (() => void) | null = null;
let unsubAuth: (() => void) | null = null;
let activeUid: string | null = null;

function scheduleWrite() {
  if (!activeUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    const ref = activeUid ? userDocRef(activeUid) : null;
    if (!ref) return;
    try {
      await setDoc(ref, { ...localSnapshot(), updatedAt: Date.now() });
    } catch {
      /* transient network error — the next change reschedules a write */
    }
  }, 1200);
}

async function attach(uid: string) {
  activeUid = uid;
  const ref = userDocRef(uid);
  if (!ref) return;

  // 1. Pull the cloud doc and merge it into the local stores.
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const cloud = snap.data() as CloudDoc;
      const p = useProgress.getState();
      const n = useNotes.getState();
      useProgress.setState({
        done: orMerge(p.done, cloud.done),
        quizScores: maxMerge(p.quizScores, cloud.quizScores),
        lastVisited: maxMerge(p.lastVisited, cloud.lastVisited),
      });
      useNotes.setState({
        notes: mergeById(n.notes, cloud.notes),
        bookmarks: maxMerge(n.bookmarks, cloud.bookmarks),
        reminders: mergeById(n.reminders, cloud.reminders),
        openScores: mergeOpenScores(n.openScores, cloud.openScores),
      });
    }
  } catch {
    /* offline / permission issue — keep local data, still attach writers */
  }

  // 2. Push the merged result and subscribe to future local changes.
  scheduleWrite();
  unsubProgress = useProgress.subscribe(scheduleWrite);
  unsubNotes = useNotes.subscribe(scheduleWrite);
}

function detach() {
  activeUid = null;
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  unsubProgress?.(); unsubProgress = null;
  unsubNotes?.(); unsubNotes = null;
}

/** Start reacting to auth changes: attach sync on sign-in, detach on sign-out. */
export function initSync() {
  if (unsubAuth) return; // already initialized
  unsubAuth = useAuth.subscribe((state) => {
    const uid = state.user?.uid ?? null;
    if (uid && uid !== activeUid) {
      detach();
      void attach(uid);
    } else if (!uid && activeUid) {
      detach();
    }
  });
  // Handle the case where a user is already restored before this subscribe runs.
  const existing = useAuth.getState().user?.uid;
  if (existing) void attach(existing);
}
