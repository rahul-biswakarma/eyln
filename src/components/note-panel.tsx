import { useState } from "react";
import { useNotes } from "../lib/notes";
import { REMINDER_PRESETS, ensureNotifyPermission } from "../lib/reminders";
import { Dialog, DialogContent, DialogTitle, Chip, Button } from "./ui";

const FIELD = "w-full mb-4 bg-surface-inset text-text border border-border rounded-sm px-[0.75rem] py-[0.6rem] text-[0.86rem] font-sans resize-vertical outline-none focus:border-border-glow";
const FIELD_LABEL = "block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-faint mb-[0.4rem]";
export function NotePanel({ lessonKey, moduleId, lessonTitle, selection, onClose, }: {
    lessonKey: string;
    moduleId: string;
    lessonTitle: string;
    selection?: string;
    onClose: () => void;
}) {
    const addNote = useNotes((s) => s.addNote);
    const addReminder = useNotes((s) => s.addReminder);
    const [body, setBody] = useState("");
    const [tagsRaw, setTagsRaw] = useState("");
    const [remindMs, setRemindMs] = useState<number | null>(null);
    function save() {
        const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
        if (body.trim() || selection) {
            addNote({ lessonKey, moduleId, selectionText: selection, body: body.trim(), tags });
        }
        if (remindMs) {
            addReminder({
                lessonKey,
                note: `Review "${lessonTitle}"${body.trim() ? `: ${body.trim().slice(0, 60)}` : ""}`,
                dueAt: Date.now() + remindMs,
            });
            void ensureNotifyPermission();
        }
        onClose();
    }
    return (<Dialog open={true} onOpenChange={(open) => {
            if (!open)
                onClose();
        }}>
      <DialogContent showCloseButton={true}>
        <DialogTitle>Add a note</DialogTitle>
        <div className="text-text-faint text-[0.86rem] mb-[0.8rem]">{lessonTitle}</div>

        {selection && (<div className="mb-[0.9rem] border-l-2 border-accent bg-surface rounded-r-sm px-[1.1rem] py-[0.9rem] text-[0.9rem] text-text-dim">
            <span className={FIELD_LABEL}>Highlighted</span>
            <span className="italic">“{selection}”</span>
          </div>)}

        <label className={FIELD_LABEL}>Note</label>
        <textarea rows={5} value={body} autoFocus placeholder="Why is this interesting / what do you want to remember?" onChange={(e) => setBody(e.target.value)} className={FIELD}/>

        <label className={FIELD_LABEL}>Tags (comma-separated)</label>
        <input type="text" value={tagsRaw} placeholder="matrices, gotcha" onChange={(e) => setTagsRaw(e.target.value)} className={FIELD}/>

        <label className={FIELD_LABEL}>Remind me to review</label>
        <div className="flex items-center gap-[0.6rem] flex-wrap mb-[1.2rem]">
          <Chip active={remindMs === null} onClick={() => setRemindMs(null)}>No reminder</Chip>
          {REMINDER_PRESETS.map((p) => (<Chip key={p.label} active={remindMs === p.ms} onClick={() => setRemindMs(p.ms)}>
              {p.label}
            </Chip>))}
        </div>

        <Button variant="primary" onClick={save} className="w-full justify-center">Save</Button>
      </DialogContent>
    </Dialog>);
}
