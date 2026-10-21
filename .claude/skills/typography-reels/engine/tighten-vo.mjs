#!/usr/bin/env node
// Tighten a voiceover: shorten every pause to at most --max-gap seconds, trim the head/tail,
// keep every spoken word. Writes the new audio plus a cut map (old time -> new time).
//
//   node tighten-vo.mjs <in-audio> <out-audio> [--max-gap 0.16] [--threshold -40] [--min-silence 0.18]
//
// Run it BEFORE transcribing, so word timings match the tightened file.

import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";

const [inp, out] = process.argv.slice(2);
if (!inp || !out) {
  console.error("usage: node tighten-vo.mjs <in-audio> <out-audio> [--max-gap 0.16] [--threshold -40] [--min-silence 0.18]");
  process.exit(2);
}
const opt = (n, d) => (process.argv.includes(n) ? parseFloat(process.argv[process.argv.indexOf(n) + 1]) : d);
const MAX_GAP = opt("--max-gap", 0.16);
const THRESH = opt("--threshold", -40);
const MIN_SIL = opt("--min-silence", 0.18);
const LEAD = 0.05, TAIL = 0.35;

const total = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", inp]).toString());
const det = spawnSync("ffmpeg", ["-nostdin", "-hide_banner", "-i", inp, "-af", `silencedetect=n=${THRESH}dB:d=${MIN_SIL}`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
const sil = [];
let cur = null;
for (const line of det.split("\n")) {
  const s = line.match(/silence_start: ([\d.]+)/);
  const e = line.match(/silence_end: ([\d.]+)/);
  if (s) cur = parseFloat(s[1]);
  if (e && cur != null) {
    sil.push([cur, parseFloat(e[1])]);
    cur = null;
  }
}
if (cur != null) sil.push([cur, total]);

// keep-segments = everything except the trimmed middle of each long silence
const keep = [];
let pos = 0;
for (const [a, b] of sil) {
  if (a <= 0.01) {
    pos = Math.max(0, b - LEAD); // leading silence
    continue;
  }
  if (b >= total - 0.01) {
    keep.push([pos, Math.min(total, a + TAIL)]); // trailing silence
    pos = total;
    continue;
  }
  if (b - a <= MAX_GAP) continue;
  keep.push([pos, a + MAX_GAP / 2]);
  pos = b - MAX_GAP / 2;
}
if (pos < total) keep.push([pos, total]);

const parts = keep.map(([a, b], i) => `[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
const filter = `${parts.join(";")};${keep.map((_, i) => `[a${i}]`).join("")}concat=n=${keep.length}:v=0:a=1[out]`;
execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", inp, "-filter_complex", filter, "-map", "[out]", "-c:a", out.endsWith(".wav") ? "pcm_s16le" : "aac", "-b:a", "192k", out]);

let t = 0;
const map = keep.map(([a, b]) => {
  const m = { from: +a.toFixed(3), to: +b.toFixed(3), newStart: +t.toFixed(3) };
  t += b - a;
  return m;
});
fs.writeFileSync(out.replace(/\.[^.]+$/, "") + ".cuts.json", JSON.stringify({ original: +total.toFixed(3), tightened: +t.toFixed(3), segments: map }, null, 2) + "\n");
console.log(`tightened ${total.toFixed(2)}s -> ${t.toFixed(2)}s (${sil.length} pauses found, ${keep.length} segments kept, max gap ${MAX_GAP}s)`);
