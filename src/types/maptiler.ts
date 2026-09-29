import type { Point } from "geojson";

/**
 * A feature from the MapTiler geocoding API, as proxied by /api/geocode.
 *
 * Note this is *not* Nominatim — that is a separate service used by
 * fetchAreas() and typed in ./nominatim.ts. The two have different shapes.
 *
 * bbox, center and place_name_en were present on every feature returned for
 * the `types` filter /api/geocode sends, so they are typed as required.
 */
export interface MapTilerFeature {
  id: string;
  type: "Feature";
  geometry: Point;
  /** [lng, lat] — GeoJSON order. The app uses [lat, lng] for Leaflet bounds. */
  center: [number, number];
  /** [minLng, minLat, maxLng, maxLat] */
  bbox: [number, number, number, number];
  place_name: string;
  place_name_en: string;
  place_type: string[];
  place_type_name?: string[];
  text: string;
  text_en?: string;
  relevance: number;
  properties: Record<string, unknown>;
  context?: { id: string; text: string; text_en?: string }[];
}
