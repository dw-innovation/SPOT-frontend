import React from "react";

import AreaSelectorStep from "@/components/InputStepper/AreaSelectorStep";
import NaturalLanguageTransformationStep from "@/components/InputStepper/NaturalLanguageTransformationStep";
import OSMQueryStep from "@/components/InputStepper/OSMQueryStep";
import useChatStore from "@/stores/useChatStore";
import useGlobalStore from "@/stores/useGlobalStore";

/**
 * The steps of a running search, rendered inline in the query panel.
 *
 * These used to run inside the inputStepper dialog, which covered the map
 * while the search was being built — including the area selector, where
 * seeing the map is the whole point. Only the first step (the welcome screen)
 * is still a dialog.
 */
const SearchFlow = () => {
  const currentStep = useGlobalStore((state) => state.currentStep);
  const searchActive = useGlobalStore((state) => state.searchActive);
  const notice = useChatStore((state) => state.notice);

  if (!searchActive) {
    // An empty result set is reported here rather than in a dialog: it is an
    // ordinary answer to a search, not a failure worth interrupting for.
    return notice ? (
      <p className="px-2 py-1.5 text-sm text-red-700 border border-red-200 rounded-md bg-red-50">
        {notice}
      </p>
    ) : null;
  }

  switch (currentStep) {
    case 1:
      return <NaturalLanguageTransformationStep />;
    case 2:
      return <AreaSelectorStep />;
    case 3:
      return <OSMQueryStep />;
    default:
      return null;
  }
};

export default SearchFlow;
