// SPOT's colour bundles, from spot_colours.csv in the SPOT Chat API: a colour
// name matches every OSM colour value of its bundle.
export const COLOUR_BUNDLES: { descriptors: string[]; values: string[] }[] = [
  {
    descriptors: ["gray", "light gray", "dark gray", "ash", "slate", "charcoal", "dove gray", "gunmetal", "stone", "cloudy", "foggy", "smoky", "silver", "metallic gray", "steel", "platinum", "chrome", "pewter", "aluminum", "shimmering gray"],
    values: ["lightgrey", "grey", "light_gray", "gray", "darkgrey", "#999999", "#808080", "#cccccc", "dimgray", "slategray", "lightgray", "#666666", "#333333", "#787878", "#B2B1A4", "#696969", "#C0C0C0", "silver", "#708090", "#898885"],
  },
  {
    descriptors: ["black", "jet black", "charcoal black", "ebony", "pitch black", "onyx", "midnight", "coal"],
    values: ["black", "#000000", "#333333"],
  },
  {
    descriptors: ["white", "off-white", "ivory", "snow", "cream", "alabaster", "pearl", "eggshell", "chalk", "ghost white"],
    values: ["white", "#ffffff", "#FFFFFF"],
  },
  {
    descriptors: ["red", "light red", "dark red", "maroon", "scarlet", "crimson", "ruby", "cherry red", "fire engine red", "blood red", "vermilion", "rose red", "brick red", "burgundy", "wine", "dark red", "oxblood", "claret", "garnet"],
    values: ["red", "#ff0000", "maroon", "firebrick", "tomato", "#c75d4d"],
  },
  {
    descriptors: ["salmon", "peach", "coral", "light red", "pinkish-orange", "apricot", "blush", "rose", "pink", "orange", "tangerine", "pumpkin", "apricot", "amber", "burnt orange", "carrot", "persimmon", "copper"],
    values: ["salmon", "pink", "rose", "#ffb5b5", "#ff9e6b", "orange", "#be8988"],
  },
  {
    descriptors: ["brown", "chocolate", "coffee", "chestnut", "cinnamon", "mahogany", "tawny", "umber", "sepia", "mocha", "russet"],
    values: ["brown", "tan", "#a1634f", "#85552E", "#9c7870", "#be8988", "#c75d4d"],
  },
  {
    descriptors: ["beige", "tan", "khaki", "cream", "sand", "ecru", "buff", "fawn", "light brown", "pale taupe"],
    values: ["beige", "#dbd4c4", "#bbad8e", "#938870", "#eecfaf", "tan", "#B2B1A4", "#ffe0a0"],
  },
  {
    descriptors: ["blue", "light blue", "navy", "sky blue", "royal blue", "baby blue", "cobalt", "azure", "cerulean", "teal", "indigo"],
    values: ["blue", "#3399FF"],
  },
  {
    descriptors: ["green", "lime", "forest green", "olive", "emerald", "mint", "seafoam", "jade", "moss", "chartreuse", "sage", "grass green"],
    values: ["green", "darkgreen"],
  },
  {
    descriptors: ["yellow", "light yellow", "lemon", "gold", "mustard", "saffron", "pale yellow", "amber", "honey", "buttercup", "sunflower", "canary yellow"],
    values: ["yellow", "lightyellow", "#ffe0a0"],
  },
  {
    descriptors: ["purple", "dark purple", "light purple", "lavender", "lilac", "mauve", "violet", "amethyst", "plum", "eggplant", "orchid", "periwinkle", "grape", "magenta", "iris"],
    values: ["purple"],
  },
];
