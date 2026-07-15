/**
 * Shared Tailwind class strings for the Knowledge "reading workspace" system.
 * These faithfully reproduce the former rw and nb rules from knowledge.css so
 * books-view, spaces-view, projects-view and knowledge.tsx render identically
 * after the Tailwind migration. Single source of truth — edit here, not per view.
 *
 * Naming: `rw` prefix kept; sub-element helpers use camelCase. Functions take
 * state flags where the original used modifier classes (.active/.on/.status-*).
 */

// ── Library (list) ──────────────────────────────────────────────
export const library = "p-[2rem_2.2rem_3rem] max-w-[1180px]";
export const libHeader = "flex items-end justify-between gap-8 mb-[1.6rem]";
export const libTitleH1 = "font-display text-[2.1rem] font-semibold tracking-[-0.02em] m-0";
export const libSub = "text-[0.82rem] text-text-dim";
export const libSearch =
  "flex items-center gap-[0.6rem] bg-surface border border-border rounded-sm px-[0.9rem] text-text-dim mb-[1.4rem] transition-colors duration-200 ease-brand focus-within:border-border-bright";
export const libSearchInput = "flex-1 bg-transparent border-none text-text text-[0.9rem] py-[0.7rem] focus:outline-none";

export const filters = "flex gap-[0.45rem] flex-wrap mb-[1.5rem]";
export const filter = (active: boolean) =>
  "inline-flex items-center gap-[0.35rem] border rounded-pill text-[0.76rem] px-[0.8rem] py-[0.34rem] cursor-pointer transition duration-200 ease-brand " +
  (active ? "bg-accent-soft border-accent text-accent" : "bg-transparent border-border text-text-dim hover:border-border-bright hover:text-text");

export const grid = "grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4";
export const card =
  "flex gap-4 text-left bg-surface border border-border rounded p-[1.1rem] cursor-pointer transition duration-200 ease-brand hover:border-border-bright hover:-translate-y-[2px] hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)]";
export const cardBody = "flex-1 min-w-0 flex flex-col gap-[0.55rem]";
export const cardHeadH3 = "m-0 font-display text-base font-semibold leading-[1.25] whitespace-nowrap overflow-hidden text-ellipsis";
export const cardAuthor = "text-[0.76rem] text-text-dim";
export const cardMeta = "flex items-center justify-between gap-2";
export const cardStats = "flex items-center gap-[0.9rem] text-[0.72rem] text-text-faint";
export const cardStatItem = "inline-flex items-center gap-[0.25rem]";
export const cardWhen = "ml-auto inline-flex items-center gap-[0.25rem]";

// ── Progress bars ───────────────────────────────────────────────
export const progress = "flex flex-col gap-[0.3rem]";
export const progressBar = "h-[4px] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] rounded-pill overflow-hidden";
export const progressBarLg = "h-[6px] bg-[color-mix(in_srgb,var(--text)_8%,transparent)] rounded-pill overflow-hidden";
export const progressBarFill = "block h-full bg-accent rounded-pill transition-[width] duration-200 ease-brand";
export const progressLbl = "text-[0.72rem] text-text-dim";
export const progressLblMuted = "text-[0.72rem] text-text-faint";

// ── Status pills ────────────────────────────────────────────────
export const statusColor: Record<string, string> = {
  reading: "text-accent", finished: "text-good", paused: "text-warn", want: "text-text-dim",
};
export const status = (s?: string) =>
  "inline-flex items-center gap-[0.3rem] text-[0.7rem] " + (s && statusColor[s] ? statusColor[s] : "text-text-dim");

// ── Stars ───────────────────────────────────────────────────────
export const stars = "inline-flex gap-[0.05rem]";
export const star = (on: boolean) =>
  "bg-none border-none p-[0.05rem] cursor-pointer leading-none transition-colors duration-200 ease-brand disabled:cursor-default " +
  (on ? "text-accent" : "text-text-faint");

// ── Search hits (unified) ───────────────────────────────────────
export const searchResults = "flex flex-col gap-[0.4rem]";
export const searchHit =
  "flex items-center gap-[0.8rem] text-left bg-surface border border-border rounded-sm px-[0.9rem] py-[0.7rem] cursor-pointer text-text-dim transition duration-200 ease-brand hover:border-border-bright hover:bg-surface-2";
export const hitIc = "text-accent grid place-items-center";
export const hitBody = "flex-1 min-w-0 flex flex-col gap-[0.1rem]";
export const hitKind = "font-mono text-[0.6rem] uppercase tracking-[0.08em] text-text-faint";
export const hitText = "text-text text-[0.85rem] whitespace-nowrap overflow-hidden text-ellipsis";
export const hitBook = "text-[0.72rem] text-text-dim";

// ── Detail: hero ────────────────────────────────────────────────
export const detail = "p-[1.6rem_2.2rem_3rem] max-w-[1080px]";
export const back =
  "inline-flex items-center gap-[0.35rem] bg-none border-none text-text-dim text-[0.8rem] cursor-pointer mb-4 transition-colors duration-200 ease-brand hover:text-accent";
export const hero = "grid grid-cols-[150px_1fr_260px] gap-10 items-start mb-6 max-[720px]:grid-cols-1 max-[720px]:gap-8";
export const heroMain = "flex flex-col gap-[0.6rem] min-w-0";
export const heroMainH1 = "font-display text-[1.9rem] font-bold tracking-[-0.02em] m-0 leading-[1.25] text-text";
export const heroSub = "text-[0.92rem] text-text-dim";
export const heroControls = "flex items-center gap-[0.6rem] mt-[0.1rem] flex-wrap";
export const heroProgress = "flex flex-col gap-[0.35rem] max-w-[320px]";

// ── Quickstats ──────────────────────────────────────────────────
export const quickstats = "flex items-center gap-[0.8rem] text-[0.82rem] text-text-dim py-3 border-t border-b border-border my-2 flex-wrap";
export const quickstat = "flex items-center gap-[0.35rem]";
export const qsIc = "text-accent";
export const qsVal = "font-display font-semibold text-text";
export const qsLbl = "text-text-faint";

// ── Tabs row ────────────────────────────────────────────────────
export const tabsRow = "flex items-center justify-between gap-4 border-b border-border mb-8";
export const tabsList = "flex-[0_1_auto] border-b-0 bg-none p-0 flex gap-[1.4rem]";
export const tabsTrigger =
  "bg-none border-none text-text-dim text-[0.84rem] font-medium py-[0.7rem] cursor-pointer relative transition-colors duration-200 ease-brand hover:text-text " +
  "data-[state=active]:text-highlight data-[state=active]:font-semibold data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:-bottom-px data-[state=active]:after:inset-x-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-accent";
export const tabsContent = "animate-[rw-fade_0.24s_var(--ease)_both]";

// ── Capture button ──────────────────────────────────────────────
export const captureBtn =
  "inline-flex items-center gap-[0.4rem] bg-accent text-on-accent border-none rounded-sm px-[0.8rem] py-[0.45rem] text-[0.78rem] font-semibold cursor-pointer whitespace-nowrap transition duration-200 ease-brand hover:shadow-[0_0_0_3px_var(--accent-soft)] hover:-translate-y-px";

// ── Forms / inputs ──────────────────────────────────────────────
export const input =
  "w-full bg-surface-inset border border-border rounded-sm text-text px-3 py-[0.6rem] text-[0.86rem] font-sans resize-y focus:outline-none focus:border-accent";
export const select =
  "bg-surface-inset border border-border rounded-sm text-text px-[0.6rem] py-[0.4rem] text-[0.78rem] cursor-pointer focus:outline-none focus:border-accent";
export const formSave =
  "mt-[0.3rem] bg-accent text-on-accent border-none rounded-sm p-[0.65rem] text-[0.85rem] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
export const newspace = "flex gap-2 items-center mb-[1.4rem] animate-[rw-fade_0.2s_var(--ease)_both]";

// ── Icon button + menu ──────────────────────────────────────────
export const iconBtn = (on = false) =>
  "bg-none border-none cursor-pointer w-[26px] h-[26px] grid place-items-center rounded-sm transition duration-200 ease-brand hover:text-text hover:bg-border " +
  (on ? "text-accent" : "text-text-faint");
export const menu = "flex flex-col gap-[0.15rem]";
export const menuBtn = (danger = false) =>
  "flex items-center gap-[0.4rem] text-left w-full bg-none border-none text-text-dim text-[0.78rem] px-2 py-[0.45rem] rounded-xs cursor-pointer transition duration-200 ease-brand hover:bg-[rgba(255,255,255,0.05)] hover:text-text " +
  (danger ? "hover:!text-bad hover:!bg-[rgba(255,92,92,0.1)]" : "");

// ── Overview / panels ───────────────────────────────────────────
export const overview = "flex flex-col gap-4";
export const overviewGrid = "grid grid-cols-[1fr_1.2fr] gap-10 max-[720px]:grid-cols-1 max-[720px]:gap-6";
export const panel = "bg-surface border border-border rounded p-[1.1rem_1.2rem]";
export const panelH4 = "flex items-center gap-[0.4rem] m-0 mb-[0.7rem] text-[0.82rem] font-semibold text-text";
export const panelLine = "text-[0.82rem] text-text-dim m-0 mt-[0.5rem]";
export const panelLineMuted = "text-[0.82rem] text-text-faint m-0 mt-[0.5rem]";
export const statgrid = "grid grid-cols-3 gap-[0.8rem]";
export const statgridV = "font-display text-[1.05rem] font-semibold text-text";
export const statgridL = "text-[0.66rem] uppercase tracking-[0.05em] text-text-faint";
export const miniNote = "flex items-center justify-between py-[0.4rem] border-b border-border text-[0.82rem] last:border-b-0";

// ── Cards column ────────────────────────────────────────────────
export const cardsCol = "flex flex-col gap-[0.8rem]";

// ── Notes (grouped) ─────────────────────────────────────────────
export const notes = "flex flex-col gap-[1.3rem]";
export const noteGroup = "flex flex-col gap-2";
export const noteGroupLabel = "font-mono text-[0.68rem] uppercase tracking-[0.06em] text-text-faint m-0 pb-[0.4rem] border-b border-border";
export const noteCard = "bg-surface border border-border rounded-sm p-[0.9rem_1.1rem]";
export const noteTitle = "block font-semibold text-text text-[0.88rem] mb-[0.3rem]";
export const noteBody = "m-0 text-[0.86rem] text-text-dim leading-[1.55] whitespace-pre-wrap";
export const noteFoot = "flex items-center justify-between mt-[0.6rem]";
export const noteDate = "text-[0.7rem] text-text-faint";
export const tag = "font-mono text-[0.68rem] text-text-dim";

// ── Formula cards ───────────────────────────────────────────────
export const vocabGrid = "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[0.8rem]";
export const formulaCard = "bg-surface border border-border rounded p-[1.1rem_1.2rem] flex flex-col gap-[0.6rem] transition duration-200 ease-brand hover:border-border-bright hover:-translate-y-px";
export const formulaRender = "bg-surface-inset rounded-sm p-[0.9rem] overflow-x-auto text-center";
export const formulaTitle = "m-0 text-[0.86rem] text-text";
export const formulaFoot = "flex items-center justify-between gap-2";
export const formulaMeta = "flex items-center gap-[0.6rem] flex-wrap text-[0.72rem] text-text-faint";
export const diff = (level: 1 | 2 | 3) =>
  "px-[0.45rem] py-[0.1rem] rounded-pill border " +
  (level === 1 ? "text-good border-[rgba(70,217,138,0.4)]" : level === 2 ? "text-warn border-[rgba(255,211,92,0.4)]" : "text-bad border-[rgba(255,92,92,0.4)]");

// ── Mistake cards ───────────────────────────────────────────────
export const mistakeCard = (resolved: boolean) =>
  "bg-surface border border-border rounded p-[1.1rem_1.2rem] border-l-2 transition duration-200 ease-brand " +
  (resolved ? "border-l-good opacity-75" : "border-l-bad");
export const mistakeHead = "flex items-center justify-between mb-[0.6rem]";
export const mistakeBadge = (resolved: boolean) =>
  "inline-flex items-center gap-[0.3rem] text-[0.68rem] uppercase tracking-[0.05em] " + (resolved ? "text-good" : "text-bad");
export const resolve = (on: boolean) =>
  "inline-flex items-center gap-[0.3rem] bg-none border rounded-sm text-[0.72rem] px-[0.6rem] py-[0.28rem] cursor-pointer transition duration-200 ease-brand " +
  (on ? "text-good border-[rgba(70,217,138,0.4)] bg-[rgba(70,217,138,0.08)]" : "text-text-dim border-border hover:text-text hover:border-border-bright");
export const mistakeWhat = "m-0 mb-[0.7rem] text-[0.92rem] text-text leading-[1.55]";
export const mistakeLine = "flex gap-[0.7rem] mb-[0.4rem] text-[0.84rem] leading-[1.5]";
export const mistakeLineLbl = "flex-shrink-0 w-[58px] font-mono text-[0.66rem] uppercase tracking-[0.05em] text-text-faint pt-[0.15rem]";

// ── Conversation cards ──────────────────────────────────────────
export const ai = "flex flex-col gap-[0.7rem]";
export const convoCard = "bg-surface border border-border rounded overflow-hidden";
export const convoHead = "flex items-center gap-[0.6rem] w-full text-left bg-none border-none p-[0.9rem_1.1rem] cursor-pointer text-text transition-colors duration-200 ease-brand hover:bg-surface-2";
export const convoTitle = "flex-1 text-[0.9rem] whitespace-nowrap overflow-hidden text-ellipsis";
export const convoMeta = "text-[0.72rem] text-text-faint flex-shrink-0";
export const convoBody = "p-[0.4rem_1.1rem_1rem] border-t border-border flex flex-col gap-[0.7rem]";
export const convoTurn = "flex flex-col gap-[0.2rem]";
export const convoWho = (user: boolean) =>
  "font-mono text-[0.64rem] uppercase tracking-[0.06em] " + (user ? "text-accent" : "text-text-faint");

// ── Vocab status pill (spaced repetition) ───────────────────────
export const vocabStatus = (s: "learning" | "review" | "mastered") =>
  "text-[0.64rem] uppercase tracking-[0.05em] px-[0.45rem] py-[0.18rem] rounded-pill border " +
  (s === "learning" ? "text-accent border-accent bg-accent-soft"
    : s === "review" ? "text-warn border-[rgba(255,211,92,0.4)]" : "text-good border-[rgba(70,217,138,0.4)]");

// ── Timeline ────────────────────────────────────────────────────
export const timeline = "relative pl-[0.4rem]";
export const tlEvent = "relative flex gap-[0.9rem] pb-[1.4rem]";
export const tlIc = "w-[26px] h-[26px] flex-shrink-0 grid place-items-center rounded-full bg-surface-inset border border-border text-text-dim z-[1]";
export const tlIcAccent = "w-[26px] h-[26px] flex-shrink-0 grid place-items-center rounded-full bg-accent-soft border border-accent text-accent z-[1]";
export const tlBody = "flex flex-col gap-[0.15rem] pt-[0.15rem]";
export const tlLabel = "text-[0.86rem] text-text font-medium";
export const tlDetail = "text-[0.8rem] text-text-dim";
export const tlMeta = "text-[0.7rem] text-text-faint";

// ── Space / project icon tile ───────────────────────────────────
export const spaceIc = "grid place-items-center w-[52px] h-[52px] flex-shrink-0 rounded-sm bg-surface-inset border border-border text-accent";
export const spaceIcLg = "grid place-items-center w-[76px] h-[76px] flex-shrink-0 rounded bg-surface-inset border border-border text-accent";

// ── Empty state ─────────────────────────────────────────────────
export const empty = "flex flex-col items-center gap-2 py-12 px-4 text-center text-text-faint";
export const emptyH4 = "mt-[0.4rem] mb-0 text-base text-text-dim";
export const emptyP = "mt-0 mb-[0.8rem] text-[0.84rem] max-w-[320px]";

// ── Notebook shell + sidebar (knowledge.tsx) ────────────────────
export const shell = "flex flex-col h-full w-full overflow-hidden bg-bg";
export const workspace = "grid grid-cols-[232px_1fr] flex-1 min-h-0";
export const sidebar = "border-r border-border p-[1.2rem_0.8rem] overflow-y-auto bg-[rgba(11,11,14,0.5)] flex flex-col gap-4";
export const sidebarGroupTitle = "block font-mono text-[0.66rem] uppercase text-text-faint tracking-[0.12em] px-[0.6rem] pb-[0.4rem]";
export const sidebarLinks = "flex flex-col gap-[0.15rem]";
export const sidebarLink = (active: boolean) =>
  "flex items-center gap-[0.6rem] w-full px-[0.6rem] py-[0.55rem] rounded-xs border-none text-[0.84rem] cursor-pointer text-left transition duration-200 ease-brand " +
  (active ? "bg-accent-soft text-highlight font-medium [&_svg]:text-highlight" : "bg-transparent text-text-dim [&_svg]:text-text-faint hover:bg-surface-card hover:text-text hover:[&_svg]:text-text");
export const sidebarBadge = (active: boolean) =>
  "ml-auto font-mono text-[0.72rem] px-[0.35rem] py-[0.1rem] rounded-[4px] " +
  (active ? "bg-[rgba(255,176,0,0.15)] text-highlight" : "bg-[rgba(255,255,255,0.05)] text-text-faint");
export const content = "overflow-y-auto relative";

// Global search bar
export const globalSearch = "flex items-center gap-[0.6rem] m-[1.6rem_2.2rem_0] px-[0.9rem] bg-surface border border-border rounded-sm text-text-dim transition-colors duration-200 ease-brand focus-within:border-border-bright";
export const globalSearchInput = "flex-1 bg-none border-none text-text text-[0.9rem] py-[0.7rem] focus:outline-none";
export const gsClear = "bg-none border-none text-text-faint cursor-pointer grid place-items-center hover:text-text";
export const gsResults = "p-[1.2rem_2.2rem_3rem] flex flex-col gap-[0.4rem]";

// Notes workspace (Recent/Pinned tab)
export const notesView = "h-full";
export const workspaceHeader = "p-[1.4rem] border-b border-border mb-[1.5rem] relative bg-[radial-gradient(circle_at_0%_0%,rgba(255,176,0,0.05)_0%,transparent_60%)]";
export const titleRow = "flex items-baseline justify-between gap-6 mb-[1.2rem] flex-wrap";
export const titleRowH1 = "font-display text-[2.5rem] font-bold tracking-[-0.02em] text-text m-0";
export const statsQuiet = "flex items-center gap-[0.6rem] font-mono text-[0.72rem] text-text-faint";
export const toolbar = "flex justify-between items-center gap-4 mb-4";
export const search = "relative flex-1 max-w-[520px]";
export const tagChips = "flex flex-wrap gap-[0.35rem]";
export const scratchpad = "p-[1.4rem]";

// View header (used by bookmarks/reminders/scratchpad views)
export const viewHeader = "mb-[1.4rem]";
export const viewHeaderH3 = "font-display text-[1.25rem] font-semibold m-0 mb-[0.3rem] text-text";
export const viewHeaderDesc = "text-[0.84rem] text-text-dim";
