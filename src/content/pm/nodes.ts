import { Node, mergeAttributes } from "@tiptap/core";

/**
 * TipTap Node extensions for our custom content types. These define the schema
 * (attrs + parse/render HTML) used by the static renderer to validate the doc
 * and by a future editor. The actual React rendering lives in `render-map.tsx`
 * via the static renderer's nodeMapping.
 *
 * All custom leaf nodes are atoms (no editable content) except `notice`, which
 * wraps inline content.
 */

export const MathInline = Node.create({
    name: "mathInline",
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,
    addAttributes() {
        return { tex: { default: "" } };
    },
    parseHTML() {
        return [{ tag: "span[data-math-inline]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes({ "data-math-inline": "" }, HTMLAttributes)];
    },
});

export const MathBlock = Node.create({
    name: "mathBlock",
    group: "block",
    atom: true,
    addAttributes() {
        return { tex: { default: "" } };
    },
    parseHTML() {
        return [{ tag: "div[data-math-block]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-math-block": "" }, HTMLAttributes)];
    },
});

export const CodeSample = Node.create({
    name: "codeSample",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            lang: { default: "ts" },
            code: { default: "" },
            filename: { default: null },
            tabs: { default: null },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-code-sample]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-code-sample": "" }, HTMLAttributes)];
    },
});

export const Notice = Node.create({
    name: "notice",
    group: "block",
    content: "inline*",
    addAttributes() {
        return {
            variant: { default: "info" },
            label: { default: null },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-notice]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-notice": "" }, HTMLAttributes), 0];
    },
});

export const Widget = Node.create({
    name: "widget",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            ref: { default: "" },
            props: { default: null },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-widget]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-widget": "" }, HTMLAttributes)];
    },
});

export const ExerciseNode = Node.create({
    name: "exercise",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            id: { default: "" },
            kind: { default: "numeric" },
            prompt: { default: "" },
            starter: { default: "" },
            hint: { default: null },
            rubric: { default: null },
            expected: { default: null },
            tolerance: { default: null },
            correctMsg: { default: null },
            wrongMsg: { default: null },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-exercise]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-exercise": "" }, HTMLAttributes)];
    },
});

export const QuizNode = Node.create({
    name: "quiz",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            id: { default: "" },
            questions: { default: [] },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-quiz]" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes({ "data-quiz": "" }, HTMLAttributes)];
    },
});

/** All custom nodes, for schema registration. */
export const customNodes = [
    MathInline,
    MathBlock,
    CodeSample,
    Notice,
    Widget,
    ExerciseNode,
    QuizNode,
];
