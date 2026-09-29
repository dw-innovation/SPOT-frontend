import { create } from "zustand";

import { trackError } from "@/lib/apiServices";
import { saveSessionStores } from "@/lib/hooks/useSaveSession";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import GlobalStoreInterface, {
  DIALOG_NAMES,
  DialogName,
  Dialogs,
} from "@/types/stores/GlobalStore.interface";

// Only the named entry gets a new identity, so a component selecting
// dialogs[name].isOpen re-renders only when that dialog changes.
const patchDialog = (
  dialogs: Dialogs,
  name: DialogName,
  patch: Partial<Dialogs[DialogName]>
): Dialogs => ({ ...dialogs, [name]: { ...dialogs[name], ...patch } });

// Expected product outcomes, not failures — kept apart from real errors in analytics.
const INFO_ERROR_TYPES = ["noResults"];

// The flow rendered by components/InputStepper; only the count and order
// matter here, the components themselves live there.
const STEP_NAMES = [
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
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, STEP_NAMES.length - 1),
    })),
  resetSteps: () => set({ currentStep: 0 }),
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
