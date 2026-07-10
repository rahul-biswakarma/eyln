// Firebase bootstrap. Config comes from Vite env vars (VITE_FIREBASE_*).
// When the config is absent, isFirebaseEnabled() is false and the whole app
// falls back to localStorage-only, single-device behavior — no auth, no sync.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function isFirebaseEnabled(): boolean {
  return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensureApp(): FirebaseApp {
  if (!app) app = initializeApp(config);
  return app;
}

/** Lazily-created Auth instance (null when Firebase isn't configured). */
export function getAuthClient(): Auth | null {
  if (!isFirebaseEnabled()) return null;
  if (!authInstance) authInstance = getAuth(ensureApp());
  return authInstance;
}

/** Lazily-created Firestore instance (null when Firebase isn't configured). */
export function getDb(): Firestore | null {
  if (!isFirebaseEnabled()) return null;
  if (!dbInstance) dbInstance = getFirestore(ensureApp());
  return dbInstance;
}

export const googleProvider = new GoogleAuthProvider();
