import useGlobalStore from "@/stores/useGlobalStore";
import useMapStore from "@/stores/useMapStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import useStreetViewStore from "@/stores/useStreetViewStore";

import { fetchOSMData } from "./apiServices";
import { setResults } from "./utils";

const convertAreaToBbox = (bounds: [number, number][]): { type: "bbox"; bbox: number[] } => ({
  type: "bbox",
  bbox: [bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]],
});

export const saveSession = async (
  stores: { name: string; getState: () => Record<string, any> }[]
): Promise<string> => {
  const combinedStoreData: Record<string, any> = {};

  for (const store of stores) {
    const state = store.getState();
    const storeData: Record<string, any> = {};

    for (const key in state) {
      if (
        Object.hasOwnProperty.call(state, key) &&
        typeof state[key] !== "function"
      ) {
        storeData[key] = state[key];
      }
    }

    combinedStoreData[store.name] = storeData;
  }

  // Replace area with current bbox and strip geometry polygon
  if (combinedStoreData.useSpotQueryStore?.spotQuery?.area && combinedStoreData.useMapStore?.bounds) {
    combinedStoreData.useSpotQueryStore = {
      ...combinedStoreData.useSpotQueryStore,
      spotQuery: {
        ...combinedStoreData.useSpotQueryStore.spotQuery,
        area: convertAreaToBbox(combinedStoreData.useMapStore.bounds),
      },
    };
  }

  const response = await fetch("/api/saveSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: combinedStoreData }),
  });

  const result = await response.json();
  return `${window.location.origin}/${result.id}`;
};

export const loadSession = async (sessionData: Record<string, any>) => {
  const toggleDialog = useGlobalStore.getState().toggleDialog;

  const stores = {
    useMapStore: useMapStore.getState().initialize,
    useStreetViewStore: useStreetViewStore.getState().initialize,
    useSpotQueryStore: useSpotQueryStore.getState().initialize,
  };

  Object.entries(stores).forEach(([key, initFn]) => {
    sessionData[key] && initFn(sessionData[key]);
  });

  toggleDialog("inputStepper", false);
  toggleDialog("queryOSM");
  toggleDialog("loadSession", false);

  const spotQuery = useSpotQueryStore.getState().spotQuery;

  await fetchOSMData({ spotQuery }).then((data) => {
    if (data) {
      setResults(data);
      toggleDialog("queryOSM", false);
    }
  });
};
