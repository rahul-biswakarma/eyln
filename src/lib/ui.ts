import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TutorContext {
  /** e.g. "lesson" | "chapter review". */
  scope: string;
  /** Human title of the page, e.g. the lesson or module title. */
  title: string;
  /** One-line summary of the page. */
  summary?: string;
  /** Optional longer body text (lesson prose) for deeper grounding. */
  body?: string;
  /** module/lesson id used to tag captured tutor tasks. */
  sourceId?: string;
}

interface UIState {
  /** Left lesson sidebar collapsed to a slim rail. Persisted. */
  sidebarCollapsed: boolean;
  /** Docked tutor panel open. */
  tutorOpen: boolean;
  /** Context for whatever page the tutor should ground itself in. */
  tutorContext: TutorContext | null;
  currentParagraph: string | null;
  currentExercise: string | null;
  selectedText: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openTutor: () => void;
  closeTutor: () => void;
  toggleTutor: () => void;
  setTutorContext: (ctx: TutorContext | null) => void;
  setCurrentParagraph: (p: string | null) => void;
  setCurrentExercise: (e: string | null) => void;
  setSelectedText: (s: string | null) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      tutorOpen: false,
      tutorContext: null,
      currentParagraph: null,
      currentExercise: null,
      selectedText: null,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      openTutor: () => set({ tutorOpen: true }),
      closeTutor: () => set({ tutorOpen: false }),
      toggleTutor: () => set((s) => ({ tutorOpen: !s.tutorOpen })),
      setTutorContext: (ctx) => set({ tutorContext: ctx }),
      setCurrentParagraph: (p) => set({ currentParagraph: p }),
      setCurrentExercise: (e) => set({ currentExercise: e }),
      setSelectedText: (s) => set({ selectedText: s }),
    }),
    {
      name: "forge-ui",
      // Only the sidebar preference persists; tutor open/context are per-session.
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
