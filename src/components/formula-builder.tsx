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

const PALETTE: { label: string; insert: string }[] = [
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

export function FormulaBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (latex: string) => void;
}) {
  const fieldRef = useRef<MathfieldElement | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = fieldRef.current;
    if (el && el.value !== value) el.value = value;
  }, [value]);

  return (
    <div className={`formula-builder ${focused ? "focused" : ""}`}>
      <div className="fb-field-wrap">
        <math-field
          ref={(el) => {
            fieldRef.current = el;
            el?.classList.add("fb-field");
          }}
          math-virtual-keyboard-policy="manual"
          smart-fence="true"
          onInput={(e) => onChange((e.target as MathfieldElement).value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      <div className="fb-palette">
        {PALETTE.map((item) => (
          <button
            key={item.label}
            type="button"
            className="fb-symbol"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const el = fieldRef.current;
              if (!el) return;
              el.focus();
              el.executeCommand(["insert", item.insert]);
              onChange(el.value);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {value.trim() && (
        <div className="fb-preview">
          <span className="fb-preview-lbl">Preview</span>
          <MBlock>{value}</MBlock>
        </div>
      )}
    </div>
  );
}
