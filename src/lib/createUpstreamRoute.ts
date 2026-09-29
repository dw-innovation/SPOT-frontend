import { NextRequest, NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/lib/auth";
import { proxyUpstream } from "@/lib/proxyUpstream";

type JsonBody = Record<string, unknown>;

type UpstreamRouteConfig = {
  /** Route path, used to label persisted error reports. */
  route: string;
  /** Read lazily so the env var is resolved per request, not at import time. */
  url: () => string;
  /** Some upstreams need an identifiable user, not just a valid session. */
  requireUsername?: boolean;
  /** Defaults to forwarding the request body unchanged. */
  buildBody?: (data: JsonBody, session: Session) => unknown;
  /** Extra context attached to error reports to make failures reproducible. */
  errorContext?: (data: JsonBody) => { prompt?: string; spotQuery?: unknown };
  /** Logs the outgoing body so prompts stay visible in the platform logs. */
  logRequestBody?: boolean;
};

const unauthenticated = () =>
  NextResponse.json(
    { status: "error", message: "unauthenticated" },
    { status: 401 }
  );

/**
 * Builds a POST handler that authenticates the caller and forwards the request
 * to a backend service. The three proxied routes differed only in their
 * upstream URL and body, so they share this instead of copying the flow.
 */
export const createUpstreamRoute =
  ({
    route,
    url,
    requireUsername = false,
    buildBody,
    errorContext,
    logRequestBody = false,
  }: UpstreamRouteConfig) =>
  async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    const token = await getToken({ req, raw: true });

    if (!session || (requireUsername && !session.user?.name)) {
      return unauthenticated();
    }

    const data: JsonBody = await req.json();
    const body = buildBody ? buildBody(data, session) : data;

    if (logRequestBody) console.log(body);

    return proxyUpstream({
      route,
      url: url(),
      token,
      body,
      session,
      ...errorContext?.(data),
    });
  };
