// Uploads extracted content (dist-content/) to Firestore (free tier — no Storage).
//
// Firestore:
//   tracks/{id}              track metadata
//   modules/{id}             light catalog: metadata + version + lesson index
//   moduleContent/{id}       heavy: { version, lessons: {lessonId: PMDoc} }
//   challenges/{id}          metadata + inlined full challenge body
//
// Requires the Firebase Admin SDK with credentials:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
// Version bumps are controlled by CONTENT_VERSION (default 1) — bump it to
// publish an update that clients will re-sync.
//
// Run: node scripts/upload-content.mjs [--dry-run]

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "dist-content");
const VERSION = Number(process.env.CONTENT_VERSION ?? "1");
const DRY = process.argv.includes("--dry-run");

// Track metadata (mirrors src/content/tracks.ts).
const TRACKS = [
    { id: "engine", title: "3D Game Engine", blurb: "Build a renderer by hand in Odin + Metal — from a triangle to procedural terrain.", icon: "🔺", accent: "#FFB000", order: 0 },
    { id: "dsa", title: "Data Structures & Algorithms", blurb: "Complexity, the core data structures, and the algorithmic patterns behind them.", icon: "🧩", accent: "#FF8A00", order: 1 },
    { id: "math", title: "Mathematics", blurb: "Functions, limits, calculus, and the geometry of curves — the language underneath it all.", icon: "∫", accent: "#8FBF6B", order: 2 },
];

function readJSON(p) {
    return JSON.parse(readFileSync(p, "utf8"));
}

function initAdmin() {
    const projectId = process.env.FIREBASE_PROJECT_ID || "forge-bdf5e";
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credential = credPath ? cert(readJSON(credPath)) : applicationDefault();
    initializeApp({ credential, projectId });
    return getFirestore();
}

async function main() {
    const catalog = readJSON(join(OUT_DIR, "catalog.json"));
    const challengeManifest = readJSON(join(OUT_DIR, "challenges.json"));

    if (DRY) {
        console.log(`[dry-run] would upload ${catalog.length} modules, ${challengeManifest.length} challenges at v${VERSION}`);
    }
    const db = DRY ? null : initAdmin();
    const now = Date.now();

    // tracks
    for (const t of TRACKS) {
        if (DRY) { console.log(`track ${t.id}`); continue; }
        await db.collection("tracks").doc(t.id).set(t);
    }

    // modules: light catalog doc + heavy content doc (both under 1 MiB)
    for (const m of catalog) {
        const mod = readJSON(join(OUT_DIR, "modules", `${m.id}.json`));
        const contentBytes = JSON.stringify(mod.docs).length;
        if (contentBytes > 1_000_000) {
            console.error(`✗ ${m.id}: content ${contentBytes}b exceeds Firestore's ~1MiB doc limit`);
            process.exit(1);
        }
        if (DRY) {
            console.log(`module ${m.id}: ${mod.lessons.length} lessons, content ${contentBytes}b`);
            continue;
        }
        await db.collection("modules").doc(m.id).set({
            id: m.id, trackId: m.track, title: m.title, blurb: m.blurb, icon: m.icon,
            dependsOn: m.dependsOn ?? [], order: catalog.indexOf(m),
            lessons: mod.lessons, version: VERSION, updatedAt: now,
        });
        await db.collection("moduleContent").doc(m.id).set({
            id: m.id, version: VERSION, lessons: mod.docs,
        });
        console.log(`✓ ${m.id}`);
    }

    // challenges: metadata + inlined body. The body is stored as a JSON *string*
    // (bodyJson) because Firestore forbids nested arrays (tests[].args is an
    // array of arrays); the client JSON.parses it back.
    for (const c of challengeManifest) {
        const body = readJSON(join(OUT_DIR, "challenges", `${c.id}.json`));
        if (DRY) { console.log(`challenge ${c.id}`); continue; }
        await db.collection("challenges").doc(c.id).set({
            ...c, version: VERSION, updatedAt: now, bodyJson: JSON.stringify(body),
        });
    }
    if (!DRY) console.log(`✓ ${challengeManifest.length} challenges`);
    console.log(DRY ? "\n[dry-run] no writes performed" : `\nUploaded at v${VERSION}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
