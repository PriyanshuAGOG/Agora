#!/usr/bin/env python3
# Generates episodes/day-11/reel.spec.json (run from the repo root).
# Palette: the series' own — ink, mint, pale mint, white, grey; red only for reaction marks and strikes.
# Music: audio/music-bed.m4a (audio/make-bed.py), 112 BPM, a beat on t = 0.
import json

BEAT = 60 / 112.347

def pulses(a, b, scale=1.025, every=1):
    out, k = [], int(a / BEAT) + 1
    k0 = k
    while k * BEAT < b - 0.15:
        if (k - k0) % every == 0:
            out.append({"type": "pulse", "at": round(k * BEAT, 3), "scale": scale})
        k += 1
    return out

def mascot(name, at, x, y, h, **kw):
    return {"name": f"lib:{name}", "at": at, "x": x, "y": y, "h": h, "cut": True, "anim": kw.pop("anim", "boing"), **kw}

def anch(name, at, to, pos, h, **kw):
    return {"name": f"lib:{name}", "at": at, "anchor": {"to": to, "pos": pos, "dx": kw.pop("dx", 0), "dy": kw.pop("dy", 0)}, "h": h, "cut": True, "anim": kw.pop("anim", "boing"), **kw}

def img(name, at, x, y, h, **kw):
    return {"name": name, "at": at, "x": x, "y": y, "h": h, "shadow": True, **kw}

def react(text, size=3.2):
    return {"text": text, "pos": "tr", "size": size}

def bar(at, x, y, thick, w="3.2em"):
    # a paper sheet seen edge-on: mint bar whose height is the thickness
    return {"text": " ", "style": "label", "size": 4, "box": "mint", "radius": 0.15, "pad": f"{thick}em {w}", "x": x, "y": y, "at": at, "anim": "slide-left"}

S = []

# 1 HOOK — three thicknesses (the word itself gets thicker)
S.append({
    "id": "hook", "start": 0.0, "end": 2.28,
    "camera": [{"type": "flash", "at": 0.0, "opacity": 0.6, "dur": 0.12}, {"type": "punch", "at": 0.64, "scale": 1.06}, {"type": "shake", "at": 0.66, "dur": 0.25, "amp": 1.3}],
    "box": {"x": 8, "y": 16, "w": 62},
    "rows": [
        {"items": [{"text": "We're Using", "style": "editorial-italic", "size": 8, "at": [0.0, 0.32], "anim": "swing"}]},
        {"mt": -0.4, "gap": 2.6, "items": [
            {"id": "three", "text": "THREE", "style": "crisis", "color": "mint", "size": 15, "at": 0.64, "anim": "slam", "fx": "shadow", "fxColor": "ink", "sfx": "impact-bass-1"},
            {"text": "Different", "style": "retro-script", "size": 7, "at": 0.96, "anim": "pop"}]},
        {"mt": 0.2, "items": [{"text": "Paper", "style": "label", "size": 6, "at": 1.28}]},
        {"mt": -0.4, "gap": 0, "items": [
            {"text": "THI", "style": "airy", "size": 11, "at": 1.76, "anim": "pop"},
            {"text": "CKNE", "style": "poster", "size": 11, "at": 1.84, "anim": "pop"},
            {"text": "SSES", "style": "titan", "color": "mint", "size": 11, "at": 1.92, "anim": "slam", "fx": "shadow", "fxColor": "ink", "sfx": "thud"}]},
    ],
    "floaters": [bar(0.7, 82, 34, 0.08), bar(0.8, 82, 46, 0.2), bar(0.9, 82, 60, 0.4)],
    "stickers": [mascot("monkey-shocked-laptop", 1.0, 60, 60, 28, tag=react(".!!?"))],
})

# 2 …to build a paper car
S.append({
    "id": "car", "start": 2.3, "end": 3.64, "enter": "whip-left", "enterSfx": "swish",
    "camera": [{"type": "punch", "at": 2.8, "scale": 1.06}],
    "box": {"x": 8, "y": 22, "w": 40},
    "rows": [
        {"items": [{"text": "To Build A", "style": "editorial-italic", "size": 8, "at": [2.32, 2.48, 2.64]}]},
        {"mt": -0.2, "items": [{"text": "PAPER", "style": "poster", "size": 15, "at": 2.8, "anim": "stamp"}]},
        {"mt": -1.2, "items": [{"text": "CAR.", "style": "titan", "color": "mint", "size": 17, "at": 3.2, "anim": "slam", "fx": "shadow", "fxColor": "ink", "sfx": "impact-bass-2"}]},
    ],
    "stickers": [img("car-hero", 2.82, 44, 30, 38, anim="slam-right", sfx="swish", wobble=1.2)],
})

# 3 HERE'S WHY.
S.append({
    "id": "why", "start": 3.66, "end": 4.38, "enter": "zoom",
    "camera": [{"type": "shake", "at": 3.92, "dur": 0.25, "amp": 1.4}],
    "box": {"x": 14, "y": 28, "w": 60},
    "rows": [
        {"items": [{"text": "Here's", "style": "retro-script", "size": 10, "at": 3.66}]},
        {"mt": -1, "items": [{"id": "why", "text": "WHY?", "style": "comic", "color": "mint", "size": 24, "at": 3.92, "anim": "jitter", "fx": "shadow", "fxColor": "ink", "sfx": "impact-bass-1"}]},
    ],
    "stickers": [mascot("cat-what", 3.98, 56, 30, 30, tag=react("??", 3.6))],
})

# 4 TITLE — the 11 as two sheets: a thin hollow one and a thick solid one; ZERO climbs from one to the other
S.append({
    "id": "title", "start": 4.4, "end": 7.18, "enter": "zoom-out",
    "camera": pulses(4.75, 7.18, 1.03),
    "floaters": [
        {"text": "DAY", "style": "crisis", "size": 15, "x": 22, "y": 40, "at": 4.4, "anim": "slam", "sfx": "impact-bass-2"},
        {"text": "Of Going From", "style": "retro-script", "size": 7, "x": 22, "y": 60, "at": 5.12, "anim": "pop", "rot": -4},
        {"text": "1", "style": "titan", "outline": True, "outlineWidth": 0.04, "color": "mint", "size": 50, "x": 51, "y": 50, "at": 4.64, "anim": "slam", "sfx": "impact-bass-1"},
        {"text": "1", "style": "titan", "color": "mint", "size": 50, "x": 67, "y": 50, "at": 4.8, "anim": "slam", "fx": "extrude", "fxColor": "ink"},
        {"text": "ZERO", "style": "geo-black", "size": 3.6, "box": "ink", "color": "white", "radius": 0.2, "pad": "0.12em 0.4em 0.06em", "x": 79.5, "y": 86, "at": 5.84, "anim": "pop", "sfx": {"name": "pop", "volume": 0.5}},
        {"text": "SOMETHING", "style": "blast", "size": 7.5, "x": 74, "y": 12, "at": 6.56, "anim": "slam", "sfx": "ding"},
    ],
    "draws": [{"shape": "arrow-up", "x": 78, "y": 24, "w": 3, "h": 56, "weight": 0.9, "color": "ink", "at": 6.0, "dur": 0.4, "sfx": "swish"}],
    "stickers": [mascot("monkey-yay", 6.62, 85, 44, 26)],
})

# 5 DESIGNS → DIY KITS
S.append({
    "id": "kits", "start": 7.2, "end": 10.3, "enter": "whip-up", "enterSfx": "swish",
    "camera": [{"type": "pulse", "at": 7.92, "scale": 1.04}, {"type": "punch", "at": 9.12, "scale": 1.05}, {"type": "shake", "at": 9.14, "dur": 0.25, "amp": 1.2}],
    "box": {"x": 7, "y": 16, "w": 42},
    "rows": [
        {"items": [{"text": "We're Turning These", "style": "editorial-italic", "size": 6.5, "at": [7.2, 7.36, 7.68]}]},
        {"mt": -0.2, "items": [{"text": "DESIGNS", "style": "bodoni", "color": "mint", "size": 12, "at": 7.92, "anim": "wipe"}]},
        {"mt": 0.6, "items": [{"text": "Into Actual", "style": "airy", "size": 5.5, "at": [8.48, 8.72]}]},
        {"mt": 0, "items": [{"text": "DIY KITS", "style": "titan", "size": 13, "at": 9.12, "anim": "slam", "fx": "shadow", "fxColor": "mint", "sfx": "impact-bass-1"}]},
    ],
    "draws": [{"shape": "curl-down-arrow", "x": 47, "y": 27, "w": 9, "h": 15, "weight": 0.9, "color": "mint", "at": 8.5, "dur": 0.35}],
    "stickers": [
        img("car-side", 7.95, 52, 14, 15, anim="slam-left", sfx="swish"),
        img("kit-box", 9.12, 58, 38, 38, anim="slam", sfx="impact-bass-2", float=0.6),
    ],
})

# 6 FINALLY figured out what paper — with a thought cloud of candidates
S.append({
    "id": "finally", "start": 10.32, "end": 14.12, "enter": "zoom",
    "camera": [{"type": "shake", "at": 11.2, "dur": 0.3, "amp": 1.3}],
    "box": {"x": 18, "y": 26, "w": 62},
    "rows": [
        {"align": "center", "items": [{"text": "And Today, We", "style": "editorial-italic", "size": 7, "at": [10.32, 10.48, 10.96]}]},
        {"align": "center", "mt": -0.4, "items": [{"id": "fin", "text": "FINALLY", "style": "comic", "color": "mint", "size": 18, "at": 11.2, "anim": "jitter", "fx": "shadow", "fxColor": "ink", "sfx": "impact-bass-1"}]},
        {"align": "center", "mt": 0.2, "gap": 1.2, "items": [
            {"text": "Figured Out", "style": "label", "size": 6, "at": [11.6, 12.08]},
            {"text": "WHAT PAPER", "style": "wide", "size": 6.5, "at": [12.24, 12.48]}]},
        {"align": "center", "mt": 0.6, "items": [{"text": "We're Going To Use", "style": "airy", "size": 4.6, "at": [12.96, 13.2, 13.36, 13.52]}]},
    ],
    "floaters": [
        {"text": "Matte?", "style": "editorial-italic", "size": 3.8, "x": 12, "y": 16, "rot": -10, "at": 12.5, "anim": "pop", "color": "grey"},
        {"text": "Kraft?", "style": "label-caps", "size": 3.2, "x": 86, "y": 14, "rot": 8, "at": 12.62, "anim": "pop"},
        {"text": "Cardstock?", "style": "label", "size": 3.4, "x": 10, "y": 80, "rot": 7, "at": 12.74, "anim": "pop"},
        {"text": "Glossy?", "style": "bodoni", "color": "mint", "size": 3.8, "x": 88, "y": 80, "rot": -6, "at": 12.86, "anim": "pop"},
        {"text": "Blah", "style": "label", "size": 2.8, "x": 50, "y": 12, "at": 12.98, "anim": "pop", "color": "grey"},
    ],
    "stickers": [anch("monkey-giggle", 11.3, "fin", "r", 20, dx=14, tag=react("!!", 3.6))],
})

# 7 THE GSM STACK — numbers count up, the sheet gets thicker each line
def gsm_row(num, at, gsm_at, desc, desc_at, desc_style="airy"):
    items = [{"text": str(num), "style": "titan", "color": "mint", "size": 11, "at": at, "anim": "count", "count": {"from": 0, "to": num, "dur": 0.45}, "fx": "shadow", "fxColor": "ink", "sfx": "typing"},
             {"text": "GSM", "style": "label-caps", "size": 4.5, "at": gsm_at, "anim": "pop"},
             {"text": desc, "style": desc_style, "size": 5, "at": desc_at}]
    return {"mt": 0.9, "gap": 1.4, "items": items}
S.append({
    "id": "gsm", "start": 14.16, "end": 22.3, "enter": "whip-left", "enterSfx": "swish",
    "camera": [{"type": "pulse", "at": 14.72, "scale": 1.04}, {"type": "pulse", "at": 17.12, "scale": 1.04}, {"type": "pulse", "at": 19.04, "scale": 1.05},
               {"type": "punch", "at": 21.52, "scale": 1.06}, {"type": "shake", "at": 21.54, "dur": 0.3, "amp": 1.4}],
    "box": {"x": 7, "y": 12, "w": 64},
    "rows": [
        {"items": [{"text": "We're Going With", "style": "editorial-italic", "size": 6.5, "at": [14.16, 14.4, 14.56]}]},
        gsm_row(180, 14.72, 15.68, "For Some Parts", [16.24, 16.48, 16.64]),
        gsm_row(210, 17.12, 17.4, "For Others", [18.0, 18.24]),
        {"mt": 0.9, "gap": 1.4, "items": [
            {"text": "250", "style": "titan", "color": "mint", "size": 11, "at": 19.04, "anim": "count", "count": {"from": 0, "to": 250, "dur": 0.45}, "fx": "shadow", "fxColor": "ink", "sfx": "typing"},
            {"text": "GSM", "style": "label-caps", "size": 4.5, "at": 20.0, "anim": "pop"},
            {"text": "Extra", "style": "airy", "size": 5, "at": 21.12},
            {"id": "stiff", "text": "STIFFNESS", "style": "block", "size": 9, "at": 21.52, "anim": "stamp", "sfx": "impact-bass-2"}]},
    ],
    "floaters": [bar(14.8, 84, 34, 0.08, "2.6em"), bar(17.2, 84, 52, 0.2, "2.6em"), bar(19.1, 84, 70, 0.4, "2.6em")],
    "stickers": [mascot("monkey-doctor", 15.0, 76, 4, 22), mascot("monkey-rock-angry", 21.6, 58, 62, 26, tag=react("STIFF", 3))],
})

# 8 NOT EVERY PIECE FOLDS THE SAME WAY (letters fold)
S.append({
    "id": "folds", "start": 22.32, "end": 24.86, "enter": "zoom",
    "box": {"x": 10, "y": 22, "w": 66},
    "rows": [
        {"items": [{"text": "Because", "style": "editorial-italic", "size": 7, "at": 22.32}]},
        {"mt": -0.2, "items": [{"text": "NOT EVERY PIECE", "style": "poster", "size": 11, "at": [22.72, 22.96, 23.2]}]},
        {"mt": -0.2, "gap": 1.4, "items": [
            {"text": "FOLDS", "style": "titan", "color": "mint", "size": 14, "at": 23.6, "anim": "spin-letters", "fx": "shadow", "fxColor": "ink", "sfx": "swish"},
            {"text": "The Same Way", "style": "retro-script", "size": 7, "at": [24.08, 24.24, 24.4]}]},
    ],
    "stickers": [mascot("monkey-thinking", 23.0, 76, 30, 40)],
})

# 9 BEND vs HOLD — split screen
S.append({
    "id": "bend", "start": 24.88, "end": 28.54, "enter": "whip-up", "enterSfx": "swish",
    "camera": [{"type": "pulse", "at": 25.36, "scale": 1.04}, {"type": "shake", "at": 27.3, "dur": 0.25, "amp": 1.3}],
    "floaters": [
        {"text": "Some Need To", "style": "editorial-italic", "size": 5.5, "x": 27, "y": 22, "at": 24.88, "anim": "pop"},
        {"text": "BEND", "style": "groovy", "color": "mint", "size": 15, "x": 27, "y": 42, "at": 25.36, "anim": "wave", "fx": "shadow", "fxColor": "ink", "sfx": "boing"},
        {"text": "easily", "style": "retro-script", "size": 6, "x": 27, "y": 60, "at": 25.76, "anim": "pop"},
        {"text": "VS", "style": "comic", "size": 6, "box": "ink", "color": "white", "radius": 0.5, "pad": "0.15em 0.35em 0.05em", "x": 50, "y": 44, "at": 26.32, "anim": "slam", "sfx": "impact-bass-2"},
        {"text": "Others Need To", "style": "editorial-italic", "size": 5.5, "x": 73, "y": 22, "at": 26.64, "anim": "pop"},
        {"text": "HOLD", "style": "block", "size": 15, "x": 73, "y": 42, "at": 27.28, "anim": "stamp", "sfx": "thud"},
        {"text": "THEIR SHAPE", "style": "label-caps", "size": 5, "x": 73, "y": 60, "at": 27.52, "anim": "pop"},
    ],
    "stickers": [mascot("gibbon-leap", 25.5, 8, 66, 26, anim="slam-left"), mascot("monkey-rock-angry", 27.4, 80, 66, 26)],
})

# 10 BASIC PAPER → GLOSSY PRINTING
S.append({
    "id": "glossy", "start": 28.56, "end": 32.34, "enter": "zoom",
    "bg": {"pattern": "dots", "color": "bg", "color2": "mint-soft"},
    "camera": [{"type": "flash", "at": 31.36, "opacity": 0.45, "dur": 0.12}, {"type": "punch", "at": 31.36, "scale": 1.06}],
    "box": {"x": 8, "y": 18, "w": 60},
    "rows": [
        {"items": [{"text": "And Instead Of Going With", "style": "airy", "size": 5, "at": [28.56, 28.8, 28.96, 29.28, 29.52]}]},
        {"mt": 0.2, "items": [{"text": "BASIC PAPER,", "style": "label-caps", "color": "grey", "size": 8, "at": [29.68, 30.08], "strike": {"at": 30.4}}]},
        {"mt": 0.8, "items": [{"text": "We're Exploring", "style": "editorial-italic", "size": 6.5, "at": [30.64, 30.88]}]},
        {"mt": -0.2, "fit": 1, "items": [{"id": "gloss", "text": "GLOSSY PRINTING", "style": "bodoni", "color": "mint", "size": 12, "at": 31.36, "anim": "slam", "fx": ["shadow", "glow"], "fxColor": "ink", "sfx": "sparkle"}]},
    ],
    "draws": [
        {"shape": "burst", "x": 4, "y": 60, "w": 6, "h": 8, "weight": 0.7, "color": "mint", "at": 31.45, "dur": 0.12},
        {"shape": "burst", "x": 66, "y": 56, "w": 6, "h": 8, "weight": 0.7, "color": "ink", "at": 31.5, "dur": 0.12},
    ],
    "stickers": [mascot("cat-shades", 31.5, 74, 30, 40, tag=react("SHINY", 3.2))],
})

# 11 IT'LL COST US MORE (music muffled)
S.append({
    "id": "cost", "start": 32.36, "end": 33.82, "enter": "blur",
    "box": {"x": 10, "y": 26, "w": 60},
    "rows": [
        {"items": [{"text": "It'll", "style": "editorial-italic", "size": 7, "at": 32.4}]},
        {"mt": -0.4, "gap": 1.4, "items": [
            {"text": "COST US", "style": "poster", "size": 13, "at": [32.72, 32.96]},
            {"text": "MOOORE", "style": "titan", "color": "mint", "size": 13, "at": 33.2, "anim": "stretch", "fx": "shadow", "fxColor": "ink"}]},
    ],
    "stickers": [mascot("cat-cry-thumb", 33.0, 74, 36, 40, tag=react("my wallet", 2.8))],
})

# 12 PREMIUM COLLECTIBLES (music back on the beat)
S.append({
    "id": "premium", "start": 33.84, "end": 38.46, "enter": "zoom", "enterSfx": "impact-bass-1",
    "camera": [{"type": "flash", "at": 34.18, "opacity": 0.4, "dur": 0.1}] + pulses(34.18, 37.0, 1.025, 2) + [{"type": "punch", "at": 36.16, "scale": 1.06}],
    "box": {"x": 6, "y": 14, "w": 46},
    "rows": [
        {"items": [{"text": "But We Want These Models To Look Like", "style": "airy", "size": 3.8, "at": [33.84, 34.08, 34.24, 34.48, 34.72, 35.12, 35.28, 35.44]}]},
        {"mt": 0.8, "items": [{"text": "PREMIUM", "style": "bodoni-light", "size": 9, "at": 35.68, "anim": "wipe", "sfx": "sparkle"}]},
        {"mt": -0.6, "fit": 1, "items": [{"text": "COLLECTIBLES", "style": "bodoni", "color": "mint", "size": 11, "at": 36.16, "anim": "slam", "fx": "shadow", "fxColor": "ink", "sfx": "impact-bass-2"}]},
        {"mt": 1.0, "items": [{"text": "Not Just Paper Crafts", "style": "retro-script", "size": 5.5, "at": [37.04, 37.2, 37.44, 37.76], "strike": {"at": 37.95}}]},
    ],
    "draws": [
        {"shape": "burst", "x": 52, "y": 16, "w": 7, "h": 9, "weight": 0.8, "color": "mint", "at": 36.2, "dur": 0.12},
        {"shape": "burst", "x": 90, "y": 60, "w": 7, "h": 9, "weight": 0.8, "color": "mint", "at": 36.3, "dur": 0.12},
    ],
    "stickers": [
        img("car-hero", 34.3, 52, 26, 30, anim="slam-right", sfx="swish", float=0.6),
        mascot("monkey-shades-cash", 36.3, 82, 56, 28, tag=react("$$$", 3.2)),
    ],
})

# 13 THE TEST LIST — Day 1's numbered list, louder
S.append({
    "id": "test", "start": 38.48, "end": 44.28, "enter": "whip-left", "enterSfx": "swish",
    "camera": [{"type": "pulse", "at": 39.44, "scale": 1.03}, {"type": "pulse", "at": 40.56, "scale": 1.03}, {"type": "pulse", "at": 42.24, "scale": 1.03}],
    "box": {"x": 8, "y": 14, "w": 62},
    "rows": [
        {"gap": 1.4, "items": [
            {"text": "Now We Need To", "style": "editorial-italic", "size": 6.5, "at": [38.48, 38.72, 38.88, 38.96]},
            {"id": "test", "text": "TEST", "style": "stencil", "size": 10, "at": 39.12, "anim": "stamp", "sfx": "impact-bass-2"}]},
        {"mt": 1.0, "items": [{"text": "1. HOW THE PRINTS LOOK", "style": "poster", "color": "mint", "size": 7, "at": [39.44, 39.44, 39.6, 39.68, 40.16]}]},
        {"mt": 0.4, "items": [{"text": "2. HOW THE PIECES FOLD", "style": "poster", "color": "mint", "size": 7, "at": [40.56, 40.56, 40.72, 40.88, 41.28]}]},
        {"mt": 0.4, "items": [{"text": "3. HOW IT ALL COMES TOGETHER", "style": "poster", "color": "mint", "size": 7, "at": [42.0, 42.24, 42.4, 42.64, 43.44, 43.68]}]},
    ],
    "stickers": [anch("monkey-doctor", 39.2, "test", "r", 24, dx=13, dy=-3), mascot("monkey-phone-thinking", 42.3, 78, 56, 30)],
})

# 14 NOT JUST SELLING PAPER — music stops, black interrupt
S.append({
    "id": "notjust", "start": 44.3, "end": 45.9, "enter": "cut", "enterSfx": "record-scratch",
    "bg": {"color": "ink"},
    "box": {"x": 10, "y": 30, "w": 64},
    "rows": [
        {"items": [{"text": "Because We're", "style": "editorial-italic", "color": "white", "size": 7, "at": [44.32, 44.56]}]},
        {"mt": -0.2, "items": [{"text": "NOT JUST", "style": "poster", "color": "white", "size": 12, "at": [44.8, 44.96]}]},
        {"mt": -0.4, "items": [{"text": "SELLING PAPER", "style": "titan", "color": "mint", "size": 11, "at": [45.12, 45.44], "strike": {"at": 45.7}}]},
    ],
})

# 15 WE'RE BUILDING AN EXPERIENCE — drop
S.append({
    "id": "experience", "start": 45.93, "end": 47.64, "enter": "zoom", "enterSfx": "impact-bass-1",
    "bg": {"pattern": "burst", "color": "bg", "color2": "mint-soft", "spin": 0.14},
    "camera": [{"type": "flash", "at": 45.93, "opacity": 0.7, "dur": 0.12}, {"type": "shake", "at": 46.9, "dur": 0.3, "amp": 1.5}] + pulses(46.0, 47.64, 1.03),
    "box": {"x": 8, "y": 30, "w": 84},
    "rows": [
        {"align": "center", "items": [{"text": "We're Building An", "style": "editorial-italic", "size": 7, "at": [46.0, 46.24, 46.64]}]},
        {"align": "center", "mt": -0.4, "fit": 0.9, "items": [{"text": "EXPERIENCE", "style": "titan", "color": "mint", "size": 15, "at": 46.88, "anim": "pop-letters", "fx": ["extrude", "sticker"], "fxColor": "ink", "sfx": "impact-bass-2"}]},
    ],
    "stickers": [mascot("monkey-yay", 47.0, 83, 58, 24)],
    "effects": [
        {"type": "rain", "sticker": "confetti-mint", "at": 46.0, "dur": 1.6, "count": 7, "x0": 1, "x1": 9, "size": 3, "seed": 31},
        {"type": "rain", "sticker": "confetti-black", "at": 46.1, "dur": 1.6, "count": 5, "x0": 91, "x1": 99, "size": 3, "seed": 33},
    ],
})

# 16 LET'S SEE HOW THIS TURNS OUT (TURNS turns)
S.append({
    "id": "turns", "start": 47.68, "end": 49.16, "enter": "whip-up", "enterSfx": "swish",
    "box": {"x": 10, "y": 30, "w": 62},
    "rows": [
        {"gap": 1.4, "items": [
            {"text": "Let's See", "style": "retro-script", "size": 9, "at": [47.68, 47.92]},
            {"text": "How This", "style": "label", "size": 6, "at": [48.08, 48.24]}]},
        {"mt": -0.2, "gap": 2.6, "items": [
            {"text": "TURNS", "style": "titan", "color": "mint", "size": 14, "at": 48.4, "anim": "spin-letters", "fx": "shadow", "fxColor": "ink", "sfx": "swish"},
            {"text": "OUT", "style": "poster", "size": 14, "at": 48.64, "anim": "slam"}]},
    ],
    "stickers": [mascot("cat-interesting", 48.0, 74, 34, 38)],
})

# 17 OUTRO — series sign-off
S.append({
    "id": "follow", "start": 49.2, "end": 51.6, "enter": "zoom",
    "camera": pulses(49.3, 51.6, 1.03),
    "box": {"x": 15, "y": 34, "w": 70},
    "rows": [
        {"align": "center", "items": [{"text": "See You Tomorrow", "style": "editorial-italic", "size": 7, "at": 49.22}]},
        {"align": "center", "mt": -0.3, "items": [{"text": "FOLLOW", "style": "titan", "color": "mint", "size": 17, "at": 49.5, "anim": "pop-letters", "fx": ["extrude", "sticker"], "fxColor": "ink", "sfx": "pop"}]},
    ],
    "stickers": [mascot("monkey-goodbye", 49.4, 6, 18, 34, tag={"text": "GOODBYE", "pos": "t", "size": 3}), mascot("monkey-heart-hands", 49.8, 80, 52, 30)],
})

spec = {
    "meta": {"day": 11, "title": "Day 11 - Zero to Something: picking the paper", "duration": 51.6,
             "handle": "@your.soulpreneur", "watermark": {"text": "DAY 11"}, "progress": True},
    "audio": [
        {"id": "vo", "src": "audio/day-11-vo.m4a", "volume": 1},
        {"id": "music", "src": "audio/music-bed.m4a", "volume": 1},
    ],
    "scenes": S,
    "transitions": [{"type": "glitch", "at": 3.56, "dur": 0.14}, {"type": "glitch", "at": 14.04, "dur": 0.14},
                    {"type": "glitch", "at": 28.46, "dur": 0.14}, {"type": "glitch", "at": 44.18, "dur": 0.14}],
}
json.dump(spec, open("episodes/day-11/reel.spec.json", "w"), indent=2, ensure_ascii=False)
print("scenes", len(S))
