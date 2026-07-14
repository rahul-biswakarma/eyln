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
        return (<button className="tutor-rail-floating" onClick={openTutor} aria-label="Open Companion Workspace">
        <SparkleIcon size={15} weight="fill" className="glow-icon"/>
        <span className="tr-label">Companion</span>
      </button>);
    }
    return (<aside className="tutor-panel-workspace" aria-label="AI Companion Workspace">
      
      <header className="comp-header">
        <div className="comp-header-left">
          <span className="comp-kicker">{moduleTitle}</span>
          <h2 className="comp-title">{ctx.title}</h2>
          <div className="comp-meta">
            <span>{masteryPct}% Mastered</span>
            <span className="dot">•</span>
            <span>Currently reading: {currentParagraph || "Opening Section"}</span>
          </div>
        </div>
        <button className="comp-close-btn" onClick={closeTutor} aria-label="Collapse companion">
          <XIcon size={15}/>
        </button>
      </header>

      
      <div className="comp-switcher">
        <button className={`switcher-tab ${activeTab === "mentor" ? "active" : ""}`} onClick={() => setActiveTab("mentor")}>
          <SparkleIcon size={13} weight="fill"/>
          <span>Mentor</span>
        </button>
        <button className={`switcher-tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
          <NotebookIcon size={13}/>
          <span>Knowledge Base</span>
          {lessonNotes.length > 0 && <span className="tab-badge">{lessonNotes.length}</span>}
        </button>
      </div>

      
      <div className="comp-workspace-scrollable" ref={logRef}>
        {activeTab === "mentor" ? (<div className="mentor-workspace">
            {history.length === 0 ? (<div className="mentor-welcome">
                <div className="welcome-intro">
                  <span className="greeting-text">{greeting}.</span>
                  <p>
                    You're currently reading <strong>{ctx.title}</strong>.
                    {currentParagraph && (<>
                        {" "}I noticed you're reviewing <strong>{currentParagraph}</strong>.
                      </>)}
                  </p>
                  <p className="prompt-lead">What would you like to explore next?</p>
                </div>

                <div className="action-cards-grid">
                  {ACTION_CARDS.map((card) => (<button key={card.key} className="action-card" onClick={() => ask(card.label, card.prompt)} disabled={loading}>
                      <span className="card-label">{card.label}</span>
                      <span className="card-desc">{card.desc}</span>
                    </button>))}
                </div>
              </div>) : (<div className="tp-notebook-stream">
                {history.map((turn, turnIdx) => (<div key={turnIdx} className={`tp-notebook-turn ${turn.role}`}>
                    {turn.role === "user" ? (<div className="tp-user-query">
                        <span className="query-decor"/>
                        <span className="query-text">{turn.text}</span>
                      </div>) : (<div className="tp-model-response">
                        {parseMarkdown(turn.text).map((block, blockIdx) => {
                            const rawBody = block.type === "code"
                                ? `\`\`\`${block.lang || "ts"}\n${block.content}\n\`\`\``
                                : (block.type === "math" ? `$$\n${block.content}\n$$` : block.content);
                            const isPinned = lessonNotes.some((n) => n.body.trim() === rawBody.trim());
                            return (<div key={blockIdx} className={`tp-notebook-block ${block.type}`}>
                              {block.type !== "heading" && (<div className="tp-block-actions">
                                  <Tooltip content={isPinned ? "Already Pinned" : "Pin to Knowledge"}>
                                    <button className={"action-btn" + (isPinned ? " pinned" : "")} onClick={() => handlePin(block)}>
                                      <PushPinIcon size={11} weight={isPinned ? "fill" : "regular"}/>
                                    </button>
                                  </Tooltip>
                                  <Tooltip content="Copy content">
                                    <button className="action-btn" onClick={() => navigator.clipboard.writeText(block.content)}>
                                      <ClipboardTextIcon size={11}/>
                                    </button>
                                  </Tooltip>
                                </div>)}
                              <div className="block-inner">
                                {block.type === "heading" && (<h4 className="nb-heading">{block.content}</h4>)}
                                {block.type === "code" && (<ShikiCode code={block.content} lang={block.lang as any}/>)}
                                {block.type === "math" && (<MBlock>{block.content}</MBlock>)}
                                {block.type === "text" && (<FormattedText text={block.content}/>)}
                              </div>
                            </div>);
                        })}
                      </div>)}
                  </div>))}
              </div>)}

            {loading && (<div className="tp-notebook-loading">
                <CircleNotchIcon size={14} className="spin animate-spin"/>
                <span>Companion is drafting concept…</span>
              </div>)}

            {captured > 0 && (<div className="tp-captured-v2">
                <ClipboardTextIcon size={13} weight="duotone"/>
                <span>Captured {captured} task{captured === 1 ? "" : "s"} to profile.</span>
              </div>)}

            {history.length > 0 && (<div className="tp-save-convo">
                <button className="tp-save-convo-btn" onClick={handleSaveConversation} disabled={savedConvo}>
                  {savedConvo ? <><CheckIcon size={13} weight="bold"/> Saved to this space</> : <><BookmarkSimpleIcon size={13}/> Save conversation</>}
                </button>
              </div>)}
          </div>) : (<div className="kb-workspace">
            <div className="kb-search-box">
              <MagnifyingGlassIcon size={13} className="search-icon"/>
              <input type="text" placeholder="Search all notes & timeline..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            </div>

            <div className="kb-timeline-list">
              <span className="kb-section-title">Timeline & Learning Journey</span>
              
              
              <div className="kb-timeline-milestone">
                <span className="time-lbl">Today</span>
                <div className="milestone-content">
                  <div className="milestone-dot"/>
                  <span className="milestone-title">Started lesson session</span>
                  <span className="milestone-desc">Reviewed "{ctx.title}" for {elapsedMinutes} minutes</span>
                </div>
              </div>

              
              {searchQuery ? (searchResults.length === 0 ? (<div className="kb-empty-state">No matching notes found.</div>) : (searchResults.map((note) => (<NoteItem key={note.id} note={note} onDelete={() => deleteNote(note.id)} onUpdate={(text) => updateNote(note.id, { body: text })}/>)))) : lessonNotes.length === 0 ? (<div className="kb-onboarding">
                  <InfoIcon size={16}/>
                  <h4>Interactive engineering ledger</h4>
                  <p>
                    I automatically sync with your current page context. As you read, pin derivation boxes, mathematical formulas, or custom notes using the workspace tools.
                  </p>
                </div>) : (lessonNotes.map((note) => (<NoteItem key={note.id} note={note} onDelete={() => deleteNote(note.id)} onUpdate={(text) => updateNote(note.id, { body: text })}/>)))}

              
              <span className="kb-section-title">Past Milestones</span>
              <div className="kb-timeline-milestone historical">
                <span className="time-lbl">Yesterday</span>
                <div className="milestone-content">
                  <div className="milestone-dot"/>
                  <span className="milestone-title">Bookmarked lesson</span>
                  <span className="milestone-desc">Saved "{ctx.title}" to favorites</span>
                </div>
              </div>
              <div className="kb-timeline-milestone historical">
                <span className="time-lbl">2 days ago</span>
                <div className="milestone-content">
                  <div className="milestone-dot"/>
                  <span className="milestone-title">Completed knowledge test</span>
                  <span className="milestone-desc">Scored 85% on vectors quiz</span>
                </div>
              </div>
            </div>
          </div>)}
      </div>

      
      <div className="comp-context-tray">
        <div className="tray-item">
          <span className="lbl">Reading</span>
          <span className="val">{currentParagraph || "Paragraph 1"}</span>
        </div>
        {selectedText && (<div className="tray-item highlight">
            <span className="lbl">Selected text</span>
            <span className="val truncate">“{selectedText}”</span>
          </div>)}
        <div className="tray-item">
          <span className="lbl">Exercise</span>
          <span className="val">{currentExercise ? `Exercise ${currentExercise.slice(-1)}` : "Not Started"}</span>
        </div>
        <div className="tray-item">
          <span className="lbl">Active Session</span>
          <span className="val">{elapsedMinutes}m</span>
        </div>
      </div>

      
      <div className="comp-input-area">
        {!enabled ? (<div className="tp-disabled-inline">
            Configure Firebase settings to enable Companion.
          </div>) : (<div className="comp-input-wrapper">
            <div className="comp-input-indicator">
              <span className="indicator-dot animate-pulse">●</span>
              <span>Syncing context</span>
            </div>
            <div className="comp-input-row">
              <input type="text" value={input} placeholder="Ask about this lesson..." onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
                if (e.key === "Enter")
                    ask(input);
            }} disabled={loading}/>
              <button className="send-btn" onClick={() => ask(input)} disabled={loading || !input.trim()} aria-label="Send query">
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
        return (<div className="kb-pinned-note">
        <div className="note-header">
          <span className="note-lbl">
            <PushPinIcon size={10} weight="fill"/> Pinned Concept
          </span>
          <button className="note-delete-btn" onClick={onDelete} aria-label="Delete note">
            <TrashIcon size={11}/>
          </button>
        </div>
        <div className="note-body">
          {blocks.map((block, idx) => (<div key={idx} className={`tp-notebook-block ${block.type}`}>
              <div className="block-inner">
                {block.type === "heading" && <h4 className="nb-heading">{block.content}</h4>}
                {block.type === "code" && <ShikiCode code={block.content} lang={block.lang as any}/>}
                {block.type === "math" && <MBlock>{block.content}</MBlock>}
                {block.type === "text" && <FormattedText text={block.content}/>}
              </div>
            </div>))}
        </div>
      </div>);
    }
    return (<div className="kb-user-note">
      <div className="note-header">
        <span className="note-lbl">Personal Note</span>
        <button className="note-delete-btn" onClick={onDelete} aria-label="Delete note">
          <TrashIcon size={11}/>
        </button>
      </div>
      {note.selectionText && (<blockquote className="note-quote">
          “{note.selectionText}”
        </blockquote>)}
      <div className="note-body">
        {editing ? (<div className="note-edit-area">
            <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} autoFocus/>
            <div className="edit-buttons">
              <button className="edit-btn cancel" onClick={() => { setVal(note.body); setEditing(false); }}>Cancel</button>
              <button className="edit-btn save" onClick={handleSave}>Save</button>
            </div>
          </div>) : (<p onClick={() => setEditing(true)} className="note-text">
            {note.body || <span className="placeholder">Empty note. Click to edit...</span>}
          </p>)}
      </div>
    </div>);
}
