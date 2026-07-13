import { create } from "zustand";
import { persist } from "zustand/middleware";
export interface TutorContext {
    scope: string;
    title: string;
    summary?: string;
    body?: string;
    sourceId?: string;
}
interface UIState {
    sidebarCollapsed: boolean;
    tutorOpen: boolean;
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
export const useUI = create<UIState>()(persist((set) => ({
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
}), {
    name: "forge-ui",
    partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
}));
