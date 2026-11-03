import _ from "lodash";

import { ChatEntity, ChatQuery, ChatRelation } from "@/types/chatQuery";
import { SpotQuery } from "@/types/spotQuery";

/**
 * The chat query to send with the next message. Edits made in the query
 * panel since the last turn win: entities, clusters and relations come from
 * the current SpotQuery. Properties only exist as OSM filters there, so they
 * come from the last chat query.
 */
export const syncChatQuery = (
  chatQuery: ChatQuery,
  spotQuery: SpotQuery
): ChatQuery => {
  const previous = new Map(chatQuery.entities.map((e) => [e.id, e]));

  // The area selector replaces the name with Nominatim's display name, so
  // only a switch between area and map view counts as an edit.
  const area: ChatQuery["area"] =
    spotQuery.area.type === chatQuery.area.type
      ? chatQuery.area
      : spotQuery.area.type === "area"
        ? { type: "area", value: spotQuery.area.value }
        : { type: "bbox" };

  const entities = spotQuery.nodes.map((node): ChatEntity => {
    const prev = previous.get(node.id);
    const properties = prev?.name === node.name ? prev.properties : undefined;
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      ...(properties?.length ? { properties } : {}),
      ...(node.type === "cluster" && {
        minPoints: node.minPoints,
        maxDistance: node.maxDistance,
      }),
    };
  });

  const relations = spotQuery.edges.map(
    (edge): ChatRelation => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      ...(edge.type === "distance" && { value: edge.value }),
    })
  );

  return { area, entities, relations };
};

/**
 * Merges the SpotQuery of a chat turn into the current one. Entities the turn
 * left unchanged keep their current node, so filters edited in the panel
 * survive, and an unchanged area keeps its selected geometry.
 */
export const mergeChatTurn = ({
  current,
  sent,
  received,
  imr,
}: {
  current: SpotQuery;
  sent: ChatQuery;
  received: ChatQuery;
  imr: SpotQuery;
}): { spotQuery: SpotQuery; areaChanged: boolean } => {
  const areaChanged = !_.isEqual(sent.area, received.area);
  const sentById = new Map(sent.entities.map((e) => [e.id, e]));

  const nodes = imr.nodes.map((node) => {
    const entity = received.entities.find((e) => e.id === node.id);
    const currentNode = current.nodes.find((n) => n.id === node.id);
    const unchanged = _.isEqual(entity, sentById.get(node.id));
    return unchanged && currentNode ? currentNode : node;
  });

  return {
    spotQuery: {
      area: areaChanged ? imr.area : current.area,
      nodes,
      edges: imr.edges,
    },
    areaChanged,
  };
};
