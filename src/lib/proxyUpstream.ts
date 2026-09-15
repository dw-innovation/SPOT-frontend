import { NextResponse } from "next/server";
import { Session } from "next-auth";

import { anonymizeUser } from "@/lib/anonymizeUser";
import { persistErrorReport } from "@/lib/errorReporting.server";

type ProxyArgs = {
  route: string;
  url: string;
  token: string | null;
  body: unknown;
  session: Session | null;
  // Surfaced in the error document to make failures reproducible.
  prompt?: string;
  spotQuery?: unknown;
};

// Forward a JSON POST to a backend service and normalise its errors.
// Upstream 5xx and network failures are persisted server-side; 4xx are
// user-facing and already reported by the client via setError().
export const proxyUpstream = async ({
  route,
  url,
  token,
  body,
  session,
  prompt,
  spotQuery,
}: ProxyArgs): Promise<NextResponse> => {
  const report = (
    errorType: string,
    message: string,
    status: number,
    stack?: string
  ) =>
    persistErrorReport({
      errorType,
      severity: "error",
      source: "server",
      route,
      message,
      status,
      stack,
      prompt,
      spotQuery,
      userId: anonymizeUser(session),
    });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || "Unknown error occurred";

      if (response.status >= 500) {
        await report("upstreamError", message, response.status);
      }

      return NextResponse.json(
        { status: "error", message },
        { status: response.status }
      );
    }

    const results = await response.json();
    return NextResponse.json(results, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    await report(
      "upstreamUnreachable",
      message,
      500,
      error instanceof Error ? error.stack : undefined
    );

    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
};
