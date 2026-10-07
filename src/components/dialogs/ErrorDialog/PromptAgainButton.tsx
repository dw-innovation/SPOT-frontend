import { SearchIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trackAction } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

const PromptAgainButton = () => {
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const clearError = useGlobalStore((state) => state.clearError);
  const resetSteps = useGlobalStore((state) => state.resetSteps);
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);
  const nextStep = useGlobalStore((state) => state.nextStep);
  const naturalLanguageSentence = useSpotQueryStore(
    (state) => state.naturalLanguageSentence
  );
  const setNaturaLanguageSentence = useSpotQueryStore(
    (state) => state.setNaturaLanguageSentence
  );

  const handleSearch = () => {
    if (naturalLanguageSentence === "") return;
    trackAction("inputStepper", "nlTransformation", naturalLanguageSentence);
    toggleDialog("error", false);
    setTimeout(() => {
      clearError();
      resetSteps();
      nextStep();
      setSearchActive(true);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        className="w-full text-sm"
        rows={2}
        placeholder="Rephrase your search..."
        value={naturalLanguageSentence}
        onChange={(e) => setNaturaLanguageSentence(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="w-fit"
        onClick={handleSearch}
        disabled={naturalLanguageSentence === ""}
      >
        <SearchIcon />
        Search
      </Button>
    </div>
  );
};

export default PromptAgainButton;
