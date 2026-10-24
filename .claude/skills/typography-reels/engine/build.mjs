#!/usr/bin/env node
// Typography-reel builder: scene spec (JSON) -> self-contained HyperFrames project.
//
//   node build.mjs <spec.json> <out-dir> [--res 1080|1440]
//
// The spec format is documented in ../references/spec-format.md.
// The output directory is a normal HyperFrames project: run `npx hyperframes check`,
// `npx hyperframes preview` and `npx hyperframes render` inside it.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { COLORS, FONT_FACES, STYLES, DEFAULTS } from "./presets.mjs";
import { SHAPES } from "./shapes.mjs";

const ENGINE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("usage: node build.mjs <spec.json> <out-dir> [--res 1080|1440]");
  process.exit(2);
}
const specPath = path.resolve(args[0]);
const outDir = path.resolve(args[1]);
const resFlag = args.includes("--res") ? args[args.indexOf("--res") + 1] : null;
const specDir = path.dirname(specPath);
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const meta = spec.meta || {};

const H = resFlag === "1440" ? 1440 : meta.height || DEFAULTS.height;
const W = resFlag === "1440" ? 2560 : meta.width || DEFAULTS.width;
const U = H / 100; // 1 spec unit = 1% of frame height
const px = (v) => `${round(v * U)}px`;
const round = (v) => Math.round(v * 100) / 100;
const warnings = [];
const warn = (m) => warnings.push(m);

// ---------- helpers ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const color = (c, fallback = COLORS.ink) => (!c ? fallback : COLORS[c] || c);
let uid = 0;
const nextId = (p) => `${p}${++uid}`;
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// Seeded PRNG (mulberry32) so every "random" layout is deterministic.
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const usedFamilies = new Set(["Poppins"]);
function styleCss(item) {
  const st = STYLES[item.style || "label"];
  if (!st) throw new Error(`unknown style "${item.style}" (see engine/presets.mjs STYLES)`);
  usedFamilies.add(st.f);
  const css = [
    `font-family:'${st.f}'`,
    `font-weight:${st.w}`,
    `font-style:${st.s || "normal"}`,
    `font-size:${px(item.size ?? 5)}`,
    `line-height:${item.lh ?? st.lh ?? 1}`,
    `letter-spacing:${item.ls ?? st.ls ?? 0}em`,
  ];
  if (item.case === "upper" || (st.up && item.case !== "none")) css.push("text-transform:uppercase");
  if (item.case === "lower") css.push("text-transform:lowercase");
  if (item.outline) {
    css.push(`color:${COLORS.bg}`, `-webkit-text-stroke:${item.outlineWidth ?? 0.035}em ${color(item.color, COLORS.mint)}`);
  } else if (!st.colorFont || item.color) css.push(`color:${color(item.color)}`);
  const shadows = fxShadows(item);
  if (shadows.length) css.push(`text-shadow:${shadows.join(",")}`);
  if (asList(item.fx).includes("sticker")) css.push("filter:drop-shadow(0 0.05em 0.06em rgba(0,0,0,0.28))");
  return css.join(";");
}

// Text effects that are pure text-shadow stacks.
function fxShadows(item) {
  const out = [];
  const fxc = color(item.fxColor || (item.color === "mint" ? "ink" : "mint"));
  for (const fx of asList(item.fx)) {
    if (fx === "extrude") for (let i = 1; i <= 7; i++) out.push(`${round(i * 0.011)}em ${round(i * 0.011)}em 0 ${fxc}`);
    if (fx === "shadow") out.push(`0.065em 0.065em 0 ${fxc}`);
    if (fx === "glow") out.push(`0 0 0.18em ${fxc}`, `0 0 0.5em ${fxc}`);
    if (fx === "sticker") {
      const w = item.stickerColor ? color(item.stickerColor) : "#FFFFFF";
      for (let a = 0; a < 16; a++) {
        const r = 0.075;
        out.push(`${round(Math.cos((a * Math.PI) / 8) * r * 1000) / 1000}em ${round(Math.sin((a * Math.PI) / 8) * r * 1000) / 1000}em 0 ${w}`);
      }
    }
  }
  return out;
}

// ---------- assets ----------
const assetDirs = { stickers: new Map(), audio: new Map(), media: new Map() };
const lottieData = {}; // name -> animation JSON (embedded so render never fetches)
const STICKER_ROOTS = () => [
  path.join(specDir, "stickers"),
  specDir,
  path.join(ENGINE, "stickers", "brand"), // the DIY / Do It Yar brand kit (logo, stickers, swatches, mockups)
  path.join(ENGINE, "stickers", "library"), // series mascots
  path.join(ENGINE, "stickers", "animated"), // Noto animated emoji (Lottie)
  path.join(ENGINE, "stickers", "3d"), // Fluent 3D emoji
  path.join(ENGINE, "stickers", "emoji"), // Twemoji flat
];
function resolveSticker(name) {
  if (assetDirs.stickers.has(name)) return assetDirs.stickers.get(name);
  const exts = ["", ".png", ".webp", ".gif", ".svg", ".jpg", ".json"];
  // optional source prefix: "3d:fire", "anim:fire", "emoji:fire", "lib:monkey-yay"
  const pre = { "3d": "3d", anim: "animated", emoji: "emoji", lib: "library", brand: "brand" };
  const [p0, p1] = name.includes(":") ? name.split(":") : [null, name];
  const roots = p0 ? [path.join(ENGINE, "stickers", pre[p0] || p0)] : STICKER_ROOTS();
  for (const r of roots)
    for (const e of exts) {
      const p = path.join(r, p1 + e);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        if (p.endsWith(".json")) {
          if (path.basename(p) === "index.json") continue;
          lottieData[name] = JSON.parse(fs.readFileSync(p, "utf8"));
          const v = { kind: "lottie", name };
          assetDirs.stickers.set(name, v);
          return v;
        }
        const rel = `assets/stickers/${path.basename(p)}`;
        const v = { kind: "img", src: p, rel };
        assetDirs.stickers.set(name, v);
        return v;
      }
    }
  throw new Error(`sticker "${name}" not found (episode stickers/, engine/stickers/{library,animated,3d,emoji})`);
}
// <img> or a Lottie container sized by height
function stickerMedia(s, heightCss, extraStyle = "") {
  if (s.kind === "lottie")
    return `<div class="lot" data-lottie="${esc(s.name)}" data-layout-allow-occlusion style="height:${heightCss};aspect-ratio:1/1;${extraStyle}"></div>`;
  return `<img src="${s.rel}" alt="" data-layout-allow-occlusion style="height:${heightCss};display:block;${extraStyle}" />`;
}
function resolveFile(kind, src) {
  const p = path.isAbsolute(src) ? src : path.join(specDir, src);
  if (!fs.existsSync(p)) throw new Error(`${kind} file not found: ${p}`);
  const rel = `assets/${kind}/${path.basename(p)}`;
  assetDirs[kind].set(rel, { src: p, rel });
  return rel;
}

// ---------- sound effects ----------
// Named SFX resolve against engine/sfx, then HyperFrames' bundled library (.agents/skills/media-use/audio/assets/sfx).
function sfxDirs() {
  const dirs = [path.join(specDir, "sfx"), path.join(ENGINE, "sfx")];
  let d = ENGINE;
  for (let i = 0; i < 8; i++) {
    const cand = path.join(d, ".agents", "skills", "media-use", "audio", "assets", "sfx");
    if (fs.existsSync(cand)) dirs.push(cand);
    d = path.dirname(d);
  }
  return dirs;
}
const SFX_DEFAULT_VOL = { pop: 0.35, "click-soft": 0.4, click: 0.35, whoosh: 0.35, "whoosh-short": 0.3, "impact-bass-1": 0.55, "impact-bass-2": 0.5, ding: 0.35, boing: 0.4, notification: 0.45, error: 0.35, sparkle: 0.3, "glitch-1": 0.35, typing: 0.3, ping: 0.3, chime: 0.3, riser: 0.3, "record-scratch": 0.45, swish: 0.3 };
const sfxCues = []; // { name|src, at, volume }
function cue(s, at) {
  if (!s) return;
  const c = typeof s === "string" ? { name: s } : s;
  sfxCues.push({ ...c, at: round(c.at ?? at) });
}
function resolveSfx(c) {
  if (c.src) return resolveFile("audio", c.src);
  for (const d of sfxDirs())
    for (const e of [".mp3", ".wav", ".ogg", ".m4a"]) {
      const p = path.join(d, c.name + e);
      if (fs.existsSync(p)) {
        const rel = `assets/audio/sfx-${path.basename(p)}`;
        assetDirs.audio.set(rel, { src: p, rel });
        return rel;
      }
    }
  throw new Error(`sfx "${c.name}" not found in ${sfxDirs().join(", ")}`);
}
const durCache = new Map();
function mediaDuration(file) {
  if (durCache.has(file)) return durCache.get(file);
  let d = 2;
  try {
    d = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]).toString());
  } catch {}
  durCache.set(file, d);
  return d;
}

// ---------- animation plan (consumed by the runtime script) ----------
const plan = []; // entries interpreted by runtime.js
const anchors = []; // sticker/draw anchors resolved after fonts load
const LETTER_ANIMS = new Set(["bounce", "pop-letters", "scatter", "fix", "wave", "jitter", "flicker", "rise-letters", "spin-letters", "drop-letters"]);

// ---------- items (text pieces) ----------
function renderItem(item, scene, floating = false) {
  const id = item.id ? `i-${item.id}` : nextId("i");
  if (item.sticker) return renderInlineSticker(item, id, scene);
  const at = item.at ?? scene.start;
  const anim = item.anim || "cut";
  const text = item.text ?? "";
  let inner;
  let animated = true;
  // per-letter colours (e.g. a Google-coloured "Google"): cycles through item.colors, skipping spaces
  let ci = 0;
  const letterColor = (c) => (item.colors && c !== " " ? `color:${color(item.colors[ci++ % item.colors.length])}` : "");
  if (anim === "count") {
    // count-up number: "0" -> "20+" (text is ignored; count = { from, to, prefix, suffix, dur })
    const c = item.count || {};
    inner = `<span id="${id}-n">${esc((c.prefix ?? "") + (c.from ?? 0) + (c.suffix ?? ""))}</span>`;
    plan.push({ k: "count", id: `${id}-n`, at, from: c.from ?? 0, to: c.to ?? 10, prefix: c.prefix ?? "", suffix: c.suffix ?? "", dur: c.dur ?? 0.6 });
  } else if (Array.isArray(at)) {
    // per-word timing: one time per word
    const words = text.split(/\s+/);
    if (words.length !== at.length) warn(`${id}: ${words.length} words but ${at.length} times`);
    inner = words.map((w, k) => `<span class="w hf-in" id="${id}-w${k}">${esc(w)}</span>`).join(" ");
    plan.push({ k: "words", id, n: words.length, times: at });
    checkTime(at[0], scene, id);
    animated = false;
  } else if (anim === "type") {
    const chars = [...text];
    inner = chars.map((c, k) => `<span class="ch hf-in" id="${id}-c${k}">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    plan.push({ k: "chars", id, n: chars.length, at, dur: item.dur ?? Math.min(0.5, 0.045 * chars.length) });
    checkTime(at, scene, id);
    animated = false;
  } else if (LETTER_ANIMS.has(anim)) {
    const chars = [...text];
    const hidden = !["fix", "jitter"].includes(anim);
    inner = chars.map((c, k) => `<span class="lt${hidden ? " hf-in" : ""}" id="${id}-c${k}" style="${letterColor(c)}">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    const rnd = prng(hash(id) + 99);
    const rand = chars.map(() => [rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1]);
    const steps = [];
    if (anim === "jitter") {
      const n = Math.max(1, Math.floor(((item.until ?? scene.end) - at) / 0.12));
      for (let s = 0; s < n; s++) steps.push(chars.map(() => [round((rnd() * 2 - 1) * 9), round((rnd() * 2 - 1) * 0.05 * 1000) / 1000]));
    }
    plan.push({ k: "letters", id, n: chars.length, anim, at, dur: item.dur, stagger: item.stagger, end: item.until ?? scene.end, em: (item.size ?? 5) * U, rand, steps, fixAt: item.fixAt });
    checkTime(at, scene, id);
    animated = anim === "jitter" || anim === "fix"; // whole item appears at `at`, letters then move
  } else if (item.colors) {
    inner = [...text].map((c) => `<span style="${letterColor(c)}">${esc(c)}</span>`).join("");
  } else {
    inner = esc(text);
  }
  const box = item.box
    ? `;background:${color(item.box === true ? "mint" : item.box)};padding:${item.pad ?? "0.04em 0.22em 0.02em"};border-radius:${item.radius ?? 0.08}em`
    : "";
  const txStyle = [styleCss(item) + box];
  const tf = [];
  if (floating) tf.push("translate(-50%,-50%)");
  if (item.vertical) {
    txStyle.push("writing-mode:vertical-rl");
    tf.push("rotate(180deg)");
  }
  if (item.rot) tf.push(`rotate(${item.rot}deg)`);
  if (item.skew) tf.push(`skewX(${item.skew}deg)`);
  if (item.stretchY) tf.push(`scaleY(${item.stretchY})`);
  if (item.stretchX) tf.push(`scaleX(${item.stretchX})`);
  if (tf.length) txStyle.push(`transform:${tf.join(" ")}`, `transform-origin:${floating ? "50% 50%" : "50% 100%"}`);

  const outer = [`font-size:${px(item.size ?? 5)}`];
  if (floating) {
    outer.push(`left:${item.x}%`, `top:${item.y}%`);
  } else {
    if (item.dx) outer.push(`margin-left:${px(item.dx)}`);
    if (item.dy) outer.push(`top:${px(item.dy)}`);
    if (item.mr) outer.push(`margin-right:${px(item.mr)}`);
  }
  if (item.z) outer.push(`z-index:${item.z}`);
  const fxList = asList(item.fx);
  const ul = item.underline
    ? `<span class="ul hf-in" id="${id}-ul" style="background:${color(item.underlineColor || item.color || "ink")};height:${item.underlineWeight ?? 0.085}em"></span>`
    : "";
  const strike = item.strike
    ? `<span class="strike hf-in" id="${id}-st" style="background:${color(item.strikeColor || "red")}"></span>`
    : "";
  const hl = fxList.includes("highlight")
    ? `<span class="hl hf-in" id="${id}-hl" style="background:${color(item.highlightColor || "yellow")}"></span>`
    : "";
  let echo = "";
  if (item.echo) {
    const e = item.echo === true ? {} : item.echo;
    const n = e.n ?? 3;
    for (let k = 1; k <= n; k++) {
      echo += `<span class="echo hf-in" id="${id}-e${k}" data-layout-ignore style="top:${round(k * (e.step ?? 0.82))}em"><span class="tx" style="${txStyle.join(";").replace(/font-size:[^;]+/, "font-size:1em")}">${esc(text)}</span></span>`;
      plan.push({ k: "echo", id: `${id}-e${k}`, at: (e.at ?? (Array.isArray(at) ? at[0] : at) + 0.15) + (k - 1) * (e.stagger ?? 0.1), op: round(Math.max(0.12, 0.55 - (k - 1) * (e.fade ?? 0.16))) });
    }
  }
  // Per-word / typewriter lines reveal their words one by one, but the container itself must not show early:
  // a box background would sit there empty, and an entrance anim (stamp, slam…) would be lost. Reveal it on the first word.
  const reveal = !animated && (item.box || (item.anim && Array.isArray(at)));
  const cls = `it${floating ? " fl" : ""}${animated || reveal ? " hf-in" : ""}`;
  // Stickers covering words is a signature of the style, so every word allows occlusion.
  const allowOverlap = (floating || item.overlap ? " data-layout-allow-overlap" : "") + " data-layout-allow-occlusion";
  const html = `<span class="${cls}" id="${id}" style="${outer.join(";")}">${hl}<span class="tx"${allowOverlap} style="${txStyle.join(";").replace(/font-size:[^;]+/, "font-size:1em")}">${inner}</span>${echo}${ul}${strike}</span>`;
  const t0 = Array.isArray(at) ? at[0] : at;
  if (animated) {
    plan.push({ k: "item", id, anim: LETTER_ANIMS.has(anim) ? "cut" : anim === "count" ? "pop" : anim, at, dur: item.dur });
    checkTime(at, scene, id);
  } else if (reveal) {
    plan.push({ k: "item", id, anim: Array.isArray(at) && item.anim && !LETTER_ANIMS.has(item.anim) && item.anim !== "type" ? item.anim : "cut", at: t0, dur: item.dur });
  }
  if (item.underline) {
    const u = item.underline === true ? {} : item.underline;
    plan.push({ k: "ul", id: `${id}-ul`, at: u.at ?? (Array.isArray(at) ? at[at.length - 1] : at) + 0.12, dur: u.dur ?? 0.25 });
  }
  if (item.strike) {
    const s = item.strike === true ? {} : item.strike;
    plan.push({ k: "ul", id: `${id}-st`, at: s.at ?? t0 + 0.3, dur: s.dur ?? 0.2 });
  }
  if (hl) plan.push({ k: "ul", id: `${id}-hl`, at: item.highlightAt ?? t0 + 0.08, dur: 0.22 });
  if (item.out) plan.push({ k: "hide", id, at: item.out });
  cue(item.sfx, t0);
  return html;
}

function renderInlineSticker(item, id, scene) {
  const s = resolveSticker(item.sticker);
  const at = item.at ?? scene.start;
  plan.push({ k: "item", id, anim: item.anim || "pop", at, dur: item.dur });
  checkTime(at, scene, id);
  const outer = [];
  if (item.dx) outer.push(`margin-left:${px(item.dx)}`);
  if (item.dy) outer.push(`top:${px(item.dy)}`);
  if (item.mr) outer.push(`margin-right:${px(item.mr)}`);
  cue(item.sfx, at);
  return `<span class="it ist hf-in" id="${id}" style="${outer.join(";")}">${stickerMedia(s, px(item.size ?? 5), item.flip ? "transform:scaleX(-1)" : "")}</span>`;
}

function checkTime(t, scene, id) {
  if (t < scene.start - 0.001 || t > scene.end + 0.001)
    warn(`${id}: at=${t} is outside its scene [${scene.start}, ${scene.end}] and will never show`);
}

// ---------- stickers (free-floating images / Lottie that may cover text) ----------
function renderSticker(st, scene) {
  const id = st.id ? `s-${st.id}` : nextId("s");
  const s = resolveSticker(st.name);
  const at = st.at ?? scene.start;
  checkTime(at, scene, id);
  const h = st.h ?? 20;
  const outer = [`height:${px(h)}`];
  if (st.anchor) {
    anchors.push({ id, to: `i-${st.anchor.to}`, pos: st.anchor.pos || "tr", dx: (st.anchor.dx ?? 0) * U, dy: (st.anchor.dy ?? 0) * U });
    outer.push("left:0", "top:0");
  } else {
    outer.push(`left:${st.x ?? 70}%`, `top:${st.y ?? 15}%`);
  }
  if (st.z != null) outer.push(`z-index:${st.z}`);
  // die-cut sticker look: a white outline (cut: true | thickness in % of H) plus a soft drop shadow
  if (st.cut) {
    const t = round((st.cut === true ? 0.45 : st.cut) * U);
    const d = round(t * 0.7);
    outer.push(`filter:drop-shadow(${t}px 0 0 #fff) drop-shadow(-${t}px 0 0 #fff) drop-shadow(0 ${t}px 0 #fff) drop-shadow(0 -${t}px 0 #fff) drop-shadow(${d}px ${d}px 0 #fff) drop-shadow(-${d}px -${d}px 0 #fff) drop-shadow(0 ${round(U * 0.6)}px ${round(U * 0.7)}px rgba(0,0,0,.28))`);
  } else if (st.shadow) outer.push(`filter:drop-shadow(0 ${round(U * 0.8)}px ${round(U * 1.2)}px rgba(0,0,0,.3))`);
  const imgT = [];
  if (st.flip) imgT.push("scaleX(-1)");
  if (st.rot) imgT.push(`rotate(${st.rot}deg)`);
  const tag = st.tag ? renderTag(st.tag) : "";
  plan.push({ k: "sticker", id, anim: st.anim || "pop", at, dur: st.dur, out: st.out });
  if (st.wobble) plan.push({ k: "wobble", id: `${id}-wb`, at: at + 0.25, end: st.out ?? scene.end, amp: st.wobble === true ? 4 : st.wobble });
  if (st.spinTurns) plan.push({ k: "spin", id: `${id}-wb`, at, end: st.out ?? scene.end, turns: st.spinTurns });
  if (st.float) plan.push({ k: "float", id: `${id}-wb`, at: at + 0.2, end: st.out ?? scene.end, amp: (st.float === true ? 1 : st.float) * U });
  cue(st.sfx, at);
  const media = stickerMedia(s, "100%", imgT.length ? `transform:${imgT.join(" ")}` : "");
  return `<div class="st hf-in" id="${id}" data-layout-allow-occlusion style="${outer.join(";")}"><div class="wb" id="${id}-wb" data-layout-allow-occlusion>${media}</div>${tag}</div>`;
}

function renderTag(tag) {
  // small reaction text glued to a sticker: ".!!?", "OMG!", "GOODBYE", "WOW", "zzz"
  const pos = tag.pos || "tr";
  const place = {
    tr: "right:-0.2em;top:-0.4em",
    tl: "left:-0.2em;top:-0.4em",
    t: "left:50%;top:-0.9em;transform:translateX(-50%)",
    b: "left:50%;bottom:-0.9em;transform:translateX(-50%)",
    br: "right:-0.2em;bottom:-0.3em",
    bl: "left:-0.2em;bottom:-0.3em",
    c: "left:50%;top:50%;transform:translate(-50%,-50%)",
  }[pos];
  const css = styleCss({ style: tag.style || "geo-black", size: tag.size ?? 3, color: tag.color || "red", fx: tag.fx });
  return `<span class="tag" style="${css};${place}${tag.rot ? `;rotate:${tag.rot}deg` : ""}">${esc(tag.text)}</span>`;
}

// ---------- hand-drawn strokes (arrows, underlines, circles) ----------
function renderDraw(d, scene) {
  const id = d.id ? `d-${d.id}` : nextId("d");
  if (d.shape === "clock") return renderClock(d, id, scene);
  const shape = SHAPES[d.shape];
  if (!shape) throw new Error(`unknown draw shape "${d.shape}" (see engine/shapes.mjs)`);
  const at = d.at ?? scene.start;
  checkTime(at, scene, id);
  const stroke = color(d.color || "ink");
  const sw = round((d.weight ?? 0.85) * U);
  const flip = [d.flipX ? "scaleX(-1)" : "", d.flipY ? "scaleY(-1)" : "", d.rot ? `rotate(${d.rot}deg)` : ""].filter(Boolean).join(" ");
  plan.push({ k: "draw", id, n: shape.paths.length, at, dur: d.dur ?? 0.35, split: shape.split ?? shape.paths.length });
  cue(d.sfx, at);
  if (d.around) {
    // sized at runtime around a word's box (+ padding in % of H)
    anchors.push({ id, around: `i-${d.around}`, pad: (d.pad ?? 1.5) * U, paths: shape.paths });
    const paths = shape.paths
      .map((p, k) => `<path id="${id}-p${k}" d="" pathLength="1" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1 1;stroke-dashoffset:1" />`)
      .join("");
    return `<div class="dr hf-in" id="${id}" data-layout-allow-occlusion style="left:0;top:0;width:10px;height:10px"><svg id="${id}-svg" viewBox="0 0 10 10" style="width:100%;height:100%;overflow:visible${flip ? `;transform:${flip}` : ""}">${paths}</svg></div>`;
  }
  // Scale the 100x100 shape into the real pixel box so dash-based drawing stays exact.
  const bw = ((d.w ?? 30) / 100) * W, bh = ((d.h ?? 12) / 100) * H;
  const paths = shape.paths
    .map((p, k) => `<path id="${id}-p${k}" d="${scalePath(p, bw / 100, bh / 100)}" pathLength="1" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1 1;stroke-dashoffset:1" />`)
    .join("");
  return `<div class="dr hf-in" id="${id}" data-layout-allow-occlusion style="left:${d.x}%;top:${d.y}%;width:${round(bw)}px;height:${round(bh)}px"><svg viewBox="0 0 ${round(bw)} ${round(bh)}" style="width:100%;height:100%;overflow:visible${flip ? `;transform:${flip}` : ""}">${paths}</svg></div>`;
}

// Shapes use absolute commands with x,y pairs only (M L C S Q T), so scaling alternates x/y.
function scalePath(d, sx, sy) {
  let k = 0;
  return d.replace(/[MLCSQT]|-?\d*\.?\d+/g, (tok) => {
    if (/[A-Z]/.test(tok)) return ` ${tok}`;
    const v = parseFloat(tok) * (k++ % 2 === 0 ? sx : sy);
    return `${round(v)}`;
  }).trim().replace(/ ,/g, ",");
}

// Outline clock with a spinning hand (Day 2: "So naturally after ... hours of regret").
function renderClock(d, id, scene) {
  const at = d.at ?? scene.start;
  checkTime(at, scene, id);
  const size = px(d.h ?? 9);
  const stroke = color(d.color || "ink");
  plan.push({ k: "item", id, anim: d.anim || "pop", at });
  plan.push({ k: "spin", id: `${id}-hand`, at, end: d.out ?? scene.end, turns: d.turns ?? 3, svgOrigin: "50 50" });
  cue(d.sfx, at);
  return `<div class="dr hf-in" id="${id}" style="left:${d.x}%;top:${d.y}%;width:${size};height:${size}"><svg viewBox="0 0 100 100" style="width:100%;height:100%;overflow:visible"><circle cx="50" cy="50" r="46" fill="#fff" stroke="${stroke}" stroke-width="4" /><line x1="50" y1="50" x2="50" y2="22" stroke="${stroke}" stroke-width="4" stroke-linecap="round" /><g id="${id}-hand"><line x1="50" y1="50" x2="74" y2="50" stroke="${stroke}" stroke-width="4" stroke-linecap="round" /></g></svg></div>`;
}

// ---------- text on an arc (e.g. "To Something" following the bowl of a 5) ----------
function renderArcText(a, scene) {
  const id = a.id ? `a-${a.id}` : nextId("a");
  const at = a.at ?? scene.start;
  checkTime(at, scene, id);
  const cx = (a.cx / 100) * W, cy = (a.cy / 100) * H, r = a.r * U;
  const a0 = ((a.start ?? 200) * Math.PI) / 180, a1 = ((a.end ?? 340) * Math.PI) / 180;
  const sweep = (a.end ?? 340) > (a.start ?? 200) ? 1 : 0;
  const large = Math.abs((a.end ?? 340) - (a.start ?? 200)) > 180 ? 1 : 0;
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
  const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  const d = `M ${round(p0[0])} ${round(p0[1])} A ${round(r)} ${round(r)} 0 ${large} ${sweep} ${round(p1[0])} ${round(p1[1])}`;
  const css = styleCss(a);
  plan.push({ k: "item", id, anim: a.anim || "fade", at, dur: a.dur ?? 0.35 });
  cue(a.sfx, at);
  return `<svg class="arc hf-in" id="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><path id="${id}-path" d="${d}" /></defs><text data-layout-allow-overlap style="${css}" fill="${color(a.color)}"><textPath href="#${id}-path"${a.spread ? ` textLength="${round(a.spread * U)}"` : ""}>${esc(a.text)}</textPath></text></svg>`;
}

// text inside a card that types itself when c.typeAt is set
function typed(text, c, id) {
  if (c.typeAt == null) return esc(text);
  const chars = [...text];
  plan.push({ k: "chars", id: `${id}-t`, n: chars.length, at: c.typeAt, dur: c.typeDur ?? Math.min(0.9, 0.05 * chars.length) });
  cue(c.typeSfx ?? null, c.typeAt);
  return chars.map((ch, k) => `<span class="ch hf-in" id="${id}-t-c${k}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");
}

// ---------- cards: notification, name tag, chat bubble, dating profile, search bar, comment ----------
function renderCard(c, scene) {
  const id = c.id ? `c-${c.id}` : nextId("c");
  const at = c.at ?? scene.start;
  checkTime(at, scene, id);
  usedFamilies.add("Poppins");
  usedFamilies.add("Montserrat");
  const fs = px(c.size ?? 3);
  const pos = `left:${c.x ?? 25}%;top:${c.y ?? 6}%;width:${c.w ?? 50}%;font-size:${fs}`;
  const rot = c.rot ? `transform:rotate(${c.rot}deg)` : "";
  plan.push({ k: "item", id, anim: c.anim || (c.kind === "notification" ? "drop" : "pop"), at, dur: c.dur });
  if (c.out != null) plan.push({ k: "hide", id, at: c.out });
  cue(c.sfx ?? (c.kind === "notification" ? "notification" : null), at);
  let body = "";
  if (c.kind === "notification") {
    const icon = c.icon ? stickerMedia(resolveSticker(c.icon), "2.3em") : "";
    body = `<div class="card-in notif" style="${rot}">
          <div class="n-icon">${icon}</div>
          <div class="n-text"><div class="n-top"><span class="n-app">${esc(c.app || "MESSAGES")}</span><span class="n-time">${esc(c.time || "now")}</span></div>
          <div class="n-title">${esc(c.title || "")}</div><div class="n-body">${esc(c.body || "")}</div></div></div>`;
  } else if (c.kind === "nametag") {
    usedFamilies.add(STYLES[c.nameStyle || "marker"].f);
    const nameCss = styleCss({ style: c.nameStyle || "marker", size: (c.size ?? 3) * 2.4, color: c.nameColor || "ink" }).replace(/font-size:[^;]+/, "font-size:2.4em");
    body = `<div class="card-in nametag" style="${rot}"><div class="nt-head"><div class="nt-hello">${esc(c.line1 || "HELLO")}</div><div class="nt-sub">${esc(c.line2 || "my name is")}</div></div>
          <div class="nt-body"><span id="${id}-name" style="${nameCss}">${esc(c.name ?? "")}</span></div></div>`;
  } else if (c.kind === "bubble") {
    body = `<div class="card-in bubble ${c.side === "right" ? "b-right" : ""}" style="${rot}"><div class="b-from">${esc(c.from || "")}</div><div class="b-text">${typed(c.text || "", c, id)}</div></div>`;
  } else if (c.kind === "profile") {
    // dating-app profile card (+ optional stamp slammed across it)
    const photo = c.photo ? stickerMedia(resolveSticker(c.photo), "5.6em") : "";
    const no = stickerMedia(resolveSticker(c.noIcon || "3d:cross-mark"), "1.5em");
    const yes = stickerMedia(resolveSticker(c.yesIcon || "3d:heavy-black-heart"), "1.5em");
    body = `<div class="card-in profile" style="${rot}"><div class="pf-photo">${photo}</div>
          <div class="pf-info"><div class="pf-name">${esc(c.name || "")}</div><div class="pf-sub">${esc(c.sub || "")}</div></div>
          <div class="pf-btns"><span class="pf-btn">${no}</span><span class="pf-btn pf-yes">${yes}</span></div></div>`;
  } else if (c.kind === "search") {
    // search / address bar whose query types itself; optional result line underneath
    const icon = stickerMedia(resolveSticker(c.icon || "3d:left-pointing-magnifying-glass"), "1.3em");
    const label = c.engine ? `<span class="sr-engine">${esc(c.engine)}</span>` : "";
    body = `<div class="card-in search" style="${rot}">${label}<div class="sr-bar">${icon}<span class="sr-q">${typed(c.query || "", c, id)}</span></div>${c.result ? `<div class="sr-result hf-in" id="${id}-res" style="color:${color(c.resultColor || "ink")}">${esc(c.result)}</div>` : ""}</div>`;
    if (c.result) plan.push({ k: "item", id: `${id}-res`, anim: c.resultAnim || "pop", at: c.resultAt ?? at + 0.8 });
  } else if (c.kind === "comment") {
    // Instagram-style comment row
    const av = c.avatar ? stickerMedia(resolveSticker(c.avatar), "1.9em") : "";
    body = `<div class="card-in comment" style="${rot}"><div class="cm-av">${av}</div><div class="cm-txt"><span class="cm-user">${esc(c.user || "you")}</span> <span class="cm-body">${typed(c.text || "", c, id)}</span><div class="cm-meta">${esc(c.meta || "Reply")}</div></div><div class="cm-heart">${stickerMedia(resolveSticker("3d:heavy-black-heart"), "1.1em")}</div></div>`;
  } else throw new Error(`unknown card kind ${c.kind}`);
  let stamp = "";
  if (c.stamp) {
    const sid = `${id}-stamp`;
    const css = styleCss({ style: c.stamp.style || "stencil", size: (c.size ?? 3) * (c.stamp.scale ?? 2.4), color: c.stamp.color || "red" }).replace(/font-size:[^;]+/, `font-size:${c.stamp.scale ?? 2.4}em`);
    stamp = `<div class="stamp hf-in" id="${sid}" style="${css};border-color:${color(c.stamp.color || "red")};left:${c.stamp.x ?? 50}%;top:${c.stamp.y ?? 42}%"><span style="display:block;transform:rotate(${c.stamp.rot ?? -14}deg)">${esc(c.stamp.text)}</span></div>`;
    plan.push({ k: "item", id: sid, anim: c.stamp.anim || "slam", at: c.stamp.at ?? at + 1 });
    cue(c.stamp.sfx ?? "impact-bass-2", c.stamp.at ?? at + 1);
  }
  return `<div class="card hf-in" id="${id}" data-layout-allow-overlap data-layout-allow-occlusion style="${pos}">${body}${stamp}</div>`;
}

// ---------- effects ----------
function renderRain(fx, scene) {
  const s = resolveSticker(fx.sticker || "money-wings");
  const rnd = prng(fx.seed ?? 7);
  const n = fx.count ?? 14;
  const out = [];
  for (let k = 0; k < n; k++) {
    const id = nextId("r");
    const x = (fx.x0 ?? 5) + rnd() * ((fx.x1 ?? 95) - (fx.x0 ?? 5));
    const delay = rnd() * (fx.spread ?? 0.5);
    const size = (fx.size ?? 6) * (0.6 + rnd() * 0.7);
    const rot = -40 + rnd() * 80;
    out.push(`<div class="rain hf-in" id="${id}" data-layout-ignore style="left:${round(x)}%;top:0;height:${px(size)}">${stickerMedia(s, "100%", `transform:rotate(${round(rot)}deg)`)}</div>`);
    plan.push({ k: "fall", id, at: (fx.at ?? scene.start) + delay, dur: fx.dur ?? 1.6, from: -12 * U, to: 1.1 * H, spin: rot * 1.5 });
  }
  cue(fx.sfx, fx.at ?? scene.start);
  return out.join("");
}
// Burst: stickers explode outward from a point (confetti-style)
function renderBurst(fx, scene) {
  const s = resolveSticker(fx.sticker || "sparkles");
  const rnd = prng(fx.seed ?? 5);
  const n = fx.count ?? 10;
  const out = [];
  for (let k = 0; k < n; k++) {
    const id = nextId("b");
    const ang = (k / n) * Math.PI * 2 + rnd() * 0.5;
    const dist = (fx.dist ?? 28) * (0.6 + rnd() * 0.6) * U;
    const size = (fx.size ?? 6) * (0.6 + rnd() * 0.7);
    out.push(`<div class="rain hf-in" id="${id}" data-layout-ignore style="left:${fx.x ?? 50}%;top:${fx.y ?? 50}%;height:${px(size)};margin-left:${px(-size / 2)};margin-top:${px(-size / 2)}">${stickerMedia(s, "100%")}</div>`);
    plan.push({ k: "burst", id, at: fx.at ?? scene.start, dur: fx.dur ?? 0.9, dx: round(Math.cos(ang) * dist), dy: round(Math.sin(ang) * dist), rot: round(-90 + rnd() * 180) });
  }
  cue(fx.sfx, fx.at ?? scene.start);
  return out.join("");
}

// ---------- scene backgrounds (cover the watermark for that scene) ----------
function renderBg(bg, id, sc) {
  if (!bg) return "";
  const c1 = color(bg.color || "bg"), c2 = color(bg.color2 || "mint-soft");
  let pattern = "";
  if (bg.pattern === "burst") pattern = `repeating-conic-gradient(from 0deg, ${c2} 0deg 10deg, ${c1} 10deg 20deg)`;
  if (bg.pattern === "dots") pattern = `radial-gradient(${c2} 18%, transparent 19%) 0 0/${px(4)} ${px(4)}, ${c1}`;
  if (bg.pattern === "grid") pattern = `linear-gradient(${c2} 2px, transparent 2px) 0 0/${px(6)} ${px(6)}, linear-gradient(90deg, ${c2} 2px, ${c1} 2px) 0 0/${px(6)} ${px(6)}`;
  if (bg.pattern === "stripes") pattern = `repeating-linear-gradient(-45deg, ${c1} 0 ${px(2)}, ${c2} ${px(2)} ${px(4)})`;
  const big = Math.ceil(Math.hypot(W, H) * 1.05);
  if (bg.spin && bg.pattern === "burst")
    plan.push({ k: "spin", id: `${id}-bgr`, at: sc.start, end: sc.end, turns: bg.spin === true ? 0.08 : bg.spin });
  const inner = pattern
    ? `<div class="bg-r" id="${id}-bgr" style="width:${big}px;height:${big}px;left:${round((W - big) / 2)}px;top:${round((H - big) / 2)}px;background:${pattern}"></div>`
    : "";
  return `<div class="bg" data-layout-ignore data-layout-allow-occlusion style="background:${c1}">${inner}</div>`;
}

// ---------- scenes ----------
function renderScene(sc, idx) {
  const id = sc.id ? `sc-${sc.id}` : `sc-${idx + 1}`;
  const dur = round(sc.end - sc.start);
  if (dur <= 0) throw new Error(`${id}: end must be after start`);
  const box = { x: 6, y: 22, w: 88, ...(sc.box || {}) };
  const rows = (sc.rows || [])
    .map((row) => {
      const st = [
        `justify-content:${{ left: "flex-start", center: "center", right: "flex-end" }[row.align || "left"]}`,
        `column-gap:${px(row.gap ?? 1.1)}`,
        `align-items:${row.items?.some((i) => i.sticker) ? "center" : row.valign || "baseline"}`,
      ];
      if (row.mt != null) st.push(`margin-top:${px(row.mt)}`);
      if (row.indent) st.push(`padding-left:${row.indent}%`);
      if (row.indentRight) st.push(`padding-right:${row.indentRight}%`);
      const fit = row.fit === true ? 1 : row.fit;
      return `<div class="row"${fit ? ` data-fit="${fit}"` : ""} style="${st.join(";")}">${(row.items || []).map((it) => renderItem(it, sc)).join("")}</div>`;
    })
    .join("");
  const blockStyle = [`left:${box.x}%`, `top:${box.y}%`, `width:${box.w}%`];
  if (box.v === "center") blockStyle.push("transform:translateY(-50%)");
  const floaters = (sc.floaters || []).map((f) => renderItem(f, sc, true)).join("");
  const stickers = (sc.stickers || []).map((s) => renderSticker(s, sc)).join("");
  const draws = (sc.draws || []).map((d) => renderDraw(d, sc)).join("");
  const arcs = (sc.arcs || []).map((a) => renderArcText(a, sc)).join("");
  const cards = (sc.cards || []).map((c) => renderCard(c, sc)).join("");
  const fx = (sc.effects || [])
    .map((e) => {
      if (e.type === "rain") return renderRain(e, sc);
      if (e.type === "burst") return renderBurst(e, sc);
      throw new Error(`unknown effect ${e.type}`);
    })
    .join("");
  // transitions + camera (scene-in: opacity/x/blur; cam: scale/shake; drift: slow zoom)
  if (sc.enter) {
    plan.push({ k: "enter", id, type: sc.enter, at: sc.start, dur: sc.enterDur });
    cue(sc.enterSfx ?? null, sc.start);
  }
  if (sc.exit) {
    const ed = sc.exitDur ?? (sc.exit === "fade" ? 0.12 : 0.16);
    plan.push({ k: "exitfx", id, type: sc.exit, at: sc.end - ed, dur: ed });
  }
  for (const c of sc.camera || []) {
    plan.push({ k: "camera", id, ...c, at: c.at ?? sc.start, end: sc.end });
    cue(c.sfx, c.at ?? sc.start);
  }
  if (sc.drift) plan.push({ k: "drift", id: `${id}-dr`, at: sc.start, end: sc.end, to: sc.drift === true ? 1.045 : sc.drift });
  const flash = (sc.camera || []).some((c) => c.type === "flash") ? `<div class="flash" id="${id}-fl" data-layout-ignore data-layout-allow-occlusion></div>` : "";
  return `
      <section class="clip scene" id="${id}" data-start="${sc.start}" data-duration="${dur}" data-track-index="1">${renderBg(sc.bg, id, sc)}
        <div class="scene-in" id="${id}-in"><div class="cam" id="${id}-cam"><div class="drift" id="${id}-dr">
          <div class="block" style="${blockStyle.join(";")}">${rows}</div>${floaters}${draws}${arcs}${cards}${stickers}${fx}
        </div></div></div>${flash}
      </section>`;
}

// ---------- media cutaways (meme clips) ----------
function renderMedia(m, k) {
  const rel = resolveFile("media", m.src);
  const id = m.id || `media-${k + 1}`;
  const w = m.w ?? 56;
  const st = [`width:${w}%`, `left:${m.x ?? (100 - w) / 2}%`, `top:${m.y ?? 12}%`, "position:absolute", "z-index:20"];
  const audio = m.audio ? `data-has-audio="true" data-volume="${m.volume ?? 1}"` : "muted";
  return `
      <video id="${id}" class="clip media" src="${rel}" playsinline ${audio} data-start="${m.start}" data-duration="${round(m.end - m.start)}" data-media-start="${m.from ?? 0}" data-track-index="3" style="${st.join(";")}"></video>`;
}

// ---------- glitch transition (Day 2 style, ~0.3s of grey RGB-split bars) ----------
function renderGlitch(g, k) {
  const id = `glitch-${k + 1}`;
  const rnd = prng(g.seed ?? 11 + k);
  const bars = 7;
  const frames = Math.max(3, Math.round((g.dur ?? 0.33) * (meta.fps || 30)));
  const html = [];
  for (let b = 0; b < bars; b++) html.push(`<div class="gb" id="${id}-b${b}"></div>`);
  const steps = [];
  for (let f = 0; f < frames; f++) {
    const row = [];
    for (let b = 0; b < bars; b++) {
      const shade = Math.round(60 + rnd() * 150);
      row.push({ top: round(rnd() * 100), h: round(4 + rnd() * 22), left: round(-10 + rnd() * 20), c: `rgb(${shade},${shade},${shade + Math.round(rnd() * 20)})` });
    }
    steps.push(row);
  }
  plan.push({ k: "glitch", id, at: g.at, fps: meta.fps || 30, bars, steps });
  cue(g.sfx ?? "glitch-1", g.at);
  return `
      <div class="clip glitch" id="${id}" data-start="${g.at}" data-duration="${g.dur ?? 0.33}" data-track-index="4">${html.join("")}</div>`;
}

// ---------- audio ----------
// Audio clips that overlap in time must sit on different tracks: reuse the lowest track that is free again.
const audioLanes = [];
function audioTrack(start, end) {
  let lane = audioLanes.findIndex((free) => free <= start + 1e-3);
  if (lane < 0) lane = audioLanes.push(0) - 1;
  audioLanes[lane] = end;
  return 10 + lane;
}
function renderAudio(a, k) {
  const rel = a.rel || resolveFile("audio", a.src);
  const id = a.id || `audio-${k + 1}`;
  const start = a.start ?? 0;
  const file = assetDirs.audio.get(rel)?.src;
  const natural = a.duration ?? (file ? mediaDuration(file) - (a.from ?? 0) : meta.duration - start);
  const dur = Math.min(natural, meta.duration - start);
  if (dur <= 0.01) return "";
  return `
      <audio id="${id}" src="${rel}" data-start="${round(start)}" data-duration="${round(dur)}" data-media-start="${a.from ?? 0}" data-volume="${a.volume ?? 1}" data-track-index="${audioTrack(start, start + dur)}"></audio>`;
}

// ---------- series progress bar (optional retention device) ----------
function renderProgress(p) {
  if (!p) return "";
  const total = p.total ?? 75;
  const frac = Math.min(1, (meta.day ?? 0) / total);
  usedFamilies.add("Poppins");
  return `<div id="progress" data-layout-ignore><div class="pg-fill" style="width:${round(frac * 100)}%"></div></div><div id="progress-label">${esc(p.label ?? `DAY ${meta.day}/${total}`)}</div>`;
}

// ---------- assemble ----------
const scenesHtml = (spec.scenes || []).map(renderScene).join("");
const mediaHtml = (spec.media || []).map(renderMedia).join("");
const glitchHtml = (spec.transitions || []).filter((t) => t.type === "glitch").map(renderGlitch).join("");
for (const s of spec.sfx || []) cue(s, s.at);
const sfxAudio = sfxCues
  .filter((c) => c.at < meta.duration)
  .map((c, k) => {
    const rel = resolveSfx(c);
    const file = assetDirs.audio.get(rel).src;
    return { id: `sfx-${k + 1}`, rel, start: c.at, duration: c.duration ?? mediaDuration(file), volume: c.volume ?? SFX_DEFAULT_VOL[c.name] ?? 0.4 };
  });
const audioHtml = [...(spec.audio || []), ...sfxAudio].map(renderAudio).join("");

const wm = { text: `DAY ${meta.day ?? ""}`.trim(), style: "watermark", color: "pale", ...(meta.watermark || {}) };
const wmCss = styleCss({ ...wm, size: 40 });
const handleCss = styleCss({ style: "handle", size: meta.handleSize ?? DEFAULTS.handleSize, color: "mint" });

// sort scenes for overlap check
const sorted = [...(spec.scenes || [])].sort((a, b) => a.start - b.start);
for (let i = 1; i < sorted.length; i++)
  if (sorted[i].start < sorted[i - 1].end - 0.001)
    warn(`scenes "${sorted[i - 1].id}" and "${sorted[i].id}" overlap (${sorted[i - 1].end} > ${sorted[i].start})`);
if (sorted.length && sorted[sorted.length - 1].end > meta.duration + 0.001)
  warn(`last scene ends at ${sorted[sorted.length - 1].end}, after meta.duration ${meta.duration}`);

const fontFaces = FONT_FACES.filter(([f]) => usedFamilies.has(f))
  .map(([f, file, w, s]) => `@font-face{font-family:'${f}';src:url('assets/fonts/${file}') format('woff2');font-weight:${w};font-style:${s};font-display:block}`)
  .join("\n      ");

const usesLottie = Object.keys(lottieData).length > 0;
let runtime = fs.readFileSync(path.join(ENGINE, "runtime.js"), "utf8");
if (!usesLottie) runtime = runtime.replace(/  \/\/ <lottie>[\s\S]*?\/\/ <\/lottie>\n/, "");
const config = { W, H, U, plan, anchors, wmWidth: wm.width ?? DEFAULTS.watermarkWidth, wmY: wm.y ?? DEFAULTS.watermarkY, lottie: lottieData };

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(meta.title || `Day ${meta.day ?? ""} - Zero to Something`)}</title>
    <script src="assets/vendor/gsap.min.js"></script>${usesLottie ? `\n    <script src="assets/vendor/lottie.min.js"></script>` : ""}
    <style>
      ${fontFaces}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${COLORS.bg}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${COLORS.bg}; }
      #wm { position: absolute; left: 0; top: 0; white-space: pre; ${wmCss}; line-height: 1; z-index: 0; }
      #handle { position: absolute; right: 2.3%; bottom: 2.6%; white-space: nowrap; ${handleCss}; z-index: 50; }
      #progress { position: absolute; left: 2.3%; top: 3%; width: 14%; height: ${px(0.7)}; border-radius: ${px(0.7)}; background: ${COLORS["mint-soft"]}; overflow: hidden; z-index: 50; }
      #progress .pg-fill { height: 100%; background: ${COLORS.mint}; border-radius: inherit; }
      #progress-label { position: absolute; left: 2.3%; top: calc(3% + ${px(1.3)}); font-family: 'Poppins'; font-weight: 700; font-size: ${px(1.9)}; color: ${COLORS.mint}; z-index: 50; letter-spacing: 0.04em; }
      .scene { position: absolute; inset: 0; z-index: 2; }
      .scene-in, .cam, .drift { position: absolute; inset: 0; }
      .bg { position: absolute; inset: 0; overflow: hidden; }
      .bg-r { position: absolute; }
      .flash { position: absolute; inset: 0; background: #fff; opacity: 0; z-index: 60; }
      .block { position: absolute; display: flex; flex-direction: column; }
      .row { display: flex; flex-wrap: nowrap; width: 100%; white-space: nowrap; }
      .it { position: relative; display: inline-block; flex: none; }
      .it.fl { position: absolute; }
      .tx { display: inline-block; white-space: pre; position: relative; }
      .ch, .w { display: inline; }
      .lt { display: inline-block; white-space: pre; }
      .ul { position: absolute; left: 3%; bottom: -0.3em; width: 94%; display: block; transform-origin: 0 50%; }
      .strike { position: absolute; left: -2%; top: 52%; width: 104%; height: 0.08em; display: block; transform-origin: 0 50%; }
      .hl { position: absolute; left: -3%; bottom: 0.06em; width: 106%; height: 0.5em; display: block; transform-origin: 0 50%; border-radius: 0.08em; }
      .echo { position: absolute; left: 0; display: block; }
      .st { position: absolute; z-index: 10; }
      .st .wb { height: 100%; transform-origin: 50% 90%; }
      .lot { display: block; }
      .lot svg { display: block; }
      .tag { position: absolute; white-space: nowrap; }
      .dr { position: absolute; z-index: 9; }
      .arc { position: absolute; left: 0; top: 0; overflow: visible; z-index: 8; }
      .rain { position: absolute; z-index: 30; }
      .card { position: absolute; z-index: 12; }
      .card-in { position: relative; }
      .notif { display: flex; gap: 0.7em; align-items: center; background: rgba(255,255,255,0.97); border-radius: 1.1em; padding: 0.75em 1em; box-shadow: 0 0.5em 1.6em rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.05); font-family: 'Poppins'; }
      .n-icon { width: 2.3em; height: 2.3em; border-radius: 0.6em; background: ${COLORS["mint-soft"]}; display: flex; align-items: center; justify-content: center; flex: none; overflow: hidden; }
      .n-icon img, .n-icon .lot { height: 1.8em !important; }
      .n-text { flex: 1; min-width: 0; }
      .n-top { display: flex; justify-content: space-between; font-size: 0.72em; color: #8a8a8a; font-weight: 600; letter-spacing: 0.06em; }
      .n-title { font-weight: 700; font-size: 1em; color: #111; margin-top: 0.1em; }
      .n-body { font-weight: 400; font-size: 0.95em; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .nametag { background: #fff; border-radius: 0.9em; overflow: hidden; box-shadow: 0 0.5em 1.4em rgba(0,0,0,0.18); border: 0.14em solid ${COLORS.red}; }
      .nt-head { background: ${COLORS.red}; color: #fff; text-align: center; padding: 0.45em 0 0.35em; font-family: 'Montserrat'; }
      .nt-hello { font-weight: 900; font-size: 2em; letter-spacing: 0.08em; line-height: 1; }
      .nt-sub { font-weight: 700; font-size: 0.95em; letter-spacing: 0.02em; }
      .nt-body { height: 4.2em; display: flex; align-items: center; justify-content: center; }
      .bubble { background: ${COLORS.mint}; color: #fff; border-radius: 1.2em 1.2em 1.2em 0.2em; padding: 0.6em 1em; font-family: 'Poppins'; display: inline-block; }
      .bubble.b-right { border-radius: 1.2em 1.2em 0.2em 1.2em; background: #E9E9EB; color: #111; }
      .b-from { font-size: 0.7em; font-weight: 700; opacity: 0.8; }
      .b-text { font-size: 1em; font-weight: 600; white-space: normal; line-height: 1.3; }
      .profile { background: #fff; border-radius: 1.2em; overflow: hidden; box-shadow: 0 0.6em 1.8em rgba(0,0,0,0.18); font-family: 'Poppins'; }
      .pf-photo { height: 7.4em; background: linear-gradient(160deg, ${COLORS["mint-soft"]}, #ffffff); display: flex; align-items: center; justify-content: center; }
      .pf-info { padding: 0.6em 0.9em 0.2em; }
      .pf-name { font-weight: 800; font-size: 1.35em; color: #111; }
      .pf-sub { font-weight: 400; font-size: 0.85em; color: #777; }
      .pf-btns { display: flex; justify-content: space-around; padding: 0.5em 0 0.8em; }
      .pf-btn { width: 2.6em; height: 2.6em; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.2em 0.6em rgba(0,0,0,0.15); background: #fff; }
      .stamp { position: absolute; transform: translate(-50%, -50%); border: 0.07em solid; border-radius: 0.12em; padding: 0.02em 0.25em; white-space: nowrap; z-index: 5; background: rgba(255,255,255,0.6); }
      .search { font-family: 'Poppins'; }
      .sr-engine { display: block; font-weight: 800; font-size: 1.1em; margin: 0 0 0.35em 0.4em; }
      .sr-bar { display: flex; align-items: center; gap: 0.6em; background: #fff; border-radius: 2em; padding: 0.6em 1.1em; box-shadow: 0 0.35em 1.2em rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06); }
      .sr-q { font-size: 1.15em; font-weight: 500; color: #222; white-space: pre; }
      .sr-result { margin: 0.5em 0 0 1.2em; font-weight: 700; font-size: 1em; }
      .comment { display: flex; align-items: flex-start; gap: 0.7em; background: #fff; border-radius: 1em; padding: 0.8em 1em; box-shadow: 0 0.4em 1.4em rgba(0,0,0,0.14); font-family: 'Poppins'; }
      .cm-av { width: 1.9em; height: 1.9em; border-radius: 50%; overflow: hidden; background: ${COLORS["mint-soft"]}; display: flex; align-items: center; justify-content: center; flex: none; }
      .cm-txt { flex: 1; font-size: 1em; color: #111; }
      .cm-user { font-weight: 700; }
      .cm-body { font-weight: 500; }
      .cm-meta { font-size: 0.7em; color: #8a8a8a; font-weight: 600; margin-top: 0.2em; }
      .cm-heart { flex: none; opacity: 0.85; }
      .glitch { position: absolute; inset: 0; z-index: 40; background: #222; overflow: hidden; }
      .gb { position: absolute; width: 120%; }
      .hf-in { opacity: 0; }
      .reel-measuring .scene { display: block !important; visibility: visible !important; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${meta.duration}" data-width="${W}" data-height="${H}">
      <div id="wm" aria-hidden="true" data-layout-ignore>${esc(wm.text)}</div>
      <div id="handle">${esc(meta.handle ?? DEFAULTS.handle)}</div>${renderProgress(meta.progress)}${scenesHtml}${mediaHtml}${glitchHtml}${audioHtml}
    </div>
    <script>
      window.__REEL__ = ${JSON.stringify(config)};
    </script>
    <script>
${runtime}
    </script>
  </body>
</html>
`;

// ---------- write project ----------
fs.mkdirSync(path.join(outDir, "assets", "fonts"), { recursive: true });
fs.mkdirSync(path.join(outDir, "assets", "vendor"), { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
for (const [, file] of FONT_FACES.filter(([f]) => usedFamilies.has(f)))
  fs.copyFileSync(path.join(ENGINE, "fonts", file), path.join(outDir, "assets", "fonts", file));
fs.copyFileSync(path.join(ENGINE, "vendor", "gsap.min.js"), path.join(outDir, "assets", "vendor", "gsap.min.js"));
if (usesLottie) fs.copyFileSync(path.join(ENGINE, "vendor", "lottie.min.js"), path.join(outDir, "assets", "vendor", "lottie.min.js"));
for (const kind of Object.keys(assetDirs)) {
  for (const v of assetDirs[kind].values()) {
    if (!v.src) continue;
    fs.mkdirSync(path.join(outDir, path.dirname(v.rel)), { recursive: true });
    fs.copyFileSync(v.src, path.join(outDir, v.rel));
  }
}
const hfJson = path.join(outDir, "hyperframes.json");
if (!fs.existsSync(hfJson))
  fs.writeFileSync(
    hfJson,
    JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { assets: "assets" }, media: { autoProxy: true } }, null, 2) + "\n",
  );
const pkg = path.join(outDir, "package.json");
if (!fs.existsSync(pkg))
  fs.writeFileSync(
    pkg,
    JSON.stringify(
      { name: `day-${meta.day ?? "x"}`, private: true, type: "module", scripts: { check: "npx --yes hyperframes check", dev: "npx --yes hyperframes preview", render: "npx --yes hyperframes render" } },
      null,
      2,
    ) + "\n",
  );
fs.copyFileSync(specPath, path.join(outDir, "reel.spec.json"));

console.log(
  `built ${path.relative(process.cwd(), outDir) || "."} — ${W}x${H}, ${meta.duration}s, ${(spec.scenes || []).length} scenes, ${plan.length} animation steps, ${Object.keys(lottieData).length} animated stickers, ${sfxAudio.length} sfx`,
);
for (const w of warnings) console.log(`WARN ${w}`);
