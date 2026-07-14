import { useEffect, useRef, useState, useMemo } from "react";
import { SparkleIcon, XIcon, PaperPlaneRightIcon, ClipboardTextIcon, CircleNotchIcon, PushPinIcon, MagnifyingGlassIcon, TrashIcon, NotebookIcon, InfoIcon, BookmarkSimpleIcon, CheckIcon } from "@phosphor-icons/react";
import { isLLMEnabled, chat, generate, parseJSON, type ChatTurn } from "../lib/llm";
import { buildLearnerContext } from "../lib/learnerContext";
import { useTutor, type TutorTaskKind } from "../lib/tutor";
import { useConversations } from "../lib/conversations";
import { useUI } from "../lib/ui";
import { useProgress } from "../lib/progress";
import { useNotes, type Note } from "../lib/notes";
import { getModule, moduleProgress } from "../content/registry";
import { MBlock, FormattedText } from "./math";
import { Code as ShikiCode } from "./code-block";
import { Tooltip } from "./ui";
import { parseMarkdown, type Block } from "../lib/blocks";
interface ExtractJSON {
    tasks: {
        kind: TutorTaskKind;
        text: string;
        topic?: string;
    }[];
}
const ACTION_CARDS = [
    { key: "explain", label: "Explain section", desc: "Deconstruct the current paragraph intuition", prompt: "Explain the current paragraph context simply but precisely. Focus on building intuition first. Keep the response compact and readable." },
    { key: "visualize", label: "Visualize concept", desc: "Textual flow/diagram of the core logic", prompt: "Generate a clean, text-based visual diagram (using ASCII art, unicode symbols, or a clear step-by-step layout) to visualize the core concept of the current paragraph. Keep it compact." },
    { key: "quiz", label: "Quiz me", desc: "Interactive multiple-choice test question", prompt: "Generate a quick, challenging single-question multiple choice quiz with choices A, B, C, D to test my understanding of the current lesson concept. Do not reveal the answer immediately, let me reply first." },
    { key: "example", label: "Real-world example", desc: "Practical shader code or physics application", prompt: "Provide a practical, short WGSL or Metal shader code example demonstrating the graphics/mathematical concept in the current section. Keep it clean, and add brief comments explaining the math." },
    { key: "summary", label: "Summarize lesson", desc: "Key take-aways and formula checklist", prompt: "Provide a high-level summary of the entire lesson highlighting the key mathematical equations and concepts. Keep it concise." },
    { key: "struggle", label: "Gotchas & mistakes", desc: "Common pitfalls and mental model debugging", prompt: "Walk me through common gotchas, edge cases, or misunderstandings that developers face when working with the concepts in this section. Help me debug my mental model." }
];
export function TutorPanel() {
    const context = useUI((s) => s.tutorContext);
    const open = useUI((s) => s.tutorOpen);
    const openTutor = useUI((s) => s.openTutor);
    const closeTutor = useUI((s) => s.closeTutor);
    const currentParagraph = useUI((s) => s.currentParagraph);
    const currentExercise = useUI((s) => s.currentExercise);
    const selectedText = useUI((s) => s.selectedText);
    const done = useProgress((s) => s.done);
    const allNotes = useNotes((s) => s.notes);
    const deleteNote = useNotes((s) => s.deleteNote);
    const addNote = useNotes((s) => s.addNote);
    const updateNote = useNotes((s) => s.updateNote);
    const [activeTab, setActiveTab] = useState<"mentor" | "notes">("mentor");
    const [history, setHistory] = useState<ChatTurn[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [captured, setCaptured] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const logRef = useRef<HTMLDivElement>(null);
    const addTasks = useTutor((s) => s.addTasks);
    const addConversation = useConversations((s) => s.addConversation);
    const [savedConvo, setSavedConvo] = useState(false);
    const sourceId = context?.sourceId;
    const title = context?.title ?? "";
    const moduleId = sourceId?.split("/")[0];
    const lessonNotes = useMemo(() => {
        return allNotes.filter((n) => n.lessonKey === sourceId);
    }, [allNotes, sourceId]);
    const searchResults = useMemo(() => {
        if (!searchQuery.trim())
            return [];
        const q = searchQuery.toLowerCase();
        return allNotes.filter((n) => n.body.toLowerCase().includes(q) ||
            n.selectionText?.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)));
    }, [allNotes, searchQuery]);
    const masteryPct = useMemo(() => {
        const activeModule = moduleId ? getModule(moduleId) : null;
        return activeModule ? Math.round(moduleProgress(activeModule, done) * 100) : 0;
    }, [moduleId, done]);
    const moduleTitle = useMemo(() => {
        const activeModule = moduleId ? getModule(moduleId) : null;
        return activeModule ? activeModule.title : "Workspace";
    }, [moduleId]);
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    }, []);
    useEffect(() => {
        if (logRef.current)
            logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [history, loading, activeTab]);
    useEffect(() => {
        setHistory([]);
        setCaptured(0);
        setSearchQuery("");
        setElapsedMinutes(0);
    }, [sourceId, title]);
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedMinutes((m) => m + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, [sourceId]);
    if (!context)
        return null;
    const ctx = context;
    const enabled = isLLMEnabled();
    const system = [
        "You are an expert, encouraging AI mentor embedded in a premium engineering academy that teaches 3D graphics, engine programming, DSA, and mathematical foundations.",
        `The learner is currently on the ${ctx.scope}: "${ctx.title}".`,
        ctx.summary ? `Summary: ${ctx.summary}` : "",
        ctx.body ? `Page content (for grounding):\n${ctx.body.slice(0, 4000)}` : "",
        "Here is what we know about the learner's progress:",
        buildLearnerContext(),
        "When explaining concepts, write editorial, structured notebook sections with headings (###), formulas ($ or $$), code blocks, or ASCII/diagram layouts.",
        "Do not use chat bubbles or greeting boilerplate. Respond directly as an expert companion.",
    ].filter(Boolean).join("\n");
    async function captureInsights(turns: ChatTurn[]) {
        try {
            const transcript = turns.slice(-6).map((t) => `${t.role === "user" ? "Learner" : "Tutor"}: ${t.text}`).join("\n");
            const prompt = [
                "From this tutoring exchange, extract durable insights about the learner as a JSON object.",
                'Shape: {"tasks":[{"kind":"struggle"|"review"|"next"|"content-gap","text":string,"topic"?:string}]}',
                "- struggle: a concept the learner finds hard.",
                "- review: something worth revisiting.",
                "- next: a recommended next topic/step.",
                "- content-gap: a topic the course should explain better or add.",
                "Only include clear, specific, useful items (0-4 total). Empty array if none. No prose, JSON only.",
                `Context page: ${ctx.title}`,
                `Exchange:\n${transcript}`,
            ].join("\n");
            const raw = await generate(prompt, { temperature: 0.2 });
            const parsed = parseJSON<ExtractJSON>(raw);
            if (parsed?.tasks?.length) {
                addTasks(parsed.tasks.map((t) => ({ ...t, source: ctx.title })));
                setCaptured((c) => c + parsed.tasks.length);
            }
        }
        catch {
        }
    }
    async function ask(displayText: string, promptText?: string) {
        const q = displayText.trim();
        if (!q || loading)
            return;
        let actualPrompt = promptText ? promptText.trim() : q;
        if (currentParagraph && !promptText) {
            actualPrompt += `\n\n(Context: Learner is currently on paragraph "${currentParagraph}")`;
        }
        if (selectedText && !promptText) {
            actualPrompt += `\n\n(Highlighted Text: "${selectedText}")`;
        }
        const next: ChatTurn[] = [...history, { role: "user", text: q }];
        setHistory(next);
        setInput("");
        setLoading(true);
        try {
            const apiHistory: ChatTurn[] = [...history, { role: "user", text: actualPrompt }];
            const reply = await chat(apiHistory, { system, temperature: 0.4 });
            const withReply: ChatTurn[] = [...next, { role: "model", text: reply }];
            setHistory(withReply);
            void captureInsights(withReply);
        }
        catch (e) {
            setHistory([...next, { role: "model", text: e instanceof Error ? e.message : String(e) }]);
        }
        finally {
            setLoading(false);
        }
    }
    const handleSaveConversation = () => {
        const turns = history.filter((t) => t.text.trim());
        if (turns.length === 0) return;
        // Title from the first learner question, else the lesson title.
        const firstQ = turns.find((t) => t.role === "user")?.text.trim();
        const convoTitle = (firstQ && firstQ.slice(0, 70)) || title || "Saved conversation";
        addConversation({ title: convoTitle, turns, moduleId, lessonKey: sourceId });
        setSavedConvo(true);
        setTimeout(() => setSavedConvo(false), 2500);
    };
    const handlePin = (block: Block) => {
        let body = block.content;
        if (block.type === "code") {
            body = `\`\`\`${block.lang || "ts"}\n${block.content}\n\`\`\``;
        }
        else if (block.type === "math") {
            body = `$$\n${block.content}\n$$`;
        }
        const alreadyPinned = lessonNotes.some((n) => n.body.trim() === body.trim());
        if (alreadyPinned)
            return;
        addNote({
            lessonKey: sourceId,
            moduleId: moduleId,
            body: body,
            tags: ["pinned", block.type],
        });
    };
    if (!open) {
        return (<button className="fixed bottom-6 right-6 z-[99] flex items-center gap-[0.6rem] px-[1.15rem] py-3 rounded-pill border border-border-bright bg-[rgba(19,22,29,0.76)] backdrop-blur-[16px] text-accent font-mono text-[0.7rem] font-medium tracking-[0.08em] uppercase cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.4),var(--accent-soft)_0_0_20px] transition-all duration-300 ease-brand hover:bg-surface-2 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_14px_44px_rgba(0,0,0,0.5),0_0_12px_rgba(255,176,0,0.35)]" onClick={openTutor} aria-label="Open Companion Workspace">
        <SparkleIcon size={15} weight="fill" className="[filter:drop-shadow(0_0_3px_var(--accent))]"/>
        <span>Companion</span>
      </button>);
    }
    return (<aside className="sticky top-[70px] flex-none w-[380px] h-[calc(100vh-70px)] flex flex-col bg-surface border-l border-border z-[60] animate-[tp-slide_0.28s_var(--ease)_both] max-[1100px]:fixed max-[1100px]:top-0 max-[1100px]:right-0 max-[1100px]:h-[100dvh] max-[1100px]:z-[61] max-[1100px]:shadow-[-30px_0_80px_rgba(0,0,0,0.5)]" aria-label="AI Companion Workspace">

      <header className="flex justify-between items-start gap-4 pt-[1.6rem] px-[1.6rem] pb-[1.2rem] shrink-0">
        <div>
          <span className="block font-mono text-[0.64rem] tracking-[0.12em] uppercase text-accent mb-1">{moduleTitle}</span>
          <h2 className="font-display text-[1.15rem] font-semibold text-text m-0 mb-[0.4rem] leading-[1.2]">{ctx.title}</h2>
          <div className="flex items-center gap-[0.4rem] text-[0.74rem] text-text-faint">
            <span>{masteryPct}% Mastered</span>
            <span className="text-border-bright">•</span>
            <span>Currently reading: {currentParagraph || "Opening Section"}</span>
          </div>
        </div>
        <button className="grid place-items-center p-[0.2rem] rounded-[4px] bg-transparent border-none text-text-faint cursor-pointer transition-all duration-200 ease-brand hover:text-text hover:bg-[rgba(255,255,255,0.05)]" onClick={closeTutor} aria-label="Collapse companion">
          <XIcon size={15}/>
        </button>
      </header>


      <div className="flex gap-[0.35rem] pt-0 px-[1.6rem] pb-4 border-b border-border shrink-0">
        <button className={`flex-1 flex items-center justify-center gap-[0.4rem] bg-transparent border-none font-sans text-[0.8rem] py-[0.45rem] px-0 cursor-pointer rounded-xs transition-all duration-200 ease-brand ${activeTab === "mentor" ? "text-highlight bg-accent-soft font-medium" : "text-text-faint hover:text-text-dim hover:bg-[rgba(255,255,255,0.03)]"}`} onClick={() => setActiveTab("mentor")}>
          <SparkleIcon size={13} weight="fill"/>
          <span>Mentor</span>
        </button>
        <button className={`flex-1 flex items-center justify-center gap-[0.4rem] bg-transparent border-none font-sans text-[0.8rem] py-[0.45rem] px-0 cursor-pointer rounded-xs transition-all duration-200 ease-brand ${activeTab === "notes" ? "text-highlight bg-accent-soft font-medium" : "text-text-faint hover:text-text-dim hover:bg-[rgba(255,255,255,0.03)]"}`} onClick={() => setActiveTab("notes")}>
          <NotebookIcon size={13}/>
          <span>Knowledge Base</span>
          {lessonNotes.length > 0 && <span className="font-mono text-[0.68rem] bg-accent-soft text-accent py-[0.05rem] px-[0.35rem] rounded-pill">{lessonNotes.length}</span>}
        </button>
      </div>


      <div className="flex-1 overflow-y-auto p-[1.6rem] flex flex-col min-h-0" ref={logRef}>
        {activeTab === "mentor" ? (<div>
            {history.length === 0 ? (<div className="flex flex-col gap-[1.6rem]">
                <div className="flex flex-col gap-[0.6rem]">
                  <span className="font-display text-[1.4rem] font-semibold text-text">{greeting}.</span>
                  <p className="text-[0.9rem] text-text-dim leading-[1.5] m-0">
                    You're currently reading <strong>{ctx.title}</strong>.
                    {currentParagraph && (<>
                        {" "}I noticed you're reviewing <strong>{currentParagraph}</strong>.
                      </>)}
                  </p>
                  <p className="font-sans text-[0.76rem] text-text-faint uppercase tracking-[0.04em] leading-[1.5] m-0 mt-[0.4rem]">What would you like to explore next?</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {ACTION_CARDS.map((card) => (<button key={card.key} className="flex flex-col gap-[0.2rem] bg-surface border border-border rounded-sm py-[0.8rem] px-4 text-left cursor-pointer outline-none transition-all duration-200 ease-brand hover:border-border-bright hover:bg-surface-2 hover:-translate-y-px" onClick={() => ask(card.label, card.prompt)} disabled={loading}>
                      <span className="font-display text-[0.88rem] font-medium text-text">{card.label}</span>
                      <span className="text-[0.76rem] text-text-faint">{card.desc}</span>
                    </button>))}
                </div>
              </div>) : (<div className="flex flex-col gap-8">
                {history.map((turn, turnIdx) => (<div key={turnIdx} className="flex flex-col gap-4">
                    {turn.role === "user" ? (<div className="flex items-start gap-[0.6rem] mb-2">
                        <span className="w-[3px] h-4 bg-accent rounded-[2px] shrink-0 mt-[0.2rem]"/>
                        <span className="text-[0.94rem] font-medium text-text">{turn.text}</span>
                      </div>) : (<div className="relative flex flex-col gap-4 p-[1.2rem] bg-surface border border-border rounded-sm">
                        {parseMarkdown(turn.text).map((block, blockIdx) => {
                            const rawBody = block.type === "code"
                                ? `\`\`\`${block.lang || "ts"}\n${block.content}\n\`\`\``
                                : (block.type === "math" ? `$$\n${block.content}\n$$` : block.content);
                            const isPinned = lessonNotes.some((n) => n.body.trim() === rawBody.trim());
                            return (<div key={blockIdx} className={`group relative leading-[1.6] text-[0.9rem]${block.type === "text" ? " text-text-dim" : ""}`}>
                              {block.type !== "heading" && (<div className="absolute right-0 top-0 flex gap-[0.3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-[ease] z-10">
                                  <Tooltip content={isPinned ? "Already Pinned" : "Pin to Knowledge"}>
                                    <button className={`grid place-items-center p-1 border rounded-[4px] cursor-pointer transition-all duration-100 ease-[ease] ${isPinned ? "bg-accent-soft border-border-glow text-accent" : "bg-surface-2 border-border text-text-faint hover:text-text hover:border-border-bright"}`} onClick={() => handlePin(block)}>
                                      <PushPinIcon size={11} weight={isPinned ? "fill" : "regular"}/>
                                    </button>
                                  </Tooltip>
                                  <Tooltip content="Copy content">
                                    <button className="grid place-items-center p-1 border border-border rounded-[4px] cursor-pointer transition-all duration-100 ease-[ease] bg-surface-2 text-text-faint hover:text-text hover:border-border-bright" onClick={() => navigator.clipboard.writeText(block.content)}>
                                      <ClipboardTextIcon size={11}/>
                                    </button>
                                  </Tooltip>
                                </div>)}
                              <div>
                                {block.type === "heading" && (<h4 className="font-display text-base font-semibold text-text mx-0 mt-[0.8rem] mb-[0.4rem]">{block.content}</h4>)}
                                {block.type === "code" && (<ShikiCode code={block.content} lang={block.lang as any}/>)}
                                {block.type === "math" && (<MBlock>{block.content}</MBlock>)}
                                {block.type === "text" && (<FormattedText text={block.content}/>)}
                              </div>
                            </div>);
                        })}
                      </div>)}
                  </div>))}
              </div>)}

            {loading && (<div className="flex items-center gap-2 text-[0.8rem] text-text-faint py-[0.4rem] px-[0.8rem]">
                <CircleNotchIcon size={14} className="spin animate-spin"/>
                <span>Companion is drafting concept…</span>
              </div>)}

            {captured > 0 && (<div className="inline-flex items-center gap-[0.4rem] text-[0.74rem] text-good bg-[rgba(70,217,138,0.06)] border border-[rgba(70,217,138,0.15)] py-[0.3rem] px-[0.6rem] rounded-[4px] self-start">
                <ClipboardTextIcon size={13} weight="duotone"/>
                <span>Captured {captured} task{captured === 1 ? "" : "s"} to profile.</span>
              </div>)}

            {history.length > 0 && (<div className="mt-[0.6rem] flex justify-center">
                <button className="inline-flex items-center gap-[0.4rem] bg-surface-inset border border-border rounded-sm text-text-dim text-[0.78rem] py-[0.4rem] px-[0.8rem] cursor-pointer transition-all duration-200 ease-brand hover:text-text hover:border-border-bright disabled:text-good disabled:border-[rgba(70,217,138,0.4)] disabled:cursor-default" onClick={handleSaveConversation} disabled={savedConvo}>
                  {savedConvo ? <><CheckIcon size={13} weight="bold"/> Saved to this space</> : <><BookmarkSimpleIcon size={13}/> Save conversation</>}
                </button>
              </div>)}
          </div>) : (<div>
            <div className="relative mb-[1.2rem]">
              <MagnifyingGlassIcon size={13} className="absolute left-[0.6rem] top-1/2 -translate-y-1/2 text-text-faint"/>
              <input type="text" className="w-full bg-surface-inset border border-border rounded-sm py-[0.4rem] pr-[0.6rem] pl-[1.8rem] font-sans text-[0.82rem] text-text outline-none transition-[border] duration-150 focus:border-border-glow" placeholder="Search all notes & timeline..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            </div>

            <div className="flex flex-col gap-[0.8rem]">
              <span className="block font-mono text-[0.64rem] uppercase text-text-faint tracking-[0.08em] mt-[0.6rem]">Timeline & Learning Journey</span>


              <div className="kb-timeline-milestone relative flex gap-[0.8rem] pl-[0.4rem]">
                <span className="font-mono text-[0.68rem] text-text-faint w-[2.4rem] text-right shrink-0 pt-[0.15rem]">Today</span>
                <div className="flex-1 flex flex-col gap-[0.1rem] relative pl-4">
                  <div className="absolute left-[-3px] top-[0.35rem] w-[7px] h-[7px] rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"/>
                  <span className="font-display text-[0.84rem] font-medium text-text">Started lesson session</span>
                  <span className="text-[0.74rem] text-text-faint">Reviewed "{ctx.title}" for {elapsedMinutes} minutes</span>
                </div>
              </div>


              {searchQuery ? (searchResults.length === 0 ? (<div>No matching notes found.</div>) : (searchResults.map((note) => (<NoteItem key={note.id} note={note} onDelete={() => deleteNote(note.id)} onUpdate={(text) => updateNote(note.id, { body: text })}/>)))) : lessonNotes.length === 0 ? (<div className="flex flex-col items-center text-center gap-[0.4rem] p-[1.4rem] border border-dashed border-border rounded-sm my-2">
                  <InfoIcon size={16} className="text-accent"/>
                  <h4 className="font-display text-[0.86rem] font-medium m-0 text-text">Interactive engineering ledger</h4>
                  <p className="text-[0.76rem] text-text-faint leading-[1.4] m-0">
                    I automatically sync with your current page context. As you read, pin derivation boxes, mathematical formulas, or custom notes using the workspace tools.
                  </p>
                </div>) : (lessonNotes.map((note) => (<NoteItem key={note.id} note={note} onDelete={() => deleteNote(note.id)} onUpdate={(text) => updateNote(note.id, { body: text })}/>)))}


              <span className="block font-mono text-[0.64rem] uppercase text-text-faint tracking-[0.08em] mt-[0.6rem]">Past Milestones</span>
              <div className="kb-timeline-milestone historical relative flex gap-[0.8rem] pl-[0.4rem]">
                <span className="font-mono text-[0.68rem] text-text-faint w-[2.4rem] text-right shrink-0 pt-[0.15rem]">Yesterday</span>
                <div className="flex-1 flex flex-col gap-[0.1rem] relative pl-4">
                  <div className="absolute left-[-3px] top-[0.35rem] w-[7px] h-[7px] rounded-full bg-text-faint"/>
                  <span className="font-display text-[0.84rem] font-medium text-text">Bookmarked lesson</span>
                  <span className="text-[0.74rem] text-text-faint">Saved "{ctx.title}" to favorites</span>
                </div>
              </div>
              <div className="kb-timeline-milestone historical relative flex gap-[0.8rem] pl-[0.4rem]">
                <span className="font-mono text-[0.68rem] text-text-faint w-[2.4rem] text-right shrink-0 pt-[0.15rem]">2 days ago</span>
                <div className="flex-1 flex flex-col gap-[0.1rem] relative pl-4">
                  <div className="absolute left-[-3px] top-[0.35rem] w-[7px] h-[7px] rounded-full bg-text-faint"/>
                  <span className="font-display text-[0.84rem] font-medium text-text">Completed knowledge test</span>
                  <span className="text-[0.74rem] text-text-faint">Scored 85% on vectors quiz</span>
                </div>
              </div>
            </div>
          </div>)}
      </div>


      <div className="flex flex-wrap gap-x-[1.2rem] gap-y-[0.6rem] border-t border-border py-[0.6rem] px-4 bg-[rgba(11,11,14,0.3)] shrink-0">
        <div className="flex flex-col gap-[0.1rem]">
          <span className="font-mono text-[0.58rem] uppercase text-text-faint tracking-[0.05em]">Reading</span>
          <span className="text-[0.76rem] text-text-dim">{currentParagraph || "Paragraph 1"}</span>
        </div>
        {selectedText && (<div className="flex flex-col gap-[0.1rem]">
            <span className="font-mono text-[0.58rem] uppercase text-text-faint tracking-[0.05em]">Selected text</span>
            <span className="text-[0.76rem] text-accent italic truncate">“{selectedText}”</span>
          </div>)}
        <div className="flex flex-col gap-[0.1rem]">
          <span className="font-mono text-[0.58rem] uppercase text-text-faint tracking-[0.05em]">Exercise</span>
          <span className="text-[0.76rem] text-text-dim">{currentExercise ? `Exercise ${currentExercise.slice(-1)}` : "Not Started"}</span>
        </div>
        <div className="flex flex-col gap-[0.1rem]">
          <span className="font-mono text-[0.58rem] uppercase text-text-faint tracking-[0.05em]">Active Session</span>
          <span className="text-[0.76rem] text-text-dim">{elapsedMinutes}m</span>
        </div>
      </div>


      <div className="pt-[0.8rem] px-4 pb-4 border-t border-border bg-surface shrink-0">
        {!enabled ? (<div>
            Configure Firebase settings to enable Companion.
          </div>) : (<div className="flex flex-col gap-[0.35rem]">
            <div className="flex items-center gap-[0.3rem] font-mono text-[0.6rem] text-text-faint uppercase tracking-[0.05em]">
              <span className="text-accent animate-pulse">●</span>
              <span>Syncing context</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-inset border border-border rounded-pill py-[0.2rem] pr-[0.4rem] pl-[0.8rem]">
              <input type="text" className="flex-1 bg-transparent border-0 text-text font-sans text-[0.84rem] outline-none py-[0.4rem] px-0 min-w-0 placeholder:text-text-faint" value={input} placeholder="Ask about this lesson..." onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === "Enter")
                    ask(input);
            }} disabled={loading}/>
              <button onClick={() => ask(input)} disabled={loading || !input.trim()} aria-label="Send query">
                {loading ? <CircleNotchIcon size={14} className="spin animate-spin"/> : <PaperPlaneRightIcon size={14}/>}
              </button>
            </div>
          </div>)}
      </div>
    </aside>);
}
function NoteItem({ note, onDelete, onUpdate }: {
    note: Note;
    onDelete: () => void;
    onUpdate: (text: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(note.body);
    const isPinned = note.tags.includes("pinned");
    const handleSave = () => {
        setEditing(false);
        if (val.trim() !== note.body.trim()) {
            onUpdate(val.trim());
        }
    };
    if (isPinned) {
        const blocks = parseMarkdown(note.body);
        return (<div className="flex flex-col gap-2 bg-surface border border-border rounded-sm p-[0.9rem] transition-[border-color] duration-200 ease-brand hover:border-border-bright">
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase text-accent">
            <PushPinIcon size={10} weight="fill"/> Pinned Concept
          </span>
          <button className="grid place-items-center bg-transparent border-none text-text-faint cursor-pointer p-[0.15rem] rounded-[4px] hover:text-[#ff5c5c] hover:bg-[rgba(255,92,92,0.05)]" onClick={onDelete} aria-label="Delete note">
            <TrashIcon size={11}/>
          </button>
        </div>
        <div>
          {blocks.map((block, idx) => (<div key={idx} className={`group relative leading-[1.6] text-[0.9rem]${block.type === "text" ? " text-text-dim" : ""}`}>
              <div>
                {block.type === "heading" && <h4 className="font-display text-base font-semibold text-text mx-0 mt-[0.8rem] mb-[0.4rem]">{block.content}</h4>}
                {block.type === "code" && <ShikiCode code={block.content} lang={block.lang as any}/>}
                {block.type === "math" && <MBlock>{block.content}</MBlock>}
                {block.type === "text" && <FormattedText text={block.content}/>}
              </div>
            </div>))}
        </div>
      </div>);
    }
    return (<div className="flex flex-col gap-2 bg-surface border border-border rounded-sm p-[0.9rem] transition-[border-color] duration-200 ease-brand hover:border-border-bright">
      <div className="flex justify-between items-center">
        <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase text-text-faint">Personal Note</span>
        <button className="grid place-items-center bg-transparent border-none text-text-faint cursor-pointer p-[0.15rem] rounded-[4px] hover:text-[#ff5c5c] hover:bg-[rgba(255,92,92,0.05)]" onClick={onDelete} aria-label="Delete note">
          <TrashIcon size={11}/>
        </button>
      </div>
      {note.selectionText && (<blockquote className="border-l-2 border-border-bright pl-[0.6rem] m-0 mb-[0.4rem] text-[0.78rem] italic text-text-faint">
          “{note.selectionText}”
        </blockquote>)}
      <div>
        {editing ? (<div>
            <textarea className="w-full bg-surface-inset border border-border rounded-sm p-[0.45rem] font-sans text-[0.82rem] text-text outline-none resize-y" value={val} onChange={(e) => setVal(e.target.value)} rows={3} autoFocus/>
            <div className="flex justify-end gap-[0.4rem] mt-[0.4rem]">
              <button className="text-[0.74rem] py-[0.2rem] px-[0.5rem] rounded-[4px] cursor-pointer border-0 bg-transparent text-text-faint" onClick={() => { setVal(note.body); setEditing(false); }}>Cancel</button>
              <button className="text-[0.74rem] py-[0.2rem] px-[0.5rem] rounded-[4px] cursor-pointer border-0 bg-accent text-on-accent" onClick={handleSave}>Save</button>
            </div>
          </div>) : (<p onClick={() => setEditing(true)} className="text-[0.84rem] text-text m-0 leading-[1.5] whitespace-pre-wrap cursor-pointer">
            {note.body || <span>Empty note. Click to edit...</span>}
          </p>)}
      </div>
    </div>);
}
