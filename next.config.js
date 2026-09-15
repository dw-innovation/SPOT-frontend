/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {
    resolveAlias: {
      // maplibre-gl >= 4 is ESM-only; the CJS require() chain in
      // react-leaflet-vector-tile-layer needs an explicit file alias.
      "maplibre-gl": "maplibre-gl/dist/maplibre-gl.mjs",
    },
  },
  webpack: (config) => {
    config.resolve.alias["maplibre-gl"] = "maplibre-gl/dist/maplibre-gl.mjs";
    return config;
  },
};

module.exports = nextConfig;
