# Agora: Zero to Something reel studio

Tooling for editing the daily **"Zero to Something"** typography reels (@your.soulpreneur) with [HyperFrames](https://github.com/heygen-com/hyperframes) and Claude Code.

| Path | What it is |
| --- | --- |
| `.claude/skills/typography-reels/` | **Our skill**: style bible distilled from Days 1–5, the creative playbook, title-card concepts, the spec→HyperFrames engine, fonts and the sticker library |
| `.agents/skills/` (+ symlinks in `.claude/skills/`) | The HyperFrames skills (`npx skills add heygen-com/hyperframes --all`), pinned in `skills-lock.json` |
| `episodes/` | One folder per day (`day-08/` …) plus `series-log.md` |

## Make an episode

Ask Claude Code: *"Edit Day 8. Voiceover is episodes/day-08-vo.m4a, CTA keyword DESIGNERS."* The skill takes over. The manual path is:

```bash
E=.claude/skills/typography-reels/engine
npx hyperframes browser ensure                         # once per machine
node $E/new-episode.mjs 8 path/to/voiceover.m4a        # → episodes/day-08/
npx hyperframes transcribe episodes/day-08/audio/day-08-vo.m4a --json > episodes/day-08/transcript.json
node $E/words.mjs episodes/day-08/transcript.json      # timing sheet
# write episodes/day-08/reel.spec.json (see the skill's references/)
node $E/build.mjs episodes/day-08/reel.spec.json episodes/day-08/build
cd episodes/day-08/build && npx hyperframes check --no-contrast && npx hyperframes render --quality delivery --output ../day-08.mp4
```

Requirements: Node.js ≥ 22 and FFmpeg.
