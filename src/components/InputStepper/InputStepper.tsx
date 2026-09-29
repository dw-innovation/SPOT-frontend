"use client";

import React from "react";

import useGlobalStore from "@/stores/useGlobalStore";

import AreaSelectorStep from "./AreaSelectorStep";
import NaturalLanguageInputStep from "./NaturalLanguageInputStep";
import NaturalLanguageTransformationStep from "./NaturalLanguageTransformationStep";
import OSMQueryScreen from "./OSMQueryStep";

// Order must match STEP_NAMES in useGlobalStore.
const STEPS = [
  NaturalLanguageInputStep,
  NaturalLanguageTransformationStep,
  AreaSelectorStep,
  OSMQueryScreen,
];

const InputStepper = () => {
  const currentStep = useGlobalStore((state) => state.currentStep);
  const CurrentStep = STEPS[currentStep];

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative z-50 flex flex-col gap-2 m-2">
        <div className="w-full max-w-[32rem]">
          <CurrentStep />
        </div>
      </div>
    </div>
  );
};

export default InputStepper;
