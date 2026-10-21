# Stickers

Lookup order for a sticker `name` in a spec:

1. `<episode>/stickers/<name>.(png|webp|gif|svg|jpg)`: episode-specific or new stickers you add
2. `engine/stickers/library/<name>.webp`: the series mascots
3. `engine/stickers/emoji/<name>.svg`: 97 Twemoji props (names in `emoji/index.json`)

## `library/`: mascot cut-outs (31)

These were **cut out of the rendered Day 1–5 videos** (background removed automatically, so edges are soft and the resolution is limited to what was on screen). They are good enough to build with. **Replace them with the original transparent PNGs from your Canva library**, keeping the same file names, and every future episode picks up the sharper versions automatically.

| Name | Looks like | Use for |
| --- | --- | --- |
| `monkey-thinking` | hand on chin | doubt, "hmm", questions |
| `monkey-phone-thinking` | chin + phone | researching, scrolling, considering |
| `monkey-giggle` | hand over a laughing mouth | laughing at ourselves |
| `monkey-laughing-hat` | bucket hat + gold chain, big laugh | "way more than expected" |
| `monkey-rich-laugh` | cash fan + chain, laughing | money, business ideas |
| `monkey-shades-cash` | sunglasses + cash | worth it, profit |
| `monkey-wink-shades` | sunglasses, tongue out | cheeky confidence |
| `monkey-rapper` | cap, shades, chain, peace sign | swagger, title cards |
| `monkey-peace-chain` | shades, gold teeth, peace sign | cool, winning |
| `monkey-peace-bow` | pink bow, tongue out, double peace | cute, playful titles |
| `monkey-doctor` | lab coat + clipboard | listing, saving, analysing |
| `monkey-shocked-laptop` | gasping at a laptop | websites, too much info |
| `monkey-phone` | gasping at a phone | reels, scrolling, DMs |
| `monkey-drama` | hands over mouth | drama, shock |
| `monkey-heart-hands` | heart hands | love, wholesome |
| `monkey-pray` | hands together, grin | hoping, waiting for replies |
| `monkey-sleepy-zzz` | dozing with yellow "zz" | ZERO, tired, nothing yet |
| `monkey-yay` | arms up + yellow "YAY" | celebrating, DAY→YAY |
| `monkey-goodbye` | waving | "see you tomorrow" (add a GOODBYE tag) |
| `monkey-flower` | offering a tulip | follow, sweet ending |
| `monkey-rock-angry` | about to throw a rock, anger mark | frustration, "LIKE SHARE FOLLOW" |
| `gibbon-leap` | leaping gibbon | PHOLLOW, energy |
| `baby-cool` | cartoon baby in sunglasses | "even a baby…" rebus |
| `cat-facepalm` | paw on face | "okay, enough" |
| `cat-yawn` | huge yawn | boring, eating a letter |
| `cat-wow` | open mouth + 3D "WOW" | amazement |
| `cat-omg` | paws on head | OMG moments |
| `cat-what` | wide-eyed stare | "what?!" |
| `cat-shades` | sunglasses + thumbs-up | approval |
| `cat-interesting` | lounging, curious | "that's where it gets INTERESTING" |
| `cat-cry-thumb` | crying with a thumbs-up | bittersweet follow |

## `emoji/`: Twemoji props (97)

Graphics © Twitter, Inc. and other contributors, licensed under **CC-BY 4.0** (https://creativecommons.org/licenses/by/4.0/), from the `@twemoji/svg` package. Credit "Twemoji" in the video description when you use them. Names include `magnifier`, `bulb`, `heart`, `eyes`, `money-wings`, `dollar`, `party`, `rocket`, `alarm-clock`, `raised-hands`, `fire`, `brain`, `package`, `scissors`, `email`, `robot`, `india`, `chart-up`; see `index.json` for the full list.

## Adding stickers

- Transparent PNG or WebP, about 600–900 px tall, subject only, no white box.
- Name in kebab-case after **emotion + subject** (`monkey-celebrate-confetti`) so specs read well.
- Put series-wide stickers in `engine/stickers/library/`, and one-offs in the episode's `stickers/` folder.
