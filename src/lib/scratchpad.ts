import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
interface ScratchpadState {
    text: string;
    setText: (text: string) => void;
}
export const useScratchpad = create<ScratchpadState>()((set) => ({
    text: "",
    setText: (text) => {
        set({ text });
        writeCloudState(getCurrentUid(), { scratchpad: text });
    },
}));
export function hydrateScratchpad(text: string | null | undefined) {
    useScratchpad.setState({ text: text ?? "" });
}
