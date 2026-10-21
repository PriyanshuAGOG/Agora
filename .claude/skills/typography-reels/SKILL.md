---
name: typography-reels
description: >
  Edit a "Zero to Something" typography reel (the @your.soulpreneur day-by-day series) in the exact
  style of Days 1–5: off-white canvas, black + mint type lockups that assemble word-by-word on the
  voiceover, a giant pale DAY-N watermark, meme mascot stickers covering words, wordplay and a
  numeral-as-journey title card. Use when the user asks to edit, make, build or render Day N (8–75),
  the next episode, or any reel "like Days 1–5" from a voiceover. Builds a HyperFrames project
  from a JSON scene spec and renders MP4.
---

# Typography reels: "Zero to Something"

You are the editor of a daily series. Every episode is a 40–44 s, 16:9 typography reel built from the creator's voiceover. Your job per episode is **creative first, mechanical second**: think up the wordplay, sticker gags and a fresh numeral concept for the title card, then express it as a spec that the engine turns into a HyperFrames composition.

## Read before the first episode of a session

1. `references/style-bible.md`: the visual system (palette, type roles, layout, motion, stickers, devices, beat sheet). **Mandatory.**
2. `references/creative-playbook.md`: how to turn each sentence into a lockup, with the sticker emotion map.
3. `references/title-card-concepts.md`: the numeral concept library for Days 8–75.
4. `references/spec-format.md`: the JSON you will write.
5. `references/episode-breakdown-days-1-5.md`: scene-by-scene reference. Consult it when unsure "how would they do this?".

HyperFrames itself is installed in `.agents/skills/` (entry: `/hyperframes`, contract: `/hyperframes-core`, CLI: `/hyperframes-cli`). You only need the CLI commands below; the engine writes valid composition HTML for you.

## Inputs to collect (ask only for what is missing)

| Input | Required | Notes |
| --- | --- | --- |
| Day number | yes | drives the watermark and title card |
| Voiceover | yes | audio or the raw video; its length = episode length |
| Script / what happens today | recommended | for exact wording and payoff words; the transcript covers the rest |
| CTA | recommended | a comment keyword (e.g. `IDEAS`, `PROMPT`, plus what they'll receive) **or** a teaser for tomorrow |
| Music bed | optional | the originals had a quiet bed under the VO (`--music`) |
| Meme clips / new stickers | optional | drop them into the episode's `media/` and `stickers/` folders |

## Workflow (one episode)

Paths below are relative to the repo root; `E=.claude/skills/typography-reels/engine`.

1. **One-time setup per machine:** `npx hyperframes browser ensure` (downloads the headless Chrome renderer). Node ≥ 22 and FFmpeg are required.
2. **Scaffold:** `node $E/new-episode.mjs <N> <voiceover-file> [--music bed.mp3]` → creates `episodes/day-NN/` with `audio/`, `stickers/`, `media/` and a starter `reel.spec.json` laid out on the series beat sheet (all TODOs).
3. **Get word timings:**
   - `npx hyperframes transcribe episodes/day-NN/audio/day-NN-vo.m4a --json > episodes/day-NN/transcript.json` (the first run downloads a Whisper model from huggingface.co. If that host is blocked, run it where it isn't, or have the user supply an `.srt`/`.vtt` or word-timed JSON from any captioning tool).
   - `node $E/words.mjs episodes/day-NN/transcript.json` → numbered sentences with every word's start time. This is your timing sheet.
4. **Creative pass (do not skip).** Check `episodes/series-log.md` for the recent title concepts, mascots, CTAs and Follow styles, then plan in a table: `scene | time range | lines (setup → payoff) | payoff word in mint | fun device | sticker | anim`. Rules of thumb:
   - Hook in ≤ 5 s, the title card starting by 4–6 s, 5–8 story lockups, one *turn*, then CTA/teaser → "See you tomorrow" → a Follow card styled differently from the last three days.
   - Every lockup needs ≥ 1 device from the playbook. The title card needs a **new** numeral concept where ZERO→SOMETHING travels along the numeral.
   - Show the plan to the user and let them redirect before building, unless they have said to go straight through.
5. **Write the spec:** replace the scaffold's TODOs (or rewrite scenes freely). Items' `at` = the spoken word time from step 3 (−0.03 s). Leave 0.1–0.3 s breath gaps between scenes.
6. **Build and check:**
   ```bash
   node $E/build.mjs episodes/day-NN/reel.spec.json episodes/day-NN/build      # add --res 1440 for 2560x1440 delivery
   cd episodes/day-NN/build && npx hyperframes check --no-contrast
   ```
   Fix every builder `WARN` and every check error. Then `npx hyperframes snapshot --at <each scene's end time>` and **look at the contact sheet**. Compare against the style bible's checklist (§10): balance, mint payoff, sticker placement, nothing off-frame, title concept readable. Iterate on the spec, not the generated HTML.
7. **Preview / approve:** `npx hyperframes preview --background` for an interactive Studio review if the user wants it; otherwise share the snapshot contact sheet. Render only after the user approves (unless they asked for a straight-through render).
8. **Render:** `npx hyperframes render --quality delivery --output ../day-NN.mp4` (≈1–2 min for 42 s at 1080p on 4 cores). Verify with `ffprobe` (duration ≈ VO length, 30 fps, AAC audio present) and spot-check 3–4 decoded frames.
9. **Log it:** append a row to `episodes/series-log.md` (title concept, mascot cast, devices, CTA keyword, Follow style).

## Engine facts you will need

- **Units:** sizes and vertical values are % of frame height; `x`/`w` are % of width; times are global seconds.
- **`fit`** on a row scales the whole line to a share of the text block's width. Use `fit: 1` on payoff lines for the poster look. Rows that would overflow shrink automatically.
- **Stickers** can be placed absolutely (`x`, `y`, `h`) or **anchored to a word** (`anchor: {to: <item id>, pos: "c"}`) to cover letters. The house entrance is `pop`.
- **Inline rebus:** a row item `{ "sticker": "heart", "size": 8 }` sits inside the sentence.
- **Arc text, clock, money rain, glitch, meme clips, draw-on arrows, underline/strike, outline, vertical text** are all built in (see `spec-format.md`).
- **Fonts** are bundled (OFL, `engine/fonts`). Styles are roles, not font names; add or adjust roles in `engine/presets.mjs`.
- **Contrast:** the signature mint `#0CD2BA` on `#FCFCFC` measures 1.87:1, below WCAG's 3:1, so HyperFrames' contrast audit fails it by design. That is why `check` runs with `--no-contrast`. If the user ever wants accessible captions, `#09A592` is the nearest passing mint.
- `check` warns `nested_structure_needs_subcomposition` / `timeline_track_too_dense`. These are Studio readability hints for a generated single-file composition; ignore them.

## Examples

- `examples/day-01.json`: a full recreation of Day 1 (expects `examples/audio/day-01.m4a`, extracted from the Day 1 video with `ffmpeg -i day1.mp4 -vn -c:a copy examples/audio/day-01.m4a`). Use it as the reference for density, sizes and timing.
- `examples/feature-demo.json`: Day 2/Day 5-style title cards, a Day 10 "ZERO inside the 0" card, stretch, rebus heart, clock, strike, thought cloud, glitch.

## Quality bar

An episode is done when a viewer who has seen Days 1–5 would not notice a different editor: same palette and chrome, lockups that land on the voice, at least one laugh-out-loud sticker or wordplay moment per 10 seconds, and a title card that makes them want to see tomorrow's numeral.
