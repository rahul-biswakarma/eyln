import { useState } from "react";
import { useNotes } from "../lib/notes";
import { REMINDER_PRESETS, ensureNotifyPermission } from "../lib/reminders";

export function NotePanel({
  lessonKey,
  moduleId,
  lessonTitle,
  selection,
  onClose,
}: {
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

  return (
    <div className="note-overlay" onClick={onClose}>
      <div className="note-panel card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.8rem" }}>
          <strong>Add a note</strong>
          <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose}>✕</button>
        </div>
        <div className="empty-note" style={{ padding: 0, marginBottom: "0.6rem" }}>{lessonTitle}</div>

        {selection && (
          <div className="notice" style={{ margin: "0 0 0.9rem" }}>
            <span className="lbl">Highlighted</span>
            <span style={{ fontStyle: "italic" }}>“{selection}”</span>
          </div>
        )}

        <label className="fld-lbl">Note</label>
        <textarea
          rows={5}
          value={body}
          autoFocus
          placeholder="Why is this interesting / what do you want to remember?"
          onChange={(e) => setBody(e.target.value)}
        />

        <label className="fld-lbl">Tags (comma-separated)</label>
        <input type="text" value={tagsRaw} placeholder="matrices, gotcha" onChange={(e) => setTagsRaw(e.target.value)} />

        <label className="fld-lbl">Remind me to review</label>
        <div className="chip-row" style={{ marginBottom: "1rem" }}>
          <span
            className={"chip" + (remindMs === null ? " active" : "")}
            onClick={() => setRemindMs(null)}
          >
            No reminder
          </span>
          {REMINDER_PRESETS.map((p) => (
            <span
              key={p.label}
              className={"chip" + (remindMs === p.ms ? " active" : "")}
              onClick={() => setRemindMs(p.ms)}
            >
              {p.label}
            </span>
          ))}
        </div>

        <button className="btn primary" onClick={save}>Save</button>
      </div>
    </div>
  );
}
