import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  fetchNLToSpotQueryTransformation,
  validateSpotQuery,
} from "@/lib/apiServices";
import useChatStore from "@/stores/useChatStore";
import useGlobalStore from "@/stores/useGlobalStore";
import useMapStore from "@/stores/useMapStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

const NaturalLanguageTransformationStep = () => {
  const nextStep = useGlobalStore((state) => state.nextStep);
  const naturalLanguageSentence = useSpotQueryStore(
    (state) => state.naturalLanguageSentence
  );
  const setSpotQuery = useSpotQueryStore((state) => state.setSpotQuery);
  const setSearchAreaBBox = useSpotQueryStore(
    (state) => state.setSearchAreaBBox
  );
  const setErrorType = useGlobalStore((state) => state.setError);
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const setSearchActive = useGlobalStore((state) => state.setSearchActive);
  const bounds = useMapStore((state) => state.bounds);
  const setChat = useChatStore((state) => state.setChat);
  const resetChat = useChatStore((state) => state.reset);

  const { data, error, isSuccess, isError } = useQuery({
    queryKey: ["transformNLToSpotQuery", naturalLanguageSentence],
    queryFn: () => fetchNLToSpotQueryTransformation(naturalLanguageSentence),
    enabled: !!naturalLanguageSentence,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      // if transformation was successful and returned data
      const spotQuery = data.imr;

      // validate SpotQuery
      validateSpotQuery(spotQuery)
        .then(() => {
          setSpotQuery(spotQuery);
          // Only the chat API returns a history; it starts a new chat.
          if (data.history) {
            setChat(data.history, data.query);
          } else {
            resetChat();
          }
          if (spotQuery.area.type === "bbox") {
            setSearchAreaBBox([
              bounds[0][1],
              bounds[0][0],
              bounds[1][1],
              bounds[1][0],
            ]);
          }
          nextStep();
        })
        .catch((validationError) => {
          setErrorType(validationError.message, {
            stack: validationError.stack,
          });
          setSearchActive(false);
          toggleDialog("error");
        });
    }
  }, [
    isSuccess,
    data,
    setSpotQuery,
    setChat,
    resetChat,
    bounds,
    nextStep,
    setErrorType,
    toggleDialog,
    setSearchActive,
  ]);

  useEffect(() => {
    if (isError && error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        const err = error as { message: string; stack?: string };
        setErrorType(err.message, { stack: err.stack });
      } else {
        setErrorType("An unexpected error occurred");
      }

      setSearchActive(false);
      toggleDialog("error");
    }
  }, [isError, error, setErrorType, toggleDialog, setSearchActive]);

  // Progress is shown by the status bar above the input.
  return null;
};

export default NaturalLanguageTransformationStep;
