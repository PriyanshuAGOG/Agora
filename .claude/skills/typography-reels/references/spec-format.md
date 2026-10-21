# Reel spec format (`reel.spec.json`)

`node engine/build.mjs <spec.json> <out-dir> [--res 1080|1440]` turns this file into a HyperFrames project.

**Units:** `size`, `h`, `mt`, `gap`, `dx`, `dy`, `r` = **% of frame height** (so `size: 10` = 108 px at 1080p). `x`, `y`, `w` = **% of frame width / height**. Times are **seconds on the global timeline**, i.e. the same clock as the voiceover transcript.

```jsonc
{
  "meta": {
    "day": 8,                          // drives the watermark "DAY 8"
    "duration": 43.2,                  // = voiceover length
    "handle": "@your.soulpreneur",
    "watermark": { "text": "Day 8", "style": "watermark", "width": 0.77, "y": 0.49 }, // optional overrides
    "width": 1920, "height": 1080      // optional; --res 1440 renders 2560x1440
  },
  "audio": [
    { "id": "vo", "src": "audio/day-08-vo.wav", "volume": 1 },
    { "id": "music", "src": "audio/bed.mp3", "volume": 0.18, "from": 0 }  // "from" = offset into the file
  ],
  "sfx": [{ "src": "audio/pop.wav", "at": 1.8, "volume": 0.5 }],
  "media": [  // meme cutaways (top layer)
    { "src": "media/shocked.mp4", "start": 3.6, "end": 5.85, "w": 56, "y": 12, "audio": true, "volume": 1, "from": 0 }
  ],
  "transitions": [{ "type": "glitch", "at": 5.9, "dur": 0.33 }],
  "scenes": [ /* see below */ ]
}
```

## Scene

```jsonc
{
  "id": "hook",                 // unique; used in element ids
  "start": 0.1, "end": 2.55,    // visible window (leave 0.1–0.3 s gaps between scenes = breath frames)
  "exit": "fade",               // optional: "fade" dims the scene over its last 0.12 s (default: hard cut)
  "box": { "x": 11, "y": 28, "w": 78, "v": "top" },  // the text block; v: "center" makes y the vertical centre
  "rows": [ /* Row */ ],
  "floaters": [ /* Item with x,y (% of frame), centred on that point */ ],
  "stickers": [ /* Sticker */ ],
  "draws": [ /* Draw */ ],
  "arcs": [ /* ArcText */ ],
  "effects": [{ "type": "rain", "sticker": "dollar", "at": 30.7, "dur": 1.6, "count": 20, "x0": 30, "x1": 78, "size": 7, "seed": 3, "spread": 0.5 }]
}
```

## Row

```jsonc
{
  "items": [ /* Item */ ],
  "align": "left" | "center" | "right",
  "fit": 1,          // scale the whole row to this share of the block width (the poster look). Omit = natural size (rows wider than the block still shrink to fit).
  "mt": -1.5,        // margin-top (negative = tighter leading)
  "gap": 1.1,        // space between items in the row
  "indent": 3,       // left padding, % of block width
  "valign": "baseline" // default baseline; rows containing inline stickers use center
}
```

## Item (a text run)

```jsonc
{
  "id": "build",              // optional; needed when a sticker anchors to it
  "text": "GOING TO BUILD",
  "style": "blast",           // a type role from engine/presets.mjs (see style-bible.md §4)
  "size": 22,                 // font-size, % of frame height
  "color": "mint",            // ink | mint | red | white | pale | grey | #hex
  "at": 1.5,                  // appear time; OR an array of per-word times: "at": [1.5, 1.7, 1.95]
  "anim": "rise",             // cut (default) | type | swing | rise | pop | stamp | drop | slide-left | slide-right | slide-up | fade | blur | wipe | stretch | spin-in | shake
  "dur": 0.33,                // optional animation duration
  "out": 4.0,                 // optional: disappear before the scene ends
  "case": "upper" | "none" | "lower",
  "ls": 0.12,                 // letter-spacing (em)
  "lh": 0.9,                  // line-height
  "box": true,                // mint highlight box behind the text (or a colour name)
  "underline": { "at": 30.8, "dur": 0.25 },  // or true; draws in under the word in the item's colour
  "strike": { "at": 14.5 },   // red strike-through drawing in
  "outline": true,            // outlined letters (stroke in `color`)
  "vertical": true,           // reads bottom-to-top, like "GOING FROM"
  "rot": -12,                 // static rotation (thought-cloud words)
  "skew": -8,
  "stretchY": 1.4,
  "dx": 2, "dy": -1, "mr": 1  // nudges (% of H)
}
```

An item can be an **inline sticker** (rebus) instead of text: `{ "sticker": "heart", "size": 9, "at": 29.7, "anim": "pop" }`.

## Sticker

```jsonc
{
  "name": "monkey-thinking",  // looked up in <spec-dir>/stickers, then engine/stickers/library, then engine/stickers/emoji
  "at": 1.8, "out": 2.4,      // out optional
  "x": 69, "y": 14,           // top-left corner, % of frame   — OR —
  "anchor": { "to": "today", "pos": "c", "dx": -1, "dy": -3 },  // centre on a word: pos t|b|l|r|c|tl|tr|bl|br
  "h": 28,                    // height, % of frame height
  "anim": "pop",              // any item anim; pop is the house style
  "flip": true, "rot": 10,
  "wobble": 4,                // idle wiggle in degrees (GIF-like)
  "spinTurns": 3,             // continuous spin (e.g. a clock-hand sticker)
  "z": 12,
  "tag": { "text": ".!!?", "pos": "tr", "size": 4.5, "color": "red", "style": "geo-black", "rot": -10 }
}
```

## Draw (hand-drawn stroke)

```jsonc
{ "shape": "swoosh-arrow", "x": 27, "y": 65, "w": 41, "h": 14, "at": 7.3, "dur": 0.35, "color": "ink", "weight": 0.85, "flipX": false, "flipY": false, "rot": 0 }
```

Shapes (`engine/shapes.mjs`): `swoosh-arrow`, `curl-down-arrow`, `squiggle-arrow`, `arrow-right`, `arrow-down`, `arrow-up`, `curve-arrow-up`, `underline`, `double-underline`, `circle`, `cross`, `check`, `burst`, `bracket`, plus the special `clock` (an outline face with a spinning hand: `{ "shape": "clock", "x": 74, "y": 40, "h": 9, "at": 27.6, "turns": 3 }`).

## ArcText (text following a circle, as in Day 5's "To Something")

```jsonc
{ "text": "To Something", "style": "elegant", "size": 5, "color": "ink", "cx": 70, "cy": 58, "r": 19, "start": 200, "end": 40, "at": 8.5, "anim": "fade", "spread": 40 }
```

Angles are in degrees, clockwise from 3 o'clock; `spread` optionally forces the text length (% of H).

## Validation the builder performs

- Warns when an item's `at` falls outside its scene, when scenes overlap, or when a scene ends after `meta.duration`.
- Fails on an unknown style, shape, sticker or audio file.
- The runtime auto-shrinks any row wider than its block (logged as `[reel] row shrunk to fit`).
