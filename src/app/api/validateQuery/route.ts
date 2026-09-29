import { createUpstreamRoute } from "@/lib/createUpstreamRoute";

export const maxDuration = 60;

export const POST = createUpstreamRoute({
  route: "/api/validateQuery",
  url: () => `${process.env.OSM_API}/validate-spot-query`,
  errorContext: (data) => ({ spotQuery: data }),
});
