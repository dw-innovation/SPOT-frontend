import { bbox } from "@turf/turf";
import type { BBox } from "geojson";
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { useMapAlert } from "@/components/map/mapAlerts/Context";
import MapAlert from "@/components/map/mapAlerts/MapAlert";
import { isPolygonWithinBoundingBox } from "@/lib/geoSpatialHelpers";
import { trackAction } from "@/lib/utils";
import useCustomSearchAreaStore from "@/stores/useCustomSearchAreaStore";
import useDisableMapInteraction from "@/stores/useDisableMapInteraction";
import useMapStore from "@/stores/useMapStore";

const PolygonOutsideAlert = () => {
  const customSearchArea = useCustomSearchAreaStore(
    (state) => state.customSearchArea
  );
  const setBounds = useMapStore((state) => state.setBounds);
  const map = useMap();
  const alertRef = useRef<HTMLDivElement>(null);
  const { setShowAlert } = useMapAlert();
  useDisableMapInteraction(alertRef);

  const handleFlyToBounds = () => {
    trackAction("map", "flyToResults");

    const newBBox = bbox({
      type: "Polygon",
      coordinates: [customSearchArea],
    });

    setBounds([
      [newBBox[0], newBBox[1]],
      [newBBox[2], newBBox[3]],
    ]);
  };

  useEffect(() => {
    const checkBounds = () => {
      const currentMapBoundsFlat = map
        .getBounds()
        .toBBoxString()
        .split(",")
        .map(Number);

      const currentMapBoundsBBox: BBox = [
        currentMapBoundsFlat[1],
        currentMapBoundsFlat[0],
        currentMapBoundsFlat[3],
        currentMapBoundsFlat[2],
      ];

      setShowAlert(
        !isPolygonWithinBoundingBox(customSearchArea, currentMapBoundsBBox)
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
  }, [customSearchArea, map]);

  return (
    <MapAlert
      handleAction={handleFlyToBounds}
      buttonText="Zoom to Area"
      alertText="Drawn search area is outside view."
    />
  );
};

export default PolygonOutsideAlert;
