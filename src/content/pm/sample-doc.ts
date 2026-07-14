import type { PMDoc } from "./types";

/**
 * A hand-written sample lesson doc exercising every custom node + standard
 * StarterKit nodes/marks. Used by the P0 preview route to verify rendering
 * parity before building the extraction pipeline. Delete after P3 if desired.
 */
export const sampleDoc: PMDoc = {
    type: "doc",
    content: [
        {
            type: "paragraph",
            content: [
                { type: "text", text: "An array is the most " },
                { type: "text", marks: [{ type: "bold" }], text: "physically honest" },
                { type: "text", text: " data structure: a run of equal-sized slots. Element " },
                { type: "mathInline", attrs: { tex: "i" } },
                { type: "text", text: " sits at a fixed offset, so indexing is " },
                { type: "text", marks: [{ type: "code" }], text: "O(1)" },
                { type: "text", text: "." },
            ],
        },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Address arithmetic" }] },
        {
            type: "paragraph",
            content: [{ type: "text", text: "The address of element i is pure arithmetic:" }],
        },
        {
            type: "mathBlock",
            attrs: { tex: "\\text{addr}(i) = \\text{base} + i \\times \\text{sizeof(element)}" },
        },
        {
            type: "bulletList",
            content: [
                {
                    type: "listItem",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Random access is a formula, not a search." }] }],
                },
                {
                    type: "listItem",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "Insert/delete in the middle is O(n)." }] }],
                },
            ],
        },
        {
            type: "codeSample",
            attrs: {
                lang: "ts",
                filename: "indexing.ts",
                code: "const a = [10, 20, 30, 40];\nconsole.log(a[2]); // 30, in O(1)\na.unshift(5);       // O(n) — everything shifts",
            },
        },
        {
            type: "notice",
            attrs: { variant: "warn", label: "The insert/delete tax" },
            content: [
                { type: "text", text: "Inserting anywhere but the end forces every later element to shift — that is " },
                { type: "mathInline", attrs: { tex: "O(n)" } },
                { type: "text", text: "." },
            ],
        },
        { type: "widget", attrs: { ref: "vector-playground", props: null } },
        {
            type: "quiz",
            attrs: {
                id: "sample/quiz",
                questions: [
                    {
                        q: "Random access in an array is O(1) because…",
                        choices: ["The array is sorted", "Indexing is a formula, not a search", "It uses a hash map", "Elements are cached"],
                        answer: 1,
                        explain: "addr(i) = base + i * size is a single multiply-add regardless of i.",
                    },
                ],
            },
        },
        {
            type: "exercise",
            attrs: {
                id: "sample/window",
                kind: "numeric",
                prompt: "For a = [2, 1, 5, 1, 3, 2] and k = 3, what is the maximum sum of any 3 consecutive elements?",
                starter: "",
                hint: "Windows: [2,1,5]=8, [1,5,1]=7, [5,1,3]=9, [1,3,2]=6.",
                expected: 9,
                tolerance: 0.01,
                correctMsg: "Correct — [5,1,3] sums to 9.",
                wrongMsg: "Slide a window of 3 and take the max: the best is [5,1,3].",
            },
        },
    ],
};
