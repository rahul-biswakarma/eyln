const API_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function isLLMEnabled(): boolean {
  return typeof API_KEY === "string" && API_KEY.length > 0;
}

export interface GenerateOpts {
  system?: string;
  
  temperature?: number;
  signal?: AbortSignal;
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

function buildBody(contents: GeminiContent[], opts: GenerateOpts) {
  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature: opts.temperature ?? 0.4 },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }
  return body;
}

export async function generate(prompt: string, opts: GenerateOpts = {}): Promise<string> {
  if (!isLLMEnabled()) throw new Error("LLM disabled: set VITE_GEMINI_API_KEY");
  const contents: GeminiContent[] = [{ role: "user", parts: [{ text: prompt }] }];
  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBody(contents, opts)),
    signal: opts.signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  return text ?? "";
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

/**
 * Multi-turn chat completion (used by the lesson tutor). Non-streaming for
 * simplicity — Gemini's flash model is fast enough for short tutoring replies.
 */
export async function chat(history: ChatTurn[], opts: GenerateOpts = {}): Promise<string> {
  if (!isLLMEnabled()) throw new Error("LLM disabled: set VITE_GEMINI_API_KEY");
  const contents: GeminiContent[] = history.map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }));
  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBody(contents, opts)),
    signal: opts.signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  const text: string | undefined = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");
  return text ?? "";
}

/** Best-effort JSON extraction from a model reply that may be fenced in ```json. */
export function parseJSON<T>(raw: string): T | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    
    const obj = candidate.match(/[[{][\s\S]*[\]}]/);
    if (obj) {
      try {
        return JSON.parse(obj[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
