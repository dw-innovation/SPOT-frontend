import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import React from "react";

import useGlobalStore from "@/stores/useGlobalStore";

import StepStatus from "../InputStepper/StepStatus";

// One status line that sits on top of the input, so progress is always in the
// same place whichever step of the search is running.
const SearchStatusBar = () => {
  const fetching = useIsFetching({ queryKey: ["transformNLToSpotQuery"] });
  const mutating = useIsMutating();
  const analyzing = fetching > 0 || mutating > 0;
  const queryingMap = useGlobalStore(
    (state) => state.searchActive && state.currentStep === 3
  );

  if (analyzing) return <StepStatus label="Analyzing your search…" />;
  if (queryingMap) return <StepStatus label="Querying OpenStreetMap…" />;
  return null;
};

export default SearchStatusBar;
