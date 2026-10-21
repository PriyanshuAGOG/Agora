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
  // v2
  // figure-eight traced bottom loop first, then the top loop (journey along an "8")
  "figure-eight": { paths: ["M50,52 C78,52 92,63 92,77 C92,91 72,98 50,98 C28,98 8,91 8,77 C8,63 22,52 50,52 C74,52 86,42 86,27 C86,12 68,2 50,2 C32,2 14,12 14,27 C14,42 26,52 50,52"] },
  heart: { paths: ["M50,92 C20,70 2,52 4,30 C6,12 26,4 40,14 C46,18 49,24 50,28 C51,24 54,18 60,14 C74,4 94,12 96,30 C98,52 80,70 50,92"] },
  spiral: { paths: ["M50,50 C54,46 58,52 54,56 C48,62 40,54 44,46 C50,36 64,40 66,52 C68,66 52,74 40,68 C24,60 26,36 42,30 C62,22 80,36 80,54 C80,76 58,90 38,84 C14,76 8,46 22,28"] },
  zigzag: { paths: ["M1,60 L10,30 L20,60 L30,30 L40,60 L50,30 L60,60 L70,30 L80,60 L90,30 L99,60"] },
  "scribble-circle": { paths: ["M60,8 C88,10 99,34 95,56 C90,84 58,98 34,92 C10,86 0,60 6,38 C12,16 36,4 58,6 C80,8 92,22 96,30"] },
  // "7" drawn the way you write it (top-left → top-right → foot), and the reverse "climb" (foot → top → left end)
  seven: { paths: ["M8,6 L88,6 L32,98"] },
  "seven-climb": { paths: ["M32,98 L88,6 L8,6"] },
  "swoosh-down-arrow": { paths: ["M4,10 C40,4 80,20 90,80", "M76,72 L90,90 L98,70"], split: 1 },
  // Day 9 title: the 9 as a balloon, drawn from the string's end (ZERO) up the wavy tail and around
  // the loop (SOMETHING). Built for a box about 0.75 as wide as tall (e.g. w 26 x h 62 at 16:9).
  "nine-balloon": { paths: ["M64,99 C56,90 76,82 78,72 C81,61 88,48 88,30 C88,12 70,1.5 50,1.5 C30,1.5 12,14 12,30 C12,46 30,58.5 50,58.5 C70,58.5 88,46 88,30"] },
};
