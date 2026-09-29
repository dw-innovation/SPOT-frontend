import { prefixKeys } from "../../utils";
import { STRINGS as commonStrings } from "./common";
import { STRINGS as downloadDialogStrings } from "./downloadDialog";
import { STRINGS as errorDialogStrings } from "./errorDialog";
import { STRINGS as filtersDialogStrings } from "./filtersDialog";
import { STRINGS as loadSessionDialogStrings } from "./loadSessionDialog";
import { STRINGS as mapLegendStrings } from "./map/mapLegend";
import { STRINGS as actionMenuStrings } from "./menus/actions";
import { STRINGS as settingsMenuStrings } from "./menus/settings";
import { STRINGS as queryOSMDialogStrings } from "./queryOSMDialog";
import { STRINGS as saveSessionDialogStrings } from "./saveSessionDialog";
import { STRINGS as spotQueryDialogStrings } from "./spotQueryDialog";

export const STRINGS = {
  ...prefixKeys(actionMenuStrings, "actionMenu"),
  ...prefixKeys(commonStrings, "common"),
  ...prefixKeys(downloadDialogStrings, "downloadDialog"),
  ...prefixKeys(errorDialogStrings, "errorDialog"),
  ...prefixKeys(filtersDialogStrings, "filtersDialog"),
  ...prefixKeys(spotQueryDialogStrings, "spotQueryDialog"),
  ...prefixKeys(loadSessionDialogStrings, "loadSessionDialog"),
  ...prefixKeys(mapLegendStrings, "mapLegend"),
  ...prefixKeys(queryOSMDialogStrings, "queryOSMDialog"),
  ...prefixKeys(saveSessionDialogStrings, "saveSessionDialog"),
  ...prefixKeys(settingsMenuStrings, "settingsMenu"),
};
