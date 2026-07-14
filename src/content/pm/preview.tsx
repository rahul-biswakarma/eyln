import { useEffect, useState } from "react";
import { LessonRenderer } from "./renderer";
import { sampleDoc } from "./sample-doc";
import { runSyncSelfTest } from "./sync-selftest";
import { CloudLessonBody } from "./cloud-lesson-body";

/** Dev-only preview of the PM content pipeline (route: /dev/pm-preview).
 *  ?selftest runs the store/sync test; ?cloud=<moduleId>/<lessonId> drives the
 *  cloud fetch/render path; default renders the hand-written sample. */
export function PMPreview() {
    const [tests, setTests] = useState<string[]>([]);
    const params = new URLSearchParams(window.location.search);
    const runTests = params.has("selftest");
    const cloud = params.get("cloud");
    const [cloudMod, cloudLesson] = (cloud ?? "").split("/");
    useEffect(() => {
        if (runTests) void runSyncSelfTest().then(setTests);
    }, [runTests]);
    return (
        <div className="content" style={{ maxWidth: 760, margin: "0 auto", padding: "2rem" }}>
            <h1 className="font-display text-2xl mb-4">PM content pipeline — {cloud ? `cloud: ${cloud}` : "sample"}</h1>
            {runTests && (
                <div className="mb-6 font-mono text-sm">
                    <div className="text-text-faint uppercase tracking-wide text-xs mb-2">IndexedDB + sync self-test</div>
                    {tests.length === 0 ? <div>running…</div> : tests.map((t, i) => <div key={i}>{t}</div>)}
                </div>
            )}
            {cloudMod && cloudLesson
                ? <div className="prose"><CloudLessonBody moduleId={cloudMod} lessonId={cloudLesson} /></div>
                : <LessonRenderer doc={sampleDoc} />}
        </div>
    );
}
