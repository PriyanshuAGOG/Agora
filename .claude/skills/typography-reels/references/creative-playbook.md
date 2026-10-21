# Creative playbook: turning a voiceover into lockups

Use this for every new episode, **before** writing any JSON. The goal is that each sentence becomes a small typographic joke, not just a caption.

## Step 1: split the script into lockups

- One **spoken sentence (or clause pair) = one lockup**, usually 2–4 s and 5–20 words.
- Cut at natural pauses. A lockup should never run over ~5 s unless it is a list or thought-cloud scene that keeps growing.
- Mark the beats: **Hook** (first sentence), **Title**, **Turn** (the "but / so naturally / and just like that" sentence), **CTA or teaser**, **Outro**.

## Step 2: for each lockup, answer five questions

1. **What is the payoff word?** It goes **mint** and **biggest**: the noun or verb the joke lands on ("BUILD", "BUSINESS IDEAS", "CROWDED", "REELS", "BRAND", "DIY KIT").
2. **What is the setup?** It goes black, smaller, Title Case, in a narrator face (`label`, `elegant`, `bookish-regular`, `plain-italic`).
3. **Which family acts the payoff out?** (font-as-meaning)
   - crowded / squeezed → `skinny-serif` or `gothic`
   - money / premium / brand → `elegant` caps, `geo-light` thin caps
   - fast / loud / action → `blast` (italic condensed)
   - toy / craft / product → `chunky`
   - casual / spoken / "okay" → `hand`
   - digital / online / internet → `pixel`
   - story / found / reel → `bookish`
   - doubt / question → `geo-light-italic` with "?"
4. **What is the fun device?** Pick at least one from the menu below.
5. **Which mascot emotion is the subtext?** (see the sticker map)

## Step 3: the fun-device menu (from `style-bible.md` §5)

| Device | When the sentence… | Example from the series | Spec tool |
| --- | --- | --- | --- |
| Occlusion | has a long key line | monkey covering "RE " in "TODAY WE'RE" | sticker with `anchor: {to, pos: "c"}` |
| Literal prop | contains a concrete verb or object (find, save, search, money, time, idea) | magnifier on FIND, clock for "hours" | emoji or library sticker |
| Rebus | contains love, look, money, baby, fire, idea, time | ❤ for love, 👀 for looking, $ for dollar | inline `sticker` item inside the row |
| Stretch | says too / so / way / very / soooo | "Toooo" | `anim: "stretch"` on an elongated word |
| Respelling | is the sign-off or a meme-able word | PHOLLOW | text |
| Scale irony | has an aside ("which one is", "even a", "and I thought") | tiny "WHICH ONE IS" | small `size` (2.5–4) |
| Thought cloud | lists research, options or overwhelm | Competitors / Pricing / Blah | `floaters` with `rot`, one per spoken word |
| Stack build | enumerates | 1. / 2. / 3. ; ? ? ? | one row per item, `at` = spoken time |
| Arrow path | moves from A to B | RANDOM IDEA ~~> PRODUCT CONCEPT | `draws` squiggle-arrow / swoosh-arrow |
| Reaction tag | expresses a feeling | ".!!?", "OMG!", "zzz" | sticker `tag` |
| Punctuation | is ironic or surprising | "Yet :)", "AND???", "Who Knew?" | short right-aligned finisher row |
| Meme cutaway | is a punchline that deserves a reaction | Bollywood laugh | `media` clip (user-supplied) |

**Budget:** 1–2 devices per lockup. The hook and the title card get the most love.

## Step 4: sticker emotion map

| Subtext | Library sticker(s) |
| --- | --- |
| confused, thinking, "hmm" | `monkey-thinking`, `monkey-phone-thinking`, `cat-interesting` |
| shocked, too much work | `monkey-shocked-laptop`, `monkey-drama`, `cat-omg`, `cat-wow`, `cat-what` |
| laughing at ourselves | `monkey-giggle`, `monkey-laughing-hat`, `monkey-rich-laugh` |
| confident, cool, it's working | `monkey-rapper`, `monkey-peace-chain`, `monkey-shades-cash`, `monkey-wink-shades`, `cat-shades` |
| researching, listing | `monkey-doctor`, `monkey-phone` |
| tired, zero energy | `monkey-sleepy-zzz`, `cat-yawn` |
| hopeful, waiting, please | `monkey-pray`, `monkey-heart-hands` |
| frustrated, angry | `monkey-rock-angry`, `cat-facepalm` |
| celebrating | `monkey-yay`, `gibbon-leap` |
| goodbye / see you tomorrow | `monkey-goodbye` (+ `tag: GOODBYE`) |
| cute / sweet / follow | `monkey-peace-bow`, `monkey-flower`, `cat-cry-thumb` |
| "even a baby could" | `baby-cool` |

When none fits, use an emoji sticker from `engine/stickers/emoji/index.json` (97 Twemoji), or ask the user for a new PNG and drop it into `<episode>/stickers/`.

## Step 5: lay out the poster

- Default block: `box: { x: 11, y: 28, w: 78 }`. Push it up (y 15–20) when a sticker sits above, and down (y 35–45) for short two-line lockups.
- Give the payoff row `"fit": 1` so it spans the block; let setup rows stay natural size. Use `"fit": 0.6–0.85` for a deliberately shorter line.
- Use negative `mt` (−0.5 to −2) to tighten leading.
- Right-align the Z-read finisher (`"align": "right"`).
- Stickers: top-right corner `x 65–85, y 8–20, h 22–34`, or `anchor` them onto a word to cover 1–3 letters.

## Step 6: time it to the voice

- Each item's `at` = the spoken start time of its first word (from the transcript), minus ~0.03 s so it lands on the syllable.
- Stickers pop 0.1–0.3 s after the word they comment on.
- Scene `end` = the next scene's `start` minus 0.1–0.2 s (the breath frame).
- The hook can use `type`, `swing` and `rise`; everything else is `cut` unless there is a reason.

## Worked example (a hypothetical Day 8 line)

> VO 12.4–15.1 s: "So I sent our sketches to all twenty designers… and only TWO replied."

- Payoff: **TWO REPLIED**, mint, `blast`, fit 1.
- Setup: "So I Sent Our Sketches To" (`label`, 12.4) / "ALL TWENTY DESIGNERS" (`poster`, black, 13.2).
- Device: scale irony ("only" tiny, 14.2), plus a `cross` draw scratching out "TWENTY" (14.5) with a tiny mint "2" next to it (rebus/correction), and the `monkey-pray` sticker anchored on "DESIGNERS".
- Finisher: none; the cross is the joke.

```json
{
  "id": "replies", "start": 12.4, "end": 15.0, "box": { "x": 11, "y": 27, "w": 78 },
  "rows": [
    { "items": [{ "text": "So I Sent Our Sketches To", "style": "label", "size": 7, "at": 12.37 }] },
    { "mt": -1, "items": [{ "id": "twenty", "text": "ALL TWENTY DESIGNERS", "style": "poster", "size": 16, "at": 13.17 }] },
    { "mt": -1.5, "fit": 1, "items": [
      { "text": "only", "style": "elegant-italic", "size": 4, "at": 14.17 },
      { "text": "TWO REPLIED", "style": "blast", "color": "mint", "size": 18, "at": 14.37 }
    ] }
  ],
  "draws": [{ "shape": "cross", "x": 33, "y": 41, "w": 20, "h": 12, "color": "red", "at": 14.5, "dur": 0.25 }],
  "stickers": [{ "name": "monkey-pray", "at": 13.4, "anchor": { "to": "twenty", "pos": "r", "dx": 7, "dy": -6 }, "h": 26 }]
}
```

## v2 device menu (Day 8 onwards)

| The sentence… | Device | Day 8 example |
| --- | --- | --- |
| opens the episode | **notification hook** card + slam + flash/shake + impact SFX | "Designer: Sent you the final designs!" → "We **FINALLY**" |
| says crazy / wild / insane | `comic` + `jitter` + `extrude` | CRAZY |
| names a physical action (print, build, drop, fix) | an anim that *performs* it: `print`, `drop-letters`, `fix`, `slam-left/right` | PRINTED OUT, BUILD A BRAND (letters fall like bricks), FIXING |
| announces a problem or turn | red `stencil` + `slam` + sirens + `record-scratch` on enter, punch + shake | PROBLEM |
| complains about sameness | `echo` clones fading below | PRODUCT ×4 |
| says nothing / empty / no | `outline` hollow letters, `strike` on each "no", grey colour for "no colours", 🦗 cricket "*chirp*" | NOTHING, NO LOGO, NO COLORS |
| has an epiphany | `burst` background + flash + shake + exploding-head | IT HIT ME |
| mentions a name / identity | HELLO-my-name-is `nametag` card with "???" | "we don't even have a NAME yet" |
| brings two things together | the two words fly in from opposite sides (`slam-left` / `slam-right`) and a shake on the collision | DESIGNS & BRANDING → TOGETHER |
| is about creativity / aesthetics | `drip` paint font, `calligraphy` + `highlight`, dotted `bg` | CREATE, aesthetics |
| is excitement | `burst` bg + `jitter` + star-struck + raised-hands | CAN'T WAIT |

**SFX map:** slam → `impact-bass-1/2`; sticker → `pop` / `boing`; scene whip → `swish`; reveal → `sparkle` / `ding`; typing/printing → `typing`; turn → `record-scratch`; notification → `notification`; fix/snap → `click`; falling letters → `thud`.

## Day 8 additions

| The script… | Device |
| --- | --- |
| has a running metaphor (dating, cooking, sports…) | carry it through every beat: a dating-app **profile card** + **TAKEN stamp** for "committed", the profile card returning as "it's a match!" for "falling in love", a bed + broken heart for "sleeping with it", a title card where the 8 becomes two **rings** and a gem lands |
| teaches steps | **STEP + giant numeral** on the left, the action on the right, and the same layout every step |
| mentions a tool or website | a fake UI that *does the thing*: a **typing ChatGPT prompt** bubble, a **search bar typing the domain** with a red "taken · $4,999" result, **Google in Google colours** |
| gives a number | **count-up** (`anim: "count"`) plus a burst of concrete examples (8 sample brand names popping around the frame) |
| has a gross or absurd joke | a monster font (`beastly`) in red, a meme mascot (cat-omg), a bandaged-face 3D emoji, money rain |
| asks people to comment | an **Instagram comment card** typing the keyword + the keyword huge in `marker` |
| reveals a result tomorrow | a **censored** reveal (█████ on the name tag) + zipper-mouth 🤐 + "(reveal soon)" |

## Day 9 additions

| The script… | Device |
| --- | --- |
| reveals something the creator made (logo, packaging, a website) | **open a reveal gap in the VO** after the teaser line (`ffmpeg` atrim + `anullsrc`, 5–7 s), shift every later word by the gap, and fill it with 3–4 short "THE LOGO / THE COLOURS / THE FONTS / THE VIBE" scenes: the logo slams on a spinning burst bg + flash + confetti, paint-chip swatch cards drop in one by one, "Aa" specimens per font, then mockups slide in with the brand stickers popping around them |
| has brand assets but they arrived only as chat images (no files) | recreate them in HTML/CSS (`episodes/day-NN/brand/brand.html`), screenshot each with Playwright to transparent PNGs in `episodes/day-NN/stickers/` (`render.mjs`); the user can later drop the originals in under the same names |
| names the brand | the brand's own font (`titan` = Titan One) and colours take over the payoffs: initials coloured with `colors` ("**D**o **I**t **Y**ar!"), a censored "???" name tag stamped with the name, FOLLOW in the brand face |
| lists deliverables (logo, colours, fonts, styles) | a 2×2 grid where each word *is* its meaning: LOGO circled, COLOUR in palette colours + swatch pills, F·O·N·T·S in five fonts, Visual in calligraphy over dripping STYLES |
| swears or says something gross | a rebus that covers the letter: SH💩T (inline `sticker` item between "SH" and "T"), red `beastly`, flies burst, cat-facepalm "EWW" |
| says pick / choose | three "Option" chips in three fonts; one circled, the other two crossed out in red |
