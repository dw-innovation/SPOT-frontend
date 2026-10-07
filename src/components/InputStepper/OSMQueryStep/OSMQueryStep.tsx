import React, { useEffect } from "react";

import useQueryOSMData from "@/lib/hooks/useQueryOSMData";
import useGlobalStore from "@/stores/useGlobalStore";

import StepStatus from "../StepStatus";

const OSMQueryStep = () => {
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);

  const { isFetching, queryOSM } = useQueryOSMData({
    onSettled: () => setSearchActive(false),
  });

  useEffect(() => {
    queryOSM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFetching) return null;

  return <StepStatus label="Querying OpenStreetMap…" />;
};

export default OSMQueryStep;
