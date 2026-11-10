import L from "leaflet";
import { LayersIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { animated, useSprings } from "react-spring";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import LayerItem from "./LayerItem";

const LAYERS = [
  {
    name: "Vector Map",
    value: "vector",
  },
  {
    name: "Hybrid Map",
    value: "satellite",
  },
  {
    name: "OSM Style Map",
    value: "osm",
  },
];

const LayerSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!triggerRef.current) return;
    L.DomEvent.disableClickPropagation(triggerRef.current);
    L.DomEvent.disableScrollPropagation(triggerRef.current);
  }, []);

  const springs = useSprings(
    LAYERS.length,
    LAYERS.map((_, index) => {
      return {
        transform: isOpen
          ? `translateX(-${(index + 1) * 15}%)`
          : `translateX(${(index + 1) * 100}%)`,
        opacity: isOpen ? 1 : 0,
        height: "100%",
      };
    })
  );

  const handleSelectorTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative flex flex-row-reverse items-end w-fit")}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="z-10" asChild>
            <Button
              className="h-10 p-0 shadow-lg aspect-square"
              onClick={handleSelectorTriggerClick}
              ref={triggerRef}
            >
              <LayersIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Select Map Style</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="z-0 flex flex-row-reverse items-end h-10">
        {springs.map((props, index) => (
          <animated.div key={LAYERS[index].value} style={props}>
            <LayerItem
              value={LAYERS[index].value as "vector" | "satellite" | "osm"}
              name={LAYERS[index].name}
            />
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default LayerSelector;
