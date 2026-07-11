import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "./auth";
import { useProgress } from "./progress";
import { useNotes, type Note, type Reminder, type OpenScore } from "./notes";

interface CloudDoc {
  done?: Record<string, boolean>;
  quizScores?: Record<string, number>;
  lastVisited?: Record<string, number>;
  solvedChallenges?: Record<string, number>;
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

function localSnapshot(): CloudDoc {
  const p = useProgress.getState();
  const n = useNotes.getState();
  return {
    done: p.done,
    quizScores: p.quizScores,
    lastVisited: p.lastVisited,
    solvedChallenges: p.solvedChallenges,
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

/** Merge a cloud document into the local stores (union / newest-wins). */
function applyCloud(cloud: CloudDoc) {
  const p = useProgress.getState();
  const n = useNotes.getState();
  useProgress.setState({
    done: orMerge(p.done, cloud.done),
    quizScores: maxMerge(p.quizScores, cloud.quizScores),
    lastVisited: maxMerge(p.lastVisited, cloud.lastVisited),
    solvedChallenges: maxMerge(p.solvedChallenges, cloud.solvedChallenges),
  });
  useNotes.setState({
    notes: mergeById(n.notes, cloud.notes),
    bookmarks: maxMerge(n.bookmarks, cloud.bookmarks),
    reminders: mergeById(n.reminders, cloud.reminders),
    openScores: mergeOpenScores(n.openScores, cloud.openScores),
  });
}

function scheduleWrite() {
  if (!activeUid) return;
  if (writeTimer) clearTimeout(writeTimer);
  // Debounced write-on-change: one setDoc per burst of edits, no open
  // connection or continuous reads.
  writeTimer = setTimeout(async () => {
    const ref = activeUid ? userDocRef(activeUid) : null;
    if (!ref) return;
    try {
      await setDoc(ref, { ...localSnapshot(), updatedAt: Date.now() });
    } catch {
      /* transient — next change reschedules */
    }
  }, 1500);
}

async function attach(uid: string) {
  activeUid = uid;
  const ref = userDocRef(uid);
  if (!ref) return;

  // One-time pull + merge (union of local and cloud) on sign-in.
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) applyCloud(snap.data() as CloudDoc);
  } catch {
    /* offline — keep local */
  }
  scheduleWrite();

  // Thereafter, write local changes up (debounced). No live listener.
  unsubProgress = useProgress.subscribe(scheduleWrite);
  unsubNotes = useNotes.subscribe(scheduleWrite);
}

function detach() {
  // Flush any pending write immediately so nothing is lost on sign-out.
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  const ref = activeUid ? userDocRef(activeUid) : null;
  if (ref) { void setDoc(ref, { ...localSnapshot(), updatedAt: Date.now() }).catch(() => {}); }
  activeUid = null;
  unsubProgress?.(); unsubProgress = null;
  unsubNotes?.(); unsubNotes = null;
}

export function initSync() {
  if (unsubAuth) return;
  unsubAuth = useAuth.subscribe((state) => {
    const uid = state.user?.uid ?? null;
    if (uid && uid !== activeUid) {
      detach();
      void attach(uid);
    } else if (!uid && activeUid) {
      detach();
    }
  });
  const existing = useAuth.getState().user?.uid;
  if (existing) void attach(existing);
}
