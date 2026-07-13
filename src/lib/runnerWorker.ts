interface RunMessage {
    code: string;
    fnName: string;
    tests: {
        args: unknown[];
        expected: unknown;
    }[];
}
interface CaseResult {
    index: number;
    passed: boolean;
    got?: string;
    error?: string;
}
function serialize(v: unknown): string {
    try {
        return JSON.stringify(v);
    }
    catch {
        return String(v);
    }
}
function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b)
        return true;
    if (typeof a !== typeof b)
        return false;
    if (a && b && typeof a === "object") {
        if (Array.isArray(a) !== Array.isArray(b))
            return false;
        const ka = Object.keys(a as object);
        const kb = Object.keys(b as object);
        if (ka.length !== kb.length)
            return false;
        return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
    }
    return false;
}
self.onmessage = (e: MessageEvent<RunMessage>) => {
    const { code, fnName, tests } = e.data;
    const results: CaseResult[] = [];
    let fn: unknown;
    try {
        const factory = new Function(`${code}\nreturn typeof ${fnName} === "function" ? ${fnName} : undefined;`);
        fn = factory();
        if (typeof fn !== "function") {
            self.postMessage({ ok: false, error: `No function named "${fnName}" was found.` });
            return;
        }
    }
    catch (err) {
        self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
        return;
    }
    for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        try {
            const args = JSON.parse(JSON.stringify(t.args));
            const got = (fn as (...a: unknown[]) => unknown)(...args);
            const passed = deepEqual(got, t.expected);
            results.push({ index: i, passed, got: serialize(got) });
        }
        catch (err) {
            results.push({ index: i, passed: false, error: err instanceof Error ? err.message : String(err) });
        }
    }
    self.postMessage({ ok: true, results });
};
