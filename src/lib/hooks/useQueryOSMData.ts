import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import useGlobalStore from "@/stores/useGlobalStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

import { fetchOSMData } from "../apiServices";
import { setResults } from "../utils";

type Props = {
  onSuccessCallbacks?: ((data: OSMData) => void)[];
  onErrorCallbacks?: ((error: Error) => void)[];
  onSettled?: () => void;
};

type OSMData = {
  results: {
    features: Array<any>;
  };
};

const useQueryOSMData = ({
  onSuccessCallbacks,
  onErrorCallbacks,
  onSettled,
}: Props) => {
  const queryClient = useQueryClient();
  const spotQuery = useSpotQueryStore((state) => state.spotQuery);
  const setError = useGlobalStore((state) => state.setError);
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);

  const queryKey: QueryKey = ["osmData", JSON.stringify(spotQuery)];

  const queryResult = useQuery<OSMData, Error>({
    queryKey,
    queryFn: () => fetchOSMData({ spotQuery }),
    enabled: false,
    retry: false,
  });

  const { data, error, isSuccess, isError } = queryResult;

  const previousSpotQuery = useRef(spotQuery);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (
      JSON.stringify(previousSpotQuery.current) !== JSON.stringify(spotQuery)
    ) {
      previousSpotQuery.current = spotQuery;
    }
  }, [JSON.stringify(spotQuery)]);

  useEffect(() => {
    if (!hasMounted.current) return;
    if (isSuccess && data) {
      if (data.results.features.length === 0) {
        setResults(data);
        toggleDialog("error", true);
        setError("noResults");
      } else {
        setResults(data);
      }

      if (onSuccessCallbacks) {
        onSuccessCallbacks.forEach((callback) => {
          if (typeof callback === "function") {
            callback(data);
          }
        });
      }
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (!hasMounted.current) return;
    if (isError && error) {
      setError(error.message || "", { stack: error.stack });
      toggleDialog("stepperError", true);

      if (onErrorCallbacks) {
        onErrorCallbacks.forEach((callback) => {
          if (typeof callback === "function") {
            callback(error);
          }
        });
      }
      toggleDialog("inputStepper", false);
    }
  }, [isError, error]);

  useEffect(() => {
    if (!hasMounted.current) return;
    if ((isSuccess || isError) && onSettled) {
      onSettled();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const queryOSM = async () => {
    await queryClient.cancelQueries();
    queryResult.refetch();
  };

  return { ...queryResult, queryOSM };
};

export default useQueryOSMData;
