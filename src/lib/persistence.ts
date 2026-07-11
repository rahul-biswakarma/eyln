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

let currentUid: string | null = null;
let hydrated = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function ref(uid: string) {
  const db = getDb();
  return db ? doc(db, "users", uid, "state", "main") : null;
}

function snapshot(): CloudDoc {
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
    updatedAt: Date.now(),
  };
}

/**
 * Persist current progress + notes to the DB. Called by store actions after a
 * button click (mark complete, solve challenge, add note/reminder, …). Debounced
 * so a burst of edits collapses into one write. No-op until the user is signed
 * in and the initial fetch has finished (so we never overwrite cloud with empty).
 */
export function saveState() {
  if (!currentUid || !hydrated) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const r = currentUid ? ref(currentUid) : null;
    if (!r) return;
    void setDoc(r, snapshot()).catch(() => {});
  }, 800);
}

/** Fetch this user's saved progress from the DB and hydrate the local stores. */
async function fetchAndHydrate(uid: string) {
  const r = ref(uid);
  if (!r) return;
  try {
    const snap = await getDoc(r);
    if (snap.exists()) {
      const c = snap.data() as CloudDoc;
      useProgress.setState({
        done: c.done ?? {},
        quizScores: c.quizScores ?? {},
        lastVisited: c.lastVisited ?? {},
        solvedChallenges: c.solvedChallenges ?? {},
      });
      useNotes.setState({
        notes: c.notes ?? [],
        bookmarks: c.bookmarks ?? {},
        reminders: c.reminders ?? [],
        openScores: c.openScores ?? {},
      });
    }
  } catch {
    /* offline — keep whatever the local cache had */
  } finally {
    hydrated = true;
  }
}

/** Wire persistence to auth: fetch on sign-in, stop on sign-out. */
export function initPersistence() {
  useAuth.subscribe((state) => {
    const uid = state.user?.uid ?? null;
    if (uid && uid !== currentUid) {
      currentUid = uid;
      hydrated = false;
      void fetchAndHydrate(uid);
    } else if (!uid) {
      currentUid = null;
      hydrated = false;
    }
  });
  const existing = useAuth.getState().user?.uid;
  if (existing) {
    currentUid = existing;
    void fetchAndHydrate(existing);
  }
}
