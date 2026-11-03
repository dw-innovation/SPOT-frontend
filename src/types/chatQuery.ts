import { SpotQuery } from "@/types/spotQuery";

// The query format of the SPOT Chat API: entities and properties by name,
// without OSM filters. See lib/chatQuery.server.ts for the conversion.

export type ChatProperty = { name: string; operator?: string; value?: string };

export type ChatEntity = {
  id: number;
  name: string;
  type?: "nwr" | "cluster";
  properties?: ChatProperty[];
  minPoints?: number;
  maxDistance?: string;
};

export type ChatRelation = {
  source: number;
  target: number;
  type: string;
  value?: string;
};

export type ChatQuery = {
  area: { type: "area"; value: string } | { type: "bbox"; value?: string };
  entities: ChatEntity[];
  relations?: ChatRelation[];
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** What /api/transformSentence returns when it uses the chat API. */
export type ChatTurnResponse = {
  reply: string;
  query: ChatQuery;
  changed: boolean;
  history: ChatMessage[];
  imr: SpotQuery;
};
