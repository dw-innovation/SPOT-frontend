export const DIALOG_NAMES = [
  "downloadResults",
  "saveSession",
  "loadSession",
  "spotQuery",
  "error",
  "stepperError",
  // Opened while a loaded session fetches its results. Nothing renders it
  // since the loading dialog was removed; the toggles in lib/sessions.ts are
  // currently no-ops.
  "queryOSM",
  "inputStepper",
  "info",
  "entityEditor",
  "signIn",
  "maintenance",
] as const;

export type DialogName = (typeof DIALOG_NAMES)[number];

/** Payload a dialog carries while open. Dialogs not listed take no data. */
type DialogDataMap = {
  entityEditor: { id: number };
  info: string;
};

export type DialogWithData = keyof DialogDataMap;

export type Dialogs = {
  [N in DialogName]: {
    isOpen: boolean;
    data?: N extends DialogWithData ? DialogDataMap[N] : never;
  };
};

export default interface GlobalStoreInterface {
  currentStep: number;
  nextStep: () => void;
  /** Returns the stepper to its first step. */
  resetSteps: () => void;
  view: "map" | "data";
  setView: (view: "map" | "data") => void;
  showSuggestions: boolean;
  initialize: (initialData: {
    showSuggestions: boolean;
    view: "map" | "data";
  }) => void;
  isStreetViewFullscreen: boolean;
  toggleStreetViewFullscreen: (state?: boolean) => void;
  dialogs: Dialogs;
  toggleDialog: (name: DialogName, state?: boolean | undefined) => void;
  setDialogData: <N extends DialogWithData>(
    name: N,
    data: DialogDataMap[N]
  ) => void;
  isError: boolean;
  errorType: string;
  setError: (
    type: string,
    details?: { message?: string; stack?: string }
  ) => Promise<void>;
  clearError: () => void;
  youTubeConsent: boolean;
  toggleYouTubeConsent: () => void;
}
