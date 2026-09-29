 
import Downshift from "downshift";
import { debounce, DebouncedFunc } from "lodash";
import React, { useCallback, useEffect, useRef } from "react";

import LensIcon from "@/assets/icons/LensIcon";
import { fetchGeocodeApiData } from "@/lib/apiServices";
import useStrings from "@/lib/contexts/useStrings";
import { convertToLatLng, getNewBoundingBox } from "@/lib/geoSpatialHelpers";
import { checkInputType } from "@/lib/utils";
import useAddressStore from "@/stores/useAddressStore";
import useDisableMapInteraction from "@/stores/useDisableMapInteraction";
import useMapStore from "@/stores/useMapStore";

import AddressSuggestions from "./AddressSuggestions";

const AddressSearchBox = () => {
  const { commonAddressSearchPlaceholder } = useStrings();
  const addressSuggestions = useAddressStore(
    (state) => state.addressSuggestions
  );
  const setSearchAddress = useAddressStore((state) => state.setSearchAddress);
  const setAddressSuggestions = useAddressStore(
    (state) => state.setAddressSuggestions
  );
  const searchAddress = useAddressStore((state) => state.searchAddress);
  const setCurrentAddress = useAddressStore((state) => state.setCurrentAddress);
  const setBounds = useMapStore((state) => state.setBounds);
  const bounds = useMapStore((state) => state.bounds);

  const lastSearchAddressRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  useDisableMapInteraction(inputRef);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchGeocodeApiData = useCallback(
    debounce(async () => {
      const suggestions = await fetchGeocodeApiData(searchAddress);
      if (suggestions) {
        setAddressSuggestions(suggestions);
      }
      lastSearchAddressRef.current = searchAddress;
    }, 200) as DebouncedFunc<() => void>,
    [searchAddress, setAddressSuggestions]
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    selectItem: (item: any) => void
  ) => {
    if (e.key === "Enter") {
      if (checkInputType(searchAddress) === "coordinates") {
        const newCenter = convertToLatLng(searchAddress);
        if (!newCenter) {
          return;
        }

        const newBounds = getNewBoundingBox(bounds, newCenter);

        if (newBounds) {
          setBounds(newBounds);
          setSearchAddress(searchAddress);
          setCurrentAddress({
            placeName: searchAddress,
            coordinates: newCenter,
          });
        }

        return;
      }

      if (
        checkInputType(searchAddress) === "address" &&
        addressSuggestions.length > 0
      ) {
        const firstSuggestion = addressSuggestions[0];
        setBounds([
          [firstSuggestion.bbox[1], firstSuggestion.bbox[0]],
          [firstSuggestion.bbox[3], firstSuggestion.bbox[2]],
        ]);
        setCurrentAddress({
          placeName: firstSuggestion.place_name_en,
          coordinates: firstSuggestion.coordinates,
        });
        setSearchAddress(firstSuggestion.place_name_en);
        selectItem(firstSuggestion);
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (
      searchAddress &&
      searchAddress !== lastSearchAddressRef.current &&
      checkInputType(searchAddress) === "address"
    ) {
      debouncedFetchGeocodeApiData();
    }
    return () => {
      debouncedFetchGeocodeApiData.cancel();
    };
  }, [searchAddress, debouncedFetchGeocodeApiData, lastSearchAddressRef]);

  return (
    <div className="flex flex-col gap-1 justify-end w-[15rem] md:w-[20rem]">
      <Downshift
        onChange={({ coordinates, bbox, place_name_en }) => {
          setBounds([
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]],
          ]);

          setCurrentAddress({ placeName: place_name_en, coordinates });
        }}
        onSelect={(item) => {
          setSearchAddress(item.place_name_en);
          inputRef?.current?.blur();
        }}
        itemToString={(item) => (item ? item.place_name : "")}
      >
        {({
          getInputProps,
          getItemProps,
          getToggleButtonProps,
          isOpen,
          getMenuProps,
          highlightedIndex,
          selectedItem,
          getRootProps,
          selectItem,
          setState,
        }) => (
          <div className="relative">
            <div className="flex flex-col gap-1" ref={inputRef}>
              <div
                className="flex shadow-lg bg-white rounded-lg gap-0.5"
                {...getRootProps({}, { suppressRefError: true })}
              >
                <div className="flex items-center justify-center flex-1 gap-2 rounded-lg">
                  <input
                    placeholder={commonAddressSearchPlaceholder()}
                    className="w-full p-2 rounded-lg"
                    {...getInputProps({
                      onChange: (e) =>
                        setSearchAddress((e.target as HTMLInputElement).value),
                      onKeyDown: (e) => handleKeyDown(e, selectItem),
                      onFocus: () => setState({ isOpen: true }),
                      value: searchAddress,
                    })}
                    ref={inputRef}
                  />
                </div>
                <button
                  aria-label={"toggle menu"}
                  className="px-2"
                  type="button"
                  {...getToggleButtonProps()}
                >
                  <LensIcon />
                </button>
              </div>
            </div>

            <AddressSuggestions
              isOpen={isOpen}
              suggestions={addressSuggestions}
              highlightedIndex={highlightedIndex}
              selectedItem={selectedItem}
              getItemProps={getItemProps}
              getMenuProps={getMenuProps}
            />
          </div>
        )}
      </Downshift>
    </div>
  );
};

export default AddressSearchBox;
