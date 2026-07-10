import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNotes } from "../lib/notes";
import { allLessons, lessonPath } from "../content/registry";
import { relativeTime } from "../lib/stats";

function lessonForKey(key?: string) {
  if (!key) return undefined;
  return allLessons.find((r) => `${r.module.id}/${r.lesson.id}` === key);
}

export function Notes() {
  const notes = useNotes((s) => s.notes);
  const bookmarks = useNotes((s) => s.bookmarks);
  const reminders = useNotes((s) => s.reminders);
  const deleteNote = useNotes((s) => s.deleteNote);
  const toggleBookmark = useNotes((s) => s.toggleBookmark);
  const completeReminder = useNotes((s) => s.completeReminder);
  const deleteReminder = useNotes((s) => s.deleteReminder);

  const now = Date.now();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const filtered = notes.filter((n) => {
    if (tag && !n.tags.includes(tag)) return false;
    if (q) {
      const hay = (n.body + " " + (n.selectionText ?? "") + " " + n.tags.join(" ")).toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const bookmarkList = Object.entries(bookmarks).sort((a, b) => b[1] - a[1]);
  const openReminders = reminders.filter((r) => !r.done).sort((a, b) => a.dueAt - b.dueAt);

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Your workspace</div>
          <h1>Notes & Reminders</h1>
          <div className="sub">Everything you saved, bookmarked, or scheduled to review.</div>
        </div>
      </div>

      {/* Reminders */}
      <div className="section-title"><h3>Reminders</h3></div>
      <div className="card">
        {openReminders.length === 0 ? (
          <div className="empty-note">No reminders. Set one from any lesson's note panel.</div>
        ) : (
          <div className="activity">
            {openReminders.map((r) => {
              const overdue = r.dueAt <= now;
              const ref = lessonForKey(r.lessonKey);
              return (
                <div className="row" key={r.id}>
                  <span className="ic">{overdue ? "🔔" : "⏰"}</span>
                  <div className="txt">
                    <div className="t">{r.note}</div>
                    <div className="s">
                      {overdue ? "due " : "in "}
                      {relativeTime(overdue ? r.dueAt : now, overdue ? now : r.dueAt)}
                      {ref && <> · {ref.module.title}</>}
                    </div>
                  </div>
                  <span style={{ display: "flex", gap: "0.4rem" }}>
                    {ref && <Link className="btn" to={lessonPath(ref.module.id, ref.lesson.id)}>Open</Link>}
                    <button className="btn" onClick={() => completeReminder(r.id)}>Done</button>
                    <button className="icon-btn" title="Delete" onClick={() => deleteReminder(r.id)}>✕</button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bookmarks */}
      <div className="section-title"><h3>Bookmarks</h3></div>
      <div className="card">
        {bookmarkList.length === 0 ? (
          <div className="empty-note">No bookmarks yet. Tap the ☆ on any lesson.</div>
        ) : (
          <div className="activity">
            {bookmarkList.map(([key, at]) => {
              const ref = lessonForKey(key);
              if (!ref) return null;
              return (
                <Link key={key} className="row" to={lessonPath(ref.module.id, ref.lesson.id)} style={{ color: "inherit" }}>
                  <span className="ic">{ref.module.icon}</span>
                  <div className="txt">
                    <div className="t">{ref.lesson.title}</div>
                    <div className="s">{ref.module.title}</div>
                  </div>
                  <span className="when">{relativeTime(at, now)}</span>
                  <button
                    className="icon-btn"
                    title="Remove bookmark"
                    onClick={(e) => { e.preventDefault(); toggleBookmark(key); }}
                  >
                    ✕
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="section-title"><h3>Notes</h3></div>
      <div className="chip-row">
        <input
          type="text"
          value={q}
          placeholder="Search notes…"
          onChange={(e) => setQ(e.target.value)}
          style={{ background: "var(--surface-inset)", color: "var(--text)", border: "1px solid var(--border-bright)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.8rem", fontSize: "0.86rem" }}
        />
        <span className={"chip" + (tag === null ? " active" : "")} onClick={() => setTag(null)}>All</span>
        {allTags.map((t) => (
          <span key={t} className={"chip" + (tag === t ? " active" : "")} onClick={() => setTag(t)}>#{t}</span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-note">No notes match. Add one from a lesson with the ✎ button.</div></div>
      ) : (
        <div className="mod-grid">
          {filtered.map((n) => {
            const ref = lessonForKey(n.lessonKey);
            return (
              <div className="card" key={n.id}>
                {n.selectionText && (
                  <div className="notice" style={{ margin: "0 0 0.7rem" }}>
                    <span className="lbl">Highlighted</span>
                    <span style={{ fontStyle: "italic" }}>“{n.selectionText}”</span>
                  </div>
                )}
                {n.body && <p style={{ margin: "0 0 0.7rem", color: "var(--text)" }}>{n.body}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.6rem" }}>
                  {n.tags.map((t) => (
                    <span key={t} className="badge">#{t}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {ref && (
                    <Link className="section-title" style={{ margin: 0 }} to={lessonPath(ref.module.id, ref.lesson.id)}>
                      <span className="more">{ref.module.icon} {ref.lesson.title} →</span>
                    </Link>
                  )}
                  <span className="when" style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--text-faint)" }}>
                    {relativeTime(n.createdAt, now)}
                  </span>
                  <button className="icon-btn" title="Delete note" onClick={() => deleteNote(n.id)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
