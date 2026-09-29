import React from "react";

import { FilterNode, LogicFilter } from "@/types/spotQuery";

import LogicGroup from "./LogicGroup";
import Rule from "./Rule";

type Props = {
  filter: FilterNode;
  path: number[];
  nodeId: number;
  pathString: string;
};

const FilterTypeSwitch = ({ filter, path, nodeId, pathString }: Props) => {
  const isLogicFilter = (filter: FilterNode): filter is LogicFilter => {
    return "and" in filter || "or" in filter;
  };

  const updatePathString = (path: number[], currentPathString: string) => {
    if (isLogicFilter(filter)) {
      const keys = Object.keys(filter);
      const newPath = `${currentPathString}[${path.at(-1)}].${keys[0]}`;
      return newPath;
    } else {
      const newPath = `${currentPathString}[${path.at(-1)}]`;
      return newPath;
    }
  };
  return (
    <>
      {isLogicFilter(filter) ? (
        <LogicGroup
          filterNode={filter}
          path={path}
          nodeId={nodeId}
          pathString={updatePathString(path, pathString)}
        />
      ) : (
        <Rule
          filter={filter}
          nodeId={nodeId}
          pathString={updatePathString(path, pathString)}
        />
      )}
    </>
  );
};

export default FilterTypeSwitch;
