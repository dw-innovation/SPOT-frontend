import type { MultiPolygon, Polygon } from "geojson";

import { SpotQuery } from "@/types/spotQuery";

export default interface SpotQueryStoreInterface {
  naturalLanguageSentence: string;
  setNaturaLanguageSentence: (naturalLanguageSentence: string) => void;
  spotQuery: SpotQuery;
  setSpotQuery: (spotQuery: SpotQuery) => void;
  removeRuleOrGroup: (nodeId: number, pathString: string) => void;
  addRuleOrGroup: (
    nodeId: number,
    pathString: string,
    newObject: object
  ) => void;
  switchOperatorAtPath: (nodeId: number, pathString: string) => void;
  stringifiedSpotQuery: string;
  setStringifiedSpotQuery: (stringifiedSpotQuery: string) => void;
  setSearchAreaBBox: (bbox: number[]) => void;
  setSearchAreaName: (area: string) => void;
  setSearchAreaGeometry: (geometry: Polygon | MultiPolygon) => void;
  updateRuleValue: (
    nodeId: number,
    pathString: string,
    keyToUpdate: string,
    newValue: any
  ) => void;
  updateNodeDisplayName: (nodeId: number, displayName: string) => void;
  setRelationValue: (
    index: number,
    key: string,
    value: string | number
  ) => void;
  initialize: (initialData: any) => void;
}
