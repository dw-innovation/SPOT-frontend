export type Step = {
  name: string;
  status: "open" | "loading" | "completed" | "error";
  error: { isError: boolean; message?: string };
};

export type Dialog = {
  name: string;
  isOpen: boolean;
  data?: any;
};
export default interface GlobalStoreInterface {
  currentStep: number;
  prevStep: () => void;
  nextStep: () => void;
  steps: Step[];
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
  dialogs: Dialog[];
  toggleDialog: (name: string, state?: boolean | undefined) => void;
  isError: boolean;
  errorType: string;
  setError: (
    type: string,
    details?: { message?: string; stack?: string }
  ) => Promise<void>;
  clearError: () => void;
  setDialogData: (name: string, data: any) => void;
  youTubeConsent: boolean;
  toggleYouTubeConsent: () => void;
}
