import { useMutation } from "@tanstack/react-query";
import { SendHorizontalIcon } from "lucide-react";
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchChatTurn, validateSpotQuery } from "@/lib/apiServices";
import { mergeChatTurn, syncChatQuery } from "@/lib/chat";
import { cn, trackAction } from "@/lib/utils";
import useChatStore from "@/stores/useChatStore";
import useGlobalStore from "@/stores/useGlobalStore";
import useMapStore from "@/stores/useMapStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import { ChatMessage } from "@/types/chatQuery";

const Bubble = ({ message }: { message: ChatMessage }) => (
  <div
    className={cn(
      "max-w-[85%] rounded-md px-2 py-1 text-sm whitespace-pre-wrap",
      message.role === "user"
        ? "self-end bg-primary text-primary-foreground"
        : "self-start bg-gray-100"
    )}
  >
    {message.content}
  </div>
);

// Refines the current search in a conversation with the SPOT Chat API. The
// first message comes from the input stepper; every later one edits the
// query, and the map is updated through the stepper's last steps.
const ChatPanel = () => {
  const history = useChatStore((state) => state.history);
  const chatQuery = useChatStore((state) => state.chatQuery);
  const setChat = useChatStore((state) => state.setChat);
  const resetChat = useChatStore((state) => state.reset);
  const setSpotQuery = useSpotQueryStore((state) => state.setSpotQuery);
  const setNaturaLanguageSentence = useSpotQueryStore(
    (state) => state.setNaturaLanguageSentence
  );
  const goToStep = useGlobalStore((state) => state.goToStep);
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);

  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { mutate, isPending, variables } = useMutation({
    mutationFn: fetchChatTurn,
    onSuccess: async (data, sent) => {
      setError(null);
      if (!data.changed || !sent.query) {
        setChat(data.history, data.query);
        return;
      }

      const current = useSpotQueryStore.getState().spotQuery;
      const { spotQuery, areaChanged } = mergeChatTurn({
        current,
        sent: sent.query,
        received: data.query,
        imr: data.imr,
      });
      if (spotQuery.area.type === "bbox" && areaChanged) {
        const { bounds } = useMapStore.getState();
        spotQuery.area = {
          type: "bbox",
          bbox: [bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]],
        };
      }

      try {
        await validateSpotQuery(spotQuery);
      } catch {
        setError("The new query could not be validated. Try rephrasing.");
        return;
      }

      setChat(data.history, data.query);
      setSpotQuery(spotQuery);
      // A new area has to be picked again; otherwise just rerun the query.
      goToStep(
        areaChanged && spotQuery.area.type === "area"
          ? "areaSelector"
          : "mapQuery"
      );
      toggleDialog("inputStepper", true);
    },
    onError: (e) => setError(e.message),
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [history, isPending]);

  const send = () => {
    const message = inputValue.trim();
    if (!message || isPending || !chatQuery) return;
    trackAction("chat", "message", message);
    const { spotQuery } = useSpotQueryStore.getState();
    mutate({ message, query: syncChatQuery(chatQuery, spotQuery), history });
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const startOver = () => {
    resetChat();
    setNaturaLanguageSentence("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your search</h3>
        <Button variant="ghost" size="sm" onClick={startOver}>
          New search
        </Button>
      </div>
      <div
        ref={listRef}
        className="flex flex-col gap-2 overflow-y-auto max-h-64"
      >
        {history.map((message, i) => (
          <Bubble key={i} message={message} />
        ))}
        {isPending && variables && (
          <>
            <Bubble message={{ role: "user", content: variables.message }} />
            <div className="self-start px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-md animate-pulse">
              …
            </div>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form className="flex items-end gap-2">
        <Textarea
          placeholder="Refine your search, e.g. “make it 200 m”"
          onChange={({ target: { value } }) => setInputValue(value)}
          value={inputValue}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <Button
          type="button"
          size="icon"
          onClick={send}
          disabled={isPending || !inputValue.trim()}
          aria-label="Send"
        >
          <SendHorizontalIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
