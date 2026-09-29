import { debounce } from "lodash";
import React, { useCallback } from "react";

import { Slider } from "@/components/ui/slider";
import {
  distanceToMeters,
  expSlider,
  findNameById,
  logSlider,
  trackAction,
} from "@/lib/utils";
import useSpotQueryStore from "@/stores/useSpotQueryStore";
import { DistanceRelation } from "@/types/spotQuery";

type Props = {
  edge: DistanceRelation;
  index: number;
};

const Distance = ({ edge, index }: Props) => {
  const nodes = useSpotQueryStore((state) => state.spotQuery.nodes);
  const setRelationValue = useSpotQueryStore((state) => state.setRelationValue);

  const debouncedTrackAction = useCallback(
    debounce((actionType, actionName, actionDetail) => {
      trackAction(actionType, actionName, actionDetail);
    }, 500),
    []
  );

  const handleValueChange = useCallback(
    (index: number, value: number[], source: string, target: string) => {
      const newValue = `${expSlider(value[0], 10, 2000, 0.8)}m`;
      setRelationValue(index, "value", newValue);

      debouncedTrackAction(
        "relations",
        "changeDistance",
        `${source} to ${target}: ${newValue}`
      );
    },
    [setRelationValue, debouncedTrackAction]
  );

  return (
    <>
      <div>
        <span className="font-bold capitalize">
          {findNameById(edge.source, nodes)}
        </span>{" "}
        to{" "}
        <span className="font-bold capitalize">
          {findNameById(edge.target, nodes)}
        </span>
        : <span>within</span> <strong>{edge.value}</strong>
      </div>
      <Slider
        max={2000}
        min={10}
        step={1}
        value={[logSlider(distanceToMeters(edge.value), 10, 2000, 0.8)]}
        className="my-2"
        onValueChange={(value) => {
          const source = findNameById(edge.source, nodes);
          const target = findNameById(edge.target, nodes);
          handleValueChange(index, value, source, target);
        }}
      />
    </>
  );
};

export default Distance;
