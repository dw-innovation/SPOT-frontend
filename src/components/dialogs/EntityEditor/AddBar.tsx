import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

import { Button } from "@/components/ui/button";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

import Connectors from "./Connectors";

type Props = {
  nodeId: number;
  pathString: string;
  path: number[];
};

const AddBar = ({ nodeId, pathString, path }: Props) => {
  const addRuleOrGroup = useSpotQueryStore((state) => state.addRuleOrGroup);

  const handleAddRuleOrGroup = (
    nodeId: number,
    pathString: string,
    newObject: object
  ) => {
    addRuleOrGroup(nodeId, pathString, newObject);
  };

  return (
    <div className="flex items-center connector-container">
      <Connectors />
      <div className="flex gap-2 ml-2">
        {path.length > 0 && (
          <Button
            onClick={() =>
              handleAddRuleOrGroup(nodeId, pathString, {
                key: "",
                operator: "=",
                value: "",
              })
            }
            variant="secondary"
            size="fit"
            className="bg-blue-100"
          >
            <PlusIcon /> rule
          </Button>
        )}
        {path.length < 2 && (
          <Button
            onClick={() =>
              handleAddRuleOrGroup(nodeId, pathString, { and: [] })
            }
            variant="secondary"
            size="fit"
            className="bg-blue-100"
          >
            <PlusIcon /> group
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddBar;
