# DIY · Do It Yar: the brand being built in the series

From Day 9 the series has a real brand: **DIY, Do It Yar** ("yaar" = buddy), paper-craft DIY kits. Use it whenever an episode shows the product, packaging, socials or results. The series house style (mint `#0CD2BA` on `#FCFCFC`, the DAY watermark, STEP numerals) stays the frame. The brand appears *inside* it, as the thing we are building.

Spelling on screen: **DIY** and **Do It Yar** (the logo spells "DoItYar"; the script may say "Do It Yaar").

## Palette (sampled from the creator's logo and stickers)

| Name | Hex | Use |
| --- | --- | --- |
| Yaar Orange | `#FF5A14` | the letters D·I·Y, brand payoff words, the brand FOLLOW |
| Orange deep (shadow) | `#C93A0B` | bubble-letter extrude |
| Kraft Cream | `#FFF7E8` | the winking "I" mascot, cream letters (MA…ING) |
| Glue Mint | `#3FE8B0` | underline bar, the ON toggle, the certified ring |
| Sunny Spark | `#FFC312` | the "pop" rays, stars |
| Glitter Lilac | `#B7A1F2` | twinkles |
| Marker Black | `#141414` | outlines, "DoItYar" marker word |
| soft orange bg | `#FFE2D2` | `bg.color2` for brand scenes (dots / burst) |

## Type

- **Titan One**: bubble headline (style role `titan`, or `chunky` for tracked caps). Brand look: `"color": "#FF5A14", "fx": "extrude", "fxColor": "ink"`.
- **Chewy**: the friendly marker voice (`chewy`).
- **Fredoka 700**: body and UI text (`bubbly`).

These are the closest bundled open fonts to the logo lettering. The demo site (do-it-yar.priyanshuagog.chatgpt.site) was not reachable from the build environment, so they could not be checked against it.

## Brand kit: `engine/stickers/brand/` (prefix `brand:` or bare name)

| Sticker | What |
| --- | --- |
| `diy-logo` | DIY with the winking cream I, "DoItYar", mint underline |
| `diy-i` | the winking "I" mascot alone (peeks, waves, reacts) |
| `yar-mode-on` | YAR / MODE: / ON toggle |
| `certified-diyd` | CERTIFIED DIY'D badge |
| `built-bought` | BUILT > BOUGHT |
| `diy-maxxing` | DIY MAXXXING |
| `swatch-{orange,cream,mint,yellow,lilac,ink}` | paint-chip palette cards with name + hex |
| `mock-box` | orange kit box with the logo label |
| `mock-phone` | Instagram profile mockup (@doityar, 3×3 brand grid) |

They are **HTML/CSS recreations** of the creator's images (the originals arrived only as chat images). The source is `src/brand.html`; re-render with `node engine/stickers/brand/src/render.mjs [name…]` (Playwright + PIL; the PNGs come out transparent and trimmed). When the creator provides the original PNG files, save them here under the same names and every episode uses them automatically.
