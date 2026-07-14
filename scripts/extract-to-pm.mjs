// Extracts course content from src/modules/*/index.tsx into ProseMirror JSON.
//
// Parses the TypeScript AST (NOT regex — tags like <f32> live inside code/math
// string literals and must not be treated as JSX). For each module it emits:
//   dist-content/modules/{moduleId}.json  → { doc: ModuleDoc-ish, lessons: {id: PMDoc} }
// and a catalog manifest. Also converts code challenges.
//
// Run: node scripts/extract-to-pm.mjs [moduleId]   (optional: one module only)

import ts from "typescript";
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODULES_DIR = join(ROOT, "src", "modules");
const OUT_DIR = join(ROOT, "dist-content");

const WIDGET_NAME_TO_REF = {
    IntegratorDemo: "integrator-demo",
    MatrixTransform2D: "matrix-transform-2d",
    NoiseExplorer: "noise-explorer",
    ShaderEditor: "shader-editor",
    SplineEditor: "spline-editor",
    TerrainField: "terrain-field",
    TransformPipeline3D: "transform-pipeline-3d",
    TriangleDemo: "triangle-demo",
    VectorPlayground: "vector-playground",
};

const warnings = [];
function warn(msg) {
    warnings.push(msg);
}

// ── literal evaluation ──────────────────────────────────────────────────────
function evalLiteral(node) {
    if (!node) return undefined;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
        const v = evalLiteral(node.operand);
        return typeof v === "number" ? -v : v;
    }
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(evalLiteral);
    if (ts.isObjectLiteralExpression(node)) {
        const o = {};
        for (const p of node.properties) {
            if (ts.isPropertyAssignment(p)) o[p.name.getText()] = evalLiteral(p.initializer);
        }
        return o;
    }
    if (ts.isAsExpression(node)) return evalLiteral(node.expression);
    if (ts.isParenthesizedExpression(node)) return evalLiteral(node.expression);
    return undefined; // functions, identifiers, etc.
}

function getProp(objLiteral, name) {
    for (const p of objLiteral.properties) {
        if (ts.isPropertyAssignment(p) && p.name.getText() === name) return p.initializer;
        if (ts.isShorthandPropertyAssignment(p) && p.name.getText() === name) return p.name;
    }
    return undefined;
}

// ── HTML entity decode (for JsxText) ────────────────────────────────────────
function decodeEntities(s) {
    return s
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
        .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–").replace(/&times;/g, "×")
        .replace(/&rarr;/g, "→").replace(/&le;/g, "≤").replace(/&ge;/g, "≥");
}

// ── JSX helpers ─────────────────────────────────────────────────────────────
function tagName(el) {
    const opening = ts.isJsxElement(el) ? el.openingElement : el;
    return opening.tagName.getText();
}
function jsxChildren(el) {
    return ts.isJsxElement(el) ? [...el.children] : [];
}
function attrValue(el, name) {
    const opening = ts.isJsxElement(el) ? el.openingElement : el;
    for (const a of opening.attributes.properties) {
        if (ts.isJsxAttribute(a) && a.name.getText() === name) {
            if (!a.initializer) return true; // bare boolean attr
            if (ts.isStringLiteral(a.initializer)) return a.initializer.text;
            if (ts.isJsxExpression(a.initializer)) return evalLiteral(a.initializer.expression);
        }
    }
    return undefined;
}
function hasAttr(el, name) {
    return attrValue(el, name) !== undefined;
}

// Pull a plain text string out of a <M>/<MBlock> child (a JsxExpression w/ template).
function texOf(el) {
    const kids = jsxChildren(el);
    for (const k of kids) {
        if (ts.isJsxExpression(k) && k.expression) {
            const v = evalLiteral(k.expression);
            if (typeof v === "string") return v;
        }
        if (ts.isJsxText(k)) {
            const t = k.text.trim();
            if (t) return decodeEntities(t);
        }
    }
    return "";
}

// ── inline conversion ────────────────────────────────────────────────────────
const MARK_TAGS = { strong: "bold", b: "bold", em: "italic", i: "italic", code: "code" };

function pushText(out, text, marks) {
    if (!text) return;
    const node = { type: "text", text };
    if (marks && marks.length) node.marks = marks.map((type) => ({ type }));
    out.push(node);
}

function convertInline(children, marks, out) {
    for (const child of children) {
        if (ts.isJsxText(child)) {
            const raw = child.text.replace(/\s+/g, " ");
            if (raw.trim() === "" && raw.includes("\n")) continue; // pure-newline formatting
            pushText(out, decodeEntities(raw), marks);
        } else if (ts.isJsxExpression(child)) {
            if (!child.expression) continue;
            const v = evalLiteral(child.expression);
            if (typeof v === "string") pushText(out, v, marks);
            else if (typeof v === "number") pushText(out, String(v), marks);
            // ignore {" "} already covered; ignore .map() etc (none in inline)
        } else if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
            const tag = tagName(child);
            if (tag === "M") {
                out.push({ type: "mathInline", attrs: { tex: texOf(child) } });
            } else if (tag === "br") {
                out.push({ type: "hardBreak" });
            } else if (MARK_TAGS[tag]) {
                convertInline(jsxChildren(child), [...marks, MARK_TAGS[tag]], out);
            } else if (tag === "span" || tag === "a" || tag === "kbd") {
                // unwrap inline wrappers (styling only)
                convertInline(jsxChildren(child), marks, out);
            } else {
                warn(`inline: unhandled <${tag}> — unwrapping`);
                convertInline(jsxChildren(child), marks, out);
            }
        }
    }
    return out;
}

// ── html serialization (fallback for tables etc.) ────────────────────────────
function serializeHtml(node) {
    if (ts.isJsxText(node)) return decodeEntities(node.text.replace(/\s+/g, " "));
    if (ts.isJsxExpression(node)) {
        const v = evalLiteral(node.expression);
        return typeof v === "string" ? v : "";
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = tagName(node);
        const cls = attrValue(node, "className");
        const attrs = typeof cls === "string" ? ` class="${cls}"` : "";
        if (tag === "M") return `<span>${texOf(node)}</span>`;
        const inner = jsxChildren(node).map(serializeHtml).join("");
        if (ts.isJsxSelfClosingElement(node)) return `<${tag}${attrs}/>`;
        return `<${tag}${attrs}>${inner}</${tag}>`;
    }
    return "";
}

// ── block conversion ──────────────────────────────────────────────────────────
const HTML_FALLBACK_TAGS = new Set(["table", "thead", "tbody", "tr", "td", "th", "dl", "dt", "dd"]);
const HEADINGS = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

function convertBlocks(children, out) {
    for (const child of children) {
        if (ts.isJsxText(child)) continue; // whitespace between blocks
        if (ts.isJsxExpression(child)) {
            // block-level {cond && <X/>} or {arr.map(...)} — try to dig out elements
            const inner = child.expression;
            if (inner && (ts.isJsxElement(inner) || ts.isJsxSelfClosingElement(inner))) {
                convertBlocks([inner], out);
            } else {
                warn("block: skipped non-static JSX expression");
            }
            continue;
        }
        if (!ts.isJsxElement(child) && !ts.isJsxSelfClosingElement(child)) continue;
        const tag = tagName(child);

        if (tag === "p") {
            // A <p> may contain a block-level child mid-flow (MBlock, Code, …).
            // Split the paragraph around such children so the PM doc stays valid.
            const BLOCK_IN_P = new Set(["MBlock", "Code", "CodeTabs", ...Object.keys(WIDGET_NAME_TO_REF)]);
            const kids = jsxChildren(child);
            const hasBlock = kids.some((k) => (ts.isJsxElement(k) || ts.isJsxSelfClosingElement(k)) && BLOCK_IN_P.has(tagName(k)));
            if (!hasBlock) {
                out.push({ type: "paragraph", content: convertInline(kids, [], []) });
            } else {
                let inline = [];
                const flush = () => {
                    const c = convertInline(inline, [], []);
                    if (c.length) out.push({ type: "paragraph", content: c });
                    inline = [];
                };
                for (const k of kids) {
                    if ((ts.isJsxElement(k) || ts.isJsxSelfClosingElement(k)) && BLOCK_IN_P.has(tagName(k))) {
                        flush();
                        convertBlocks([k], out);
                    } else {
                        inline.push(k);
                    }
                }
                flush();
            }
        } else if (HEADINGS[tag]) {
            out.push({ type: "heading", attrs: { level: HEADINGS[tag] }, content: convertInline(jsxChildren(child), [], []) });
        } else if (tag === "ul" || tag === "ol") {
            out.push(convertList(child, tag === "ol"));
        } else if (tag === "MBlock") {
            out.push({ type: "mathBlock", attrs: { tex: texOf(child) } });
        } else if (tag === "Code") {
            out.push({
                type: "codeSample",
                attrs: {
                    lang: attrValue(child, "lang") ?? "ts",
                    code: attrValue(child, "code") ?? "",
                    filename: attrValue(child, "filename") ?? null,
                },
            });
        } else if (tag === "CodeTabs") {
            out.push({ type: "codeSample", attrs: { lang: "ts", code: "", tabs: attrValue(child, "tabs") ?? [] } });
        } else if (tag === "Notice") {
            out.push(convertNotice(child));
        } else if (WIDGET_NAME_TO_REF[tag]) {
            out.push({ type: "widget", attrs: { ref: WIDGET_NAME_TO_REF[tag], props: null } });
        } else if (tag === "div") {
            convertBlocks(jsxChildren(child), out); // unwrap layout divs
        } else if (HTML_FALLBACK_TAGS.has(tag)) {
            out.push({ type: "htmlBlock", attrs: { html: serializeHtml(child) } });
        } else if (tag === "br") {
            // stray block-level break — ignore
        } else {
            warn(`block: unhandled <${tag}> — html fallback`);
            out.push({ type: "htmlBlock", attrs: { html: serializeHtml(child) } });
        }
    }
    return out;
}

function convertList(el, ordered) {
    const items = [];
    for (const li of jsxChildren(el)) {
        if (!ts.isJsxElement(li) || tagName(li) !== "li") continue;
        // A list item may hold inline content and/or nested blocks (sub-lists, MBlock).
        const kids = jsxChildren(li);
        const hasBlockChild = kids.some(
            (k) => (ts.isJsxElement(k) || ts.isJsxSelfClosingElement(k)) &&
                ["ul", "ol", "MBlock", "Code", "p"].includes(tagName(k)),
        );
        if (hasBlockChild) {
            const blocks = [];
            // group leading inline into a paragraph, then blocks
            const inline = [];
            for (const k of kids) {
                if ((ts.isJsxElement(k) || ts.isJsxSelfClosingElement(k)) &&
                    ["ul", "ol", "MBlock", "Code", "p"].includes(tagName(k))) {
                    if (inline.length) { blocks.push({ type: "paragraph", content: convertInline(inline, [], []) }); inline.length = 0; }
                    convertBlocks([k], blocks);
                } else {
                    inline.push(k);
                }
            }
            if (inline.length) blocks.push({ type: "paragraph", content: convertInline(inline, [], []) });
            items.push({ type: "listItem", content: blocks.length ? blocks : [{ type: "paragraph" }] });
        } else {
            items.push({ type: "listItem", content: [{ type: "paragraph", content: convertInline(kids, [], []) }] });
        }
    }
    return { type: ordered ? "orderedList" : "bulletList", content: items };
}

function convertNotice(el) {
    const warnAttr = hasAttr(el, "warn");
    let label = null;
    const inlineChildren = [];
    for (const k of jsxChildren(el)) {
        if (ts.isJsxElement(k) && tagName(k) === "span" && attrValue(k, "className") === "lbl") {
            const buf = [];
            convertInline(jsxChildren(k), [], buf);
            label = buf.map((n) => n.text ?? "").join("");
        } else {
            inlineChildren.push(k);
        }
    }
    return {
        type: "notice",
        attrs: { variant: warnAttr ? "warn" : "info", label },
        content: convertInline(inlineChildren, [], []),
    };
}

// ── Body resolution: find function by name, get its returned JSX root ─────────
function findFunctionsByName(sourceFile) {
    const map = new Map();
    const visit = (n) => {
        if (ts.isFunctionDeclaration(n) && n.name) map.set(n.name.text, n);
        if (ts.isVariableStatement(n)) {
            for (const d of n.declarationList.declarations) {
                if (ts.isIdentifier(d.name) && d.initializer &&
                    (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer))) {
                    map.set(d.name.text, d.initializer);
                }
            }
        }
        ts.forEachChild(n, visit);
    };
    visit(sourceFile);
    return map;
}

function returnedJsxRoot(fnNode) {
    let root = null;
    const visit = (n) => {
        if (root) return;
        if (ts.isReturnStatement(n) && n.expression) {
            let e = n.expression;
            while (ts.isParenthesizedExpression(e)) e = e.expression;
            if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e)) root = e;
            return;
        }
        // arrow with expression body: () => (<div/>)
        ts.forEachChild(n, visit);
    };
    if (ts.isArrowFunction(fnNode) && fnNode.body && !ts.isBlock(fnNode.body)) {
        let e = fnNode.body;
        while (ts.isParenthesizedExpression(e)) e = e.expression;
        if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e) || ts.isJsxFragment(e)) return e;
    }
    visit(fnNode);
    return root;
}

function bodyToPMDoc(fnNode) {
    const root = returnedJsxRoot(fnNode);
    if (!root) return { type: "doc", content: [] };
    // unwrap outer <div className="prose"> or fragment
    let children;
    if (ts.isJsxFragment(root)) children = [...root.children];
    else if (ts.isJsxElement(root)) children = [...root.children];
    else children = [root];
    const content = convertBlocks(children, []);
    return { type: "doc", content };
}

// ── validate() → {expected, tolerance, msgs} ─────────────────────────────────
// Safely evaluate a numeric expected-value expression: number literals, the
// four operators, parens, and Math.* only. Rejects anything else.
function evalNumericExpr(expr) {
    const cleaned = expr.trim();
    // Strip `Math.<prop>` accesses, then no bare identifiers may remain — only
    // Math.* is permitted (Math.sqrt, Math.PI, Math.log, …).
    const stripped = cleaned.replace(/Math\.[A-Za-z]+/g, "");
    if (/[A-Za-z_$]/.test(stripped)) return null;
    if (!/^[-+*/%().\d\s\w]+$/.test(cleaned)) return null;
    try {
        // eslint-disable-next-line no-new-func
        const v = Function("Math", `"use strict"; return (${cleaned});`)(Math);
        return typeof v === "number" && isFinite(v) ? v : null;
    } catch {
        return null;
    }
}

function parseValidate(fnNode) {
    // Match Math.abs(<inputExpr> - <EXPECTED_EXPR>) < TOL. <inputExpr> is
    // parseFloat(s) or a local var; <EXPECTED_EXPR> may be a literal or a small
    // arithmetic/Math expression (8/3, Math.sqrt(29), (-3), etc.).
    const text = fnNode.getText();
    if (!/parseFloat\s*\(/.test(text)) return { unparsed: true };
    // Greedy capture of everything between the subtraction and `) <`, then drop
    // the trailing `)` that closes Math.abs — this tolerates inner parens like
    // Math.sqrt(29). The leading input term (parseFloat(s) or a var) is stripped.
    const m = text.match(/Math\.abs\(\s*([A-Za-z_$][\w$]*(?:\([^)]*\))?)\s*-\s*(.*)\)\s*<\s*([\d.]+)/s);
    if (!m) return { unparsed: true };
    const expected = evalNumericExpr(m[2]);
    if (expected === null) return { unparsed: true };
    const tolerance = Number(m[3]);
    const msgs = [...text.matchAll(/message:\s*"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
    return { expected, tolerance, correctMsg: msgs[0], wrongMsg: msgs[1] };
}

// ── lesson / module extraction ────────────────────────────────────────────────
function extractExercises(arrNode, fns, srcText) {
    if (!arrNode || !ts.isArrayLiteralExpression(arrNode)) return [];
    return arrNode.elements.filter(ts.isObjectLiteralExpression).map((ex) => {
        const id = evalLiteral(getProp(ex, "id"));
        const kind = evalLiteral(getProp(ex, "kind"));
        const attrs = {
            id, kind,
            prompt: evalLiteral(getProp(ex, "prompt")) ?? "",
            starter: evalLiteral(getProp(ex, "starter")) ?? "",
            hint: evalLiteral(getProp(ex, "hint")) ?? null,
            rubric: evalLiteral(getProp(ex, "rubric")) ?? null,
            expected: null, tolerance: null, correctMsg: null, wrongMsg: null,
        };
        const v = getProp(ex, "validate");
        if (v && (ts.isArrowFunction(v) || ts.isFunctionExpression(v))) {
            const parsed = parseValidate(v, srcText);
            if (parsed.unparsed) warn(`exercise ${id}: validate() not a tolerance check — needs manual review`);
            else {
                attrs.expected = parsed.expected;
                attrs.tolerance = parsed.tolerance;
                attrs.correctMsg = parsed.correctMsg ?? null;
                attrs.wrongMsg = parsed.wrongMsg ?? null;
            }
        }
        return attrs;
    });
}

function extractQuiz(quizNode) {
    if (!quizNode || !ts.isObjectLiteralExpression(quizNode)) return null;
    const q = getProp(quizNode, "questions");
    const questions = evalLiteral(q);
    return Array.isArray(questions) ? questions : null;
}

function extractModule(filePath) {
    const srcText = readFileSync(filePath, "utf8");
    const sf = ts.createSourceFile(filePath, srcText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const fns = findFunctionsByName(sf);

    // find `export const X: Module = { ... }`
    let moduleObj = null;
    sf.forEachChild((n) => {
        if (ts.isVariableStatement(n) && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            for (const d of n.declarationList.declarations) {
                if (d.initializer && ts.isObjectLiteralExpression(d.initializer) &&
                    getProp(d.initializer, "lessons")) {
                    moduleObj = d.initializer;
                }
            }
        }
    });
    if (!moduleObj) return null;

    const meta = {
        id: evalLiteral(getProp(moduleObj, "id")),
        title: evalLiteral(getProp(moduleObj, "title")),
        blurb: evalLiteral(getProp(moduleObj, "blurb")),
        icon: evalLiteral(getProp(moduleObj, "icon")),
        track: evalLiteral(getProp(moduleObj, "track")) ?? "engine",
        dependsOn: evalLiteral(getProp(moduleObj, "dependsOn")) ?? [],
    };

    const lessonsArr = getProp(moduleObj, "lessons");
    const lessonMetas = [];
    const lessonDocs = {};
    for (const lo of lessonsArr.elements) {
        if (!ts.isObjectLiteralExpression(lo)) continue;
        const id = evalLiteral(getProp(lo, "id"));
        const title = evalLiteral(getProp(lo, "title"));
        const minutes = evalLiteral(getProp(lo, "minutes"));
        const summary = evalLiteral(getProp(lo, "summary"));
        const bodyRef = getProp(lo, "Body");
        const bodyName = bodyRef && ts.isIdentifier(bodyRef) ? bodyRef.text : null;
        const fn = bodyName ? fns.get(bodyName) : null;
        if (!fn) warn(`${meta.id}/${id}: Body '${bodyName}' not found`);
        const doc = fn ? bodyToPMDoc(fn) : { type: "doc", content: [] };

        // append quiz + exercises as trailing nodes in the doc
        const exercises = extractExercises(getProp(lo, "exercises"), fns, srcText);
        const quiz = extractQuiz(getProp(lo, "quiz"));
        for (const ex of exercises) doc.content.push({ type: "exercise", attrs: ex });
        if (quiz) doc.content.push({ type: "quiz", attrs: { id: `${meta.id}/${id}`, questions: quiz } });

        lessonDocs[id] = doc;
        lessonMetas.push({ id, title, minutes, summary, hasQuestions: exercises.length > 0 || !!quiz });
    }

    return { meta, lessonMetas, lessonDocs };
}

// ── code challenges ───────────────────────────────────────────────────────────
// Collect every CodeChallenge object literal across challenges.ts + challenges/*.
// They're pure data (tests[], strings) — evalLiteral handles them directly.
function extractChallengesFromFile(filePath, defaultTrack) {
    const srcText = readFileSync(filePath, "utf8");
    const sf = ts.createSourceFile(filePath, srcText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const found = [];
    const visit = (n) => {
        // A challenge object literal has both `fnName` and `tests` properties.
        if (ts.isObjectLiteralExpression(n) && getProp(n, "fnName") && getProp(n, "tests")) {
            const obj = evalLiteral(n);
            if (obj && obj.id) {
                if (!obj.practiceTrack && defaultTrack) obj.practiceTrack = defaultTrack;
                found.push(obj);
            }
        }
        ts.forEachChild(n, visit);
    };
    visit(sf);
    return found;
}

function extractChallenges() {
    const base = join(ROOT, "src", "content");
    const files = [
        // challenges.ts's inline array is dsaChallenges → practiceTrack "dsa"
        [join(base, "challenges.ts"), "dsa"],
        [join(base, "challenges", "engine.ts"), null],
        [join(base, "challenges", "math.ts"), null],
        [join(base, "challenges", "dsa-extra.ts"), null],
    ];
    const all = [];
    const seen = new Set();
    for (const [f, track] of files) {
        if (!existsSync(f)) continue;
        for (const ch of extractChallengesFromFile(f, track)) {
            if (seen.has(ch.id)) { warn(`challenge ${ch.id}: duplicate id — skipped`); continue; }
            seen.add(ch.id);
            all.push(ch);
        }
    }
    return all;
}

// ── main ──────────────────────────────────────────────────────────────────────
const only = process.argv[2];
const moduleDirs = readdirSync(MODULES_DIR).filter((d) => {
    const p = join(MODULES_DIR, d, "index.tsx");
    return existsSync(p);
});

mkdirSync(join(OUT_DIR, "modules"), { recursive: true });
const catalog = [];
for (const dir of moduleDirs) {
    const filePath = join(MODULES_DIR, dir, "index.tsx");
    const result = extractModule(filePath);
    if (!result) { warn(`${dir}: no Module export found`); continue; }
    const { meta, lessonMetas, lessonDocs } = result;
    if (only && meta.id !== only) continue;
    writeFileSync(
        join(OUT_DIR, "modules", `${meta.id}.json`),
        JSON.stringify({ meta, lessons: lessonMetas, docs: lessonDocs }, null, 2),
    );
    catalog.push({ ...meta, lessonCount: lessonMetas.length });
    console.log(`✓ ${meta.id}: ${lessonMetas.length} lessons`);
}
writeFileSync(join(OUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));

// challenges
if (!only) {
    const challenges = extractChallenges();
    mkdirSync(join(OUT_DIR, "challenges"), { recursive: true });
    for (const ch of challenges) {
        writeFileSync(join(OUT_DIR, "challenges", `${ch.id}.json`), JSON.stringify(ch, null, 2));
    }
    const chManifest = challenges.map((c) => ({
        id: c.id, title: c.title, difficulty: c.difficulty, topic: c.topic,
        practiceTrack: c.practiceTrack ?? null, source: c.source ?? null, tags: c.tags ?? [],
    }));
    writeFileSync(join(OUT_DIR, "challenges.json"), JSON.stringify(chManifest, null, 2));
    console.log(`✓ ${challenges.length} challenges`);
}

console.log(`\n${catalog.length} modules → ${OUT_DIR}`);
if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warnings:`);
    for (const w of warnings.slice(0, 60)) console.log("  - " + w);
}
