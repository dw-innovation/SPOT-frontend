import React from "react";
import { TileLayer as LeafletTileLayer } from "react-leaflet";
import VectorTileLayer from "react-leaflet-vector-tile-layer";
import { getProtomapsStyle, registerPmtilesProtocol } from "./protomapsStyle";

type Props = {
  layerType: "vector" | "satellite" | "osm";
};

const TileLayer = ({ layerType }: Props) => {
  if (layerType === "vector") registerPmtilesProtocol();

  return (
    <>
      {layerType === "osm" && (
        <LeafletTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      )}

      {layerType === "vector" && (
        // wrapper types styleUrl as string, but maplibre-gl-leaflet accepts a style object too
        <VectorTileLayer styleUrl={getProtomapsStyle() as unknown as string} />
      )}

      {layerType === "satellite" && (
        <LeafletTileLayer
          url={`https://api.tomtom.com/map/1/tile/sat/main/{z}/{x}/{y}.jpg?key=${process.env.NEXT_PUBLIC_TOMTOM_KEY}`}
          attribution='© <a href="https://www.tomtom.com/">TomTom</a>'
          maxZoom={20}
          minZoom={0}
        />
      )}
    </>
  );
};

export default TileLayer;
