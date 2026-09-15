import shortUUID from "short-uuid";

import { connectToDatabase, ensureIndexes } from "@/lib/db";
import { ErrorReport } from "@/types/errorReport";

const MAX_STRING = 8_000;

const clip = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const str = typeof value === "string" ? value : String(value);
  return str.length > MAX_STRING ? `${str.slice(0, MAX_STRING)}…` : str;
};

// Persist one error document into the `errors` collection.
// Never throws — error reporting must not break the request that triggered it.
export const persistErrorReport = async (
  report: Omit<ErrorReport, "id" | "date" | "commit">
): Promise<string | undefined> => {
  const id = shortUUID.generate();
  const errorType = report.errorType || "Unknown error occurred";

  const doc: ErrorReport & { error: { params: { errorType: string; sessionLink?: string } } } = {
    id,
    date: new Date(),
    errorType,
    severity: report.severity ?? "error",
    source: report.source,
    route: report.route,
    message: clip(report.message),
    stack: clip(report.stack),
    status: report.status,
    sessionLink: report.sessionLink,
    userId: report.userId,
    prompt: clip(report.prompt),
    spotQuery: report.spotQuery,
    userAgent: clip(report.userAgent),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    // Legacy shape, still read by the analytics dashboard's errorsOverTime action.
    error: { params: { errorType, sessionLink: report.sessionLink } },
  };

  try {
    const db = await connectToDatabase();
    await ensureIndexes(db);
    await db.collection("errors").insertOne(doc);
    return id;
  } catch (e) {
    console.error("persistErrorReport failed:", e, doc);
    return undefined;
  }
};
