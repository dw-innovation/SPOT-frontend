import { useCallback, useEffect, useState } from "react";

import useSessionsStore from "@/stores/useSessionsStore";
import { Session } from "@/types/stores/SessionsStore.interface";

const useLoadSessionState = () => {
  const sessions = useSessionsStore((state) => state.sessions);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  const findSessionById = useCallback(
    (id: string): Session | undefined => sessions.find((s) => s.id === id),
    [sessions]
  );

  useEffect(() => {
    if (!Array.isArray(sessions)) return;
    const availableOptions = sessions.map((session) => ({
      value: session.id,
      label: session.name,
    }));
    setOptions(availableOptions);
  }, [sessions]);

  const selectedSession = sessionId ? findSessionById(sessionId) : undefined;

  return { sessionId, setSessionId, options, selectedSession, findSessionById };
};

export default useLoadSessionState;
