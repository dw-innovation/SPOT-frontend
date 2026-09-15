export type ErrorSeverity = "info" | "error";
export type ErrorSource = "client" | "server";

// Shape of a document in the `errors` collection.
export type ErrorReport = {
  id: string;
  date: Date;
  // Short, groupable identifier (translation key, upstream error code, …).
  errorType: string;
  // "info" = expected product outcome (e.g. noResults); "error" = something broke.
  severity: ErrorSeverity;
  source: ErrorSource;
  // Client pathname or API route that produced the error.
  route?: string;
  message?: string;
  stack?: string;
  status?: number;
  sessionLink?: string;
  userId?: string;
  prompt?: string;
  spotQuery?: unknown;
  userAgent?: string;
  commit?: string;
};

// What the client sends to /api/trackError.
export type ClientErrorPayload = Pick<
  ErrorReport,
  "errorType" | "severity" | "route" | "message" | "stack" | "sessionLink" | "prompt" | "spotQuery"
>;
