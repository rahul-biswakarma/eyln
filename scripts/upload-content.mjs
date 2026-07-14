// Uploads extracted content (dist-content/) to Firestore + Firebase Storage.
//
// Firestore:  tracks/{id}, modules/{id} (metadata + version), challenges/{id}
// Storage:    content/{moduleId}/v{version}/{lessonId}.json,
//             challenges/v{version}/{challengeId}.json
//
// Requires the Firebase Admin SDK with credentials. Set one of:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
// and the storage bucket via CONTENT_STORAGE_BUCKET (defaults to
// {projectId}.appspot.com). Version bumps are controlled by CONTENT_VERSION
// (default 1) — bump it to publish an update the clients will re-sync.
//
// Run: node scripts/upload-content.mjs [--dry-run]

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync } from "node:fs";
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
    const bucket = process.env.CONTENT_STORAGE_BUCKET || `${projectId}.appspot.com`;
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credential = credPath ? cert(readJSON(credPath)) : applicationDefault();
    initializeApp({ credential, projectId, storageBucket: bucket });
    return { db: getFirestore(), bucket: getStorage().bucket() };
}

async function main() {
    const catalog = readJSON(join(OUT_DIR, "catalog.json"));
    const challengeManifest = readJSON(join(OUT_DIR, "challenges.json"));

    if (DRY) {
        console.log(`[dry-run] would upload ${catalog.length} modules, ${challengeManifest.length} challenges at v${VERSION}`);
    }
    const { db, bucket } = DRY ? {} : initAdmin();
    const now = Date.now();

    // tracks
    for (const t of TRACKS) {
        if (DRY) { console.log(`track ${t.id}`); continue; }
        await db.collection("tracks").doc(t.id).set(t);
    }

    // modules + lesson bodies
    for (const m of catalog) {
        const mod = readJSON(join(OUT_DIR, "modules", `${m.id}.json`));
        const contentPath = `content/${m.id}/v${VERSION}`;
        // upload each lesson body
        for (const [lessonId, doc] of Object.entries(mod.docs)) {
            const path = `${contentPath}/${lessonId}.json`;
            const body = JSON.stringify({ id: lessonId, moduleId: m.id, doc });
            if (DRY) { console.log(`  storage ${path} (${body.length}b)`); continue; }
            await bucket.file(path).save(body, { contentType: "application/json" });
        }
        const doc = {
            id: m.id, trackId: m.track, title: m.title, blurb: m.blurb, icon: m.icon,
            dependsOn: m.dependsOn ?? [], order: catalog.indexOf(m),
            lessons: mod.lessons, version: VERSION, updatedAt: now, contentPath,
        };
        if (DRY) { console.log(`module ${m.id}: ${mod.lessons.length} lessons`); continue; }
        await db.collection("modules").doc(m.id).set(doc);
        console.log(`✓ ${m.id}`);
    }

    // challenges + bodies
    const chPath = `challenges/v${VERSION}`;
    for (const c of challengeManifest) {
        const body = readJSON(join(OUT_DIR, "challenges", `${c.id}.json`));
        if (DRY) { console.log(`challenge ${c.id}`); continue; }
        await bucket.file(`${chPath}/${c.id}.json`).save(JSON.stringify(body), { contentType: "application/json" });
        await db.collection("challenges").doc(c.id).set({
            ...c, version: VERSION, updatedAt: now, contentPath: chPath,
        });
    }
    if (!DRY) console.log(`✓ ${challengeManifest.length} challenges`);
    console.log(DRY ? "\n[dry-run] no writes performed" : `\nUploaded at v${VERSION}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
