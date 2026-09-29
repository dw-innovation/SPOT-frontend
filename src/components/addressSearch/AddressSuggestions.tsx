import { ControllerStateAndHelpers } from "downshift";
import L from "leaflet";
import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { MapTilerFeature } from "@/types/maptiler";

type Props = {
  isOpen: boolean;
  suggestions: MapTilerFeature[];
  highlightedIndex: number | null;
  selectedItem: MapTilerFeature | null;
  getItemProps: ControllerStateAndHelpers<MapTilerFeature>["getItemProps"];
  getMenuProps: ControllerStateAndHelpers<MapTilerFeature>["getMenuProps"];
};

const AddressSuggestions = ({
  isOpen,
  suggestions,
  highlightedIndex,
  selectedItem,
  getItemProps,
  getMenuProps,
}: Props) => {
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (suggestionsRef.current) {
      L.DomEvent.disableScrollPropagation(suggestionsRef.current);
    }
  }, []);

  return (
    <ul
      className={cn(
        "absolute w-full bg-white mt-1 shadow-md max-h-80 p-0 z-[800] overflow-y-auto",
        !isOpen && suggestions.length === 0 && "hidden"
      )}
      {...getMenuProps({ ref: suggestionsRef })}
    >
      {isOpen &&
        suggestions.map((item, index) => (
          <li
            key={index}
            className={cn(
              "py-2 px-3 shadow-sm flex flex-col cursor-pointer",
              highlightedIndex === index && "bg-blue-300",
              selectedItem === item && "font-bold"
            )}
            {...getItemProps({
              index,
              item,
            })}
          >
            {item.place_name}
          </li>
        ))}
    </ul>
  );
};

export default AddressSuggestions;
