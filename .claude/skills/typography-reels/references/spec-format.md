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

## v2 additions (the engagement layer)

### Meta
```jsonc
"progress": true            // thin "DAY 8/75" series progress bar, top-left (retention device)
```

### Scene: transitions, camera, background
```jsonc
{
  "enter": "whip-left",       // whip-left | whip-right | whip-up | zoom | zoom-out | drop | spin | blur   (enterDur, enterSfx)
  "exit": "whip-left",        // fade | whip-left | whip-right | zoom | drop   (exitDur)
  "drift": true,              // slow continuous push-in (1 → 1.045, or a number) so no frame is ever static
  "camera": [
    { "type": "punch", "at": 14.54, "scale": 1.1 },    // snap zoom and hold
    { "type": "pulse", "at": 3.34, "scale": 1.05 },    // zoom in and back
    { "type": "shake", "at": 14.54, "dur": 0.3, "amp": 1.5 },
    { "type": "flash", "at": 22.06, "opacity": 0.9 },  // white flash frame
    { "type": "tilt", "at": 5, "deg": -3 }, { "type": "reset", "at": 6 }
  ],                          // any camera entry may carry "sfx"
  "bg": { "pattern": "burst", "color": "bg", "color2": "mint-soft", "spin": 0.06 },   // burst | dots | grid | stripes; covers the watermark for this scene
  "cards": [ /* Card */ ],
  "effects": [ { "type": "burst", "sticker": "3d:sparkles", "x": 64, "y": 70, "at": 4.16, "count": 9, "size": 5, "dist": 24 } ]  // confetti-style explosion; also "rain"
}
```

### Item: per-letter animations, effects, echo
```jsonc
{
  "anim": "jitter",   // + letter anims: bounce | drop-letters | pop-letters | rise-letters | spin-letters | scatter | fix | wave | jitter | flicker
                      // + item anims: boing | slam | zoom | slam-left | slam-right | print
  "stagger": 0.03,    // letter delay
  "fixAt": 30.7,      // "fix": letters start jumbled at `at`, snap into place at fixAt
  "until": 12.0,      // jitter/wave loop end (default: scene end)
  "fx": ["extrude", "sticker"],   // extrude (3D block shadow) | shadow (hard offset) | glow | sticker (white die-cut outline) | highlight (marker swipe behind)
  "fxColor": "mint",              // colour for extrude/shadow/glow (defaults to the opposite of the text colour)
  "highlightColor": "yellow", "highlightAt": 33.2,
  "echo": { "n": 3, "step": 0.78, "stagger": 0.08, "fade": 0.16 },   // fading clones stacked below (sameness, repetition)
  "stretchX": 1.3,
  "sfx": "pop"        // sound on appearance: a name or { "name", "at", "volume" }
}
```

Every element type (item, sticker, card, draw, effect, camera) accepts `"sfx"`.

### Card
```jsonc
{ "kind": "notification", "x": 31, "y": 3, "w": 38, "size": 2.5, "app": "MESSAGES", "time": "now", "title": "Designer", "body": "Sent you the final designs!", "icon": "3d:artist-palette", "at": 0.0, "out": 1.9 }
{ "kind": "nametag", "x": 64, "y": 30, "w": 28, "size": 3.2, "line1": "HELLO", "line2": "my name is", "name": "???", "nameStyle": "marker", "at": 25.44, "rot": -6 }
{ "kind": "bubble", "x": 10, "y": 20, "w": 30, "size": 3, "from": "Designer", "text": "Here you go!", "side": "left", "at": 2 }
{ "kind": "profile", "x": 60, "y": 10, "w": 26, "size": 2.7, "photo": "3d:ring", "name": "ThePerfectName", "sub": "2 days old · single?", "at": 1.95,
  "stamp": { "text": "TAKEN", "at": 3.0, "rot": -16, "y": 40, "scale": 2.6 } }          // dating-app card; any card can take a "stamp"
{ "kind": "search", "x": 35, "y": 52, "w": 48, "size": 2.7, "engine": "Google", "icon": "3d:globe-with-meridians", "query": "www.foldly.com",
  "typeAt": 22.95, "typeDur": 0.55, "typeSfx": "typing", "result": "foldly.com is taken · $4,999", "resultColor": "red", "resultAt": 23.75 }
{ "kind": "comment", "x": 58, "y": 32, "w": 34, "size": 3.6, "avatar": "3d:smiling-face-with-heart-shaped-eyes", "user": "you", "text": "NAME", "meta": "just now · Reply", "typeAt": 49.84 }
```
`typeAt` / `typeDur` / `typeSfx` make the text of a bubble, search or comment card type itself.

### Count-up and per-letter colours
```jsonc
{ "text": "20+", "anim": "count", "count": { "from": 0, "to": 20, "suffix": "+", "prefix": "", "dur": 0.6 }, "at": 18.64 }
{ "text": "Google", "colors": ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"], "anim": "pop-letters" }   // cycles per letter
```

### Sticker
```jsonc
{ "name": "fire" }          // Lottie when an animated version exists; "3d:fire" / "anim:fire" / "lib:..." / "emoji:..." force a source
{ "float": 0.8 }            // gentle up-down bob (% of H)
{ "anim": "boing" }         // elastic hero pop
```

### Draw
```jsonc
{ "shape": "scribble-circle", "around": "fix", "pad": 1.2, "at": 31.0 }   // sized around a word at runtime
```
New shapes: `figure-eight`, `seven` + `seven-climb` (the Day 7 numeral and its upward tracer), `heart`, `spiral`, `zigzag`, `scribble-circle`, `swoosh-down-arrow`. `weight` sets the stroke (% of H); use 5–7 to *draw a numeral* itself.

### SFX names
HyperFrames bundled: `pop`, `click`, `click-soft`, `whoosh`, `whoosh-short`, `whoosh-cinematic`, `impact-bass-1`, `impact-bass-2`, `glitch-1/2/3`, `notification`, `chime`, `ping`, `sparkle`, `typing`, `key-press`, `error`, `riser`.
Engine (`engine/sfx`): `boing`, `ding`, `swish`, `record-scratch`, `thud`. Add your own files to `engine/sfx/` or `<episode>/sfx/`.

## Validation the builder performs

- Warns when an item's `at` falls outside its scene, when scenes overlap, or when a scene ends after `meta.duration`.
- Fails on an unknown style, shape, sticker or audio file.
- The runtime auto-shrinks any row wider than its block (logged as `[reel] row shrunk to fit`).
