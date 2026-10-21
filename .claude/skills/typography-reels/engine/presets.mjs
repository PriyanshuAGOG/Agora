// Design tokens for the "Zero to Something" typography reels.
// Every value here was measured from Days 1-5 (see references/style-bible.md).

export const COLORS = {
  bg: "#FCFCFC", // canvas (measured #fcfcfc)
  ink: "#000000", // primary text
  mint: "#0CD2BA", // signature accent (measured #0cd2ba)
  pale: "#DEFCFC", // giant DAY watermark (measured #defcfc)
  red: "#E41E24", // reaction marks on stickers (.!!? OMG!)
  white: "#FFFFFF",
  grey: "#5A5A5A",
};

// [family, file, weight, style]
export const FONT_FACES = [
  ["Oswald", "oswald-latin-500-normal.woff2", 500, "normal"],
  ["Oswald", "oswald-latin-600-normal.woff2", 600, "normal"],
  ["Oswald", "oswald-latin-700-normal.woff2", 700, "normal"],
  ["Bebas Neue", "bebas-neue-latin-400-normal.woff2", 400, "normal"],
  ["Barlow Condensed", "barlow-condensed-latin-700-italic.woff2", 700, "italic"],
  ["Barlow Condensed", "barlow-condensed-latin-800-italic.woff2", 800, "italic"],
  ["Barlow Condensed", "barlow-condensed-latin-800-normal.woff2", 800, "normal"],
  ["Playfair Display", "playfair-display-latin-400-normal.woff2", 400, "normal"],
  ["Playfair Display", "playfair-display-latin-400-italic.woff2", 400, "italic"],
  ["Playfair Display", "playfair-display-latin-700-normal.woff2", 700, "normal"],
  ["Playfair Display", "playfair-display-latin-900-italic.woff2", 900, "italic"],
  ["Montserrat", "montserrat-latin-300-normal.woff2", 300, "normal"],
  ["Montserrat", "montserrat-latin-300-italic.woff2", 300, "italic"],
  ["Montserrat", "montserrat-latin-400-normal.woff2", 400, "normal"],
  ["Montserrat", "montserrat-latin-700-normal.woff2", 700, "normal"],
  ["Montserrat", "montserrat-latin-800-normal.woff2", 800, "normal"],
  ["Montserrat", "montserrat-latin-800-italic.woff2", 800, "italic"],
  ["Montserrat", "montserrat-latin-900-normal.woff2", 900, "normal"],
  ["Montserrat", "montserrat-latin-900-italic.woff2", 900, "italic"],
  ["Open Sans", "open-sans-latin-300-italic.woff2", 300, "italic"],
  ["Open Sans", "open-sans-latin-400-normal.woff2", 400, "normal"],
  ["Open Sans", "open-sans-latin-400-italic.woff2", 400, "italic"],
  ["Open Sans", "open-sans-latin-600-italic.woff2", 600, "italic"],
  ["Merriweather", "merriweather-latin-400-normal.woff2", 400, "normal"],
  ["Merriweather", "merriweather-latin-700-italic.woff2", 700, "italic"],
  ["Merriweather", "merriweather-latin-900-normal.woff2", 900, "normal"],
  ["Poppins", "poppins-latin-400-normal.woff2", 400, "normal"],
  ["Poppins", "poppins-latin-600-normal.woff2", 600, "normal"],
  ["Poppins", "poppins-latin-700-normal.woff2", 700, "normal"],
  ["Poppins", "poppins-latin-800-normal.woff2", 800, "normal"],
  ["Poppins", "poppins-latin-900-normal.woff2", 900, "normal"],
  ["Poppins", "poppins-latin-900-italic.woff2", 900, "italic"],
  ["Titan One", "titan-one-latin-400-normal.woff2", 400, "normal"],
  ["Caveat", "caveat-latin-700-normal.woff2", 700, "normal"],
  ["Kaushan Script", "kaushan-script-latin-400-normal.woff2", 400, "normal"],
  ["Pixelify Sans", "pixelify-sans-latin-700-normal.woff2", 700, "normal"],
  ["Cinzel Decorative", "cinzel-decorative-latin-700-normal.woff2", 700, "normal"],
  ["Cinzel Decorative", "cinzel-decorative-latin-900-normal.woff2", 900, "normal"],
  ["Oranienbaum", "oranienbaum-latin-400-normal.woff2", 400, "normal"],
  ["Anton", "anton-latin-400-normal.woff2", 400, "normal"],
  ["League Gothic", "league-gothic-latin-400-normal.woff2", 400, "normal"],
  ["Righteous", "righteous-latin-400-normal.woff2", 400, "normal"],
  ["Abril Fatface", "abril-fatface-latin-400-normal.woff2", 400, "normal"],
  ["Archivo Black", "archivo-black-latin-400-normal.woff2", 400, "normal"],
];

// Type roles. f=family, w=weight, s=style, up=uppercase, ls=letter-spacing (em), lh=line-height.
// The comment names the line in Days 1-5 each role was matched against.
export const STYLES = {
  label: { f: "Oswald", w: 600, lh: 1.05 }, // "We Have No Idea", "And Honestly There"
  "label-caps": { f: "Oswald", w: 600, up: true, lh: 1.05 }, // "THAN I EXPECTED", "AND MOST IMPORTANTLY"
  "label-bold": { f: "Oswald", w: 700, lh: 1.0 }, // "Of Going From" (Day 3)
  poster: { f: "Bebas Neue", w: 400, up: true, ls: 0.005, lh: 0.92 }, // "WHAT WE'RE", "THAT'S WHAT WE'RE"
  blast: { f: "Barlow Condensed", w: 800, s: "italic", up: true, ls: -0.005, lh: 0.9 }, // "GOING TO BUILD", "ZERO TO SOMETHING"
  "blast-upright": { f: "Barlow Condensed", w: 800, up: true, lh: 0.9 },
  geo: { f: "Montserrat", w: 800, lh: 1.0 }, // "THIS IS DAY 1 OF", "SEE YOU TOMORROW", "E COMMERCE?"
  "geo-black": { f: "Montserrat", w: 900, lh: 1.0 },
  "geo-italic": { f: "Montserrat", w: 900, s: "italic", lh: 1.0 }, // "To Research", "STARTING A WHOLE NEW CAREER?"
  "geo-light": { f: "Montserrat", w: 300, lh: 1.0 }, // "BRAND", "DROPSHIPPING?" (italic variant)
  "geo-light-italic": { f: "Montserrat", w: 300, s: "italic", lh: 1.0 },
  "geo-regular": { f: "Montserrat", w: 400, lh: 1.0 },
  elegant: { f: "Playfair Display", w: 400, lh: 1.0 }, // "WERE WAY MORE IDEAS", "Whether People Were Actually"
  "elegant-italic": { f: "Playfair Display", w: 400, s: "italic", lh: 1.0 }, // "even a"
  "elegant-bold": { f: "Playfair Display", w: 700, lh: 1.0 }, // "I Started Learning"
  swash: { f: "Playfair Display", w: 900, s: "italic", lh: 1.0 }, // "Instead?"
  airy: { f: "Open Sans", w: 300, s: "italic", lh: 1.1 }, // "Figuring Out Tomorrow", "After Two Minutes"
  plain: { f: "Open Sans", w: 400, lh: 1.1 }, // "So I Used"
  "plain-italic": { f: "Open Sans", w: 400, s: "italic", lh: 1.1 },
  "plain-semi-italic": { f: "Open Sans", w: 600, s: "italic", lh: 1.1 },
  bookish: { f: "Merriweather", w: 900, lh: 1.0 }, // "REEL"
  "bookish-italic": { f: "Merriweather", w: 700, s: "italic", lh: 1.05 }, // "That Made Me Stop Scrolling"
  "bookish-regular": { f: "Merriweather", w: 400, lh: 1.05 }, // "One Random Reel And Suddenly"
  "skinny-serif": { f: "Oranienbaum", w: 400, lh: 0.95 }, // "Crowded", "WEB AGENCY?", "is a founder now"
  gothic: { f: "League Gothic", w: 400, up: true, lh: 0.92 }, // condensed caps alt to poster
  block: { f: "Anton", w: 400, lh: 0.9 }, // big numerals "3", "4"
  chunky: { f: "Titan One", w: 400, up: true, ls: 0.12, lh: 1.0 }, // "COMPLETE DIY KIT"
  hand: { f: "Caveat", w: 700, lh: 1.0 }, // "Okay"
  script: { f: "Kaushan Script", w: 400, lh: 1.1 }, // "PHOLLOW"
  pixel: { f: "Pixelify Sans", w: 700, lh: 0.9 }, // pixel numeral "2"
  victorian: { f: "Cinzel Decorative", w: 900, lh: 1.0 }, // outlined "DAY" (Day 5)
  "victorian-light": { f: "Cinzel Decorative", w: 700, lh: 1.0 },
  retro: { f: "Righteous", w: 400, lh: 1.0 }, // "FOLLOW" (Day 3)
  fatface: { f: "Abril Fatface", w: 400, lh: 1.0 },
  heavy: { f: "Archivo Black", w: 400, lh: 1.0 }, // "What If We Made A", "This Is"
  round: { f: "Poppins", w: 800, lh: 1.0 }, // "SEE YOU TOMORROW" alt, "Follow"
  "round-semi": { f: "Poppins", w: 600, lh: 1.0 },
  "round-black": { f: "Poppins", w: 900, lh: 1.0 },
  "round-black-italic": { f: "Poppins", w: 900, s: "italic", lh: 1.0 },
  "round-regular": { f: "Poppins", w: 400, lh: 1.0 },
  // fixed chrome
  watermark: { f: "Poppins", w: 900, ls: -0.02, lh: 1.0 },
  handle: { f: "Poppins", w: 700, lh: 1.0 },
};

// Sticker / tag defaults
export const DEFAULTS = {
  width: 1920,
  height: 1080,
  fps: 30,
  handle: "@your.soulpreneur",
  watermarkWidth: 0.77, // watermark spans ~77% of frame width (measured)
  watermarkY: 0.49, // vertical centre of the watermark (fraction of H)
  handleSize: 3.2, // % of H
};
