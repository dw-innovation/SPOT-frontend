"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { trackError } from "@/lib/apiServices";

// Catches uncaught render/runtime errors below the root layout.
const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    trackError({
      errorType: "uncaughtClientError",
      severity: "error",
      message: error.message,
      stack: error.stack ?? error.digest,
    });
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 font-noto">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-sm text-gray-600">
        The error has been reported. You can try again or reload the page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
};

export default ErrorPage;
