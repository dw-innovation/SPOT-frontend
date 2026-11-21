import { Metadata } from "next";
import React from "react";

import {
  collectStatus,
  type Dependency,
  type ServiceStatus,
} from "@/lib/statusReport";

// A cached status page is a lie.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export const metadata: Metadata = {
  title: "SPOT status",
  description: "Live health of the SPOT services and their dependencies",
};

const REFRESH_SECONDS = 30;

const latency = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);

/** Green when fine, amber when a non-critical dependency is down, red otherwise. */
const tone = (ok: boolean, critical = true) =>
  ok
    ? { dot: "bg-emerald-500", text: "text-emerald-700", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
    : critical
      ? { dot: "bg-red-500", text: "text-red-700", chip: "bg-red-50 text-red-700 ring-red-200" }
      : { dot: "bg-amber-500", text: "text-amber-700", chip: "bg-amber-50 text-amber-700 ring-amber-200" };

const DependencyRow = ({ dependency }: { dependency: Dependency }) => {
  const colour = tone(dependency.ok, dependency.critical);
  return (
    <li className="flex items-start gap-3 py-2 border-t border-gray-100 first:border-t-0">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colour.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-gray-900">{dependency.name}</span>
          <span className="font-mono text-xs text-gray-400 tabular-nums">
            {latency(dependency.latencyMs)}
          </span>
        </div>
        {dependency.detail && (
          <p className="mt-0.5 text-xs leading-snug text-gray-500 break-words">
            {dependency.detail}
          </p>
        )}
      </div>
      {!dependency.critical && (
        <span className="mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100">
          non-critical
        </span>
      )}
    </li>
  );
};

const ServiceCard = ({ service }: { service: ServiceStatus }) => {
  const colour = tone(service.ok);
  return (
    <section className="flex flex-col overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
      <header className="flex items-start gap-3 p-4">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${colour.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="text-base font-semibold text-gray-900">{service.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colour.chip}`}>
              {service.ok ? "operational" : "down"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{service.description}</p>
          <p className="mt-1 font-mono text-[11px] text-gray-400 break-all">
            {service.endpoint} · {latency(service.latencyMs)}
          </p>
        </div>
      </header>

      {service.error && (
        <p className="px-4 pb-3 -mt-1 text-sm text-red-700">{service.error}</p>
      )}

      {service.dependencies.length > 0 && (
        <div className="px-4 pb-3">
          <h3 className="mb-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
            Dependencies
          </h3>
          <ul>
            {service.dependencies.map((dependency) => (
              <DependencyRow key={dependency.name} dependency={dependency} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

const StatusPage = async () => {
  const report = await collectStatus();
  const failing = report.services.filter((service) => !service.ok);

  return (
    <main className="min-h-screen px-4 py-10 bg-gray-50 sm:px-6">
      {/* React hoists this into <head>; the page re-fetches on its own. */}
      <meta httpEquiv="refresh" content={String(REFRESH_SECONDS)} />

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            SPOT status
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${tone(report.ok).chip}`}
          >
            {report.ok
              ? "All systems operational"
              : `${failing.length} service${failing.length === 1 ? "" : "s"} affected`}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Checked live on every load — nothing here is cached. Each service
          reports its own dependencies, including the ones inside the DW
          network that cannot be reached from here directly.
        </p>

        <div className="grid items-start gap-4 mt-6 sm:grid-cols-2">
          {report.services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>

        <footer className="mt-8 text-xs text-gray-400">
          <p>
            {new Date(report.checkedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "medium",
              timeZone: "UTC",
            })}{" "}
            UTC · refreshes every {REFRESH_SECONDS}s
            {report.commit && ` · ${report.commit}`}
          </p>
          <p className="mt-1">
            Machine-readable:{" "}
            {/* An API route, not a page — next/link does not apply. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="underline hover:text-gray-600" href="/api/health?deep=1">
              /api/health?deep=1
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default StatusPage;
