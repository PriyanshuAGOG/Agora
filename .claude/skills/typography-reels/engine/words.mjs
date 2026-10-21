#!/usr/bin/env node
// Print a voiceover transcript as timed sentences + words, ready for planning lockups.
//
//   node words.mjs <transcript.json|.srt|.vtt> [--gap 0.35]
//
// Accepts word-level JSON in the common shapes (array of {text|word, start, end}, {words:[...]},
// {segments:[{words:[...]}]}) — e.g. the output of `npx hyperframes transcribe` — or SRT/VTT cues.
// A new sentence starts after punctuation or a pause longer than --gap seconds.

import fs from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node words.mjs <transcript.json|.srt|.vtt> [--gap 0.35]");
  process.exit(2);
}
const gapArg = process.argv.indexOf("--gap");
const GAP = gapArg > 0 ? parseFloat(process.argv[gapArg + 1]) : 0.35;
const raw = fs.readFileSync(file, "utf8");

function fromJson(j) {
  const pick = (w) => ({ w: String(w.text ?? w.word ?? w.w ?? "").trim(), s: +(w.start ?? w.s ?? w.from), e: +(w.end ?? w.e ?? w.to) });
  if (Array.isArray(j)) {
    if (j.length && Array.isArray(j[0].words)) return j.flatMap((seg) => seg.words.map(pick));
    return j.map(pick);
  }
  if (Array.isArray(j.words)) return j.words.map(pick);
  if (Array.isArray(j.segments)) return j.segments.flatMap((seg) => (seg.words || [{ text: seg.text, start: seg.start, end: seg.end }]).map(pick));
  if (Array.isArray(j.transcript)) return fromJson(j.transcript);
  throw new Error("unrecognised transcript JSON shape");
}
function fromCues(text) {
  const ts = (t) => {
    const m = t.trim().replace(",", ".").split(":").map(Number);
    return m.length === 3 ? m[0] * 3600 + m[1] * 60 + m[2] : m[0] * 60 + m[1];
  };
  const out = [];
  for (const block of text.split(/\r?\n\r?\n/)) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, b] = lines[i].split("-->");
    const words = lines.slice(i + 1).join(" ").split(/\s+/).filter(Boolean);
    const s = ts(a), e = ts(b.trim().split(/\s+/)[0]);
    // spread cue words evenly (cue-level files carry no word timing)
    words.forEach((w, k) => out.push({ w, s: s + ((e - s) * k) / words.length, e: s + ((e - s) * (k + 1)) / words.length, brk: k === words.length - 1 }));
  }
  return out;
}

const words = (file.endsWith(".json") ? fromJson(JSON.parse(raw)) : fromCues(raw)).filter((x) => x.w && !Number.isNaN(x.s));
const sentences = [];
let cur = [];
words.forEach((x, k) => {
  cur.push(x);
  const next = words[k + 1];
  if (!next || x.brk || /[.!?]$/.test(x.w) || next.s - x.e > GAP) {
    sentences.push(cur);
    cur = [];
  }
});

const f = (n) => n.toFixed(2).padStart(6);
sentences.forEach((s, i) => {
  const text = s.map((x) => x.w).join(" ");
  console.log(`#${String(i + 1).padStart(2)} [${f(s[0].s)} → ${f(s[s.length - 1].e)}] (${(s[s.length - 1].e - s[0].s).toFixed(1)}s) ${text}`);
  console.log("     " + s.map((x) => `${x.w}@${x.s.toFixed(2)}`).join("  "));
});
console.log(`\n${words.length} words, ${sentences.length} sentences, ${(words.length / (words[words.length - 1].e - words[0].s)).toFixed(2)} words/s`);
