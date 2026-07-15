import { Schema, type FunctionDeclaration, type FunctionCall } from "firebase/ai";
import { WIDGETS } from "../content/pm/widget-registry";
import { findLesson, lessonPath } from "../content/registry";

/**
 * Agentic tool-use for the AI tutor. The model may call these to manipulate the
 * learning surface — render a live shader, run an inline quiz, embed a widget,
 * or point the learner at a lesson. Each declaration is a Gemini
 * FunctionDeclaration; `executeToolCall` validates the model's args and turns
 * them into a typed ToolBlock the tutor panel renders inline.
 */

export type ToolBlock =
    | { kind: "shader"; description: string; wgsl: string }
    | { kind: "quiz"; question: string; choices: string[]; answerIndex: number; explain: string }
    | { kind: "widget"; ref: string; label: string }
    | { kind: "nav"; moduleId: string; lessonId: string; title: string; path: string };

const WIDGET_REFS = Object.keys(WIDGETS);

export const TUTOR_TOOLS: FunctionDeclaration[] = [
    {
        name: "render_shader",
        description:
            "Render a live, editable WGSL fragment shader inline in the chat. Use when the learner asks to see, visualize, or experiment with a shader or a visual/graphics effect. The wgsl MUST define exactly `fn shade(uv : vec2<f32>, t : f32) -> vec3<f32>` returning an RGB color; `uv` is 0..1 across the canvas and `t` is seconds. Do not include entry points, bindings, or struct declarations — only the shade function.",
        parameters: Schema.object({
            properties: {
                description: Schema.string({ description: "One short sentence describing the visual effect." }),
                wgsl: Schema.string({ description: "The WGSL source defining `fn shade(uv, t) -> vec3<f32>`." }),
            },
        }),
    },
    {
        name: "inline_quiz",
        description:
            "Pose a single multiple-choice question the learner answers inline. Use when the learner asks to be quizzed or tested, or to check understanding. Provide 3-4 concise choices, the zero-based index of the correct one, and a brief explanation shown after they answer.",
        parameters: Schema.object({
            properties: {
                question: Schema.string({ description: "The question text." }),
                choices: Schema.array({ items: Schema.string(), description: "3-4 answer choices." }),
                answerIndex: Schema.integer({ description: "Zero-based index of the correct choice." }),
                explain: Schema.string({ description: "Short explanation of the correct answer." }),
            },
        }),
    },
    {
        name: "embed_widget",
        description:
            `Embed one of the course's interactive teaching widgets inline. Use when a hands-on widget best illustrates the concept. ref must be one of: ${WIDGET_REFS.join(", ")}.`,
        parameters: Schema.object({
            properties: {
                ref: Schema.enumString({ enum: WIDGET_REFS, description: "The widget registry id." }),
                label: Schema.string({ description: "A short caption for why this widget helps here." }),
            },
        }),
    },
    {
        name: "go_to_lesson",
        description:
            "Point the learner at a specific lesson with a navigable link. Use when recommending exactly where to go next. Provide the moduleId and lessonId as they appear in the course registry.",
        parameters: Schema.object({
            properties: {
                moduleId: Schema.string({ description: "The module id, e.g. 'linear-algebra'." }),
                lessonId: Schema.string({ description: "The lesson id within that module." }),
            },
        }),
    },
];

/**
 * Validate + execute a model tool call, returning a renderable ToolBlock or a
 * string describing why it couldn't (fed back to the model as the tool result).
 */
export function executeToolCall(call: FunctionCall): ToolBlock | { error: string } {
    const args = (call.args ?? {}) as Record<string, unknown>;
    switch (call.name) {
        case "render_shader": {
            const wgsl = typeof args.wgsl === "string" ? args.wgsl : "";
            if (!wgsl.includes("fn shade"))
                return { error: "wgsl must define `fn shade(uv : vec2<f32>, t : f32) -> vec3<f32>`." };
            return { kind: "shader", description: String(args.description ?? "Live shader"), wgsl };
        }
        case "inline_quiz": {
            const choices = Array.isArray(args.choices) ? args.choices.map(String) : [];
            const answerIndex = Number(args.answerIndex);
            if (choices.length < 2)
                return { error: "Provide at least two choices." };
            if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length)
                return { error: "answerIndex is out of range for the given choices." };
            return {
                kind: "quiz",
                question: String(args.question ?? ""),
                choices,
                answerIndex,
                explain: String(args.explain ?? ""),
            };
        }
        case "embed_widget": {
            const ref = String(args.ref ?? "");
            if (!WIDGETS[ref])
                return { error: `Unknown widget '${ref}'. Valid: ${WIDGET_REFS.join(", ")}.` };
            return { kind: "widget", ref, label: String(args.label ?? "") };
        }
        case "go_to_lesson": {
            const moduleId = String(args.moduleId ?? "");
            const lessonId = String(args.lessonId ?? "");
            const ref = findLesson(moduleId, lessonId);
            if (!ref)
                return { error: `No lesson '${moduleId}/${lessonId}' exists in the registry.` };
            return { kind: "nav", moduleId, lessonId, title: ref.lesson.title, path: lessonPath(moduleId, lessonId) };
        }
        default:
            return { error: `Unknown tool '${call.name}'.` };
    }
}
