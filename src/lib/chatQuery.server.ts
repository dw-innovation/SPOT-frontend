import pluralize from "pluralize";

import { COLOUR_BUNDLES } from "@/lib/const/spotColours";
import { ChatEntity, ChatProperty, ChatQuery } from "@/types/chatQuery";
import { Edge, Filter, FilterNode, SpotQuery } from "@/types/spotQuery";

/**
 * Converts a query from the SPOT Chat API into a SpotQuery.
 *
 * The chat API returns entities and properties by name only ("cafe",
 * "cuisine = italian"). The OSM filters are looked up in SPOT's tag search,
 * the same way the Central NLP API does it in adopt_generation.py.
 */

type TagSearchResult = { imr: FilterNode[] };

export class ChatQueryConversionError extends Error {}

const TAG_SEARCH_URL =
  process.env.SPOT_TAG_SEARCH_URL || "https://tags.findthatspot.io/api/search";

const searchTag = async (word: string): Promise<TagSearchResult[]> => {
  const params = new URLSearchParams({ word, limit: "1", detail: "false" });
  const response = await fetch(`${TAG_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Tag search failed for '${word}' (${response.status})`);
  }
  return response.json();
};

const colourValues = (colour: string): string[] => {
  const key = colour.trim().toLowerCase();
  return (
    COLOUR_BUNDLES.find(({ descriptors }) => descriptors.includes(key))
      ?.values ?? [key]
  );
};

const isFilter = (node: FilterNode): node is Filter => "key" in node;

const buildPropertyFilter = async (
  property: ChatProperty
): Promise<FilterNode> => {
  const [result] = await searchTag(property.name);
  const block = result?.imr?.[0];
  if (!block) {
    throw new ChatQueryConversionError(
      `No OSM tags found for the property '${property.name}'`
    );
  }
  const tags = ("or" in block ? block.or : "and" in block ? block.and : [
    block,
  ])!.filter(isFilter);

  if (property.operator === undefined) return { or: tags };

  const operator = (property.operator || "=") as Filter["operator"];
  const value = property.value ?? "";

  if (tags.length === 1) return { ...tags[0], operator, value };

  const isColour = tags[0]?.key.includes("colour");
  const values = isColour ? colourValues(value) : [value];
  return {
    or: values.flatMap((v) =>
      tags.map((tag) => ({ ...tag, operator, value: v }))
    ),
  };
};

const buildFilters = async (entity: ChatEntity): Promise<FilterNode[]> => {
  const [result] = await searchTag(entity.name);
  if (!result?.imr?.length) {
    throw new ChatQueryConversionError(
      `No OSM tags found for '${entity.name}'`
    );
  }

  let filters = result.imr;
  if (entity.name.startsWith("brand:")) {
    const brand = entity.name.replace("brand:", "");
    filters = filters.map((item) =>
      "or" in item && item.or
        ? {
            or: item.or.map((sub) =>
              isFilter(sub) && sub.value === "***example***"
                ? { ...sub, value: brand }
                : sub
            ),
          }
        : item
    );
  }

  if (entity.properties?.length) {
    const propertyFilters = await Promise.all(
      entity.properties.map(buildPropertyFilter)
    );
    return [{ and: [filters[0], ...propertyFilters] }];
  }

  const hasLogic = filters.some((f) => "and" in f || "or" in f);
  return hasLogic ? filters : [{ and: filters }];
};

const displayName = (name: string) => {
  const plural = pluralize.isSingular(name) ? pluralize(name) : name;
  return plural.replace(/^brand:/, "");
};

export const chatQueryToSpotQuery = async (
  query: ChatQuery
): Promise<SpotQuery> => {
  const area: SpotQuery["area"] =
    query.area.type === "area"
      ? { type: "area", value: query.area.value }
      : { type: "bbox", bbox: [] };

  const nodes = await Promise.all(
    query.entities.map(async (entity) => {
      const common = {
        id: entity.id,
        name: entity.name,
        display_name: displayName(entity.name),
        filters: await buildFilters(entity),
      };
      return entity.type === "cluster"
        ? {
            ...common,
            type: "cluster" as const,
            minPoints: entity.minPoints ?? 2,
            maxDistance: entity.maxDistance ?? "",
          }
        : { ...common, type: "nwr" as const };
    })
  );

  // The chat API writes relations in SpotQuery's edge format already.
  const edges = (query.relations ?? []) as Edge[];

  return { area, nodes, edges };
};
