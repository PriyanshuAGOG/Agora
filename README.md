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
npx hyperframes browser ensure                                   # once per machine
node $E/tighten-vo.mjs raw-vo.mp3 episodes/day-09/audio/day-09-vo.m4a  # cut dead air, keep every word
bash $E/transcribe.sh episodes/day-09/audio/day-09-vo.m4a episodes/day-09/transcript.json   # offline Parakeet ASR
node $E/words.mjs episodes/day-09/transcript.json --gap 0.12     # timing sheet
# write episodes/day-09/reel.spec.json (see episodes/day-08/reel.spec.json and the skill's references/)
node $E/build.mjs episodes/day-09/reel.spec.json episodes/day-09/build-1440 --res 1440
cd episodes/day-09/build-1440 && npx hyperframes check --no-contrast && npx hyperframes render --quality delivery --output ../day-09.mp4
```

Requirements: Node.js ≥ 22, FFmpeg and Python 3. Rendered MP4s and build folders are git-ignored.
