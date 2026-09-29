import React, { ReactNode } from "react";

import useChatStore from "@/stores/useChatStore";
import useResultsStore from "@/stores/useResultsStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import { ChatProperty } from "@/types/chatQuery";
import { Node } from "@/types/spotQuery";

const propertyLabel = ({ name, operator, value }: ChatProperty) => {
  if (!value) return name;
  if (operator === "<" || operator === ">") return `${name} ${operator} ${value}`;
  return `${name} ${value}`;
};

const Pill = ({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 text-xs font-medium leading-tight bg-white border border-gray-300 rounded-full align-middle">
    {color && (
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
    )}
    {children}
  </span>
);

const Value = ({ children }: { children: ReactNode }) => (
  <span className="font-semibold">{children}</span>
);

// One sentence describing the current query, e.g. "Searching for (cafes)
// within 100 m of (parks) in Berlin". Built from the SpotQuery, so edits made
// in the query panel show up too.
const SearchSummary = () => {
  const { nodes, edges, area } = useSpotQueryStore((state) => state.spotQuery);
  const chatQuery = useChatStore((state) => state.chatQuery);
  const sets = useResultsStore((state) => state.sets);

  if (nodes.length === 0) return null;

  // Result sets carry the map colours; match them by either name.
  const colorOf = (node: Node) => {
    const names = [node.display_name, node.name].map((n) => n?.toLowerCase());
    return sets.find((set) =>
      [set.name, set.display_name].some((n) => names.includes(n?.toLowerCase()))
    )?.fillColor;
  };

  const entityPill = (id: number) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return null;
    const entity = chatQuery?.entities.find(
      (e) => e.id === id && e.name === node.name
    );
    const details = [
      ...(entity?.properties ?? []).map(propertyLabel),
      ...(node.type === "cluster"
        ? [`${node.minPoints}+ within ${node.maxDistance}`]
        : []),
    ];
    return (
      <Pill color={colorOf(node)}>
        <span className="capitalize">{node.display_name}</span>
        {details.length > 0 && (
          <span className="font-normal text-gray-500">
            {details.join(", ")}
          </span>
        )}
      </Pill>
    );
  };

  const mentioned = new Set(edges.flatMap((e) => [e.source, e.target]));
  const clauses: ReactNode[] = [
    ...edges.map((edge, i) =>
      edge.type === "distance" ? (
        <React.Fragment key={`edge-${i}`}>
          {entityPill(edge.source)} within <Value>{edge.value}</Value> of{" "}
          {entityPill(edge.target)}
        </React.Fragment>
      ) : (
        <React.Fragment key={`edge-${i}`}>
          {entityPill(edge.source)} containing {entityPill(edge.target)}
        </React.Fragment>
      )
    ),
    ...nodes
      .filter((node) => !mentioned.has(node.id))
      .map((node) => (
        <React.Fragment key={`node-${node.id}`}>
          {entityPill(node.id)}
        </React.Fragment>
      )),
  ];

  // Nominatim's display names are long ("Berlin, Deutschland"); the first
  // part is enough here.
  const place =
    area.type === "area" ? (
      <>
        in <Value>{area.value.split(",")[0]}</Value>
      </>
    ) : (
      "in the current map view"
    );

  return (
    <p className="p-2 text-sm leading-7 border rounded-md bg-gray-50">
      Searching for{" "}
      {clauses.map((clause, i) => (
        <React.Fragment key={i}>
          {i > 0 && (i === clauses.length - 1 ? " and " : ", ")}
          {clause}
        </React.Fragment>
      ))}{" "}
      {place}
    </p>
  );
};

export default SearchSummary;
