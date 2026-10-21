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
  // v2 accents: use sparingly for punchlines (highlighter swipes, alarms, emphasis)
  yellow: "#FFD60A", // highlighter / marker
  pink: "#FF4F8B",
  blue: "#2F80FF",
  orange: "#FF8A00",
  purple: "#8E5CFF",
  "mint-dark": "#09A592",
  "mint-soft": "#BDF5EC",
  "ink-soft": "#2B2B2B",
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
  // v2: display & personality fonts
  ["Bangers", "bangers-latin-400-normal.woff2", 400, "normal"],
  ["Luckiest Guy", "luckiest-guy-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Wet Paint", "rubik-wet-paint-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Glitch", "rubik-glitch-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Mono One", "rubik-mono-one-latin-400-normal.woff2", 400, "normal"],
  ["Bungee Shade", "bungee-shade-latin-400-normal.woff2", 400, "normal"],
  ["Monoton", "monoton-latin-400-normal.woff2", 400, "normal"],
  ["Pacifico", "pacifico-latin-400-normal.woff2", 400, "normal"],
  ["Permanent Marker", "permanent-marker-latin-400-normal.woff2", 400, "normal"],
  ["Shrikhand", "shrikhand-latin-400-normal.woff2", 400, "normal"],
  ["Ultra", "ultra-latin-400-normal.woff2", 400, "normal"],
  ["Bowlby One", "bowlby-one-latin-400-normal.woff2", 400, "normal"],
  ["Black Ops One", "black-ops-one-latin-400-normal.woff2", 400, "normal"],
  ["Press Start 2P", "press-start-2p-latin-400-normal.woff2", 400, "normal"],
  ["Fredoka", "fredoka-latin-700-normal.woff2", 700, "normal"],
  ["Syne", "syne-latin-800-normal.woff2", 800, "normal"],
  ["Unbounded", "unbounded-latin-900-normal.woff2", 900, "normal"],
  ["Unbounded", "unbounded-latin-300-normal.woff2", 300, "normal"],
  ["Gloock", "gloock-latin-400-normal.woff2", 400, "normal"],
  ["DM Serif Display", "dm-serif-display-latin-400-normal.woff2", 400, "normal"],
  ["DM Serif Display", "dm-serif-display-latin-400-italic.woff2", 400, "italic"],
  ["Instrument Serif", "instrument-serif-latin-400-normal.woff2", 400, "normal"],
  ["Instrument Serif", "instrument-serif-latin-400-italic.woff2", 400, "italic"],
  ["Fraunces", "fraunces-latin-900-italic.woff2", 900, "italic"],
  ["Fraunces", "fraunces-latin-300-italic.woff2", 300, "italic"],
  ["Space Grotesk", "space-grotesk-latin-700-normal.woff2", 700, "normal"],
  ["Great Vibes", "great-vibes-latin-400-normal.woff2", 400, "normal"],
  ["Yellowtail", "yellowtail-latin-400-normal.woff2", 400, "normal"],
  ["Rock Salt", "rock-salt-latin-400-normal.woff2", 400, "normal"],
  ["Gochi Hand", "gochi-hand-latin-400-normal.woff2", 400, "normal"],
  ["Chewy", "chewy-latin-400-normal.woff2", 400, "normal"],
  ["Lilita One", "lilita-one-latin-400-normal.woff2", 400, "normal"],
  ["Passion One", "passion-one-latin-900-normal.woff2", 900, "normal"],
  ["Alfa Slab One", "alfa-slab-one-latin-400-normal.woff2", 400, "normal"],
  ["Bodoni Moda", "bodoni-moda-latin-900-italic.woff2", 900, "italic"],
  ["Bodoni Moda", "bodoni-moda-latin-400-normal.woff2", 400, "normal"],
  ["Poiret One", "poiret-one-latin-400-normal.woff2", 400, "normal"],
  ["Major Mono Display", "major-mono-display-latin-400-normal.woff2", 400, "normal"],
  ["Silkscreen", "silkscreen-latin-700-normal.woff2", 700, "normal"],
  ["Rampart One", "rampart-one-latin-400-normal.woff2", 400, "normal"],
  ["Nabla", "nabla-latin-400-normal.woff2", 400, "normal"],
  ["Honk", "honk-latin-400-normal.woff2", 400, "normal"],
  ["Bungee Spice", "bungee-spice-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Bubbles", "rubik-bubbles-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Puddles", "rubik-puddles-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Doodle Shadow", "rubik-doodle-shadow-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Scribble", "rubik-scribble-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Beastly", "rubik-beastly-latin-400-normal.woff2", 400, "normal"],
  ["Rubik Vinyl", "rubik-vinyl-latin-400-normal.woff2", 400, "normal"],
  ["Climate Crisis", "climate-crisis-latin-400-normal.woff2", 400, "normal"],
  ["Sedgwick Ave Display", "sedgwick-ave-display-latin-400-normal.woff2", 400, "normal"],
  ["Caprasimo", "caprasimo-latin-400-normal.woff2", 400, "normal"],
  ["Bricolage Grotesque", "bricolage-grotesque-latin-800-normal.woff2", 800, "normal"],
  ["Archivo Narrow", "archivo-narrow-latin-700-italic.woff2", 700, "italic"],
  ["Londrina Solid", "londrina-solid-latin-900-normal.woff2", 900, "normal"],
  ["Londrina Shadow", "londrina-shadow-latin-400-normal.woff2", 400, "normal"],
  ["Modak", "modak-latin-400-normal.woff2", 400, "normal"],
  ["Baloo 2", "baloo-2-latin-800-normal.woff2", 800, "normal"],
  ["Sniglet", "sniglet-latin-800-normal.woff2", 800, "normal"],
  ["Comic Neue", "comic-neue-latin-700-normal.woff2", 700, "normal"],
  ["Rammetto One", "rammetto-one-latin-400-normal.woff2", 400, "normal"],
  ["Bungee", "bungee-latin-400-normal.woff2", 400, "normal"],
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
  titan: { f: "Titan One", w: 400, lh: 1.0 }, // DIY brand headline face (Day 9)
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
  // v2 personality roles — use freely for font-as-meaning (see style-bible §4b)
  "comic": { f: "Bangers", w: 400, ls: 0.03, lh: 0.95 },
  "cartoon": { f: "Luckiest Guy", w: 400, lh: 1.0 },
  "drip": { f: "Rubik Wet Paint", w: 400 },
  "glitchy": { f: "Rubik Glitch", w: 400 },
  "mono-fat": { f: "Rubik Mono One", w: 400 },
  "shade": { f: "Bungee Shade", w: 400 },
  "neon": { f: "Monoton", w: 400 },
  "retro-script": { f: "Pacifico", w: 400, lh: 1.2 },
  "marker": { f: "Permanent Marker", w: 400 },
  "groovy": { f: "Shrikhand", w: 400 },
  "ultra": { f: "Ultra", w: 400 },
  "bowl": { f: "Bowlby One", w: 400 },
  "stencil": { f: "Black Ops One", w: 400 },
  "arcade": { f: "Press Start 2P", w: 400, lh: 1.2 },
  "bubbly": { f: "Fredoka", w: 700 },
  "syne": { f: "Syne", w: 800 },
  "wide": { f: "Unbounded", w: 900 },
  "wide-light": { f: "Unbounded", w: 300 },
  "gloock": { f: "Gloock", w: 400 },
  "didot": { f: "DM Serif Display", w: 400 },
  "didot-italic": { f: "DM Serif Display", w: 400, s: "italic" },
  "editorial": { f: "Instrument Serif", w: 400 },
  "editorial-italic": { f: "Instrument Serif", w: 400, s: "italic" },
  "soft-serif": { f: "Fraunces", w: 900, s: "italic" },
  "soft-serif-light": { f: "Fraunces", w: 300, s: "italic" },
  "tech": { f: "Space Grotesk", w: 700 },
  "calligraphy": { f: "Great Vibes", w: 400, lh: 1.25 },
  "signature": { f: "Yellowtail", w: 400, lh: 1.2 },
  "scrawl": { f: "Rock Salt", w: 400, lh: 1.4 },
  "kid": { f: "Gochi Hand", w: 400 },
  "chewy": { f: "Chewy", w: 400 },
  "lilita": { f: "Lilita One", w: 400 },
  "passion": { f: "Passion One", w: 900, lh: 0.9 },
  "slab": { f: "Alfa Slab One", w: 400 },
  "bodoni": { f: "Bodoni Moda", w: 900, s: "italic" },
  "bodoni-light": { f: "Bodoni Moda", w: 400 },
  "deco": { f: "Poiret One", w: 400 },
  "mono-display": { f: "Major Mono Display", w: 400 },
  "pixel-bold": { f: "Silkscreen", w: 700 },
  "outline-3d": { f: "Rampart One", w: 400 },
  // colour fonts (COLRv1): their palettes may render flat/black in headless renders — snapshot before relying on them
  "color-3d": { f: "Nabla", w: 400, colorFont: true },
  "honk": { f: "Honk", w: 400, colorFont: true },
  "spice": { f: "Bungee Spice", w: 400, colorFont: true },
  "bubbles": { f: "Rubik Bubbles", w: 400 },
  "puddles": { f: "Rubik Puddles", w: 400 },
  "doodle": { f: "Rubik Doodle Shadow", w: 400 },
  "scribble": { f: "Rubik Scribble", w: 400 },
  "beastly": { f: "Rubik Beastly", w: 400 },
  "vinyl": { f: "Rubik Vinyl", w: 400 },
  "crisis": { f: "Climate Crisis", w: 400 },
  "graffiti": { f: "Sedgwick Ave Display", w: 400 },
  "caprasimo": { f: "Caprasimo", w: 400 },
  "grotesk": { f: "Bricolage Grotesque", w: 800 },
  "narrow-italic": { f: "Archivo Narrow", w: 700, s: "italic" },
  "londrina": { f: "Londrina Solid", w: 900 },
  "londrina-shadow": { f: "Londrina Shadow", w: 400 },
  "modak": { f: "Modak", w: 400, lh: 0.85 },
  "baloo": { f: "Baloo 2", w: 800 },
  "sniglet": { f: "Sniglet", w: 800 },
  "comic-neue": { f: "Comic Neue", w: 700 },
  "rammetto": { f: "Rammetto One", w: 400 },
  "bungee": { f: "Bungee", w: 400 },
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
  watermarkY: 0.5, // vertical centre of the watermark (fraction of H)
  handleSize: 3.2, // % of H
};
