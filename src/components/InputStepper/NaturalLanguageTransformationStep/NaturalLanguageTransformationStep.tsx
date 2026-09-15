import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import {
  fetchNLToSpotQueryTransformation,
  validateSpotQuery,
} from "@/lib/apiServices";
import useGlobalStore from "@/stores/useGlobalStore";
import useMapStore from "@/stores/useMapStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

import AnalyzeAnimation from "../Animation";
import InputContainer from "../InputContainer";

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
  const bounds = useMapStore((state) => state.bounds);

  const { data, error, isSuccess, isError, isFetching } = useQuery({
    queryKey: ["transformNLToSpotQuery", naturalLanguageSentence],
    queryFn: () => fetchNLToSpotQueryTransformation(naturalLanguageSentence),
    enabled: !!naturalLanguageSentence,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      // if transformation was successful and returned data
      let spotQuery = data.imr;

      // validate SpotQuery
      validateSpotQuery(spotQuery)
        .then(() => {
          setSpotQuery(spotQuery);
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
          toggleDialog("inputStepper", false);
          toggleDialog("error");
        });
    }
  }, [
    isSuccess,
    data,
    setSpotQuery,
    bounds,
    nextStep,
    setErrorType,
    toggleDialog,
  ]);

  useEffect(() => {
    if (isError && error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        const err = error as { message: string; stack?: string };
        setErrorType(err.message, { stack: err.stack });
      } else {
        setErrorType("An unexpected error occurred");
      }

      toggleDialog("inputStepper", false);
      toggleDialog("error");
    }
  }, [isError, error, setErrorType, toggleDialog]);

  return (
    <InputContainer shouldUnmount={isSuccess} title="Analyzing your input">
      <AnalyzeAnimation
        sentences={[
          "Identifying the area in your query",
          "Determining all objects in your prompt",
          "Analyzing the connections between the objects",
          "Hang on, we're almost there!",
        ]}
        duration={2500}
      />
      {isFetching && <LoadingSpinner size="2.5rem" />}
    </InputContainer>
  );
};

export default NaturalLanguageTransformationStep;
