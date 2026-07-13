import { create } from "zustand";
import { useAuth } from "./auth";
import { fetchCloudState, setCurrentUid } from "./db";
import { hydrateProgress } from "./progress";
import { hydrateNotes } from "./notes";
import { hydrateTutor } from "./tutor";
import { hydrateScratchpad } from "./scratchpad";

interface SyncState {
  /** True once the signed-in user's data has been fetched from Firestore (or there is no user). */
  loaded: boolean;
}

export const useSync = create<SyncState>()(() => ({
  loaded: false,
}));

// Guards against a stale fetch resolving after a newer sign-in/out.
let inFlightUid: string | null = null;

async function loadForUser(uid: string) {
  inFlightUid = uid;
  useSync.setState({ loaded: false });
  const data = await fetchCloudState(uid);
  if (inFlightUid !== uid) return; // superseded by a subsequent auth change
  setCurrentUid(uid);
  hydrateProgress(data);
  hydrateNotes(data);
  hydrateTutor(data ? { tasks: data.tutorTasks } : null);
  hydrateScratchpad(data?.scratchpad);
  useSync.setState({ loaded: true });
}

function clearAll() {
  inFlightUid = null;
  setCurrentUid(null);
  hydrateProgress(null);
  hydrateNotes(null);
  hydrateTutor(null);
  hydrateScratchpad(null);
  useSync.setState({ loaded: false });
}

/** Wires the data stores to the signed-in user's Firestore document. */
export function initSync() {
  useAuth.subscribe((state, prev) => {
    const uid = state.user?.uid ?? null;
    const prevUid = prev.user?.uid ?? null;
    if (uid === prevUid) return;
    if (uid) void loadForUser(uid);
    else clearAll();
  });

  const existing = useAuth.getState().user?.uid;
  if (existing) void loadForUser(existing);
}
