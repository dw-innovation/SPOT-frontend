import React, { useRef } from "react";

import useChatStore from "@/stores/useChatStore";
import useDisableMapInteraction from "@/stores/useDisableMapInteraction";

import ChatPanel from "./ChatPanel";
import PromptInput from "./PromptInput";
import SearchFlow from "./SearchFlow";
import SearchRefinement from "./SearchRefinement";

const QueryPanel = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  useDisableMapInteraction(panelRef);
  const isChatting = useChatStore((state) => state.history.length > 0);

  return (
    <div ref={panelRef} className="w-[20rem] flex flex-col gap-2">
      <div className="flex flex-col gap-4 p-2 overflow-hidden bg-white rounded-md shadow-lg cursor-auto">
        {isChatting ? <ChatPanel /> : <PromptInput />}
        {/* Progress, area selection and "no results" all appear here, below
            the conversation, rather than in a dialog over the map. */}
        <SearchFlow />
      </div>
      <div className="flex flex-col overflow-hidden bg-white rounded-md shadow-lg">
        <SearchRefinement />
      </div>
    </div>
  );
};

export default QueryPanel;
