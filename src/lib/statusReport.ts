import { runHealthChecks } from "@/lib/health";

export type Dependency = {
  name: string;
  ok: boolean;
  latencyMs: number;
  detail?: string;
  /** A failing non-critical dependency is a warning, not an outage. */
  critical: boolean;
};

export type ServiceStatus = {
  name: string;
  description: string;
  /** Shown so the page doubles as documentation of what is being checked. */
  endpoint: string;
  ok: boolean;
  latencyMs: number;
  dependencies: Dependency[];
  error?: string;
};

export type StatusReport = {
  ok: boolean;
  checkedAt: string;
  commit?: string;
  services: ServiceStatus[];
};

const TIMEOUT_MS = 6_000;

/** Shape the backend /health endpoints return. */
type BackendHealth = {
  status?: string;
  checks?: Record<
    string,
    { ok?: boolean; latencyMs?: number; detail?: string; critical?: boolean }
  >;
};

const toDependencies = (health: BackendHealth): Dependency[] =>
  Object.entries(health.checks ?? {}).map(([name, check]) => ({
    name,
    ok: check.ok ?? false,
    latencyMs: check.latencyMs ?? 0,
    detail: check.detail,
    critical: check.critical ?? true,
  }));

/**
 * Ask one backend for its own health report.
 *
 * These services sit inside the DW network and reach dependencies — the LLM
 * hub, the tag search, Elasticsearch — that are not reachable from here at
 * all. Their /health is the only way those surface, so this page shows what
 * they report rather than probing them itself.
 */
const checkBackend = async (
  name: string,
  description: string,
  base: string | undefined,
  path = "/health"
): Promise<ServiceStatus> => {
  const endpoint = base ? `${base}${path}` : "(not configured)";
  const started = Date.now();

  if (!base) {
    return {
      name,
      description,
      endpoint,
      ok: false,
      latencyMs: 0,
      dependencies: [],
      error: "environment variable is not set",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      cache: "no-store",
    });

    const health: BackendHealth = await response.json().catch(() => ({}));
    const dependencies = toDependencies(health);

    return {
      name,
      description,
      endpoint,
      // Trust the service's own verdict; it knows which of its dependencies
      // are critical. Fall back to the status code when it says nothing.
      ok: health.status ? health.status === "ok" : response.ok,
      latencyMs: Date.now() - started,
      dependencies,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (e) {
    return {
      name,
      description,
      endpoint,
      ok: false,
      latencyMs: Date.now() - started,
      dependencies: [],
      error:
        e instanceof Error && e.name === "AbortError"
          ? `no response within ${TIMEOUT_MS}ms`
          : e instanceof Error
            ? e.message
            : String(e),
    };
  } finally {
    clearTimeout(timer);
  }
};

export const collectStatus = async (): Promise<StatusReport> => {
  const [own, nlp, osm] = await Promise.all([
    runHealthChecks(false),
    checkBackend(
      "NLP API",
      "Turns a sentence into a Spot query",
      process.env.NLP_API
    ),
    checkBackend(
      "OSM Query API",
      "Runs the query against OpenStreetMap",
      process.env.OSM_API
    ),
  ]);

  const frontend: ServiceStatus = {
    name: "Frontend",
    description: "This application and its session storage",
    endpoint: "/api/health",
    ok: own.status === "ok",
    latencyMs: own.durationMs,
    dependencies: Object.entries(own.checks).map(([name, check]) => ({
      name,
      ok: check.ok,
      latencyMs: check.latencyMs,
      detail: check.detail,
      critical: true,
    })),
  };

  const services = [frontend, nlp, osm];

  return {
    ok: services.every((service) => service.ok),
    checkedAt: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    services,
  };
};
