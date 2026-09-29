import { createUpstreamRoute } from "@/lib/createUpstreamRoute";

export const maxDuration = 60;

export const POST = createUpstreamRoute({
  route: "/api/queryOSM",
  url: () => `${process.env.OSM_API}/run-spot-query`,
  errorContext: (data) => ({ spotQuery: data }),
});
