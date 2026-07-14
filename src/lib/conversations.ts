import { create } from "zustand";
import { getCurrentUid, writeCloudState } from "./db";
import type { ChatTurn } from "./llm";

function save(patch: Record<string, unknown>) {
  writeCloudState(getCurrentUid(), patch);
}

/** A saved AI tutor conversation, filed under a learning source. */
export interface Conversation {
  id: string;
  title: string;
  turns: ChatTurn[];
  moduleId?: string; // built-in curriculum module
  spaceId?: string;  // custom Learning Space
  lessonKey?: string;
  createdAt: number;
  updatedAt: number;
}

interface ConversationsState {
  conversations: Conversation[];
  addConversation: (c: Omit<Conversation, "id" | "createdAt" | "updatedAt">) => string;
  updateConversation: (id: string, patch: Partial<Pick<Conversation, "title" | "turns" | "moduleId" | "spaceId">>) => void;
  deleteConversation: (id: string) => void;
}

let seq = 0;
const uid = () => `cv-${Date.now().toString(36)}-${(seq++).toString(36)}`;

const EMPTY_CONVERSATIONS = { conversations: [] as Conversation[] };

export const useConversations = create<ConversationsState>()((set) => ({
  ...EMPTY_CONVERSATIONS,
  addConversation: (c) => {
    const now = Date.now();
    const id = uid();
    set((st) => {
      const conversations = [{ ...c, id, createdAt: now, updatedAt: now }, ...st.conversations];
      save({ conversations });
      return { conversations };
    });
    return id;
  },
  updateConversation: (id, patch) => {
    set((st) => {
      const conversations = st.conversations.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c));
      save({ conversations });
      return { conversations };
    });
  },
  deleteConversation: (id) => {
    set((st) => {
      const conversations = st.conversations.filter((c) => c.id !== id);
      save({ conversations });
      return { conversations };
    });
  },
}));

export function hydrateConversations(data: { conversations?: Conversation[] } | null) {
  useConversations.setState({ conversations: data?.conversations ?? [] });
}
