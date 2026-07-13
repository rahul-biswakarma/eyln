import { useEffect, useState } from "react";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui";
export type Lang = "wgsl" | "cpp" | "odin" | "ts" | "bash" | "c";
let highlighterPromise: Promise<HighlighterCore> | null = null;
function getHighlighter(): Promise<HighlighterCore> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighterCore({
            themes: [import("shiki/themes/ayu-dark.mjs")],
            langs: [
                import("shiki/langs/wgsl.mjs"),
                import("shiki/langs/cpp.mjs"),
                import("shiki/langs/c.mjs"),
                import("shiki/langs/typescript.mjs"),
                import("shiki/langs/bash.mjs"),
            ],
            engine: createOnigurumaEngine(import("shiki/wasm")),
        });
    }
    return highlighterPromise;
}
export interface CodeTab {
    label: string;
    lang: Lang;
    code: string;
    filename?: string;
}
const shikiLang: Record<Lang, string> = {
    wgsl: "wgsl",
    cpp: "cpp",
    c: "c",
    odin: "c",
    ts: "typescript",
    bash: "bash",
};
function useHighlighted(code: string, lang: Lang): string {
    const [html, setHtml] = useState("");
    useEffect(() => {
        let alive = true;
        getHighlighter()
            .then((hl) => hl.codeToHtml(code, { lang: shikiLang[lang], theme: "ayu-dark" }))
            .then((h) => alive && setHtml(h))
            .catch(() => alive && setHtml(`<pre>${escapeHtml(code)}</pre>`));
        return () => {
            alive = false;
        };
    }, [code, lang]);
    return html;
}
function escapeHtml(s: string): string {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
export function Code({ code, lang, filename }: {
    code: string;
    lang: Lang;
    filename?: string;
}) {
    const html = useHighlighted(code.trim(), lang);
    return (<div className="codeblock">
      {filename && (<div className="tabs">
          <span className="filename">{filename}</span>
        </div>)}
      <div dangerouslySetInnerHTML={{ __html: html }}/>
    </div>);
}
export function CodeTabs({ tabs }: {
    tabs: CodeTab[];
}) {
    const [active, setActive] = useState("0");
    const activeIdx = parseInt(active, 10);
    const tab = tabs[activeIdx];
    const html = useHighlighted(tab.code.trim(), tab.lang);
    return (<div className="codeblock">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList>
          {tabs.map((t, i) => (<TabsTrigger key={t.label} value={String(i)}>
              {t.label}
            </TabsTrigger>))}
          {tab.filename && <span className="filename">{tab.filename}</span>}
        </TabsList>
        <TabsContent value={active}>
          <div dangerouslySetInnerHTML={{ __html: html }}/>
        </TabsContent>
      </Tabs>
    </div>);
}
