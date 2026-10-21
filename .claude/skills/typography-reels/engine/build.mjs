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
  } else css.push(`color:${color(item.color)}`);
  return css.join(";");
}

// ---------- assets ----------
const assetDirs = { stickers: new Map(), audio: new Map(), media: new Map() };
function resolveSticker(name) {
  if (assetDirs.stickers.has(name)) return assetDirs.stickers.get(name);
  const exts = ["", ".png", ".webp", ".gif", ".svg", ".jpg"];
  const roots = [
    path.join(specDir, "stickers"),
    specDir,
    path.join(ENGINE, "stickers", "library"),
    path.join(ENGINE, "stickers", "emoji"),
  ];
  for (const r of roots)
    for (const e of exts) {
      const p = path.join(r, name + e);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const rel = `assets/stickers/${path.basename(p)}`;
        assetDirs.stickers.set(name, { src: p, rel });
        return assetDirs.stickers.get(name);
      }
    }
  throw new Error(
    `sticker "${name}" not found (looked in spec-dir/stickers, engine/stickers/library, engine/stickers/emoji)`,
  );
}
function resolveFile(kind, src) {
  const p = path.isAbsolute(src) ? src : path.join(specDir, src);
  if (!fs.existsSync(p)) throw new Error(`${kind} file not found: ${p}`);
  const rel = `assets/${kind}/${path.basename(p)}`;
  assetDirs[kind].set(rel, { src: p, rel });
  return rel;
}

// ---------- animation plan (consumed by the runtime script) ----------
const plan = []; // entries interpreted by runtime.js
const anchors = []; // sticker anchors resolved after fonts load

// ---------- items (text pieces) ----------
function renderItem(item, scene, floating = false) {
  const id = item.id ? `i-${item.id}` : nextId("i");
  if (item.sticker) return renderInlineSticker(item, id, scene);
  const at = item.at ?? scene.start;
  const anim = item.anim || "cut";
  const text = item.text ?? "";
  let inner;
  if (Array.isArray(at)) {
    // per-word timing: one time per word
    const words = text.split(/\s+/);
    if (words.length !== at.length) warn(`${id}: ${words.length} words but ${at.length} times`);
    inner = words.map((w, k) => `<span class="w hf-in" id="${id}-w${k}">${esc(w)}</span>`).join(" ");
    plan.push({ k: "words", id, n: words.length, times: at });
    checkTime(at[0], scene, id);
  } else if (anim === "type") {
    const chars = [...text];
    inner = chars.map((c, k) => `<span class="ch hf-in" id="${id}-c${k}">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    plan.push({ k: "chars", id, n: chars.length, at, dur: item.dur ?? Math.min(0.5, 0.045 * chars.length) });
    checkTime(at, scene, id);
  } else {
    inner = esc(text);
  }
  const box = item.box
    ? `;background:${color(item.box === true ? "mint" : item.box)};padding:0.04em 0.22em 0.02em;border-radius:${item.radius ?? 0.08}em`
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
  const animated = !Array.isArray(at) && anim !== "type";
  const ul = item.underline
    ? `<span class="ul hf-in" id="${id}-ul" style="background:${color(item.underlineColor || item.color || "ink")};height:${item.underlineWeight ?? 0.085}em"></span>`
    : "";
  const strike = item.strike
    ? `<span class="strike hf-in" id="${id}-st" style="background:${color(item.strikeColor || "red")}"></span>`
    : "";
  const cls = `it${floating ? " fl" : ""}${animated ? " hf-in" : ""}`;
  // Stickers covering words is a signature of the style, so every word allows occlusion.
  const allowOverlap = (floating || item.overlap ? " data-layout-allow-overlap" : "") + " data-layout-allow-occlusion";
  const html = `<span class="${cls}" id="${id}" style="${outer.join(";")}"><span class="tx"${allowOverlap} style="${txStyle.join(";").replace(/font-size:[^;]+/, "font-size:1em")}">${inner}</span>${ul}${strike}</span>`;
  if (animated) {
    plan.push({ k: "item", id, anim, at, dur: item.dur });
    checkTime(at, scene, id);
  }
  if (item.underline) {
    const u = item.underline === true ? {} : item.underline;
    plan.push({ k: "ul", id: `${id}-ul`, at: u.at ?? (Array.isArray(at) ? at[at.length - 1] : at) + 0.12, dur: u.dur ?? 0.25 });
  }
  if (item.strike) {
    const s = item.strike === true ? {} : item.strike;
    plan.push({ k: "ul", id: `${id}-st`, at: s.at ?? at + 0.3, dur: s.dur ?? 0.2 });
  }
  if (item.out) plan.push({ k: "hide", id, at: item.out });
  return html;
}

function renderInlineSticker(item, id, scene) {
  const s = resolveSticker(item.sticker);
  const at = item.at ?? scene.start;
  plan.push({ k: "item", id, anim: item.anim || "pop", at, dur: item.dur });
  checkTime(at, scene, id);
  const st = [`height:${px(item.size ?? 5)}`, "display:block"];
  if (item.flip) st.push("transform:scaleX(-1)");
  const outer = [];
  if (item.dx) outer.push(`margin-left:${px(item.dx)}`);
  if (item.dy) outer.push(`top:${px(item.dy)}`);
  if (item.mr) outer.push(`margin-right:${px(item.mr)}`);
  return `<span class="it ist hf-in" id="${id}" style="${outer.join(";")}"><img src="${s.rel}" alt="" style="${st.join(";")}" /></span>`;
}

function checkTime(t, scene, id) {
  if (t < scene.start - 0.001 || t > scene.end + 0.001)
    warn(`${id}: at=${t} is outside its scene [${scene.start}, ${scene.end}] and will never show`);
}

// ---------- stickers (free-floating images that may cover text) ----------
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
  const imgT = [];
  if (st.flip) imgT.push("scaleX(-1)");
  if (st.rot) imgT.push(`rotate(${st.rot}deg)`);
  const tag = st.tag ? renderTag(st.tag) : "";
  plan.push({ k: "sticker", id, anim: st.anim || "pop", at, dur: st.dur, out: st.out });
  if (st.wobble) plan.push({ k: "wobble", id: `${id}-wb`, at: at + 0.25, end: st.out ?? scene.end, amp: st.wobble === true ? 4 : st.wobble });
  if (st.spinTurns) plan.push({ k: "spin", id: `${id}-wb`, at, end: st.out ?? scene.end, turns: st.spinTurns });
  return `<div class="st hf-in" id="${id}" data-layout-allow-occlusion style="${outer.join(";")}"><div class="wb" id="${id}-wb" data-layout-allow-occlusion><img src="${s.rel}" alt="" data-layout-allow-occlusion style="height:100%;display:block;${imgT.length ? `transform:${imgT.join(" ")}` : ""}" /></div>${tag}</div>`;
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
  const css = styleCss({ style: tag.style || "geo-black", size: tag.size ?? 3, color: tag.color || "red" });
  const rot = tag.rot ? `rotate(${tag.rot}deg)` : "";
  return `<span class="tag" style="${css};${place}${rot ? `;rotate:${tag.rot}deg` : ""}">${esc(tag.text)}</span>`;
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
  // Scale the 100x100 shape into the real pixel box so dash-based drawing stays exact.
  const bw = ((d.w ?? 30) / 100) * W, bh = ((d.h ?? 12) / 100) * H;
  const paths = shape.paths
    .map((p, k) => `<path id="${id}-p${k}" d="${scalePath(p, bw / 100, bh / 100)}" pathLength="1" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:1 1;stroke-dashoffset:1" />`)
    .join("");
  const flip = [d.flipX ? "scaleX(-1)" : "", d.flipY ? "scaleY(-1)" : "", d.rot ? `rotate(${d.rot}deg)` : ""].filter(Boolean).join(" ");
  plan.push({ k: "draw", id, n: shape.paths.length, at, dur: d.dur ?? 0.35, split: shape.split ?? shape.paths.length });
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
  return `<svg class="arc hf-in" id="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><path id="${id}-path" d="${d}" /></defs><text data-layout-allow-overlap style="${css}" fill="${color(a.color)}"><textPath href="#${id}-path"${a.spread ? ` textLength="${round(a.spread * U)}"` : ""}>${esc(a.text)}</textPath></text></svg>`;
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
    out.push(`<div class="rain hf-in" id="${id}" data-layout-ignore style="left:${round(x)}%;top:0;height:${px(size)}"><img src="${s.rel}" alt="" style="height:100%;display:block;transform:rotate(${round(rot)}deg)" /></div>`);
    plan.push({ k: "fall", id, at: (fx.at ?? scene.start) + delay, dur: fx.dur ?? 1.6, from: -12 * U, to: 1.1 * H, spin: rot * 1.5 });
  }
  return out.join("");
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
  const fx = (sc.effects || [])
    .map((e) => {
      if (e.type === "rain") return renderRain(e, sc);
      throw new Error(`unknown effect ${e.type}`);
    })
    .join("");
  if (sc.exit === "fade") plan.push({ k: "exit", id: `${id}-in`, at: sc.end - (sc.exitDur ?? 0.12), dur: sc.exitDur ?? 0.12 });
  return `
      <section class="clip scene" id="${id}" data-start="${sc.start}" data-duration="${dur}" data-track-index="1">
        <div class="scene-in" id="${id}-in">
          <div class="block" style="${blockStyle.join(";")}">${rows}</div>${floaters}${draws}${arcs}${stickers}${fx}
        </div>
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
  return `
      <div class="clip glitch" id="${id}" data-start="${g.at}" data-duration="${g.dur ?? 0.33}" data-track-index="4">${html.join("")}</div>`;
}

// ---------- audio ----------
function renderAudio(a, k) {
  const rel = resolveFile("audio", a.src);
  const id = a.id || `audio-${k + 1}`;
  const dur = a.duration ?? (meta.duration - (a.start ?? 0));
  return `
      <audio id="${id}" src="${rel}" data-start="${a.start ?? 0}" data-duration="${round(dur)}" data-media-start="${a.from ?? 0}" data-volume="${a.volume ?? 1}" data-track-index="${10 + k}"></audio>`;
}

// ---------- assemble ----------
const scenesHtml = (spec.scenes || []).map(renderScene).join("");
const mediaHtml = (spec.media || []).map(renderMedia).join("");
const glitchHtml = (spec.transitions || []).filter((t) => t.type === "glitch").map(renderGlitch).join("");
const sfx = (spec.sfx || []).map((s, k) => ({ id: `sfx-${k + 1}`, src: s.src, start: s.at, duration: s.duration ?? 1.5, volume: s.volume ?? 0.6 }));
const audioHtml = [...(spec.audio || []), ...sfx].map(renderAudio).join("");

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

const runtime = fs.readFileSync(path.join(ENGINE, "runtime.js"), "utf8");
const config = { W, H, U, plan, anchors, wmWidth: wm.width ?? DEFAULTS.watermarkWidth };

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(meta.title || `Day ${meta.day ?? ""} - Zero to Something`)}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      ${fontFaces}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${COLORS.bg}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${COLORS.bg}; }
      #wm { position: absolute; left: 50%; top: ${(wm.y ?? DEFAULTS.watermarkY) * 100}%; transform: translate(-50%, -50%); white-space: nowrap; ${wmCss}; z-index: 0; }
      #handle { position: absolute; right: 2.3%; bottom: 2.6%; white-space: nowrap; ${handleCss}; z-index: 50; }
      .scene { position: absolute; inset: 0; z-index: 2; }
      .scene-in { position: absolute; inset: 0; }
      .block { position: absolute; display: flex; flex-direction: column; }
      .row { display: flex; flex-wrap: nowrap; width: 100%; white-space: nowrap; }
      .it { position: relative; display: inline-block; flex: none; }
      .it.fl { position: absolute; }
      .tx { display: inline-block; white-space: pre; }
      .ch, .w { display: inline; }
      .ul { position: absolute; left: 3%; bottom: -0.3em; width: 94%; display: block; transform-origin: 0 50%; }
      .strike { position: absolute; left: -2%; top: 52%; width: 104%; height: 0.08em; display: block; transform-origin: 0 50%; }
      .st { position: absolute; z-index: 10; }
      .st .wb { height: 100%; transform-origin: 50% 90%; }
      .tag { position: absolute; white-space: nowrap; }
      .dr { position: absolute; z-index: 9; }
      .arc { position: absolute; left: 0; top: 0; overflow: visible; z-index: 8; }
      .rain { position: absolute; z-index: 30; }
      .glitch { position: absolute; inset: 0; z-index: 40; background: #222; overflow: hidden; }
      .gb { position: absolute; width: 120%; }
      .hf-in { opacity: 0; }
      .reel-measuring .scene { display: block !important; visibility: visible !important; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${meta.duration}" data-width="${W}" data-height="${H}">
      <div id="wm" aria-hidden="true" data-layout-ignore>${esc(wm.text)}</div>
      <div id="handle">${esc(meta.handle ?? DEFAULTS.handle)}</div>${scenesHtml}${mediaHtml}${glitchHtml}${audioHtml}
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
for (const [f, file] of FONT_FACES.filter(([f]) => usedFamilies.has(f)).map(([f, file]) => [f, file]))
  fs.copyFileSync(path.join(ENGINE, "fonts", file), path.join(outDir, "assets", "fonts", file));
fs.copyFileSync(path.join(ENGINE, "vendor", "gsap.min.js"), path.join(outDir, "assets", "vendor", "gsap.min.js"));
for (const kind of Object.keys(assetDirs)) {
  for (const { src, rel } of assetDirs[kind].values()) {
    fs.mkdirSync(path.join(outDir, path.dirname(rel)), { recursive: true });
    fs.copyFileSync(src, path.join(outDir, rel));
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

console.log(`built ${path.relative(process.cwd(), outDir) || "."} — ${W}x${H}, ${meta.duration}s, ${(spec.scenes || []).length} scenes, ${plan.length} animation steps`);
for (const w of warnings) console.log(`WARN ${w}`);
