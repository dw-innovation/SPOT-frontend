"use client";

import { useEffect } from "react";

import { trackError } from "@/lib/apiServices";

// Last-resort boundary: catches errors thrown by the root layout itself.
// Must render its own <html>/<body> since the layout is gone.
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    trackError({
      errorType: "uncaughtGlobalError",
      severity: "error",
      message: error.message,
      stack: error.stack ?? error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "1rem",
          fontFamily: "sans-serif",
        }}
      >
        <h1>Something went wrong</h1>
        <p>The error has been reported.</p>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
};

export default GlobalError;
