---
name: typography-reels
description: >
  Edit a "Zero to Something" typography reel (the @your.soulpreneur day-by-day series) end to end
  from a voiceover: tighten pauses, transcribe offline, design lockups that assemble word-by-word,
  wordplay, animated/3D/mascot stickers, SFX, camera moves and a numeral-as-journey title card, in
  the style of Days 1–5 plus the v2 engagement layer. Use when the user asks to edit, make, build or
  render Day N (8–75), the next episode, or any reel "like Days 1–5" from a voiceover. Builds a
  HyperFrames project from a JSON scene spec and renders MP4.
---

# Typography reels: "Zero to Something"

You are the editor of a daily series. Every episode is a ≤ 45 s, 16:9 typography reel built from the creator's voiceover. Your job per episode is **creative first, mechanical second**: invent the wordplay, sticker gags, sound hits and a fresh numeral concept for the title card, then express it as a spec that the engine turns into a HyperFrames composition.

## Read before the first episode of a session

1. `references/style-bible.md`: the visual system. **§11 (the engagement layer) is the current house style**; §1–10 are its foundations.
2. `references/creative-playbook.md`: how to turn each sentence into a lockup, with the sticker emotion map.
3. `references/title-card-concepts.md`: numeral concepts for Days 8–75.
4. `references/spec-format.md`: the JSON you will write (including the v2 section).
5. `references/episode-breakdown-days-1-5.md`: scene-by-scene reference for "how would they do this?".
6. `engine/stickers/README.md`: about 2,050 stickers in 4 libraries, plus naming and licences.
7. `references/diy-brand.md`: the **DIY · Do It Yar** brand (palette, fonts, the `brand:` sticker kit) that the series is building. Use it whenever the product, packaging or socials appear (Day 9 onwards).

HyperFrames itself is installed in `.agents/skills/` (`/hyperframes`, `/hyperframes-core`, `/hyperframes-cli`). The engine writes valid composition HTML; you mostly need the CLI commands below.

## Inputs (ask only for what is missing)

| Input | Required | Notes |
| --- | --- | --- |
| Day number | yes | watermark, progress bar, title card. **Check that the VO says the same number** (Day 8's VO said "day seven"; flag mismatches to the user) |
| Voiceover | yes | audio or video. The user prefers that you do everything else |
| CTA | optional | comment keyword (`IDEAS`, `PROMPT`) or a teaser; if the VO has none, end on See-you-tomorrow + Follow |
| Music bed | optional | none is bundled and music sites are blocked here, so ask once and add it to `audio[]` at volume 0.15–0.2 |
| Meme clips / new stickers | optional | `episodes/day-NN/media/`, `episodes/day-NN/stickers/` |

## Workflow (one episode, end to end)

`E=.claude/skills/typography-reels/engine`, run from the repo root.

1. **Setup, once per machine:** `npx hyperframes browser ensure`. Node ≥ 22, FFmpeg, Python 3.
2. **Folder:** `mkdir -p episodes/day-NN/audio` and copy the raw VO to `episodes/day-NN/audio/day-NN-vo-raw.<ext>`.
3. **Tighten the VO** (removes dead air, keeps every word):
   `node $E/tighten-vo.mjs episodes/day-NN/audio/day-NN-vo-raw.mp3 episodes/day-NN/audio/day-NN-vo.m4a --max-gap 0.14`
   It writes a `.cuts.json` map. If the VO has filler words ("um", repeated takes), cut them with `ffmpeg atrim` segments before transcribing.
4. **Transcribe offline (word timings):** `bash $E/transcribe.sh episodes/day-NN/audio/day-NN-vo.m4a episodes/day-NN/transcript.json`
   This uses NVIDIA Parakeet via sherpa-onnx. The model comes from GitHub releases, so it works where huggingface.co is blocked. The first run sets up about 650 MB in `~/.cache/typography-reels`.
   Then run `node $E/words.mjs episodes/day-NN/transcript.json --gap 0.12` for numbered sentences with every word's time.
   **Verify it.** Parakeet occasionally drops a whole phrase: on Day 8 "Step 2: check the domain on Hostinger" vanished, leaving a 3 s hole. Any gap of more than ~1 s between words, or any odd word, gets re-transcribed on its own slice (`ffmpeg -ss A -to B` → `transcribe.py`) and cross-checked with Whisper: `bash $E/verify-slice.sh <audio> <from> <to>` prints both models' output for that slice. Then patch `transcript.json`.
5. **Creative pass (never skip).** Read `episodes/series-log.md` (avoid repeating title concepts, fonts and Follow styles). Plan a table: `scene | time | lines (setup → payoff) | payoff font + anim | fun device | stickers (mascot / animated / 3D) | SFX | transition / camera`. Requirements:
   - Frame 1 moves (§11 hook); the first payoff slams by about 0.3 s.
   - Title card: a **new** numeral concept where ZERO→SOMETHING travels along the numeral (e.g. Day 8 *drew* the 8 as a thick mint figure-eight and traced the journey through it).
   - Every scene: ≥ 1 wordplay/font-as-meaning device, 1–3 stickers, an SFX on each hit, and a transition or camera move that differs from the previous scene.
   - **Find the episode's metaphor.** If the script has a running joke (Day 8: brand names as dating, "committed", "falling in love", "sleeping with it"), carry it visually through hook, title and payoff.
   - **Leave breathing room:** text blocks ≤ ~70% of the width, ≥ 8% margins, at most 3–4 rows per scene; split long sentences into two scenes.
   - **Lists and steps** get a repeating system (Day 8: "STEP" + a giant numeral on the left, the action on the right) so viewers feel the progress.
   - End teasers with a curiosity gap (Day 8: the chosen name is censored █████).
   - **Reveals need room.** When the VO says "here's what we came up with" and the user wants to show the result, open a gap in the VO right after that line: `ffmpeg -i vo.m4a -filter_complex "[0]atrim=0:T,asetpts=N/SR/TB[a];[0]atrim=start=T,asetpts=N/SR/TB[b];anullsrc=r=44100:cl=mono,atrim=0:GAP[s];[a][s][b]concat=n=3:v=0:a=1" vo-reveal.m4a`. Cut at a near-silent sample; Day 9 cut at 42.96 s and opened 6.8 s. Shift every later word time by GAP (Day 9's spec uses `S(t)`), and fill the gap with short THE LOGO / THE COLOURS / THE FONTS / THE VIBE scenes (or leave it blank if the user will drop footage in).
   - Show the plan to the user only if they asked to review plans; otherwise proceed.
6. **Write `episodes/day-NN/reel.spec.json`.** Item `at` = the spoken word time (multi-word lines can take per-word arrays). Leave 0.04–0.1 s between scenes. Add a 1.5–2 s Follow outro after the last word (`meta.duration` = VO + outro).
7. **Build, check, look:**
   ```bash
   node $E/build.mjs episodes/day-NN/reel.spec.json episodes/day-NN/build
   cd episodes/day-NN/build && npx hyperframes check --no-contrast
   npx hyperframes snapshot --at <the fullest moment of each scene>
   ```
   Fix builder `WARN`s and check errors, then **read every contact sheet**. Look for overlaps, clipped glyphs, unfinished letter animations at scene end, stickers off-frame, and empty halves of the frame. Iterate on the spec.
8. **Render (delivery, 1440p like the originals):**
   ```bash
   node $E/build.mjs episodes/day-NN/reel.spec.json episodes/day-NN/build-1440 --res 1440
   cd episodes/day-NN/build-1440 && npx hyperframes render --quality delivery --output ../day-NN.mp4
   ```
   That takes about 4–6 min for 41 s on 4 cores. Verify with `ffprobe` (duration, 30 fps, AAC) and decode 4–6 frames to check against the snapshots.
9. **Log it** in `episodes/series-log.md`.

## Engine facts

- **Units:** sizes/vertical = % of frame height; `x`/`w` = % of width; times = global seconds.
- **`fit`** scales a row to a share of the block width (poster look); overflowing rows auto-shrink.
- **Stickers:** `x/y/h`, or `anchor: {to: <item id>, pos}` to cover letters. Names resolve episode → brand kit → mascots → animated → 3D → flat; force a source with `brand:` / `3d:` / `anim:` / `lib:` / `emoji:`.
- **Letter animations** (`bounce`, `jitter`, `fix`, `wave`, `scatter`, …) must finish before the scene ends. With `fix`, set `fixAt` ≈ the spoken word, and keep total stagger under ~0.3 s.
- **Colour fonts** (`color-3d` Nabla, `honk`, `spice`) render flat/black in headless renders; prefer `fx` effects on normal fonts.
- **STEP numerals** use `titan` (Titan One, mint, `fx: "extrude"`, `fxColor: "ink"`) from Day 9 onwards. Climate Crisis (`crisis`) draws a squashed "3" with a black notch under the shadow, which reads as broken.
- **Anchor and `around` to row items.** On floaters (centred with a transform) anchored stickers, `around` circles and `strike`/`underline` can land offset (Day 9: the LOGO circle and the Option A/B/C marks). Next to floaters, place stickers and draws with explicit `x`/`y`/`w`/`h`.
- **Overlap pass before rendering:** extract a frame every 0.5 s from the build (`ffmpeg -vf fps=2,tile=4x6`) and look for stickers or bursts covering words, stamps over card text, and cards overlapping each other. Bursts fly *over* text, so keep them away from words or give the hero sticker `z: 10`.
- **Contrast:** mint `#0CD2BA` on white measures 1.87:1, below WCAG's 3:1, so `check` runs with `--no-contrast` by design (`#09A592` is the nearest passing mint).
- **Ignore** `nested_structure_needs_subcomposition`, `timeline_track_too_dense`, `composition_file_too_large`, `duplicate_media_discovery_risk`; they are Studio readability hints for the generated single file.
- The watermark is centred on its **ink** (canvas glyph metrics), so it stays optically centred for any day number.

## Examples

- `episodes/day-09/reel.spec.json`: the brand episode (57 s, NO-VIBE nametag hook, balloon-9 title, 4-step system, a 2×2 deliverables grid, a SH💩T rebus, a **6.8 s brand reveal opened in the VO**: logo slam, paint-chip palette, font specimens, box + Instagram mockups + sticker pack).
- `episodes/day-08/reel.spec.json`: **the best reference** (53 s, a dating metaphor through the whole script, a dating-card hook stamped TAKEN, a two-rings title, the 5-step STEP+numeral system, typing ChatGPT/search/comment cards, a count-up, Google colours, a censored-name cliffhanger, 52 SFX).
- `episodes/day-07/reel.spec.json`: notification hook, drawn 7 title with a climbing tracer, 15 animated stickers.
- `examples/day-01.json`: a faithful recreation of Day 1 (the v1 baseline; needs `examples/audio/day-01.m4a`).
- `examples/feature-demo.json`: alternative title-card mechanics (pixel 2, arc-text 5, ZERO-inside-the-0 for 10).

## Quality bar

A viewer who has seen Days 1–5 recognises the series instantly, but this episode is louder, funnier and never still: something moves or lands every ~0.5 s, every sentence has a visual joke, every hit has a sound, and the title card makes them curious about tomorrow's numeral.
