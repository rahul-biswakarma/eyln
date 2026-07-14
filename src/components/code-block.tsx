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
    return (<div className="codeblock my-[1.6rem] border border-border rounded overflow-hidden bg-surface-inset">
      {filename && (<div className="flex gap-1 items-center py-2 px-[0.6rem] border-b border-border bg-surface">
          <span className="ml-auto px-[0.6rem] font-mono text-[0.7rem] text-text-faint">{filename}</span>
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
    return (<div className="codeblock my-[1.6rem] border border-border rounded overflow-hidden bg-surface-inset">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex gap-1 items-center py-2 px-[0.6rem] border-b border-border bg-surface">
          {tabs.map((t, i) => (<TabsTrigger key={t.label} value={String(i)} className="cursor-pointer py-[0.28rem] px-[0.65rem] font-display text-[0.76rem] font-medium text-text-dim bg-none border border-transparent rounded-sm transition duration-200 ease-brand hover:text-text hover:bg-surface-2 data-[state=active]:text-accent data-[state=active]:bg-accent-soft data-[state=active]:border-border-glow">
              {t.label}
            </TabsTrigger>))}
          {tab.filename && <span className="ml-auto px-[0.6rem] font-mono text-[0.7rem] text-text-faint">{tab.filename}</span>}
        </TabsList>
        <TabsContent value={active}>
          <div dangerouslySetInnerHTML={{ __html: html }}/>
        </TabsContent>
      </Tabs>
    </div>);
}
