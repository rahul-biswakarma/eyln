import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_id, label) {
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });

const FORGE_THEME = "forge-dark";
let defined = false;

export function ensureForgeTheme(m: typeof monaco) {
  if (defined) return;
  defined = true;
  m.editor.defineTheme(FORGE_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5c6270", fontStyle: "italic" },
      { token: "keyword", foreground: "ff9e2c" },
      { token: "number", foreground: "ffd35c" },
      { token: "string", foreground: "8fbf6b" },
      { token: "type", foreground: "d0a06a" },
      { token: "delimiter", foreground: "a3a9b8" },
    ],
    colors: {
      "editor.background": "#0C0D11",
      "editor.foreground": "#f4f4f5",
      "editorLineNumber.foreground": "#3a3f4b",
      "editorLineNumber.activeForeground": "#a3a9b8",
      "editor.selectionBackground": "#ffb00033",
      "editor.lineHighlightBackground": "#ffffff08",
      "editorCursor.foreground": "#ffb000",
      "editorIndentGuide.background1": "#ffffff0d",
      "editorGutter.background": "#0C0D11",
    },
  });
}

export const FORGE_MONACO_THEME = FORGE_THEME;
