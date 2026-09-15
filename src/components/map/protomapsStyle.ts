import { layers, namedFlavor } from "@protomaps/basemaps";
import { addProtocol, type StyleSpecification } from "maplibre-gl";
import { Protocol } from "pmtiles";

const PMTILES_URL = process.env.NEXT_PUBLIC_PMTILES_URL ?? "";
const FLAVOR = process.env.NEXT_PUBLIC_PROTOMAPS_FLAVOR ?? "light";
const LANG = process.env.NEXT_PUBLIC_PROTOMAPS_LANG ?? "en";

let protocolRegistered = false;

// maplibre needs the pmtiles:// protocol registered once before any style using it is loaded
export const registerPmtilesProtocol = () => {
  if (protocolRegistered) return;
  addProtocol("pmtiles", new Protocol().tile);
  protocolRegistered = true;
};

export const getProtomapsStyle = (): StyleSpecification => ({
  version: 8,
  glyphs:
    "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${FLAVOR}`,
  sources: {
    protomaps: {
      type: "vector",
      url: `pmtiles://${PMTILES_URL}`,
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: layers("protomaps", namedFlavor(FLAVOR), { lang: LANG }),
});
