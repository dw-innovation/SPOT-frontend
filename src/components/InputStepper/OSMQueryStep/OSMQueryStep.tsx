import { useEffect } from "react";

import useQueryOSMData from "@/lib/hooks/useQueryOSMData";
import useGlobalStore from "@/stores/useGlobalStore";

const OSMQueryStep = () => {
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);

  const { queryOSM } = useQueryOSMData({
    onSettled: () => setSearchActive(false),
  });

  useEffect(() => {
    queryOSM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The map refresh is visible on the map itself, and the status bar above the input shows progress.
  return null;
};

export default OSMQueryStep;
