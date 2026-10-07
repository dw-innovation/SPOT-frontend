import React from "react";

import AreaSelector from "@/components/AreaSelector";
import { Button } from "@/components/ui/button";
import useGlobalStore from "@/stores/useGlobalStore";

// Rendered inline in the query panel: picking an area while a dialog covers
// the map was the wrong way round.
const AreaSelectorStep = () => {
  const nextStep = useGlobalStore((state) => state.nextStep);

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-md bg-gray-50">
      <h4 className="text-sm font-semibold">Select the search area</h4>
      <AreaSelector />
      <Button size="sm" onClick={() => nextStep()}>
        Continue
      </Button>
    </div>
  );
};

export default AreaSelectorStep;
