import type { MultiPolygon, Polygon } from "geojson";
import _ from "lodash";

import { SpotQuery } from "@/types/spotQuery";

export const updateSearchGeometry = (
  spotQuery: SpotQuery,
  value: Polygon | MultiPolygon
): SpotQuery => {
  if (spotQuery.area.type === "area") {
    return {
      ...spotQuery,
      area: {
        ...spotQuery.area,
        geometry: value,
      },
    };
  }
  return spotQuery;
};

export const updateSearchBbox = (
  spotQuery: SpotQuery,
  value: number[]
): SpotQuery => ({
  ...spotQuery,
  area: {
    ...spotQuery.area,
    type: "bbox",
    bbox: value,
  },
});

export const updateSearchAreaName = (
  spotQuery: SpotQuery,
  value: string
): SpotQuery => {
  if (spotQuery.area.type === "area") {
    return {
      ...spotQuery,
      area: {
        ...spotQuery.area,
        value: value,
      },
    };
  } else {
    return spotQuery;
  }
};

export const updateNodeDisplayName = (
  spotQuery: SpotQuery,
  nodeId: number,
  displayName: string
): SpotQuery => {
  const fullPath = `nodes[${nodeId}].name`;
  const clonedSpotQuery = _.cloneDeep(spotQuery);
  _.set(clonedSpotQuery, fullPath, displayName);

  return clonedSpotQuery;
};

export const addRuleOrGroup = (
  spotQuery: SpotQuery,
  nodeId: number,
  pathString: string,
  newObject: object
): SpotQuery => {
  const fullPath = `nodes[${nodeId}].${pathString}`;
  const clonedSpotQuery = _.cloneDeep(spotQuery);

  const arrayAtPath = _.get(clonedSpotQuery, fullPath);

  if (!Array.isArray(arrayAtPath)) {
    _.set(clonedSpotQuery, fullPath, [newObject]);
  } else {
    arrayAtPath.push(newObject);
  }

  return clonedSpotQuery;
};

export const removeRuleOrGroup = (
  spotQuery: SpotQuery,
  nodeId: number,
  pathString: string
): SpotQuery => {
  const clonedSpotQuery = _.cloneDeep(spotQuery);
  const fullPath = `nodes[${nodeId}].${pathString}`;

  const pathArray = _.toPath(fullPath);

  let parentPath = pathArray.slice(0, -1).join(".");
  let lastPathElement = pathArray[pathArray.length - 1];

  if (lastPathElement === "and" || lastPathElement === "or") {
    parentPath = pathArray.slice(0, -2).join(".");

    lastPathElement = pathArray[pathArray.length - 2];
  }
  const index = parseInt(lastPathElement, 10);

  const parent = _.get(clonedSpotQuery, parentPath);

  if (Array.isArray(parent) && !isNaN(index)) {
    parent.splice(index, 1);
    _.set(clonedSpotQuery, parentPath, parent);
  }

  return clonedSpotQuery;
};

export const switchOperatorAtPath = (
  spotQuery: SpotQuery,
  nodeId: number,
  pathString: string
): SpotQuery => {
  const fullPath = `nodes[${nodeId}].${pathString}`;
  const clonedSpotQuery = _.cloneDeep(spotQuery);
  const nodeToSwitch = _.get(clonedSpotQuery, fullPath);

  const pathArray = _.toPath(fullPath);
  const parentPathArray = pathArray.slice(0, -1);
  const switchedOperator =
    pathArray[pathArray.length - 1] === "and" ? "or" : "and";
  parentPathArray.push(switchedOperator);

  const switchedFullPath = parentPathArray.join(".");

  const spotQueryWithoutPreviousOperatorNode = removeRuleOrGroup(
    clonedSpotQuery,
    nodeId,
    pathString
  );

  const updatedSpotQuery = _.set(
    spotQueryWithoutPreviousOperatorNode,
    switchedFullPath,
    nodeToSwitch
  );

  return updatedSpotQuery;
};

export const updateRuleValue = (
  spotQuery: SpotQuery,
  nodeId: number,
  pathString: string,
  keyToUpdate: string,
  newValue: any
): SpotQuery => {
  const fullPath = `nodes[${nodeId}].${pathString}.${keyToUpdate}`;
  const clonedSpotQuery = _.cloneDeep(spotQuery);
  _.set(clonedSpotQuery, fullPath, newValue);

  return clonedSpotQuery;
};
