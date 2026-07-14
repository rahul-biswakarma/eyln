// Deploys firestore.rules to the project via the Admin SDK security-rules API.
// Requires GOOGLE_APPLICATION_CREDENTIALS. Run: node scripts/deploy-rules.mjs

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectId = process.env.FIREBASE_PROJECT_ID || "forge-bdf5e";
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({ credential: credPath ? cert(JSON.parse(readFileSync(credPath, "utf8"))) : applicationDefault(), projectId });

const source = readFileSync(join(ROOT, "firestore.rules"), "utf8");
const sr = getSecurityRules();
const ruleset = await sr.createRuleset(sr.createRulesFileFromSource("firestore.rules", source));
await sr.releaseFirestoreRuleset(ruleset);
console.log("✓ Deployed firestore.rules (ruleset " + ruleset.name + ")");
process.exit(0);
