import { useMemo } from "react";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { customNodes } from "./nodes";
import { nodeMapping } from "./render-map";
import type { PMDoc } from "./types";

/** Extensions defining the content schema (standard + custom nodes). */
export const contentExtensions = [StarterKit, ...customNodes];

/**
 * Render a lesson's ProseMirror JSON to React, read-only, without an editor
 * instance. Standard nodes/marks render via StarterKit's default DOM specs;
 * custom nodes render via `nodeMapping`.
 */
export function LessonRenderer({ doc }: { doc: PMDoc }) {
    const el = useMemo(
        () =>
            renderToReactElement({
                content: doc,
                extensions: contentExtensions,
                options: { nodeMapping },
            }),
        [doc],
    );
    return <div className="prose">{el}</div>;
}
