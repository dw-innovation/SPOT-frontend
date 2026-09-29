import L from "leaflet";
import { createRoot } from "react-dom/client";

import Popup from "@/components/map/Popup";
import { Set } from "@/types/stores/ResultsStore.interface";

import { trackAction } from "./utils";

export const getSetIndex = (setName: string | undefined, sets: Set[]) =>
  sets.findIndex((set) => set.name === setName);

export const getSetColor = (
  setIndex: number,
  currentNodeId: string,
  sets: Set[],
  spotNodes: string[]
) => {
  if (sets[setIndex] && sets[setIndex].visible) {
    if (sets[setIndex].highlighted || spotNodes.includes(currentNodeId)) {
      return "#C0392B";
    } else {
      return "#fff";
    }
  } else {
    return "transparent";
  }
};

export const getSetFillOpacity = (setIndex: number, sets: Set[]) => {
  return sets[setIndex] && sets[setIndex].visible ? 0.8 : 0;
};

export const getWeight = (
  setIndex: number,
  currentNodeId: string,
  sets: Set[],
  spotNodes: string[]
) => {
  return (sets[setIndex] && sets[setIndex].highlighted) ||
    spotNodes.includes(currentNodeId)
    ? 2.5
    : 1;
};

export const resetPreviousLayerStyle = (
  previousClickedLayer: React.MutableRefObject<L.CircleMarker<any> | null>
) => {
  if (previousClickedLayer.current) {
    previousClickedLayer.current.setStyle({
      color: "#3388ff",
    });
  }
};

export const styleFunction = (
  sets: Set[],
  spotNodes: string[],
  feature?: GeoJSON.Feature
) => {
  if (!feature) return {};

  const setIndex = getSetIndex(feature.properties?.set_name, sets);

  let paneName;

  if (
    feature?.geometry?.type === "Point" ||
    feature?.geometry?.type === "MultiPoint"
  ) {
    paneName = "points";
  } else if (
    feature?.geometry?.type === "LineString" ||
    feature?.geometry?.type === "MultiLineString"
  ) {
    paneName = "lineStrings";
  } else if (
    feature?.geometry?.type === "Polygon" ||
    feature?.geometry?.type === "MultiPolygon"
  ) {
    paneName = "polygons";
  }

  let styleOptions: L.PathOptions = {
    fillColor: sets[setIndex]?.fillColor ?? "#000",
    color: getSetColor(setIndex, feature.properties?.osm_ids, sets, spotNodes),
    weight: getWeight(setIndex, feature.properties?.osm_ids, sets, spotNodes),
    opacity: 1,
    fillOpacity: 0.8,
    pane: paneName,
  };

  if (feature.geometry.type === "LineString") {
    styleOptions = {
      ...styleOptions,
      weight: 2,
      opacity: 0.8,
      color: sets[setIndex]?.fillColor ?? "#000",
    };
  }

  return styleOptions;
};

export const onFeatureClick = (
  e: L.LeafletEvent,
  setStreetViewCoordinates: (streetViewCoordinates: L.LatLngLiteral) => void,
  previousClickedLayer: React.MutableRefObject<L.CircleMarker<any> | null>
) => {
  const layer = e.target as L.CircleMarker;

  if (layer.feature && layer.feature.properties.center) {
    trackAction("click", "mapFeature", layer.feature.properties.osm_ids);
    setStreetViewCoordinates({
      lat: layer.feature.properties.center.coordinates[1],
      lng: layer.feature.properties.center.coordinates[0],
    });
  }

  resetPreviousLayerStyle(previousClickedLayer);
  layer.setStyle({ color: "#ff0000" });
  previousClickedLayer.current = layer;
};

export const pointToLayer = (
  _: GeoJSON.Feature<GeoJSON.Point>,
  latlng: L.LatLng,
  sets: Set[]
) => {
  const setIndex = getSetIndex(_.properties?.set_name, sets);
  const markerOptions: L.CircleMarkerOptions = {
    radius: 12,
    fillColor: sets[setIndex].fillColor,
    color: "#fff",
    weight: 5,
    opacity: 1,
    fillOpacity: 0.8,
  };

  return L.circleMarker(latlng, markerOptions);
};

export const onEachFeature = (
  feature: GeoJSON.Feature,
  layer: L.Layer,
  setStreetViewCoordinates: (streetViewCoordinates: L.LatLngLiteral) => void,
  previousClickedLayer: React.MutableRefObject<L.CircleMarker<any> | null>
) => {
  if (feature.properties) {
    bindPopupToLayer(feature, layer);
  }
  layer.on("click", (e) =>
    onFeatureClick(e, setStreetViewCoordinates, previousClickedLayer)
  );
};

const bindPopupToLayer = (feature: GeoJSON.Feature, layer: L.Layer) => {
  const popupContainer = document.createElement("div");
  const root = createRoot(popupContainer);

  layer.bindPopup(popupContainer, { maxWidth: 400 });

  layer.on("popupopen", () => {
    root.render(<Popup feature={feature} />);
  });
};
