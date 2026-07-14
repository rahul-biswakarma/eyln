import { useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes } from "react";
import "mathlive";
import type { MathfieldElement } from "mathlive";
import { MBlock } from "./math";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "math-field": DetailedHTMLProps<HTMLAttributes<MathfieldElement>, MathfieldElement>;
        }
    }
}
const PALETTE: {
    label: string;
    insert: string;
}[] = [
    { label: "a/b", insert: "\\frac{#@}{#?}" },
    { label: "√", insert: "\\sqrt{#@}" },
    { label: "xⁿ", insert: "#@^{#?}" },
    { label: "x₂", insert: "#@_{#?}" },
    { label: "∑", insert: "\\sum_{#?}^{#?}" },
    { label: "∫", insert: "\\int_{#?}^{#?}" },
    { label: "lim", insert: "\\lim_{#? \\to #?}" },
    { label: "→", insert: "\\vec{#@}" },
    { label: "·", insert: "\\cdot" },
    { label: "×", insert: "\\times" },
    { label: "∂", insert: "\\partial" },
    { label: "π", insert: "\\pi" },
    { label: "θ", insert: "\\theta" },
    { label: "∞", insert: "\\infty" },
    { label: "≤", insert: "\\leq" },
    { label: "≥", insert: "\\geq" },
];
export function FormulaBuilder({ value, onChange, }: {
    value: string;
    onChange: (latex: string) => void;
}) {
    const fieldRef = useRef<MathfieldElement | null>(null);
    const [focused, setFocused] = useState(false);
    useEffect(() => {
        const el = fieldRef.current;
        if (el && el.value !== value)
            el.value = value;
    }, [value]);
    return (<div className="flex flex-col gap-[0.6rem]">
        <div className={"bg-surface-inset border rounded-sm p-[0.2rem] transition-[border-color,box-shadow] duration-200 ease-brand " + (focused ? "border-border-glow shadow-[0_0_10px_rgba(255,176,0,0.1)]" : "border-border")}>
            <math-field ref={(el) => {
            fieldRef.current = el;
            if (el) {
                el.classList.add("fb-field");
                (el as any).menuItems = [];
                el.addEventListener("contextmenu", (e) => e.preventDefault());
            }
        }} math-virtual-keyboard-policy="manual" smart-fence="true" onInput={(e) => onChange((e.target as MathfieldElement).value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}/>
        </div>

        <div className="grid grid-cols-8 gap-[0.25rem]">
            {PALETTE.map((item) => (<button key={item.label} type="button" className="bg-surface-2 border border-border rounded-xs text-text-dim font-display text-[0.86rem] py-[0.35rem] px-[0.2rem] cursor-pointer transition-all duration-200 ease-brand hover:text-highlight hover:border-border-glow hover:bg-accent-soft" onMouseDown={(e) => e.preventDefault()} onClick={() => {
                const el = fieldRef.current;
                if (!el)
                    return;
                el.focus();
                el.executeCommand(["insert", item.insert]);
                onChange(el.value);
            }}>
                {item.label}
            </button>))}
        </div>

        {value.trim() && (<div className="bg-surface-inset border border-dashed border-border rounded-sm py-[0.7rem] px-[0.9rem] flex flex-col gap-[0.3rem]">
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.06em] text-text-faint">Preview</span>
            <MBlock>{value}</MBlock>
        </div>)}
    </div>);
}
