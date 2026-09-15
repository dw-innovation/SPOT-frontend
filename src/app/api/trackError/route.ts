export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { anonymizeUser } from "@/lib/anonymizeUser";
import { authOptions } from "@/lib/auth";
import { persistErrorReport } from "@/lib/errorReporting.server";
import { ClientErrorPayload } from "@/types/errorReport";

const MAX_BODY_BYTES = 64 * 1024;
const RATE_LIMIT = { windowMs: 60_000, max: 30 };

// Best-effort per-instance rate limit; good enough to stop a runaway client loop.
const hits = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
};

export async function POST(req: NextRequest) {
  // Auth is deliberately soft here: errors caused by a broken login must still be reportable.
  const session = await getServerSession(authOptions);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(session?.user?.name || ip)) {
    return NextResponse.json({ status: "error", message: "rateLimited" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ status: "error", message: "payloadTooLarge" }, { status: 413 });
  }

  let payload: Partial<ClientErrorPayload> & { params?: { errorType?: string; sessionLink?: string } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ status: "error", message: "invalidJson" }, { status: 400 });
  }

  // Accept the legacy `{ params: { errorType, sessionLink } }` shape from older clients.
  const legacy = payload.params ?? {};

  const id = await persistErrorReport({
    errorType: payload.errorType ?? legacy.errorType ?? "Unknown error occurred",
    severity: payload.severity === "info" ? "info" : "error",
    source: "client",
    route: payload.route,
    message: payload.message,
    stack: payload.stack,
    sessionLink: payload.sessionLink ?? legacy.sessionLink,
    prompt: payload.prompt,
    spotQuery: payload.spotQuery,
    userId: anonymizeUser(session),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  if (!id) {
    return NextResponse.json({ status: "error", message: "errorAddingData" }, { status: 500 });
  }

  return NextResponse.json({ status: "success", message: "errorLogged", id });
}
