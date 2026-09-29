import { InfoIcon } from "lucide-react";
import React from "react";

import { Input } from "@/components/ui/input";
import useGlobalStore from "@/stores/useGlobalStore";
import useSpotQueryStore from "@/stores/useSpotQueryStore";

import Dialog from "../Dialog";
import AddBar from "./AddBar";
import ApplyButton from "./ApplyButton";
import FilterTypeSwitch from "./FilterTypeSwitch";
import Header from "./Header";

const DIALOG_NAME = "entityEditor";

const EntityEditor = () => {
  const dialogData = useGlobalStore((state) => state.dialogs.entityEditor.data);

  const node = useSpotQueryStore(
    (state) => state.spotQuery.nodes[dialogData?.id || 0]
  );

  const filters = node ? node.filters : undefined;

  return (
    <Dialog dialogName={DIALOG_NAME} className="sm:max-w-[40rem] w-fit">
      {node && (
        <div className="relative h-full">
          <Header name={node.name} nodeId={node.id} />
          <div className="flex-1 max-h-full overflow-hidden">
            {filters &&
              filters.map((filter, index) => (
                <FilterTypeSwitch
                  key={index}
                  filter={filter}
                  path={[index]}
                  nodeId={node.id}
                  pathString={`filters`}
                />
              ))}

            {filters && filters.length === 0 && (
              <AddBar pathString={`filters`} nodeId={node.id} path={[]} />
            )}

            {node.type === "cluster" && (
              <div>
                <h3 className="font-bold">Edit cluster settings</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center w-1/3">
                    <span className="text-nowrap">min. points:</span>
                    <Input onChange={() => {}} value={node.minPoints} />
                  </div>
                  <div className="flex gap-2 items-center w-1/3">
                    <span className="text-nowrap">max. distance:</span>
                    <Input onChange={(e) => {}} value={node.maxDistance} />
                  </div>
                </div>
              </div>
            )}
            <ApplyButton />
          </div>
        </div>
      )}
      <div className="bg-blue-100 p-2 rounded-sm shadow-sm flex gap-2">
        <InfoIcon className="text-black inline" />
        <p>
          Suggest changes, new descriptors or tag bundles with the{" "}
          <a
            href="https://tags.findthatspot.io"
            target="_blank"
            className="underline hover:no-underline"
          >
            SPOT Tag Editor
          </a>
          .
        </p>
      </div>
    </Dialog>
  );
};

export default EntityEditor;
