// Auth state as a small zustand store, driven by Firebase's onAuthStateChanged.
// When Firebase isn't configured, `ready` is true and `user` stays null, so the
// UI simply shows a "sign in" affordance that explains it's disabled.
import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { getAuthClient, googleProvider, isFirebaseEnabled } from "./firebase";

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  /** false until the first auth-state callback (or immediately if disabled). */
  ready: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

function toUser(u: User): AuthUser {
  return { uid: u.uid, name: u.displayName, email: u.email, photoURL: u.photoURL };
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: !isFirebaseEnabled(), // nothing to wait for when disabled
  error: null,

  signIn: async () => {
    const auth = getAuthClient();
    if (!auth) {
      set({ error: "Sync is not configured for this build." });
      return;
    }
    try {
      set({ error: null });
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  signOut: async () => {
    const auth = getAuthClient();
    if (!auth) return;
    await fbSignOut(auth);
  },
}));

/** Wire Firebase auth changes into the store. Call once at app start. */
export function initAuthListener() {
  const auth = getAuthClient();
  if (!auth) {
    useAuth.setState({ ready: true, user: null });
    return;
  }
  onAuthStateChanged(auth, (u) => {
    useAuth.setState({ user: u ? toUser(u) : null, ready: true });
  });
}
