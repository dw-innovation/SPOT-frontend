import { anonymizeUser } from "@/lib/anonymizeUser";
import { createUpstreamRoute } from "@/lib/createUpstreamRoute";

export const maxDuration = 60;

export const POST = createUpstreamRoute({
  route: "/api/transformSentence",
  url: () => `${process.env.NLP_API}/transform-sentence-to-imr`,
  requireUsername: true,
  buildBody: (data, session) => ({
    ...data,
    environment: process.env.ENVIRONMENT || "production",
    username: anonymizeUser(session),
    model: process.env.NLP_MODEL || "t5",
  }),
  errorContext: (data) => ({
    prompt: typeof data.sentence === "string" ? data.sentence : undefined,
  }),
  logRequestBody: true,
});
