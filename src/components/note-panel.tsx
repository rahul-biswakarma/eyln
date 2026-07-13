import { useState } from "react";
import { useNotes } from "../lib/notes";
import { REMINDER_PRESETS, ensureNotifyPermission } from "../lib/reminders";
import { Dialog, DialogContent, DialogTitle } from "./ui";
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
    return (<Dialog open={true} onOpenChange={(open) => { if (!open)
        onClose(); }}>
      <DialogContent showCloseButton={true}>
        <DialogTitle>Add a note</DialogTitle>
        <div className="empty-note" style={{ padding: 0, marginBottom: "0.8rem", background: "none", border: 0 }}>{lessonTitle}</div>

        {selection && (<div className="notice" style={{ margin: "0 0 0.9rem" }}>
            <span className="lbl">Highlighted</span>
            <span style={{ fontStyle: "italic" }}>“{selection}”</span>
          </div>)}

        <label className="fld-lbl">Note</label>
        <textarea rows={5} value={body} autoFocus placeholder="Why is this interesting / what do you want to remember?" onChange={(e) => setBody(e.target.value)} style={{ width: "100%", marginBottom: "1rem" }}/>

        <label className="fld-lbl">Tags (comma-separated)</label>
        <input type="text" value={tagsRaw} placeholder="matrices, gotcha" onChange={(e) => setTagsRaw(e.target.value)} style={{ width: "100%", marginBottom: "1rem" }}/>

        <label className="fld-lbl">Remind me to review</label>
        <div className="chip-row" style={{ marginBottom: "1.2rem" }}>
          <span className={"chip" + (remindMs === null ? " active" : "")} onClick={() => setRemindMs(null)}>
            No reminder
          </span>
          {REMINDER_PRESETS.map((p) => (<span key={p.label} className={"chip" + (remindMs === p.ms ? " active" : "")} onClick={() => setRemindMs(p.ms)}>
              {p.label}
            </span>))}
        </div>

        <button className="btn primary" onClick={save} style={{ width: "100%" }}>Save</button>
      </DialogContent>
    </Dialog>);
}
