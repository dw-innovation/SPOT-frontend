import { NextRequest, NextResponse } from "next/server";

import { runHealthChecks } from "@/lib/health";

// A cached health check is worse than none.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/health          shallow: is this app up and is Mongo reachable
 * GET /api/health?deep=1   also checks the NLP and OSM APIs, reporting each
 *                          dependency separately so an alert can name what broke
 *
 * Returns 200 while everything is ok and 503 otherwise, so an uptime checker
 * needs no body parsing. Set HEALTH_TOKEN to require ?token= for deep checks.
 */
export async function GET(req: NextRequest) {
  const deep = req.nextUrl.searchParams.get("deep") === "1";

  const requiredToken = process.env.HEALTH_TOKEN;
  if (deep && requiredToken) {
    const provided =
      req.nextUrl.searchParams.get("token") ??
      req.headers.get("x-health-token") ??
      "";
    if (provided !== requiredToken) {
      return NextResponse.json(
        { status: "error", message: "invalid or missing health token" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  const report = await runHealthChecks(deep);

  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
