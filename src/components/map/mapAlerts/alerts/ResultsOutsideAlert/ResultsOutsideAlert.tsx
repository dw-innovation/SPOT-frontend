import { bbox } from "@turf/turf";
import type { BBox, FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { useMapAlert } from "@/components/map/mapAlerts/Context";
import MapAlert from "@/components/map/mapAlerts/MapAlert";
import { allFeaturesWithinBoundingBox } from "@/lib/geoSpatialHelpers";
import useCustomSearchAreaStore from "@/stores/useCustomSearchAreaStore";
import useMapStore from "@/stores/useMapStore";
import useResultsStore from "@/stores/useResultsStore";

const ResultsOutsideAlert = () => {
  const geoJSON = useResultsStore((state) => state.geoJSON);
  const setBounds = useMapStore((state) => state.setBounds);
  const customSearchArea = useCustomSearchAreaStore(
    (state) => state.customSearchArea
  );
  const { setShowAlert } = useMapAlert();
  const map = useMap();

  const handleCloseClick = () => {
    setShowAlert(false);
  };

  const handleFlyToBounds = () => {
    if (!geoJSON) return;
    handleCloseClick();
    const newBBox = bbox(geoJSON);

    setBounds([
      [newBBox[1], newBBox[0]],
      [newBBox[3], newBBox[2]],
    ]);
  };

  useEffect(() => {
    !geoJSON || (geoJSON.features.length === 0 && setShowAlert(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJSON]);

  useEffect(() => {
    const checkBounds = () => {
      if (!geoJSON) {
        setShowAlert(false);
        return;
      }
      const currentMapBoundsFlat = map
        .getBounds()
        .toBBoxString()
        .split(",")
        .map(Number);

      const currentMapBoundsBBox: BBox = [
        currentMapBoundsFlat[0],
        currentMapBoundsFlat[1],
        currentMapBoundsFlat[2],
        currentMapBoundsFlat[3],
      ];

      setShowAlert(
        !allFeaturesWithinBoundingBox(
          geoJSON as FeatureCollection<Geometry, GeoJsonProperties>,
          currentMapBoundsBBox
        )
      );
    };

    const onMoveEnd = () => {
      checkBounds();
    };

    map.on("moveend", onMoveEnd);

    return () => {
      map.off("moveend", onMoveEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSearchArea, map, geoJSON]);

  return (
    <MapAlert
      handleAction={handleFlyToBounds}
      alertText="Some results are outside the current view."
      buttonText="Zoom to Results"
    />
  );
};

export default ResultsOutsideAlert;
