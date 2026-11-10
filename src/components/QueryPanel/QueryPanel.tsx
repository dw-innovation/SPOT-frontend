import React, { useRef } from "react";

import useChatStore from "@/stores/useChatStore";
import useDisableMapInteraction from "@/stores/useDisableMapInteraction";

import ChatPanel from "./ChatPanel";
import PromptInput from "./PromptInput";

const QueryPanel = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  useDisableMapInteraction(panelRef);
  const isChatting = useChatStore((state) => state.history.length > 0);

  return (
    <div ref={panelRef} className="flex flex-col w-[20rem] h-full gap-2">
      {/* min-h-0 lets the card shrink inside the column so the conversation
          scrolls instead of pushing the composer off the bottom. */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 p-2 overflow-hidden bg-white rounded-md shadow-lg cursor-auto">
        {isChatting ? <ChatPanel /> : <PromptInput />}
      </div>
    </div>
  );
};

export default QueryPanel;
