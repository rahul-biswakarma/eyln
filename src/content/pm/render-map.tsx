import type { ReactNode } from "react";
import { M, MBlock } from "../../components/math";
import { Code, CodeTabs } from "../../components/code-block";
import { Notice as NoticeUI } from "../../components/ui";
import { Quiz } from "../../components/quiz";
import { Exercise } from "../../components/exercise";
import type { Exercise as ExerciseType, ExerciseResult } from "../types";
import { getWidget } from "./widget-registry";
import type { CodeSampleAttrs, ExerciseAttrs, MathAttrs, NoticeAttrs, QuizAttrs, WidgetAttrs } from "./types";

/** Rebuild a runtime `validate` from serialized numeric grading. */
function buildValidate(attrs: ExerciseAttrs): ExerciseType["validate"] {
    if (attrs.expected == null) return undefined;
    const expected = attrs.expected;
    const tol = attrs.tolerance ?? 0.01;
    const correct = attrs.correctMsg ?? "Correct.";
    const wrong = attrs.wrongMsg ?? "Not quite — check your work.";
    return (s: string): ExerciseResult =>
        Math.abs(parseFloat(s) - expected) < tol
            ? { pass: true, message: correct }
            : { pass: false, message: wrong };
}

function exerciseFromAttrs(attrs: ExerciseAttrs): ExerciseType {
    return {
        id: attrs.id,
        prompt: attrs.prompt,
        kind: attrs.kind,
        starter: attrs.starter,
        hint: attrs.hint ?? undefined,
        rubric: attrs.rubric ?? undefined,
        validate: buildValidate(attrs),
    };
}

type NodeCtx = { node: { attrs?: Record<string, unknown> }; children?: ReactNode };

/**
 * nodeMapping for @tiptap/static-renderer. Keyed by node name; each receives
 * `{ node, children }` and returns a React node. Standard nodes (paragraph,
 * heading, lists, text, marks) are handled by StarterKit's default DOM specs;
 * we only override our custom nodes here.
 */
export const nodeMapping = {
    mathInline: ({ node }: NodeCtx) => <M>{(node.attrs as unknown as MathAttrs).tex}</M>,

    mathBlock: ({ node }: NodeCtx) => <MBlock>{(node.attrs as unknown as MathAttrs).tex}</MBlock>,

    codeSample: ({ node }: NodeCtx) => {
        const a = node.attrs as unknown as CodeSampleAttrs;
        if (a.tabs && a.tabs.length > 0) return <CodeTabs tabs={a.tabs} />;
        return <Code code={a.code} lang={a.lang} filename={a.filename} />;
    },

    notice: ({ node, children }: NodeCtx) => {
        const a = node.attrs as unknown as NoticeAttrs;
        return (
            <NoticeUI warn={a.variant === "warn"}>
                {a.label && <span className="lbl">{a.label}</span>}
                {children}
            </NoticeUI>
        );
    },

    htmlBlock: ({ node }: NodeCtx) => {
        const html = (node.attrs as { html?: string }).html ?? "";
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    },

    widget: ({ node }: NodeCtx) => {
        const a = node.attrs as unknown as WidgetAttrs;
        const W = getWidget(a.ref);
        if (!W) return <div data-missing-widget={a.ref} />;
        return <W {...(a.props ?? {})} />;
    },

    exercise: ({ node }: NodeCtx) => {
        const ex = exerciseFromAttrs(node.attrs as unknown as ExerciseAttrs);
        return <Exercise ex={ex} logId={ex.id} />;
    },

    quiz: ({ node }: NodeCtx) => {
        const a = node.attrs as unknown as QuizAttrs;
        return <Quiz id={a.id} quiz={{ questions: a.questions }} />;
    },
};
