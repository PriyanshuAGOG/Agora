# Stickers

About 2,050 stickers from four libraries. When a spec names a sticker, the builder looks it up in this order:

1. `<episode>/stickers/<name>.(png|webp|gif|svg|jpg|json)`: episode-specific or new stickers you add
2. `library/<name>.webp`: the **series mascots** (31 monkeys and cats cut out of Days 1–5)
3. `animated/<name>.json`: **127 animated emoji** (Google Noto Animated Emoji, Lottie, seeked frame-accurately by HyperFrames)
4. `3d/<name>.webp`: **1,826 glossy 3D emoji** (Microsoft Fluent Emoji 3D), named by Unicode name, e.g. `artist-palette`, `hammer-and-wrench`, `spiral-calendar-pad`
5. `emoji/<name>.svg`: 97 flat Twemoji props

To force one source when a name exists in several, prefix it: `"3d:fire"`, `"anim:fire"`, `"lib:monkey-yay"`, `"emoji:fire"`.
Full name lists are in `animated/index.json`, `3d/index.json` and `emoji/index.json` (name → emoji character).

## Which library for what

| Want | Use |
| --- | --- |
| A reaction with personality (the series' signature) | `library/` mascots |
| Movement: fire flickering, a head exploding, a siren spinning, eyes darting, confetti | `animated/` (Lottie). This is the best way to make a frame feel alive |
| A clean, premium **object** (printer, calendar, tools, palette, medal, handshake, rocket, brick) | `3d/` |
| A tiny inline icon inside a sentence (rebus) | `animated/` or `3d/` as a row item `{ "sticker": "heart", "size": 8 }` |

Animated names include: `fire`, `exploding-head`, `mind-blown`, `police-light`, `eyes`, `sparkles`, `star-struck`, `party-popper`, `partying-face`, `joy`, `rofl`, `sob`, `scream`, `skull`, `melting`, `dotted-face`, `neutral`, `yawn`, `sleeping`, `sweat-smile`, `grimacing`, `thinking`, `monocle`, `nerd`, `money-mouth`, `money-wings`, `rocket`, `collision`, `bomb`, `zap`, `hundred`, `trophy`, `first-place`, `crown`, `gem`, `magic-wand`, `crystal-ball`, `bulb`, `alarm-clock`, `hourglass`, `bell`, `megaphone`, `handshake`, `clap`, `raised-hands`, `muscle`, `pray`, `wave`, `salute`, `thumbs-up`, `thumbs-down`, `heart-hands`, `red-heart`, `broken-heart`, `question`, `exclamation`, `check`, `cross`, `cricket`, `snail`, `turtle`, `unicorn`, `ghost`, `clown`, `robot`, `alien`, `construction`, `tools`, `package`, `gift`, `confetti`, `balloon`, `rainbow`, `plant`, `chart-up`, `printer`, and more (`animated/index.json`).

## Licences and credits

| Library | Licence | Credit line |
| --- | --- | --- |
| `animated/`: Noto Animated Emoji (Google, via fonts.gstatic.com) | CC BY 4.0, to the best of my knowledge (Google publishes the Noto emoji animations under CC BY 4.0); confirm on the Noto Emoji animation page before commercial use | "Animated emoji: Google Noto Emoji (CC BY 4.0)" |
| `3d/`: Fluent Emoji 3D (Microsoft), packaged by `@lobehub/fluent-emoji-3d` | MIT (stated in the package) | optional |
| `emoji/`: Twemoji (Twitter / X and contributors) | CC BY 4.0 | "Twemoji (CC BY 4.0)" |
| `library/`: mascot cut-outs | Cut from your own published Day 1–5 renders. The source photos are meme images, so their copyright belongs to the original owners, as it did in Days 1–5 | none |

Putting one line in the video description covers the CC BY libraries: *"Emoji: Google Noto & Twemoji (CC BY 4.0), Microsoft Fluent (MIT)."*

## Mascot cut-outs (`library/`)

These are soft-edged and limited to on-screen resolution. Replace them with the original transparent PNGs from your Canva library under the same names, and every future episode picks up the sharp versions. Names: `monkey-thinking`, `monkey-phone-thinking`, `monkey-giggle`, `monkey-laughing-hat`, `monkey-rich-laugh`, `monkey-shades-cash`, `monkey-wink-shades`, `monkey-rapper`, `monkey-peace-chain`, `monkey-peace-bow`, `monkey-doctor`, `monkey-shocked-laptop`, `monkey-phone`, `monkey-drama`, `monkey-heart-hands`, `monkey-pray`, `monkey-sleepy-zzz`, `monkey-yay`, `monkey-goodbye`, `monkey-flower`, `monkey-rock-angry`, `gibbon-leap`, `baby-cool`, `cat-facepalm`, `cat-yawn`, `cat-wow`, `cat-omg`, `cat-what`, `cat-shades`, `cat-interesting`, `cat-cry-thumb`.

## Adding stickers

- Transparent PNG/WebP (about 600–900 px tall, subject only) or a Lottie `.json`.
- Name in kebab-case after **emotion + subject** (`monkey-celebrate-confetti`).
- Series-wide stickers go in `library/`; one-offs go in the episode's `stickers/` folder.
- More animated emoji: `https://fonts.gstatic.com/s/e/notoemoji/latest/<codepoint>/lottie.json` (e.g. `1f602`). More 3D: `npm i @lobehub/fluent-emoji-3d`.

## brand/ (DIY · Do It Yar kit, Day 9+)

The logo, brand stickers, palette swatch cards and box/phone mockups of the brand the series is building, as HTML/CSS recreations of the creator's artwork (`brand/src/brand.html`, rendered by `brand/src/render.mjs`). It resolves before the mascot library; force it with `brand:`. Details: `references/diy-brand.md`. The artwork belongs to the creator, and the open fonts used to recreate it are OFL.
