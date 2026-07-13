import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "./auth";
import { useProgress, type Attempt } from "./progress";
import { useNotes, type Note, type Reminder, type OpenScore } from "./notes";
import { useTutor, type TutorTask } from "./tutor";
interface CloudDoc {
    done?: Record<string, boolean>;
    quizScores?: Record<string, number>;
    exercisesDone?: Record<string, boolean>;
    attempts?: Record<string, Attempt[]>;
    lastVisited?: Record<string, number>;
    solvedChallenges?: Record<string, number>;
    notes?: Note[];
    bookmarks?: Record<string, number>;
    reminders?: Reminder[];
    openScores?: Record<string, OpenScore>;
    tutorTasks?: TutorTask[];
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
    const t = useTutor.getState();
    return {
        done: p.done,
        quizScores: p.quizScores,
        exercisesDone: p.exercisesDone,
        attempts: p.attempts,
        lastVisited: p.lastVisited,
        solvedChallenges: p.solvedChallenges,
        notes: n.notes,
        bookmarks: n.bookmarks,
        reminders: n.reminders,
        openScores: n.openScores,
        tutorTasks: t.tasks,
        updatedAt: Date.now(),
    };
}
export function saveState() {
    if (!currentUid || !hydrated)
        return;
    if (saveTimer)
        clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        const r = currentUid ? ref(currentUid) : null;
        if (!r)
            return;
        void setDoc(r, snapshot()).catch(() => { });
    }, 800);
}
async function fetchAndHydrate(uid: string) {
    const r = ref(uid);
    if (!r)
        return;
    try {
        const snap = await getDoc(r);
        if (snap.exists()) {
            const c = snap.data() as CloudDoc;
            useProgress.setState({
                done: c.done ?? {},
                quizScores: c.quizScores ?? {},
                exercisesDone: c.exercisesDone ?? {},
                attempts: c.attempts ?? {},
                lastVisited: c.lastVisited ?? {},
                solvedChallenges: c.solvedChallenges ?? {},
            });
            useNotes.setState({
                notes: c.notes ?? [],
                bookmarks: c.bookmarks ?? {},
                reminders: c.reminders ?? [],
                openScores: c.openScores ?? {},
            });
            useTutor.setState({ tasks: c.tutorTasks ?? [] });
        }
    }
    catch {
    }
    finally {
        hydrated = true;
    }
}
export function initPersistence() {
    useAuth.subscribe((state) => {
        const uid = state.user?.uid ?? null;
        if (uid && uid !== currentUid) {
            currentUid = uid;
            hydrated = false;
            void fetchAndHydrate(uid);
        }
        else if (!uid) {
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
