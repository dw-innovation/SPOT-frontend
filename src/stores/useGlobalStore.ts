import { create } from "zustand";

import { trackError } from "@/lib/apiServices";
import { saveSessionStores } from "@/lib/hooks/useSaveSession";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import GlobalStoreInterface, {
  DIALOG_NAMES,
  DialogName,
  Dialogs,
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

// Only the named entry gets a new identity, so a component selecting
// dialogs[name].isOpen re-renders only when that dialog changes.
const patchDialog = (
  dialogs: Dialogs,
  name: DialogName,
  patch: Partial<Dialogs[DialogName]>
): Dialogs => ({ ...dialogs, [name]: { ...dialogs[name], ...patch } });

// Expected product outcomes, not failures — kept apart from real errors in analytics.
const INFO_ERROR_TYPES = ["noResults"];

const STEPS = [
  "naturalLanguageInput",
  "naturalLanguageTransformation",
  "areaSelector",
  "mapQuery",
];

const initialDialogs = (): Dialogs => {
  const maintenance = process.env.NEXT_PUBLIC_MAINTENANCE;

  return Object.fromEntries(
    DIALOG_NAMES.map((name) => [
      name,
      {
        isOpen:
          (maintenance === "on" && name === "maintenance") ||
          (maintenance === "off" && name === "inputStepper"),
      },
    ])
  ) as Dialogs;
};

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
  dialogs: initialDialogs(),
  toggleDialog: (name, isOpen) =>
    set((state) => ({
      dialogs: patchDialog(state.dialogs, name, {
        isOpen: isOpen ?? !state.dialogs[name].isOpen,
      }),
    })),
  setDialogData: (name, data) =>
    set((state) => ({ dialogs: patchDialog(state.dialogs, name, { data }) })),
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
