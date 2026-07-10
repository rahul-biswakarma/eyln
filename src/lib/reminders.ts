import { useEffect } from "react";
import { useNotes, dueReminders } from "./notes";

/** Ask for browser-notification permission on demand (never on first paint). */
export async function ensureNotifyPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

function fireNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: "forge-reminder", icon: "/favicon.ico" });
  } catch {
    /* notifications can throw in some embedded contexts — ignore */
  }
}

const CHECK_MS = 30_000;

/**
 * Background scheduler mounted once (in App). Scans reminders on an interval and
 * on tab focus; fires a browser notification for each newly-due reminder and flags
 * it `notified` so it never re-fires. The in-app bell reads the same store for its badge.
 */
export function useReminderScheduler() {
  const markNotified = useNotes((s) => s.markNotified);

  useEffect(() => {
    const scan = () => {
      const { reminders } = useNotes.getState();
      const now = Date.now();
      for (const r of dueReminders(reminders, now)) {
        if (r.notified) continue;
        fireNotification("Forge — time to review", r.note);
        markNotified(r.id);
      }
    };
    scan();
    const t = setInterval(scan, CHECK_MS);
    window.addEventListener("focus", scan);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", scan);
    };
  }, [markNotified]);
}

/** Common "remind me in…" presets, in ms. */
export const REMINDER_PRESETS: { label: string; ms: number }[] = [
  { label: "In 1 hour", ms: 60 * 60 * 1000 },
  { label: "Tomorrow", ms: 24 * 60 * 60 * 1000 },
  { label: "In 3 days", ms: 3 * 24 * 60 * 60 * 1000 },
  { label: "In a week", ms: 7 * 24 * 60 * 60 * 1000 },
];
