import { SearchIcon } from "lucide-react";
import React, { KeyboardEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, trackAction } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

// Short enough to read at a glance, and each one shows a different thing the
// search can do: a chain of relations, a named place, a simple pair.
const EXAMPLES = [
  "a tram stop next to a park within 150 m of a traffic light in Prague",
  "a café called “club” within 150 m of a marina in The Hague",
  "a bus station in front of a shopping mall in Yangon",
];

const PromptInput = () => {
  const naturalLanguageSentence = useSpotQueryStore(
    (state) => state.naturalLanguageSentence
  );
  const setNaturaLanguageSentence = useSpotQueryStore(
    (state) => state.setNaturaLanguageSentence
  );
  const resetSteps = useGlobalStore((state) => state.resetSteps);
  const nextStep = useGlobalStore((state) => state.nextStep);
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);

  const [inputValue, setInputValue] = useState(naturalLanguageSentence);

  useEffect(() => {
    setInputValue(naturalLanguageSentence);
  }, [naturalLanguageSentence]);

  const search = (sentence: string) => {
    if (!sentence.trim()) return;
    resetSteps();
    nextStep();
    setSearchActive(true);
    trackAction("promptInput", "search", sentence);
    setNaturaLanguageSentence(sentence);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      search(inputValue);
    }
  };

  const isDisabled =
    inputValue === naturalLanguageSentence || inputValue.trim() === "";

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <h3 className="text-lg font-semibold shrink-0">Your search</h3>

      {/* Fills the column with something useful rather than white space, and
          doubles as an explanation of what the search understands. */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        <p className="text-sm text-gray-500">
          Describe what you are looking for and how the places relate to each
          other. For example:
        </p>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => search(example)}
            className="px-3 py-2 text-sm text-left text-gray-700 transition-colors border border-gray-200 rounded-md hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {example}
          </button>
        ))}
      </div>

      <form className="flex flex-col gap-2 pt-3 mt-auto border-t shrink-0">
        <Textarea
          placeholder="Describe your search…"
          onChange={({ target: { value } }) => setInputValue(value)}
          value={inputValue}
          onKeyDown={handleKeyPress}
          rows={3}
        />
        <Button
          onClick={() => search(inputValue)}
          type="button"
          disabled={isDisabled}
          className={cn(isDisabled ? "cursor-not-allowed" : "cursor-pointer")}
        >
          <SearchIcon className="w-4 h-4" />
          Search
        </Button>
      </form>
    </div>
  );
};

export default PromptInput;
