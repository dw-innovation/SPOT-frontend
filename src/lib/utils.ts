import tokml from "@jlandrum/tokml";
import { area } from "@turf/turf";
import { type ClassValue, clsx } from "clsx";
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import { LatLngLiteral } from "leaflet";
import _ from "lodash";
import { twMerge } from "tailwind-merge";

import usePersistedStore from "@/stores/usePersistedStore";
import useResultsStore from "@/stores/useResultsStore";
import { Node, SpotQuery } from "@/types/spotQuery";

import { FILL_COLORS } from "./const/colors";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const saveResultsToFile = (format: "geojson" | "kml") => {
  let fileData = "";
  const geojson = useResultsStore.getState().geoJSON;

  if (!geojson) return;

  const cleanedGeoJSON = cleanGeoJSON(geojson);

  if (format === "geojson") {
    fileData = JSON.stringify(cleanedGeoJSON);
  } else {
    const kml = tokml(cleanedGeoJSON);
    fileData = kml;
  }
  const blob = new Blob([fileData], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `export.${format}`;
  link.href = url;
  link.click();
};

const cleanGeoJSON = (
  geoJSON: FeatureCollection<Geometry, GeoJsonProperties>
): FeatureCollection<Geometry, GeoJsonProperties> => {
  const propsToRemove = [
    "center",
    "primary_osm_ids",
    "primitive_type",
    "set_name",
  ];

  geoJSON.features = geoJSON.features.map((feature) => ({
    ...feature,
    properties: _.omit(feature.properties, propsToRemove),
  }));

  return geoJSON;
};

export const createGoogleMapsEmbedUrl = (coordinates: LatLngLiteral) => {
  if (!coordinates) {
    return undefined;
  }

  const baseUrl = "https://www.google.com/maps/embed/v1/streetview";
  const coordinatesString = `${String(coordinates.lat)},${String(
    coordinates.lng
  )}`;
  const url = `${baseUrl}?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&location=${coordinatesString}`;

  return url;
};

export const checkInputType = (input: string): "address" | "coordinates" => {
  // DMS (Degrees, Minutes, Seconds) format: 40° 26' 46" N 79° 58' 56" W
  const dmsRegex =
    /^(\d{1,3}°\s\d{1,2}'\s\d{1,2}(\.\d+)?["]\s[N|S])\s+(\d{1,3}°\s\d{1,2}'\s\d{1,2}(\.\d+)?["]\s[E|W])$/;

  // DM (Degrees, Minutes) format: 40° 26.767' N 79° 58.933' W
  const dmRegex =
    /^(\d{1,3}°\s\d{1,2}(\.\d+)?'\s[N|S])\s+(\d{1,3}°\s\d{1,2}(\.\d+)?'\s[E|W])$/;

  // DD (Decimal Degrees) format: 40.446195, -79.948862
  const ddRegex = /^(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/;

  if (dmsRegex.test(input) || dmRegex.test(input) || ddRegex.test(input)) {
    return "coordinates";
  }

  return "address";
};

export const calculateSurface = (polgyon: Polygon | MultiPolygon): number => {
  if (polgyon.type !== "Polygon" && polgyon.type !== "MultiPolygon") {
    return 0;
  }
  return Math.round(area(polgyon) / 1000000);
};

type PrefixKeys<Obj extends Record<string, any>, Prefix extends string> = {
  [K in keyof Obj as `${Prefix}${Capitalize<string & K>}`]: Obj[K];
};

export const prefixKeys = <
  Obj extends Record<string, any>,
  Prefix extends string
>(
  obj: Obj,
  prefix: Prefix
): PrefixKeys<Obj, Prefix> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`,
      value,
    ])
  ) as PrefixKeys<Obj, Prefix>;
};

export const capitalize = (str: string) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const bboxToGeoJSON = (bbox: number[]) => {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [minLon, minLat],
          [maxLon, minLat],
          [maxLon, maxLat],
          [minLon, maxLat],
          [minLon, minLat],
        ],
      ],
    },
    properties: {},
  };
};

export const distanceToMeters = (distanceStr: string): number => {
  const conversionRates: { [unit: string]: number } = {
    m: 1,
    km: 1000,
    ft: 0.3048,
    mile: 1609.34,
    miles: 1609.34,
    mi: 1609.34,
    yd: 0.9144,
    in: 0.0254,
    cm: 0.01,
    mm: 0.001,
  };

  const match = /([\d.]+)\s?([a-zA-Z]*)/.exec(distanceStr);

  if (!match) {
    throw new Error(`Invalid format: ${distanceStr}`);
  }

  const valueStr = match[1];
  const unit = match[2]?.toLowerCase();

  if (!unit) {
    return parseInt(valueStr);
  }

  if (!conversionRates[unit]) {
    throw new Error(`Unknown distance unit: ${unit}`);
  }

  const value = parseFloat(valueStr);
  const distanceMeters = value * conversionRates[unit];

  return distanceMeters;
};

export const setResults = (data: any) => {
  const state = useResultsStore.getState();
  const {
    clearGeoJSON,
    clearSets,
    clearSpots,
    setGeoJSON,
    setSets,
    setSearchArea,
    setSpots,
  } = state;

  clearGeoJSON();
  clearSets();
  clearSpots();

  const existingSets = state.sets;
  const availableColors = FILL_COLORS.filter(
    (color) => !existingSets.map((set) => set.fillColor).includes(color)
  );
  const shuffledColors = [...availableColors].sort(() => Math.random() - 0.5);

  const newSets = data.sets.distinct_sets.map((setName: any, index: number) => {
    const existingSet = existingSets.find((set) => set.name === setName);
    return {
      id: index,
      name: setName,
      visible: true,
      highlighted: false,
      fillColor: existingSet ? existingSet.fillColor : shuffledColors[index],
    };
  });

  setSets(newSets);

  setGeoJSON(data.results);
  const parsedGeoJSON =
    data.area.type === "bbox"
      ? bboxToGeoJSON(data.area.bbox)
      : JSON.parse(data.area.geometry);

  setSearchArea(parsedGeoJSON);
  setSpots(data.spots);
};

export const expSlider = (
  value: number,
  min: number,
  max: number,
  scale: number = 0.8
): number => {
  const base = Math.pow(max / min, 1 / ((max - min) * scale));
  const expTerm = Math.pow(base, (value - min) * scale) * min;
  return Math.round(expTerm);
};

export const logSlider = (
  value: number,
  min: number,
  max: number,
  scale: number = 0.8
) => {
  const base = Math.pow(max / min, 1 / ((max - min) * scale));
  return Math.round(Math.log(value / min) / (Math.log(base) * scale) + min);
};

export const trackAction = async (
  category: string,
  action?: string,
  value?: string
) => {
  type MatomoParams = {
    idsite: string | undefined;
    rec: number;
    rand: number;
    res: string;
    ua: string;
    url: string;
    e_c: string;
    e_a?: string;
    e_n?: string;
  };
  const trackingEnabled = usePersistedStore.getState().trackingEnabled;
  if (!trackingEnabled) return;

  const params: MatomoParams = {
    idsite: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
    rec: 1,
    url: process.env.NEXT_PUBLIC_SITE_URL || "",
    rand: Math.floor(Math.random() * 10000000),
    res: `${window?.screen?.availWidth}x${window?.screen?.availHeight}`,
    ua: window?.navigator?.userAgent,
    e_c: category,
  };

  if (action) params.e_a = action;
  if (value) params.e_n = value;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });

  await fetch(`${process.env.NEXT_PUBLIC_MATOMO_URL}?${searchParams}`);
};

export const createMailtoLink = ({
  to,
  cc,
  bcc,
  subject,
  body,
}: {
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body?: string;
}) => {
  let link = `mailto:${encodeURIComponent(to)}`;

  const params = [];

  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  if (bcc) params.push(`bcc=${encodeURIComponent(bcc)}`);
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    link += `?${params.join("&")}`;
  }

  return link;
};

export const insertBBox = (
  spotQuery: SpotQuery,
  bounds: number[]
): SpotQuery => ({
  ...spotQuery,
  area: {
    type: "bbox",
    bbox: bounds,
  },
});

export const findNameById = (id: number, nodes: Node[]) => {
  const node = nodes.find((node) => node.id === id);
  return node ? node.name : "";
};
