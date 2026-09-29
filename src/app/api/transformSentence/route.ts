import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { anonymizeUser } from "@/lib/anonymizeUser";
import { authOptions } from "@/lib/auth";
import {
  ChatQuery,
  ChatQueryConversionError,
  chatQueryToSpotQuery,
} from "@/lib/chatQuery.server";
import { createUpstreamRoute } from "@/lib/createUpstreamRoute";
import { persistErrorReport } from "@/lib/errorReporting.server";

export const maxDuration = 60;

const ROUTE = "/api/transformSentence";

const transformWithNlpApi = createUpstreamRoute({
  route: ROUTE,
  url: () => `${process.env.NLP_API}/transform-sentence-to-imr`,
  requireUsername: true,
  buildBody: (data, session) => ({
    ...data,
    environment: process.env.ENVIRONMENT || "production",
    username: anonymizeUser(session),
    model: process.env.NLP_MODEL || "t5",
  }),
  errorContext: (data) => ({
    prompt: typeof data.sentence === "string" ? data.sentence : undefined,
  }),
  logRequestBody: true,
});

const errorResponse = (message: string, status: number) =>
  NextResponse.json({ status: "error", message }, { status });

// Sends the sentence to the SPOT Chat API and converts its query into a
// SpotQuery, returned as `imr` like the NLP API does.
const transformWithChatApi = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) return errorResponse("unauthenticated", 401);

  const { sentence } = await req.json();
  if (typeof sentence !== "string" || !sentence.trim()) {
    return errorResponse("emptySentence", 400);
  }
  console.log({ sentence, username: anonymizeUser(session) });

  const report = (errorType: string, message: string, status: number) =>
    persistErrorReport({
      errorType,
      severity: "error",
      source: "server",
      route: ROUTE,
      message,
      status,
      prompt: sentence,
      userId: anonymizeUser(session),
    });

  try {
    const response = await fetch(`${process.env.SPOT_CHAT_API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SPOT_CHAT_API_KEY || "",
      },
      body: JSON.stringify({ message: sentence }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        typeof errorData.detail === "string"
          ? errorData.detail
          : "Unknown error occurred";
      // 401 means our key is wrong, not the user's input.
      if (response.status >= 500 || response.status === 401) {
        await report("upstreamError", message, response.status);
      }
      return errorResponse(message, response.status === 401 ? 500 : response.status);
    }

    const data: { reply: string; query: ChatQuery } = await response.json();
    const imr = await chatQueryToSpotQuery(data.query);

    return NextResponse.json({ ...data, imr, inputSentence: sentence });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    if (error instanceof ChatQueryConversionError) {
      return errorResponse(message, 400);
    }
    await report("upstreamUnreachable", message, 500);
    return errorResponse(message, 500);
  }
};

export const POST = (req: NextRequest) =>
  process.env.SPOT_CHAT_API
    ? transformWithChatApi(req)
    : transformWithNlpApi(req);
