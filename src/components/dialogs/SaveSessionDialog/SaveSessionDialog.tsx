import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import shortUUID from "short-uuid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useStrings from "@/lib/contexts/useStrings";
import { cn, trackAction } from "@/lib/utils";
import useGlobalStore from "@/stores/useGlobalStore";
import useMapStore from "@/stores/useMapStore";
import useSessionsStore from "@/stores/useSessionsStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import useStreetViewStore from "@/stores/useStreetViewStore";

import Dialog from "../Dialog";

const DIALOG_NAME = "saveSession";

const SaveSessionDialog = () => {
  const {
    saveSessionDialogDescription,
    saveSessionDialogErrorNameUsed,
    saveSessionDialogPlaceholderDescription,
    saveSessionDialogPlaceholderName,
    saveSessionDialogSaveButton,
    saveSessionDialogTitle,
  } = useStrings();
  const toggleDialog = useGlobalStore((state) => state.toggleDialog);
  const sessions = useSessionsStore((state) => state.sessions);
  const addSession = useSessionsStore((state) => state.addSession);
  const [error, setError] = useState(false);

  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");

  const handleSaveSession = (
    sessionName: string,
    sessionDescription: string
  ) => {
    if (sessions.find((session) => session.name === sessionName)) return;
    trackAction("session", "save", sessionName);
    try {
      const date = new Date();

      const bounds = useMapStore.getState().bounds;
      const spotQueryState = useSpotQueryStore.getState();
      const spotQueryForSession = {
        ...spotQueryState,
        spotQuery: {
          ...spotQueryState.spotQuery,
          area: {
            type: "bbox" as const,
            bbox: [bounds[0][1], bounds[0][0], bounds[1][1], bounds[1][0]],
          },
        },
      };

      addSession({
        name: sessionName,
        data: {
          useGlobalStore: useGlobalStore.getState(),
          useMapStore: useMapStore.getState(),
          useStreetViewStore: useStreetViewStore.getState(),
          useSpotQueryStore: spotQueryForSession,
        },
        created: date,
        modified: date,
        id: shortUUID.generate(),
        description: sessionDescription,
      });
      setSessionName("");
      setSessionDescription("");
      toggleDialog(DIALOG_NAME);
      toast.success("Session saved");
    } catch (error) {
      console.error(error);
      toast.error("Error saving session");
    }
  };

  useEffect(() => {
    if (
      Array.isArray(sessions) &&
      sessions.find((session) => session.name === sessionName)
    ) {
      setError(true);
    } else {
      setError(false);
    }
  }, [sessionName, sessions]);

  return (
    <Dialog
      dialogName={DIALOG_NAME}
      dialogTitle={saveSessionDialogTitle()}
      dialogDescription={saveSessionDialogDescription()}
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2"
      >
        <Input
          value={sessionName}
          placeholder={saveSessionDialogPlaceholderName()}
          onChange={({ target: { value } }) => setSessionName(value)}
          className={cn({ "border-red-400": error })}
        />
        {error && (
          <span className="text-sm text-red-400">
            {saveSessionDialogErrorNameUsed()}
          </span>
        )}
        <Textarea
          value={sessionDescription}
          onChange={({ target: { value } }) => setSessionDescription(value)}
          placeholder={saveSessionDialogPlaceholderDescription()}
        />
        <Button
          onClick={() => handleSaveSession(sessionName, sessionDescription)}
          disabled={error || sessionName === ""}
          type="submit"
        >
          {saveSessionDialogSaveButton()}
        </Button>
      </form>
    </Dialog>
  );
};

export default SaveSessionDialog;
