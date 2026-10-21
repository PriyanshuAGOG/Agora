# Style bible: "Zero to Something" typography reels

Measured from Days 1–5 of the series by @your.soulpreneur: every second watched at 10 fps, animations at 30 fps, colours sampled from pixels.
Anything not measured directly is marked **(est.)**, and anything uncertain is marked **(unverified)**.

---

## 1. Format at a glance

| Property | Value |
| --- | --- |
| Canvas | 16:9 landscape. Exports were 2560×1440 or 2542×1440 at 30 fps. Build at 1920×1080 by default; use `--res 1440` for delivery |
| Length | 40–44 s (D1 42.1, D2 40.0, D3 44.1, D4 44.3, D5 40.3) |
| Background | flat off-white `#FCFCFC`, never a gradient, photo or texture |
| Text colours | **black `#000000`** and **mint `#0CD2BA`**, and nothing else |
| Accent | red `#E41E24` only for reaction marks on stickers (`.!!?`, `OMG!`, the anger symbol) |
| Watermark | giant `DAY N` in pale mint `#DEFCFC`, heavy rounded sans, about 77% of frame width, centred at y ≈ 49%, visible the whole video |
| Handle | `@your.soulpreneur`, mint, Poppins Bold, ~3% of height (spans ~19% of frame width), bottom-right (right 2.3%, bottom 2.6%), always on |
| Audio | continuous first-person voiceover over a low music bed (bed ≈ −25 dB; VO peaks ≈ −8 dB). Short transients line up with some sticker entrances, so pop/whoosh SFX are likely **(unverified, the stems are not separable)** |
| Scenes per video | 11–13 typographic "lockups" + 1 title card |

## 2. Episode structure (the beat sheet)

Every episode follows the same arc. Times are typical (min–max over Days 1–5).

| # | Beat | When | What happens | Examples |
| - | ---- | ---- | ------------ | -------- |
| 1 | **Hook** | 0.0–2.5 s (up to 6 s) | One curiosity or contradiction line, built word by word. Often a recap twist on yesterday. | "We have no idea what we're going to build. Yet :)" / "We went looking for a MILLION $ IDEA and came back with…" / "One random reel and suddenly we had a business idea to investigate" / "Okay, enough research!! What are we actually going to SELL?" / "Apparently starting a PAPER CRAFT business also means becoming a 3D DESIGNER. Who knew?" |
| 2 | *(optional)* **Meme cutaway** | 3.6–5.9 s | 1–2 s reaction clip (D2: a shocked man in a suit), then a 0.3 s grey **glitch** into the title | Day 2 only |
| 3 | **Series title card** | starts 3.8–6.3 s, lasts ~3.4 s | "This is Day N of going from Zero to Something", with a new visual concept every day (§6) | see `title-card-concepts.md` |
| 4 | **Story beats** | ~9 s → ~34 s | 5–8 lockups, 2–5 s each. Each lockup is **one spoken sentence**. Includes at least one *list/stack* beat and one *turn* ("But now comes the hard part", "So naturally…", "But hours later…") | |
| 5 | *(optional)* **Second meme** | | Punchline reaction clip (D2 32.4–34 s: laughing Bollywood clip) | |
| 6 | **CTA or cliffhanger** | ~34–39 s | Either a **comment-keyword lead magnet** ("If you want the 5 sites I used, comment 'IDEAS', I'll send them to you" / "Want the prompt? Comment 'PROMPT'") **or** a **teaser** ("TOMORROW I'll show you why" / "That's where things get INTERESTING") | D1, D3, D5 = keyword; D2, D4 = teaser |
| 7 | **Outro** | last 1.5–4 s | "See you tomorrow" (waving GOODBYE mascot) then a **Follow** card that is styled differently every day | "LIKE, SHARE, FOLLOW" / "PHOLLOW" / "FOLLOW" / "Follow" |

**Scene changes** are hard cuts to an **empty "breath" frame**, showing only the watermark and handle, for 0.1–0.3 s before the next lockup starts. Day 1's hook dims out over ~0.1 s; everything else cuts.

## 3. The lockup: how one sentence becomes a poster

A lockup is a stack of 2–5 lines that **assembles in sync with the voiceover**. Each line (sometimes each word) appears on the syllable it is spoken. When the sentence ends, the frame is a finished, balanced typographic poster, and then it cuts.

Rules, in order of importance:

1. **Mix families.** Each lockup uses 2–4 type families. Two adjacent lines never share family, case *and* colour.
2. **Two colours.** The setup is black; the **payoff noun or phrase is mint**. Typically one mint line per lockup, sometimes two.
3. **Extreme size contrast.** Setup line 4–9% of frame height; payoff line 13–27%; asides tiny (2.5–4%), e.g. "WHICH ONE IS", "even a", "WAY MORE", "And I Thought".
4. **Shared left edge, poster width.** Lines start at a common left edge around x = 6–13% and the big lines stretch to x ≈ 88–92%, so the stack reads as one block (use `"fit": 1`).
5. **Z-read finishers.** The last short line is often **right-aligned** under the end of the big line: "Yet :)", "FIND ONE", "THAN I EXPECTED", "That's The Gap", "Who Knew?", "I Started / OF REGRET".
6. **Tight leading.** Lines nearly touch (negative margins); descenders kiss ascenders.
7. **Case as tone.** Conversational setups are Title Case ("And Honestly There", "So Naturally After"); shouts are ALL CAPS.
8. **The vertical band.** The block sits in the upper-middle (y ≈ 15–75%), over the watermark. The bottom 20% stays clear apart from the handle.
9. **Stickers sit on the top-right corner** of the block (x 65–90%, y 8–45%) **or deliberately cover part of a word** in the middle of the stack (§5.1).

## 4. Typography roles

These are the original Canva fonts matched to the closest free Google Fonts (bundled in `engine/fonts`). The matches are good approximations, not exact identifications **(est.)**. If you have the exact Canva font names, put them in `engine/presets.mjs`.

| Role (`style`) | Font used here | Where it appeared | Mood |
| --- | --- | --- | --- |
| `label`, `label-caps`, `label-bold` | Oswald 600/700 | "We Have No Idea", "And Honestly There", "THAN I EXPECTED", "Of Going From" | narrator voice, setup |
| `poster` | Bebas Neue | "WHAT WE'RE", "GOING THROUGH", "THAT'S WHAT WE'RE", "I'LL SEND THEM TO YOU" | the default shout |
| `blast` | Barlow Condensed 800 *italic* | "GOING TO BUILD", "ZERO TO SOMETHING", "BUILDING" | the fastest, loudest payoff |
| `geo`, `geo-black`, `geo-italic` | Montserrat 800/900 (+italic) | "THIS IS DAY 1 OF", "FIND ONE", "SEE YOU TOMORROW", "To Research", "STARTING A WHOLE NEW CAREER?" | confident, clean |
| `geo-light(-italic)` | Montserrat 300 | "BRAND", "DROPSHIPPING?" | airy, premium, doubtful |
| `elegant`, `elegant-italic`, `elegant-bold` | Playfair Display | "WERE WAY MORE IDEAS", "BUSINESS IDEAS", "Whether People Were Actually", "AND???" | editorial, ironic |
| `swash` | Playfair Display 900 italic | "Instead?" | flourish |
| `airy`, `plain`, `plain-italic` | Open Sans 300 italic / 400 | "Figuring Out Tomorrow", "After Two Minutes", "So I Used", "A Step By Step Instruction Booklet" | soft aside |
| `bookish`, `bookish-italic`, `bookish-regular` | Merriweather | "REEL", "That Made Me Stop Scrolling", "One Random Reel And Suddenly", "Yet :)" | storybook |
| `skinny-serif` | Oranienbaum | "Crowded", "WEB AGENCY?", "is a founder now", "I Started", "I Was Struggling" | squeezed, crowded, dramatic |
| `chunky` | Titan One (+tracking) | "COMPLETE DIY KIT" | toy / craft / product |
| `heavy` | Archivo Black | "What If We Made A", "This Is" | blunt |
| `round`, `round-black` | Poppins 800/900 | "If You Want The 5 Sites I Used", "Follow", watermark, handle | friendly |
| `hand` | Caveat 700 | "Okay" | casual, spoken |
| `script` | Kaushan Script | "PHOLLOW" | playful sign-off |
| `pixel` | Pixelify Sans | the stepped pixel "2" | digital / internet |
| `victorian` | Cinzel Decorative | the outlined "DAY" in Day 5's title | ornate, celebratory |
| `block`, `gothic` | Anton, League Gothic | big numerals "3", "4", condensed caps | monumental |
| `retro`, `fatface` | Righteous, Abril Fatface | "FOLLOW" (Day 3) | sign-off variety |

**Font-as-meaning** is a core habit: pick the family that *acts out* the word. "Crowded" is set in a squeezed condensed serif, "COMPLETE DIY KIT" in a toy-block face, "BRAND" in thin luxury caps, "I Was Struggling" in a wobbly condensed italic, the "2" in pixels because the business is online.

## 5. The fun layer: stickers, wordplay and visual puns

This is what makes the series feel alive. **Every lockup gets at least one fun device, and the best ones get two.**

### 5.1 Sticker occlusion
A mascot photo-cutout (monkey, or cats on Day 4) is placed **on top of a word, hiding 1–3 letters**, while the word stays readable: "TODAY WE'**[monkey]** GOING TO", "I WENT HU**[monkey]**ING FOR", "BUSINE**[monkey]**DEAS", "PAPER CRA**[monkey]**", "TR**[monkey]**EATING MODELS", "Whose Work **[monkey]** Our IDEA". The covering sticker's emotion comments on the sentence: laughing at "business ideas", shocked at "hunting", thinking at "creating models".

### 5.2 Literal props (the sticker acts out the word)
| Word / idea | Prop |
| --- | --- |
| FIND | magnifying glass over "So" |
| idea | light bulb above the mascot |
| SAVED / LISTED / RESEARCH | doctor monkey with a clipboard |
| WEBSITES / REELS / scrolling | monkey with a laptop or phone |
| ACTUALLY WORTH BUILDING | money rain + sunglasses monkey with cash |
| hours of regret | outline clock with a spinning hand |
| ZERO | sleeping monkey with "zzz" (zero energy) |
| DAY → YAY | cheering monkey with a yellow scribbled "YAY" |
| Toooo many | a cheering crowd sticker sitting on the stretched "Toooo" |
| even a baby is a founder now | a baby-in-sunglasses sticker **replaces the word "baby"** |
| See you tomorrow | waving monkey with a "GOODBYE" tag |
| Follow | dancing / flexing / flower-holding / crying-cat mascot |

### 5.3 Rebus substitutions (icon replaces a word)
- `MILLION $ IDEA`: a giant mint **$** stands in for "dollar"
- `WHAT I ❤ THE MOST`: a heart for "love"
- `After 👀 At The Market`: eyes for "looking"
- `even a 👶 is a founder now`: a sticker for the noun

### 5.4 Spelling play
- Letter stretching: "Mostly ideas were **Toooo**" (too crowded), "Okay" in hand script
- Phonetic respelling: **PHOLLOW**
- Day→**YAY** rhyme on the title card
- Punctuation as emotion: "Yet :)", "AND???", ".!!?", "Enough Research!!", "Who Knew?"
- Avoid accidental typos. The originals have "TOMMOROW" and "IDIAS"; keep misspellings intentional and obvious.

### 5.5 Scale irony
Tiny words carry the joke: "But Now Comes The Hard Part" then a tiny "WHICH ONE IS" then a huge "ACTUALLY WORTH **BUILDING**"; "But Instead Of Getting" then a tiny "EXCITED" in a mint box. A word that *should* be big is set small, and a filler word is set huge.

### 5.6 Thought cloud / overload
For research, brainstorming or overwhelm, small rotated words scatter around the central line one by one: "Existing Products", "Competitors", "Potential Customers", "Pricing", "Blah", "Blah" (Day 3). Use `floaters` with `rot`.

### 5.7 Stack builds
Lists grow line by line on each spoken item: "1. TRENDING PRODUCTS / 2. INTERNATIONAL BUSINESSES / 3. IDEAS…"; "DROPSHIPPING? / E COMMERCE? / WEB AGENCY?"; Day 4's "CUTTER … GLUE … PRINTED PRECUT PAPERS" orbiting "COMPLETE DIY KIT".

### 5.8 Arrows and paths
Hand-drawn strokes that draw on in about 0.35 s: the swoosh from ZERO to SOMETHING, the curl from ZERO down to SOMETHING, and `RANDOM IDEA ~~> PRODUCT CONCEPT`. Underlines draw under the payoff word (BUILDING).

### 5.9 Reaction tags
Small text glued to a sticker: `.!!?` (red), `OMG!` (red), `WOW` (3D bubble), `OH THE DRAMA!!`, `zzz` (yellow), `GOODBYE`, `INTERESTING`, `YAY` (yellow scribble).

### 5.10 Meme cutaways
Short reaction clips from Bollywood or viral memes cut in hard, either centred at ~56% width on white, or full-bleed for a punchline. Use at most one or two per video.

## 6. The series title card: the creative centrepiece

The sentence never changes: **"This is Day N of going from Zero to Something."** The design changes every day, and the rule is:

> **The day's numeral is the hero (45–60% of frame height, mint), and the journey from ZERO to SOMETHING is drawn along the numeral itself.**

| Day | Concept |
| --- | --- |
| 1 | No numeral concept yet: "THIS IS DAY 1 OF" (Montserrat black) over a huge mint italic "ZERO TO SOMETHING", a vertical "GOING FROM" running up the left edge, a smile-shaped arrow drawing from ZERO to SOMETHING, and the rapper monkey |
| 2 | Ultra-condensed "Day" and a stepped **pixel 2**. "ZERO" sits knocked out at the **top of the 2's stroke** and "SOMETHING" runs **along the base**, so you read the 2 top to bottom as the journey. Bow-tie monkey peace sign |
| 3 | "This Is" (thin serif) + mint "DAY" + giant **3** (condensed). "ZERO" is half-hidden by a peace-sign monkey and a **sleeping "zzz" monkey sits on the O**. A curling arrow drops to a thin-serif "SOMETHING". "Of Going From" in black condensed |
| 4 | "This Is" + a **cat sticker eating the "D" of DAY** + big serif "AY" + a block **4**: tiny "ZERO" at the bottom of the stem, "TO SOMETHING" **climbing the 4's vertical stem**. "Of Going From" in fat swash italic |
| 5 | Order flipped: a small "THIS IS" on the right, an ornate outlined "DAY", and a cheering monkey turning **DAY into YAY**. A giant **5**: "ZERO" in a mint pill at the top flag of the 5 and "To Something" written **around the bowl of the 5** on an arc |

Title card animation: the parts appear **in spoken order** ("This is", "Day", N, "of going from", "zero", "to something"). The arrow or path draws last. The card holds about 0.5 s after the last word, then cuts.

## 7. Motion vocabulary

The series is **typography-first, not motion-first**. About 80% of all appearances are plain **cuts on the word**. Animation is reserved for the hook and the title card.

| Move (`anim`) | Measured behaviour | Used for |
| --- | --- | --- |
| `cut` | appears on the frame the word is spoken | default for every line and word |
| `type` | typewriter, one letter per frame-ish (~0.45 s for 10 letters) | hook lines ("WHAT WE'RE") |
| `swing` | rises from ~55% scale, tilted −9°, with a soft overshoot (~0.27 s) | first line of the hook |
| `rise` | springs up from the baseline with vertical blur (~0.2 s) | the hook payoff, "ZERO TO SOMETHING" |
| `pop` | sticker slaps in slightly oversized (≈118%) and settles with a tiny 4-frame bounce | every sticker |
| draw (`draws`) | stroke draws on over 0.3–0.35 s, arrowhead last | arrows, swooshes, underlines |
| `stretch` | grows sideways | "Toooo" |
| `wobble` | gentle idle rotation | GIF-like stickers (crowd, clock, dancing) |
| `exit: "fade"` | ~0.1 s dim before the cut | end of the hook only |
| glitch transition | 0.3 s grey RGB bars | meme → title (Day 2) |

**Never:** camera moves, zooms, slides between scenes, crossfades between lockups, bouncing text loops, gradients, drop shadows (the only exception is the WOW sticker's own bubble style).

## 8. Mascot system

- **Monkeys** are the default cast (Days 1–3, 5): thinking, rapper, giggling, laughing-with-hat, doctor, cash, shades, goodbye-waving, praying, phone, yay.
- **Cats** took over for Day 4 (facepalm, yawn, WOW, OMG, "what", shades, interesting, crying with thumbs-up). That's a deliberate variety day; rotate in a "guest cast" every so often.
- **One mascot per lockup**, two at most (D2's "Mostly ideas were Toooo", D3's title). Size 20–36% of frame height.
- The sticker's **emotion must match the line's subtext** (laughing at an absurd idea, shocked at the work involved, praying while waiting for replies).

## 9. Voice and copy

- First-person, real-time diary ("we", "I"), honest, self-deprecating, with suspense at the end of every episode.
- Short spoken sentences of 6–14 words, roughly 2.5–3 words per second.
- Each episode advances **one** concrete step of the journey (Day 1 find ideas → Day 2 everything's crowded, one reel stops the scroll → Day 3 paper craft and a ChatGPT research gap → Day 4 decide to sell a complete DIY kit → Day 5 learn Blender and email 20 designers).
- Recurring CTA keywords: **IDEAS**, **PROMPT**. New lead magnets should be one-word, ALL-CAPS, in quotes.

## 10. Quality checklist (per episode)

- [ ] Hook in the first second, payoff word in mint, done within ~5 s
- [ ] Title card: numeral concept is new and the ZERO→SOMETHING path follows the numeral
- [ ] Every lockup: 2–4 families, black and mint only, one dominant line, tight leading, at least one fun device (§5)
- [ ] Every word appears **on its spoken syllable** (±2 frames)
- [ ] Breath frame (watermark only) between lockups, 0.1–0.3 s
- [ ] Stickers match the subtext; no more than two per lockup
- [ ] No accidental typos; intentional ones are obvious
- [ ] CTA (keyword or cliffhanger) + "See you tomorrow" + a Follow card styled differently from the last 3 days
- [ ] Watermark reads `DAY N` / `Day N` for the right day; handle visible bottom-right
- [ ] `npx hyperframes check --no-contrast` passes (mint on white is a deliberate brand choice; see the SKILL.md note)
