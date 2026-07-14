import { create } from "zustand";
import { useAuth } from "./auth";
import { fetchCloudState, setCurrentUid } from "./db";
import { hydrateProgress } from "./progress";
import { hydrateNotes } from "./notes";
import { hydrateTutor } from "./tutor";
import { hydrateScratchpad } from "./scratchpad";
import { hydrateBooks } from "./books";
import { hydrateConcepts } from "./concepts";
interface SyncState {
    loaded: boolean;
}
export const useSync = create<SyncState>()(() => ({
    loaded: false,
}));
let inFlightUid: string | null = null;
async function loadForUser(uid: string) {
    inFlightUid = uid;
    useSync.setState({ loaded: false });
    const data = await fetchCloudState(uid);
    if (inFlightUid !== uid)
        return;
    setCurrentUid(uid);
    hydrateProgress(data);
    hydrateNotes(data);
    hydrateBooks(data);
    hydrateConcepts(data);
    hydrateTutor(data ? { tasks: data.tutorTasks } : null);
    hydrateScratchpad(data?.scratchpad);
    useSync.setState({ loaded: true });
}
function clearAll() {
    inFlightUid = null;
    setCurrentUid(null);
    hydrateProgress(null);
    hydrateNotes(null);
    hydrateBooks(null);
    hydrateConcepts(null);
    hydrateTutor(null);
    hydrateScratchpad(null);
    useSync.setState({ loaded: false });
}
export function initSync() {
    useAuth.subscribe((state, prev) => {
        const uid = state.user?.uid ?? null;
        const prevUid = prev.user?.uid ?? null;
        if (uid === prevUid)
            return;
        if (uid)
            void loadForUser(uid);
        else
            clearAll();
    });
    const existing = useAuth.getState().user?.uid;
    if (existing)
        void loadForUser(existing);
}
