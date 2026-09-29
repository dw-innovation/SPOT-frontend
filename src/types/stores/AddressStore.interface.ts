import { MapTilerFeature } from "@/types/maptiler";

export default interface AddressStoreInterface {
  searchAddress: string;
  setSearchAddress: (searchAddress: string) => void;
  currentAddress: {
    placeName: string;
    /** [lat, lng], matching the Leaflet convention used for bounds. */
    coordinates: [number, number];
  };
  setCurrentAddress: (
    currentAddress: AddressStoreInterface["currentAddress"]
  ) => void;
  addressSuggestions: MapTilerFeature[];
  setAddressSuggestions: (addressSuggestions: MapTilerFeature[]) => void;
}
