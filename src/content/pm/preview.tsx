import { LessonRenderer } from "./renderer";
import { sampleDoc } from "./sample-doc";

/** Dev-only preview of the PM content pipeline (route: /dev/pm-preview). */
export function PMPreview() {
    return (
        <div className="content" style={{ maxWidth: 760, margin: "0 auto", padding: "2rem" }}>
            <h1 className="font-display text-2xl mb-4">PM content pipeline — sample</h1>
            <LessonRenderer doc={sampleDoc} />
        </div>
    );
}
