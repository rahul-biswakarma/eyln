import { initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "6LfDZU8tAAAAAN8tkipl9NX0wY-efJTdfNuf3zkY";
export function isFirebaseEnabled(): boolean {
    return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
function ensureApp(): FirebaseApp {
    if (!app) {
        app = initializeApp(config);
        if (RECAPTCHA_SITE_KEY) {
            initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
                isTokenAutoRefreshEnabled: true,
            });
        }
    }
    return app;
}
export function getFirebaseApp(): FirebaseApp {
    return ensureApp();
}
export function getAuthClient(): Auth | null {
    if (!isFirebaseEnabled())
        return null;
    if (!authInstance)
        authInstance = getAuth(ensureApp());
    return authInstance;
}
export function getDb(): Firestore | null {
    if (!isFirebaseEnabled())
        return null;
    if (!dbInstance)
        dbInstance = getFirestore(ensureApp());
    return dbInstance;
}
export function getStorageClient(): FirebaseStorage | null {
    if (!isFirebaseEnabled())
        return null;
    if (!storageInstance)
        storageInstance = getStorage(ensureApp());
    return storageInstance;
}
export const googleProvider = new GoogleAuthProvider();
