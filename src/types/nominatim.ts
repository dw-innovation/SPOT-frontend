import type { Geometry, MultiPolygon, Polygon } from "geojson";

export interface NominatimPlace {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
  /** Nominatim also returns Point and LineString results, not only areas. */
  geojson: Geometry;
}

/**
 * A place whose geometry is an actual area. fetchAreas() narrows to these, so
 * the search-area geometry can be used without a cast.
 */
export type NominatimArea = Omit<NominatimPlace, "geojson"> & {
  geojson: Polygon | MultiPolygon;
};
