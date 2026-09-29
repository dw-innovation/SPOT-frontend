import { create } from "zustand";

import { ChatMessage, ChatQuery } from "@/types/chatQuery";

type ChatStoreInterface = {
  /** Turns so far, oldest first; empty while no chat is running. */
  history: ChatMessage[];
  /** The chat API's query from the last turn. */
  chatQuery: ChatQuery | null;
  setChat: (history: ChatMessage[], chatQuery: ChatQuery) => void;
  reset: () => void;
};

const useChatStore = create<ChatStoreInterface>((set) => ({
  history: [],
  chatQuery: null,
  setChat: (history, chatQuery) => set({ history, chatQuery }),
  reset: () => set({ history: [], chatQuery: null }),
}));

export default useChatStore;
