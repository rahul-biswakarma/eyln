import katex from "katex";
import { useMemo } from "react";
export function M({ children }: {
    children: string;
}) {
    const html = useMemo(() => katex.renderToString(children, { throwOnError: false, displayMode: false }), [children]);
    return <span dangerouslySetInnerHTML={{ __html: html }}/>;
}
export function MBlock({ children }: {
    children: string;
}) {
    const html = useMemo(() => katex.renderToString(children, { throwOnError: false, displayMode: true }), [children]);
    return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }}/>;
}
export function FormattedText({ text }: {
    text: string;
}) {
    const parts = text.split(/(\$[^\$]+\$)/g);
    return (<>
      {parts.map((part, i) => {
            if (part.startsWith("$") && part.endsWith("$")) {
                return <M key={i}>{part.slice(1, -1)}</M>;
            }
            const subparts = part.split(/(`[^`]+`)/g);
            return subparts.map((sub, j) => {
                if (sub.startsWith("`") && sub.endsWith("`")) {
                    return <code key={`${i}-${j}`}>{sub.slice(1, -1)}</code>;
                }
                return sub;
            });
        })}
    </>);
}
