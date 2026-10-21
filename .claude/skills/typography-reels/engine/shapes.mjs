// Hand-drawn strokes in a 100x100 box (stretched to the draw's w/h; stroke width stays constant).
// paths[0..split-1] draw first (the body); the rest (arrowheads) draw after the body finishes.

export const SHAPES = {
  // Day 1 title: smile-shaped swoosh under "ZERO TO SOMETHING", arrowhead on the right
  "swoosh-arrow": { paths: ["M2,18 C25,85 70,95 97,30", "M83,30 L97,30 L94,46"], split: 1 },
  // Day 3 title: arrow curling from ZERO down to SOMETHING
  "curl-down-arrow": { paths: ["M8,6 C55,0 80,25 62,55 C55,68 52,80 55,96", "M43,84 L55,96 L66,83"], split: 1 },
  // Day 4 body: "~~>" squiggle that leads into the next word ("RANDOM IDEA ~~> PRODUCT CONCEPT")
  "squiggle-arrow": { paths: ["M2,30 C10,0 18,70 28,40 C36,15 44,75 56,50 C64,36 70,58 97,58", "M86,44 L97,58 L84,70"], split: 1 },
  "arrow-right": { paths: ["M2,50 L96,50", "M82,32 L97,50 L82,68"], split: 1 },
  "arrow-down": { paths: ["M50,2 L50,96", "M32,82 L50,97 L68,82"], split: 1 },
  "arrow-up": { paths: ["M50,98 L50,4", "M32,18 L50,3 L68,18"], split: 1 },
  "curve-arrow-up": { paths: ["M4,96 C10,40 50,10 94,8", "M80,0 L95,8 L82,20"], split: 1 },
  underline: { paths: ["M1,55 C30,45 70,62 99,48"] },
  "double-underline": { paths: ["M1,35 C30,28 70,42 99,30", "M5,75 C35,68 70,80 96,70"], split: 2 },
  circle: { paths: ["M55,6 C85,6 99,30 97,54 C94,84 62,97 40,94 C12,90 1,64 4,40 C8,16 30,3 62,9"] },
  cross: { paths: ["M5,5 L95,95", "M95,5 L5,95"], split: 2 },
  check: { paths: ["M5,55 L38,90 L96,8"] },
  // little "emphasis" burst lines next to a word or sticker
  burst: { paths: ["M50,40 L50,2", "M30,48 L6,20", "M70,48 L94,20"], split: 3 },
  // a "clock" shape also exists: it is rendered specially (outline face + spinning hand), see build.mjs
  bracket: { paths: ["M20,2 C2,2 2,2 2,20 L2,80 C2,98 2,98 20,98"] },
};
