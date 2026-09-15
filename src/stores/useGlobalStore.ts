import { create } from "zustand";

import { trackError } from "@/lib/apiServices";
import { saveSessionStores } from "@/lib/hooks/useSaveSession";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import GlobalStoreInterface, {
  Dialog,
  Step,
} from "@/types/stores/GlobalStore.interface";

const resetSteps = (steps: Step[]): Step[] =>
  steps.map((step) => ({
    ...step,
    status: "open",
    error: { isError: false, message: "" },
  }));

const prevStep = (currentStep: number): number =>
  currentStep - 1 > 0 ? currentStep - 1 : currentStep;

const nextStep = (
  currentStep: number,
  steps: Step[]
): Partial<GlobalStoreInterface> => ({
  currentStep: currentStep + 1 < steps.length ? currentStep + 1 : currentStep,
  steps: steps.map((step, i) => {
    if (i === currentStep) {
      return { ...step, status: "completed" };
    }
    return step;
  }),
});

const toggleDialog = (
  dialogs: Dialog[],
  name: string,
  isOpen: boolean | undefined = undefined
): Dialog[] =>
  dialogs.map((dialog) => {
    if (dialog.name === name) {
      return {
        ...dialog,
        isOpen: isOpen !== undefined ? isOpen : !dialog.isOpen,
      };
    }
    return dialog;
  });

const setDialogData = (dialogs: Dialog[], name: string, data: any): Dialog[] =>
  dialogs.map((dialog) =>
    dialog.name === name ? { ...dialog, data } : dialog
  );

// Expected product outcomes, not failures — kept apart from real errors in analytics.
const INFO_ERROR_TYPES = ["noResults"];

const STEPS = [
  "naturalLanguageInput",
  "naturalLanguageTransformation",
  "areaSelector",
  "mapQuery",
];

const DIALOGS = [
  "downloadResults",
  "saveSession",
  "loadSession",
  "spotQuery",
  "error",
  "stepperError",
  "queryOSM",
  "inputStepper",
  "info",
  "entityEditor",
  "signIn",
  "maintenance",
];

const useGlobalStore = create<GlobalStoreInterface>((set) => ({
  currentStep: 0,
  showSuggestions: false,
  steps: STEPS.map((step) => ({
    name: step,
    status: "open",
    error: { isError: false },
  })),
  nextStep: () => set((state) => nextStep(state.currentStep, state.steps)),
  prevStep: () =>
    set((state) => ({
      currentStep: prevStep(state.currentStep),
    })),
  resetSteps: () =>
    set((state) => ({
      currentStep: 0,
      steps: resetSteps(state.steps),
    })),
  view: "map",
  setView: (view: "map" | "data") => set({ view }),
  initialize: (initialData) =>
    set({
      showSuggestions: initialData.showSuggestions,
      view: initialData.view,
    }),
  isStreetViewFullscreen: false,
  toggleStreetViewFullscreen: (isFullScreen) =>
    set((state) => ({
      isStreetViewFullscreen: isFullScreen ?? !state.isStreetViewFullscreen,
    })),
  dialogs: DIALOGS.map((dialog) => {
    const maintenance = process.env.NEXT_PUBLIC_MAINTENANCE;

    const isOpen =
      (maintenance === "on" && dialog === "maintenance") ||
      (maintenance === "off" && dialog === "inputStepper");

    return { name: dialog, isOpen };
  }),
  toggleDialog: (name, isOpen) =>
    set((state) => ({ dialogs: toggleDialog(state.dialogs, name, isOpen) })),
  setDialogData: (name, data) =>
    set((state) => ({ dialogs: setDialogData(state.dialogs, name, data) })),
  isError: false,
  errorType: "",
  setError: async (type, details) => {
    set({ isError: true, errorType: type });
    const { naturalLanguageSentence, spotQuery } = useSpotQueryStore.getState();
    const sessionLink = await saveSessionStores().catch(() => undefined);
    await trackError({
      errorType: type,
      severity: INFO_ERROR_TYPES.includes(type) ? "info" : "error",
      message: details?.message,
      stack: details?.stack,
      sessionLink,
      prompt: naturalLanguageSentence,
      spotQuery,
    });
  },
  clearError: () => set({ isError: false, errorType: "" }),
  youTubeConsent: false,
  toggleYouTubeConsent: () =>
    set((state) => ({ youTubeConsent: !state.youTubeConsent })),
}));

export default useGlobalStore;
