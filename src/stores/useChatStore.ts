import { create } from "zustand";

import { ChatMessage, ChatQuery } from "@/types/chatQuery";

type ChatStoreInterface = {
  /** Turns so far, oldest first; empty while no chat is running. */
  history: ChatMessage[];
  /** The chat API's query from the last turn. */
  chatQuery: ChatQuery | null;
  setChat: (history: ChatMessage[], chatQuery: ChatQuery) => void;
  /**
   * Something the search needs to tell the user, shown inline in the panel
   * rather than as a dialog — "no results" is an ordinary outcome of a search,
   * not an error worth interrupting them for.
   */
  notice: string | null;
  setNotice: (notice: string | null) => void;
  reset: () => void;
};

const useChatStore = create<ChatStoreInterface>((set) => ({
  history: [],
  chatQuery: null,
  setChat: (history, chatQuery) => set({ history, chatQuery, notice: null }),
  notice: null,
  setNotice: (notice) => set({ notice }),
  reset: () => set({ history: [], chatQuery: null, notice: null }),
}));

export default useChatStore;
