#!/usr/bin/env node
// Scaffold an episode folder with a starter spec laid out on the series beat sheet.
//
//   node new-episode.mjs <day> <voiceover-audio-or-video> [--out <dir>] [--music <bed.mp3>]
//
// Creates <dir> (default: episodes/day-NN) with audio/, stickers/, media/, and reel.spec.json.
// The starter spec has placeholder scenes (hook, title, beats, CTA, see-you, follow) timed
// proportionally to the voiceover — replace every TODO with the real lines and word times.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [dayArg, voArg] = process.argv.slice(2);
if (!dayArg || !voArg) {
  console.error("usage: node new-episode.mjs <day> <voiceover-audio-or-video> [--out <dir>] [--music <bed.mp3>]");
  process.exit(2);
}
const flag = (n) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null);
const day = parseInt(dayArg, 10);
const pad = String(day).padStart(2, "0");
const out = path.resolve(flag("--out") || path.join("episodes", `day-${pad}`));
const vo = path.resolve(voArg);
if (!fs.existsSync(vo)) throw new Error(`voiceover not found: ${vo}`);
if (fs.existsSync(path.join(out, "reel.spec.json"))) throw new Error(`${out}/reel.spec.json already exists — not overwriting`);

for (const d of ["audio", "stickers", "media"]) fs.mkdirSync(path.join(out, d), { recursive: true });

// Extract / copy the voiceover as an audio-only file (works for .mp4/.mov inputs too).
const voOut = path.join(out, "audio", `day-${pad}-vo.m4a`);
execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", vo, "-vn", "-c:a", "aac", "-b:a", "192k", voOut]);
const duration = parseFloat(
  execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", voOut]).toString(),
);
const D = Math.round(duration * 100) / 100;
const audio = [{ id: "vo", src: `audio/${path.basename(voOut)}`, volume: 1 }];
const music = flag("--music");
if (music) {
  const m = path.join(out, "audio", path.basename(music));
  fs.copyFileSync(path.resolve(music), m);
  audio.push({ id: "music", src: `audio/${path.basename(m)}`, volume: 0.18 });
}

// Beat sheet proportions measured on Days 1–5 (hook ~12%, title ~8%, beats ~60%, CTA ~11%, outro ~9%).
const t = (f) => Math.round(D * f * 100) / 100;
const todo = (text, style, size, at, extra = {}) => ({ text, style, size, at, ...extra });
const scenes = [
  { id: "hook", start: 0.1, end: t(0.12), exit: "fade", box: { x: 13, y: 18, w: 72 }, rows: [
    { items: [todo("TODO setup line", "label", 6, 0.15, { anim: "swing" })] },
    { mt: -0.5, items: [todo("TODO SHOUT", "poster", 18, t(0.04), { anim: "type" })] },
    { mt: -2, fit: 1, items: [todo("TODO PAYOFF", "blast", 24, t(0.07), { color: "mint", anim: "rise" })] },
    { align: "right", items: [todo("TODO twist", "bookish-regular", 6, t(0.1), { anim: "pop" })] },
  ], stickers: [{ name: "monkey-thinking", at: t(0.08), x: 69, y: 14, h: 28, tag: { text: ".!!?", pos: "tr", size: 4.5 } }] },
  { id: "title", start: t(0.125), end: t(0.205), box: { x: 10, y: 30, w: 80 }, rows: [
    { items: [todo("This Is", "heavy", 7, t(0.13)), todo(`DAY ${day}`, "geo-black", 30, t(0.145), { color: "mint" })] },
    { items: [todo("Of Going From", "label-bold", 7, t(0.16))] },
  ], floaters: [
    todo("ZERO", "geo-black", 5, t(0.175), { box: true, x: 70, y: 28 }),
    todo("SOMETHING", "blast", 7, t(0.19), { x: 78, y: 72 }),
  ], draws: [{ shape: "swoosh-arrow", x: 62, y: 40, w: 22, h: 26, at: t(0.19), dur: 0.35 }],
    stickers: [{ name: "monkey-yay", at: t(0.15), x: 4, y: 12, h: 24 }] },
];
const beatCount = 5;
for (let b = 0; b < beatCount; b++) {
  const s = 0.21 + (0.6 * b) / beatCount, e = 0.21 + (0.6 * (b + 1)) / beatCount;
  scenes.push({ id: `beat-${b + 1}`, start: t(s), end: Math.round((t(e) - 0.15) * 100) / 100, box: { x: 11, y: 28, w: 78 }, rows: [
    { items: [todo("TODO Setup Line", "label", 8, t(s))] },
    { mt: -1, fit: 1, items: [todo("TODO PAYOFF", "poster", 16, t(s + 0.03), { color: "mint" })] },
  ] });
}
scenes.push(
  { id: "cta", start: t(0.81), end: t(0.9), box: { x: 11, y: 31, w: 79 }, rows: [
    { fit: 1, items: [todo("If You Want The TODO", "round", 7, t(0.81))] },
    { fit: 1, items: [todo("Comment 'KEYWORD'", "label-bold", 15, t(0.84), { color: "mint" })] },
    { fit: 1, items: [todo("I'LL SEND IT TO YOU", "poster", 16, t(0.87))] },
  ] },
  { id: "see-you", start: t(0.905), end: t(0.955), box: { x: 11, y: 43, w: 78 }, rows: [
    { fit: 1, items: [todo("SEE YOU TOMORROW", "geo-black", 11, t(0.905), { color: "mint" })] },
  ], stickers: [{ name: "monkey-goodbye", at: t(0.91), x: 15, y: 9, h: 36, tag: { text: "GOODBYE", pos: "tl", size: 2.6, color: "ink", rot: -12 } }] },
  { id: "follow", start: t(0.96), end: D, box: { x: 30, y: 43, w: 40 }, rows: [
    { fit: 1, items: [todo("Follow", "script", 11, t(0.96), { color: "mint" })] },
  ], stickers: [{ name: "monkey-flower", at: t(0.965), x: 45, y: 18, h: 22 }] },
);

const spec = {
  meta: { day, title: `Day ${day} - Zero to Something`, duration: D, handle: "@your.soulpreneur", watermark: { text: `DAY ${day}` } },
  audio,
  scenes,
};
fs.writeFileSync(path.join(out, "reel.spec.json"), JSON.stringify(spec, null, 2) + "\n");
console.log(`scaffolded ${path.relative(process.cwd(), out)} — VO ${D}s, ${scenes.length} placeholder scenes`);
console.log("next: node tighten-vo.mjs (optional) → bash transcribe.sh → node words.mjs → replace TODOs → node build.mjs reel.spec.json build");
