import { useEffect, useState } from "react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { contentExtensions } from "./renderer";
import { nodeMapping } from "./render-map";
import { getLessonDoc } from "../../lib/content-sync";
import type { PMDoc } from "./types";

type State =
    | { status: "loading" }
    | { status: "ready"; doc: PMDoc }
    | { status: "missing" }
    | { status: "error"; message: string };

/**
 * Fetches a lesson's PM JSON from the cloud (version-gated IndexedDB/Storage
 * sync) and renders it read-only. Used by LessonLayout when CONTENT_FROM_CLOUD
 * is on. Rendering matches the static-renderer setup in `renderer.tsx`.
 */
export function CloudLessonBody({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
    const [state, setState] = useState<State>({ status: "loading" });

    useEffect(() => {
        let alive = true;
        setState({ status: "loading" });
        getLessonDoc(moduleId, lessonId)
            .then((doc) => {
                if (!alive) return;
                setState(doc ? { status: "ready", doc } : { status: "missing" });
            })
            .catch((e) => {
                if (!alive) return;
                setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
            });
        return () => {
            alive = false;
        };
    }, [moduleId, lessonId]);

    if (state.status === "loading") {
        return <p className="text-text-dim font-mono text-sm">Loading lesson…</p>;
    }
    if (state.status === "missing") {
        return <p className="text-text-dim">This lesson hasn’t been published yet.</p>;
    }
    if (state.status === "error") {
        return <p className="text-bad">Couldn’t load this lesson: {state.message}</p>;
    }
    return <>{renderToReactElement({ content: state.doc, extensions: contentExtensions, options: { nodeMapping } })}</>;
}
