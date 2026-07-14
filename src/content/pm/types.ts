import type { JSONContent } from "@tiptap/core";
import type { Lang } from "../../components/code-block";
import type { ExerciseKind } from "../types";

/** A lesson body is a single ProseMirror/TipTap document. */
export type PMDoc = JSONContent;

/** Attribute shapes for our custom nodes. These are the contract that the
 *  extraction pipeline (P3) emits and the renderer (P2) consumes. */

export interface MathAttrs {
    tex: string;
}

export interface CodeSampleTab {
    label: string;
    lang: Lang;
    code: string;
    filename?: string;
}

export interface CodeSampleAttrs {
    lang: Lang;
    code: string;
    filename?: string;
    /** Present when the block is a multi-tab code sample (was <CodeTabs/>). */
    tabs?: CodeSampleTab[];
}

export interface NoticeAttrs {
    variant: "info" | "warn";
    label?: string;
}

/** Interactive widgets stay as app code; the doc references them by id. */
export interface WidgetAttrs {
    ref: string;
    props?: Record<string, unknown>;
}

/** Quiz question — identical to the legacy QuizQuestion, kept as plain data. */
export interface QuizQuestionData {
    q: string;
    choices?: string[];
    answer: number;
    tolerance?: number;
    explain: string;
}

export interface QuizAttrs {
    id: string;
    questions: QuizQuestionData[];
}

/** Exercise grading, serialized. 233/234 legacy validators were numeric
 *  tolerance checks; open/code-open have no validator (LLM-graded). */
export interface ExerciseAttrs {
    id: string;
    kind: ExerciseKind;
    prompt: string;
    starter: string;
    hint?: string;
    rubric?: string;
    /** For numeric/predict kinds: the expected value + tolerance. */
    expected?: number;
    tolerance?: number;
    /** Optional custom feedback messages for pass/fail. */
    correctMsg?: string;
    wrongMsg?: string;
}
