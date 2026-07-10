import katex from "katex";
import { useMemo } from "react";

export function M({ children }: { children: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: false }),
    [children]
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MBlock({ children }: { children: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: true }),
    [children]
  );
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
}
