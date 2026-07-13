import { getAI, getGenerativeModel, GoogleAIBackend, type AI } from "firebase/ai";
import { getFirebaseApp, isFirebaseEnabled } from "./firebase";
const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
export function isLLMEnabled(): boolean {
    return isFirebaseEnabled();
}
let aiInstance: AI | null = null;
function getAIClient(): AI {
    if (!aiInstance) {
        aiInstance = getAI(getFirebaseApp(), { backend: new GoogleAIBackend() });
    }
    return aiInstance;
}
export interface GenerateOpts {
    system?: string;
    temperature?: number;
    signal?: AbortSignal;
}
interface GeminiContent {
    role: "user" | "model";
    parts: {
        text: string;
    }[];
}
function getModel(opts: GenerateOpts) {
    return getGenerativeModel(getAIClient(), {
        model: MODEL,
        generationConfig: { temperature: opts.temperature ?? 0.4 },
        ...(opts.system ? { systemInstruction: opts.system } : {}),
    });
}
async function run(contents: GeminiContent[], opts: GenerateOpts): Promise<string> {
    if (!isLLMEnabled())
        throw new Error("LLM disabled: Firebase is not configured");
    const model = getModel(opts);
    const result = await model.generateContent({ contents }, opts.signal ? { signal: opts.signal } : undefined);
    return result.response.text();
}
export async function generate(prompt: string, opts: GenerateOpts = {}): Promise<string> {
    return run([{ role: "user", parts: [{ text: prompt }] }], opts);
}
export interface ChatTurn {
    role: "user" | "model";
    text: string;
}
export async function chat(history: ChatTurn[], opts: GenerateOpts = {}): Promise<string> {
    const contents: GeminiContent[] = history.map((t) => ({
        role: t.role,
        parts: [{ text: t.text }],
    }));
    return run(contents, opts);
}
export function parseJSON<T>(raw: string): T | null {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = (fenced ? fenced[1] : raw).trim();
    try {
        return JSON.parse(candidate) as T;
    }
    catch {
        const obj = candidate.match(/[[{][\s\S]*[\]}]/);
        if (obj) {
            try {
                return JSON.parse(obj[0]) as T;
            }
            catch {
                return null;
            }
        }
        return null;
    }
}
