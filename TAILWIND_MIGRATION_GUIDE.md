# Finish-the-Tailwind-migration Contract

Goal: eliminate a specific hand-written CSS file by converting its rules to Tailwind
utilities in the consuming .tsx, using shared components where they exist. When the
CSS file has no remaining referenced rules, DELETE it and remove its @import from
src/theme.css.

## Shared components (import from "../components/ui" or "../../components/ui")
Use these INSTEAD of the old primitive classes:
- `.btn` / `.btn primary` / `.btn ghost` / `.btn danger` / `.btn sm` / `.btn lg`
   → `<Button variant="default|primary|ghost|danger" size="default|sm|lg">`
- `.card`, `.card hover`, `.card grad`, `a.card`
   → `<Card hover grad as="a" href=...>` (hover/grad are boolean props)
- `.chip`, `.chip active`, `.chip ghost` → `<Chip active ghost>`
- `.badge`, `.badge dep`, `.badge time` → `<Badge tone="default|dep|time">`
- `.pbar` + inner `<i style={{width}}>` → `<ProgressBar value={0..1} />` (value is a fraction)
- Radix Dialog/Popover/Tabs/Tooltip/Switch already carry their own styles (from ../components/ui) — do NOT add class-based styling for `.DialogContent`/`.TabsList` etc.; those CSS classes are gone.

## Token → utility names (Tailwind v4, already configured)
bg-bg, bg-surface, bg-surface-2, bg-surface-inset; border-border, border-border-bright, border-border-glow;
text-text, text-text-dim, text-text-faint, text-accent, text-highlight, text-on-accent, text-good, text-warn, text-bad;
bg-accent, bg-accent-soft; font-sans, font-mono, font-display; rounded-xs/sm/(default)/lg/pill;
shadow-card, shadow-lg; transition + duration-200 + ease-brand. Arbitrary values for anything else: `text-[0.72rem]`, `px-[1.1rem]`, `bg-[rgba(...)]`, `bg-[image:var(--accent-grad)]`.

## Rules
1. For each className in the .tsx that maps to a rule in the target CSS file, replace it with the shared component OR inline Tailwind utilities reproducing the rule faithfully (pixel-exact). Then remove that rule from the CSS.
2. Keyframes are ALL already in src/tailwind.css — reference via `animate-[name_dur_var(--ease)_both]`. Do NOT keep a local @keyframes.
3. Global keyframe utility `.spin` and `.fld-lbl` and `.prose`/library-DOM live in tailwind.css — leave them; don't redefine.
4. If a rule uses ::before/::after, color-mix(), or a per-instance CSS var (e.g. --track-accent set inline): reproduce with Tailwind arbitrary utilities / `before:`/`after:` variants / inline style. Only if truly impossible, KEEP that one rule in the CSS file and say so.
5. When the CSS file is emptied, DELETE it and remove its `@import "...";` line from src/theme.css.
6. Do NOT edit tailwind.css, theme.css beyond removing your file's @import, other files, or shared components. Do NOT run the build.

## Output
Report: files edited, whether the CSS file was deleted (or which rules were kept + why), and confirm the @import was removed from theme.css.
