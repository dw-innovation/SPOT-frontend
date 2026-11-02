import { connectToDatabase } from "@/lib/db";

export type CheckResult = {
  ok: boolean;
  latencyMs: number;
  /** Why it failed, or a short note on what was verified. */
  detail?: string;
};

export type HealthReport = {
  status: "ok" | "degraded";
  /** "shallow" only proves this app and its database are alive. */
  mode: "shallow" | "deep";
  commit?: string;
  timestamp: string;
  durationMs: number;
  checks: Record<string, CheckResult>;
};

const DEFAULT_TIMEOUT_MS = 5_000;

const time = async (fn: () => Promise<string | undefined>): Promise<CheckResult> => {
  const started = Date.now();
  try {
    const detail = await fn();
    return { ok: true, latencyMs: Date.now() - started, detail };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
};

/** fetch with a hard deadline — a hanging upstream must not hang the probe. */
const fetchWithTimeout = async (
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(`no response within ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
};

const checkDatabase = () =>
  time(async () => {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });
    return "ping ok";
  });

/**
 * The NLP API's own health endpoint, which reports its internal dependencies
 * (LLM hub, tag search, Elasticsearch). Those live inside the DW network and
 * cannot be reached from outside, so this is the only way they surface.
 *
 * Falls back to /docs while that endpoint does not exist yet: that proves the
 * process is serving, but NOT that a transformation would succeed — which is
 * exactly the failure mode seen when Elasticsearch was down.
 */
const checkNlpApi = () =>
  time(async () => {
    const base = process.env.NLP_API;
    if (!base) throw new Error("NLP_API is not set");

    // A timeout here means the service is unresponsive, so there is nothing to
    // be learned from a second probe — only fall back when /health is absent.
    const health = await fetchWithTimeout(`${base}/health`);
    if (health.ok) {
      const body = await health.json().catch(() => null);
      return body ? `/health: ${JSON.stringify(body).slice(0, 300)}` : "/health ok";
    }
    if (health.status !== 404) {
      throw new Error(`/health returned ${health.status}`);
    }

    const docs = await fetchWithTimeout(`${base}/docs`);
    if (!docs.ok) throw new Error(`/docs returned ${docs.status}`);
    return "no /health yet; /docs reachable (does not prove transforms work)";
  });

/**
 * Validates a tiny known-good query. Cheap (~0.5s) and touches no LLM, so it
 * is safe to run often while still exercising a real code path.
 */
const checkOsmApi = () =>
  time(async () => {
    const base = process.env.OSM_API;
    if (!base) throw new Error("OSM_API is not set");

    const response = await fetchWithTimeout(`${base}/validate-spot-query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        area: { type: "bbox", bbox: [6.9, 50.9, 7.05, 50.97] },
        nodes: [
          {
            id: 0,
            type: "nwr",
            filters: [{ or: [{ key: "shop", operator: "=", value: "bakery" }] }],
            name: "bakery",
          },
        ],
        edges: [],
      }),
    });

    if (!response.ok) throw new Error(`validate-spot-query returned ${response.status}`);
    const body = await response.json().catch(() => null);
    if (body?.status !== "success") {
      throw new Error(`unexpected body: ${JSON.stringify(body).slice(0, 200)}`);
    }
    return "validate-spot-query ok";
  });

export const runHealthChecks = async (deep: boolean): Promise<HealthReport> => {
  const started = Date.now();

  const entries: [string, CheckResult][] = deep
    ? await Promise.all(
        (
          [
            ["database", checkDatabase],
            ["nlpApi", checkNlpApi],
            ["osmApi", checkOsmApi],
          ] as const
        ).map(async ([name, run]) => [name, await run()] as [string, CheckResult])
      )
    : [["database", await checkDatabase()]];

  const checks = Object.fromEntries(entries);

  return {
    status: entries.every(([, c]) => c.ok) ? "ok" : "degraded",
    mode: deep ? "deep" : "shallow",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - started,
    checks,
  };
};
