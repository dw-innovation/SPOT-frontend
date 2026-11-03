import React from "react";

import AddressSearchBox from "@/components/addressSearch";
import Footer from "@/components/Footer";
import LayerSelector from "@/components/LayerSelector";
import PolygonOutsideAlert from "@/components/map/mapAlerts/alerts/CustomSearchAreaOutsideAlert";
import ResultsOutsideAlert from "@/components/map/mapAlerts/alerts/ResultsOutsideAlert";
import MapControls from "@/components/map/MapControls";
import MapLegend from "@/components/map/MapLegend";
import QueryPanel from "@/components/QueryPanel";
import SearchCurrentViewButton from "@/components/SearchCurrentViewButton";

const MapInterface = () => (
  <>
    <div className="absolute top-0 bottom-0 left-0 z-[400] flex items-stretch !font-sans p-2">
      <QueryPanel />
    </div>

    {/* Centred on its own rather than inside a w-full flex row: that row was
        an invisible bar across the whole top of the map, and since it comes
        after the query panel at the same z-index it swallowed every click in
        that band — including the panel's "New search" button. */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[400] p-2">
      <SearchCurrentViewButton />
    </div>

    <div className="absolute top-0 right-0 z-[400] flex items-start justify-between !font-sans p-2 w-fit">
      <div className="flex flex-col-reverse items-end gap-2 font-sans text-base">
        <div className="flex gap-2 flex-col items-end">
          <AddressSearchBox />
          <div className="flex gap-2 justify-end">
            <div className="flex flex-col items-end gap-2">
              <PolygonOutsideAlert />
              <ResultsOutsideAlert />
            </div>
            {/* The legend sits under the zoom slider; the bottom-left corner
                belongs to the query panel now that it spans the column. */}
            <div className="flex flex-col items-end gap-2">
              <MapControls />
              <LayerSelector />
              <MapLegend />
            </div>
          </div>
        </div>
      </div>
    </div>


    <div className="absolute bottom-0 right-0 z-[400] p-2">
      <Footer />
    </div>
  </>
);

export default MapInterface;
