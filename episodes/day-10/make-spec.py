#!/usr/bin/env python3
# Generates episodes/day-10/reel.spec.json (run from the repo root).
# Times are the tightened VO's word times. Music: audio/music-bed.m4a (see audio/make-bed.py), 112 BPM,
# a beat lands on t = 0, so camera pulses use the grid k * BEAT.
import json

BEAT = 60 / 112.347
KY, KO, INK, MT = "#FCD112", "#FC5E0F", "#141414", "#3FE8B0"   # kit yellow / kit orange (sampled from the box)
YSOFT = "#FFF4BF"

def pulses(a, b, scale=1.025, every=1):
    k0 = int(a / BEAT) + 1
    out = []
    k = k0
    while k * BEAT < b - 0.15:
        if (k - k0) % every == 0:
            out.append({"type": "pulse", "at": round(k * BEAT, 3), "scale": scale})
        k += 1
    return out

def mascot(name, at, x, y, h, **kw):
    return {"name": f"lib:{name}", "at": at, "x": x, "y": y, "h": h, "cut": True, "anim": kw.pop("anim", "boing"), **kw}

def img(name, at, x, y, h, **kw):
    return {"name": name, "at": at, "x": x, "y": y, "h": h, "shadow": True, **kw}

def tag(text, at, x, y, size=4.2, rot=-4, bg=KY, fg=INK, **kw):
    return {"text": text, "style": "titan", "size": size, "x": x, "y": y, "rot": rot, "at": at, "box": bg, "color": fg,
            "radius": 0.18, "pad": "0.12em 0.42em 0.06em", "anim": kw.pop("anim", "pop"), **kw}

S = []

# 1 HOOK — the car on frame 1
S.append({
    "id": "hook-car", "start": 0.0, "end": 1.36,
    "bg": {"pattern": "burst", "color": "bg", "color2": YSOFT, "spin": 0.08},
    "camera": [{"type": "flash", "at": 0.0, "opacity": 0.75, "dur": 0.15}, {"type": "shake", "at": 0.02, "dur": 0.3, "amp": 1.4}],
    "box": {"x": 10, "y": 6, "w": 80},
    "rows": [
        {"align": "center", "gap": 1.4, "items": [
            {"text": "How About", "style": "editorial-italic", "size": 7, "at": [0.16, 0.4]},
            {"text": "BUILDING", "style": "wide", "size": 7.5, "at": 0.64},
            {"id": "this", "text": "THIS", "style": "titan", "color": KY, "size": 13, "at": 1.0, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-2"}]},
    ],
    "stickers": [img("car-hero", 0.0, 20, 33, 47, anim="slam", sfx="impact-bass-1")],
    "draws": [{"shape": "curl-down-arrow", "x": 79, "y": 18, "w": 7, "h": 17, "weight": 0.9, "color": "ink", "at": 1.04, "dur": 0.12}],
})

# 2 …out of a few sheets of paper?
S.append({
    "id": "hook-paper", "start": 1.38, "end": 3.0, "enter": "whip-left", "enterSfx": "swish",
    "camera": [{"type": "punch", "at": 2.48, "scale": 1.07}, {"type": "shake", "at": 2.48, "dur": 0.25, "amp": 1.1}],
    "box": {"x": 6, "y": 18, "w": 50},
    "rows": [
        {"items": [{"text": "With Just A Few", "style": "editorial-italic", "size": 7.5, "at": [1.38, 1.44, 1.6, 1.76]}]},
        {"mt": 0.6, "items": [{"text": "SHEETS", "style": "titan", "color": KY, "size": 17, "at": 2.0, "anim": "drop-letters", "fx": "extrude", "fxColor": "ink", "sfx": "thud"}]},
        {"mt": 0.4, "items": [{"text": "of PAPER?", "style": "marker", "size": 11, "at": [2.32, 2.48], "anim": "slam"}]},
    ],
    "stickers": [
        img("paper-stack", 1.9, 50, 18, 54, anim="drop", rot=4, sfx="swish"),
        mascot("cat-omg", 2.55, 81, 54, 32, sfx="boing"),
    ],
})

# 3 TITLE — milestone: the first double digits; ZERO lives inside the 0
S.append({
    "id": "title", "start": 3.02, "end": 6.3, "enter": "zoom-out",
    "camera": pulses(3.45, 6.3, 1.03),
    "floaters": [
        {"text": "This Is", "style": "editorial-italic", "size": 9, "x": 21, "y": 24, "at": 3.04, "anim": "slide-left"},
        {"text": "DAY", "style": "crisis", "size": 15, "x": 22, "y": 44, "at": 3.36, "anim": "slam", "sfx": "impact-bass-2"},
        {"text": "Of Going From", "style": "marker", "size": 6, "x": 22, "y": 63, "at": 4.08, "anim": "pop", "rot": -3},
        {"text": "1", "style": "titan", "color": "mint", "size": 50, "x": 55, "y": 50, "at": 3.68, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-1"},
        {"text": "0", "style": "titan", "color": "mint", "size": 50, "x": 73, "y": 50, "at": 3.8, "anim": "slam", "fx": "extrude", "fxColor": "ink"},
        {"text": "ZERO", "style": "geo-black", "size": 3.2, "x": 72.6, "y": 50, "rot": -90, "box": KY, "radius": 0.2, "pad": "0.1em 0.3em 0.04em", "at": 4.8, "anim": "pop", "sfx": {"name": "pop", "volume": 0.5}},
        {"text": "SOMETHING", "style": "blast", "color": KO, "size": 8.5, "x": 64, "y": 14, "at": 5.6, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "ding"},
        tag("DOUBLE DIGITS!", 4.3, 22, 80, size=4, rot=-5),
    ],
    "stickers": [mascot("monkey-yay", 5.0, 84.5, 60, 26)],
    "effects": [
        {"type": "rain", "sticker": "confetti-yellow", "at": 3.8, "dur": 2.2, "count": 7, "x0": 2, "x1": 14, "size": 3.2, "seed": 3},
        {"type": "rain", "sticker": "confetti-orange", "at": 3.9, "dur": 2.2, "count": 5, "x0": 88, "x1": 98, "size": 3.2, "seed": 5},
        {"type": "rain", "sticker": "confetti-black", "at": 4.0, "dur": 2.2, "count": 5, "x0": 2, "x1": 14, "size": 3, "seed": 9},
    ],
})

# 4 YESTERDAY: brand identity, done
S.append({
    "id": "yesterday", "start": 6.32, "end": 8.76, "enter": "whip-up", "enterSfx": "swish",
    "box": {"x": 8, "y": 16, "w": 52},
    "rows": [
        {"items": [{"text": "Yesterday,", "style": "editorial", "color": "grey", "size": 10, "at": 6.32}]},
        {"mt": 0.6, "items": [{"text": "We Built Our", "style": "airy", "size": 5.5, "at": [6.96, 7.2, 7.6]}]},
        {"mt": 0.4, "items": [{"text": "BRAND IDENTITY", "style": "titan", "size": 8.5, "box": INK, "color": KY, "radius": 0.12, "pad": "0.1em 0.3em 0.02em", "at": 7.76, "anim": "stamp", "sfx": "impact-bass-2"}]},
    ],
    "floaters": [
        tag("LOGO", 7.9, 80, 24, size=4.6, rot=-3),
        tag("COLOURS", 8.08, 80, 38, size=4.6, rot=2, bg=INK, fg=KY),
        tag("FONTS", 8.26, 80, 52, size=4.6, rot=-2, bg=KO, fg="white"),
    ],
    "draws": [
        {"shape": "check", "x": 68, "y": 20.5, "w": 4, "h": 6, "weight": 0.8, "color": MT, "at": 7.98, "dur": 0.12, "sfx": "click"},
        {"shape": "check", "x": 68, "y": 34.5, "w": 4, "h": 6, "weight": 0.8, "color": MT, "at": 8.16, "dur": 0.12, "sfx": "click"},
        {"shape": "check", "x": 68, "y": 48.5, "w": 4, "h": 6, "weight": 0.8, "color": MT, "at": 8.34, "dur": 0.12, "sfx": "click"},
    ],
    "stickers": [mascot("monkey-rapper", 7.5, 9, 58, 32)],
})

# 5 TODAY WE PUT IT TO WORK
S.append({
    "id": "work", "start": 8.8, "end": 10.52, "enter": "zoom",
    "bg": {"pattern": "stripes", "color": "bg", "color2": "#FFF9DC"},
    "camera": [{"type": "punch", "at": 10.0, "scale": 1.07}, {"type": "shake", "at": 10.0, "dur": 0.25, "amp": 1.2}],
    "box": {"x": 8, "y": 20, "w": 58},
    "rows": [
        {"items": [{"text": "Today,", "style": "editorial-italic", "size": 9, "at": 8.8}]},
        {"mt": 0.2, "items": [{"text": "WE PUT IT", "style": "poster", "size": 12, "at": [9.28, 9.44, 9.6]}]},
        {"mt": 0.4, "items": [{"text": "TO WORK.", "style": "stencil", "size": 15, "box": KY, "radius": 0.06, "pad": "0.08em 0.3em 0.02em", "at": 9.76, "anim": "stamp", "sfx": "impact-bass-1"}]},
    ],
    "stickers": [mascot("monkey-shocked-laptop", 9.5, 70, 30, 40)],
})

# 6 THE EQUATION: papercraft designs + new branding = ?
S.append({
    "id": "equation", "start": 10.56, "end": 14.5, "enter": "whip-left", "enterSfx": "swish",
    "floaters": [
        {"text": "We Took Our", "style": "editorial-italic", "size": 6, "x": 23, "y": 20, "at": 10.56, "anim": "pop"},
        {"text": "PAPERCRAFT DESIGNS", "style": "wide", "size": 4.2, "x": 23, "y": 66, "at": 11.04, "anim": "pop-letters", "sfx": {"name": "pop", "volume": 0.4}},
        {"text": "+", "style": "titan", "size": 16, "x": 49, "y": 44, "at": 12.32, "anim": "slam", "sfx": "impact-bass-2"},
        {"text": "Added Our", "style": "editorial-italic", "size": 6, "x": 76, "y": 20, "at": 12.32, "anim": "pop"},
        {"text": "NEW", "style": "marker", "size": 7, "x": 76, "y": 33, "at": 12.8, "anim": "pop", "rot": -4},
        {"text": "BRANDING", "style": "titan", "color": KY, "size": 10, "x": 76, "y": 46, "at": 13.04, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-1"},
        {"text": " ", "style": "label", "size": 4, "box": KY, "radius": 0.5, "pad": "0.1em 0.9em", "x": 68, "y": 60, "at": 13.2, "anim": "pop"},
        {"text": " ", "style": "label", "size": 4, "box": INK, "radius": 0.5, "pad": "0.1em 0.9em", "x": 73.5, "y": 60, "at": 13.28, "anim": "pop"},
        {"text": " ", "style": "label", "size": 4, "box": KO, "radius": 0.5, "pad": "0.1em 0.9em", "x": 79, "y": 60, "at": 13.36, "anim": "pop"},
        {"text": " ", "style": "label", "size": 4, "box": MT, "radius": 0.5, "pad": "0.1em 0.9em", "x": 84.5, "y": 60, "at": 13.44, "anim": "pop"},
        {"text": "= ?", "style": "titan", "color": KO, "size": 12, "x": 50, "y": 80, "at": 13.68, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-2"},
    ],
    "stickers": [img("car-side", 11.0, 5, 33, 22, anim="slide-right", sfx="swish")],
})

# 7 THE REVEAL: our first look at a DIY kit
S.append({
    "id": "kit-reveal", "start": 14.52, "end": 17.86, "enter": "zoom",
    "bg": {"pattern": "burst", "color": "bg", "color2": YSOFT, "spin": 0.1},
    "camera": [{"type": "flash", "at": 14.56, "opacity": 0.85, "dur": 0.18}, {"type": "punch", "at": 14.82, "scale": 1.06},
               {"type": "shake", "at": 14.6, "dur": 0.3, "amp": 1.3}, {"type": "pulse", "at": 16.24, "scale": 1.05}],
    "floaters": [
        {"text": "Our", "style": "editorial-italic", "size": 5, "x": 13, "y": 30, "at": 14.32 + 0.22, "anim": "pop"},
        {"text": "FIRST", "style": "titan", "size": 7, "x": 13, "y": 40, "at": 14.56, "anim": "slam"},
        {"text": "LOOK", "style": "titan", "color": KY, "size": 7, "x": 13, "y": 50, "at": 14.88, "anim": "slam", "fx": "extrude", "fxColor": "ink"},
        {"text": "at a", "style": "editorial-italic", "size": 4.5, "x": 87, "y": 28, "at": 15.36, "anim": "pop"},
        {"text": "DIY KIT", "style": "titan", "color": KO, "size": 6.5, "x": 87, "y": 38, "at": 15.68, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-2"},
        {"text": "could actually", "style": "airy", "size": 3.2, "x": 87, "y": 47, "at": 16.64, "anim": "pop"},
        {"text": "look like", "style": "airy", "size": 3.2, "x": 87, "y": 52, "at": 17.2, "anim": "pop"},
    ],
    "stickers": [
        img("kit-box", 14.56, 25.5, 22, 58, anim="slam", z=10, sfx="impact-bass-1", wobble=1.5),
        mascot("cat-wow", 16.9, 79, 58, 28),
    ],
    "effects": [
        {"type": "burst", "sticker": "confetti-yellow", "x": 50, "y": 50, "at": 14.6, "count": 9, "size": 3.4, "dist": 44, "sfx": "sparkle"},
        {"type": "burst", "sticker": "confetti-black", "x": 50, "y": 50, "at": 14.66, "count": 7, "size": 3, "dist": 40},
    ],
})

# 8 THE IDEA? — music cuts out; black pattern interrupt
S.append({
    "id": "idea", "start": 17.88, "end": 18.68, "enter": "cut", "enterSfx": "record-scratch",
    "bg": {"color": INK},
    "box": {"x": 10, "y": 30, "w": 60},
    "rows": [
        {"items": [{"text": "The", "style": "editorial-italic", "color": "white", "size": 8, "at": 17.9}]},
        {"mt": -0.6, "items": [{"text": "IDEA?", "style": "titan", "color": KY, "size": 22, "at": 18.06, "anim": "slam", "sfx": "impact-bass-2"}]},
    ],
    "stickers": [mascot("monkey-thinking", 18.12, 66, 26, 44, anim="pop")],
})

# 9 A BOX WITH EVERYTHING — the kit contents, with callouts
S.append({
    "id": "contents", "start": 18.7, "end": 23.82, "enter": "zoom", "enterSfx": "impact-bass-1",
    "camera": [{"type": "flash", "at": 18.7, "opacity": 0.5, "dur": 0.12}] + pulses(18.7, 20.0, 1.02, 2),
    "floaters": [
        {"text": "A BOX", "style": "titan", "color": KY, "size": 11, "x": 24, "y": 20, "at": 18.72, "anim": "slam", "fx": "extrude", "fxColor": "ink"},
        {"text": "WITH EVERYTHING", "style": "wide", "size": 4.6, "x": 24, "y": 32, "at": 19.28, "anim": "pop-letters", "sfx": {"name": "pop", "volume": 0.35}},
        {"text": "You Need To Build Your Own", "style": "airy", "size": 3.4, "x": 24, "y": 40, "at": 19.92, "anim": "pop"},
        {"text": "PAPER CAR", "style": "marker", "size": 8, "x": 24, "y": 50, "at": 21.12, "anim": "slam", "rot": -3, "box": KY, "radius": 0.1, "pad": "0.06em 0.3em 0.02em", "sfx": "impact-bass-2"},
        tag("TEMPLATES", 22.16, 25, 74, size=4.4, rot=-3),
        tag("INSTRUCTIONS", 23.04, 84, 9, size=3.8, rot=2, bg=INK, fg=KY),
    ],
    "draws": [
        {"shape": "arrow-right", "x": 36.5, "y": 71.5, "w": 13, "h": 6, "weight": 0.8, "color": "ink", "at": 22.3, "dur": 0.18},
        {"shape": "arrow-down", "x": 86.5, "y": 12.8, "w": 3, "h": 10, "weight": 0.8, "color": "ink", "at": 23.2, "dur": 0.15},
    ],
    "stickers": [
        img("kit-contents", 18.72, 47, 18, 62, anim="slam", sfx="thud"),
        mascot("baby-cool", 20.5, 3, 60, 24),
    ],
})

# 10 NOT JUST A PDF
S.append({
    "id": "pdf", "start": 23.84, "end": 25.0, "enter": "whip-up", "enterSfx": "swish",
    "box": {"x": 10, "y": 24, "w": 56},
    "rows": [
        {"items": [{"text": "NOT JUST A", "style": "poster", "size": 11, "at": [23.84, 24.0, 24.16]}]},
        {"mt": 0.6, "items": [{"text": "PDF", "style": "tech", "size": 20, "box": "#E6E6E6", "radius": 0.08, "pad": "0.05em 0.35em", "at": 24.32, "anim": "pop", "strike": {"at": 24.6}, "sfx": "error"}]},
    ],
    "stickers": [mascot("monkey-drama", 24.45, 68, 30, 42)],
})

# 11 AN ACTUAL PRODUCT: open, build, shelf
S.append({
    "id": "product", "start": 25.02, "end": 28.92, "enter": "zoom",
    "camera": [{"type": "pulse", "at": 25.68, "scale": 1.04}, {"type": "pulse", "at": 28.32, "scale": 1.04}],
    "box": {"x": 6, "y": 14, "w": 40},
    "rows": [
        {"items": [{"text": "An Actual", "style": "editorial-italic", "size": 7, "at": [25.04, 25.28]}]},
        {"mt": -0.2, "fit": 1, "items": [{"text": "PRODUCT", "style": "titan", "color": KO, "size": 12, "at": 25.68, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-1"}]},
        {"mt": 1.2, "gap": 1.1, "items": [
            {"text": "OPEN", "style": "chunky", "size": 5.5, "box": KY, "radius": 0.1, "pad": "0.08em 0.3em 0.02em", "at": 26.64, "anim": "pop", "sfx": {"name": "pop", "volume": 0.5}},
            {"text": "BUILD", "style": "stencil", "size": 5.5, "box": INK, "color": KY, "radius": 0.1, "pad": "0.08em 0.3em 0.02em", "at": 27.12, "anim": "drop-letters", "sfx": "thud"}]},
        {"mt": 1.2, "gap": 1.0, "items": [
            {"text": "& Put It On Your", "style": "airy", "size": 4, "at": [27.6, 27.6, 27.76, 28.0, 28.16]},
            {"text": "SHELF", "style": "marker", "size": 7, "at": 28.32, "anim": "slam", "sfx": "impact-bass-2"}]},
    ],
    "draws": [{"shape": "underline", "x": 50, "y": 70, "w": 46, "h": 3, "weight": 1.6, "color": "ink", "at": 28.2, "dur": 0.2}],
    "stickers": [
        img("car-closeup", 25.7, 54, 22, 48, anim="slide-left", sfx="swish"),
        mascot("monkey-wink-shades", 27.0, 87, 2, 17),
    ],
})

# 12 OF COURSE… FIRST CONCEPT (music muffled)
S.append({
    "id": "concept", "start": 28.96, "end": 31.4, "enter": "blur",
    "bg": {"pattern": "grid", "color": "bg", "color2": "#E9EEF5"},
    "camera": [{"type": "tilt", "at": 29.0, "deg": -1.5}],
    "box": {"x": 8, "y": 20, "w": 56},
    "rows": [
        {"items": [{"text": "Of Course,", "style": "editorial-italic", "color": "grey", "size": 8, "at": [28.96, 29.12]}]},
        {"mt": 0.4, "items": [{"text": "This Is Just Our", "style": "airy", "size": 5, "at": [29.52, 29.68, 29.92, 30.16]}]},
        {"mt": 0.4, "fit": 1, "items": [{"text": "FIRST CONCEPT", "style": "titan", "outline": True, "outlineWidth": 0.05, "color": "ink", "size": 11, "at": [30.4, 30.72], "anim": "pop"}]},
    ],
    "floaters": [{"text": "DRAFT v0.1", "style": "stencil", "color": "red", "size": 5.5, "x": 46, "y": 66, "rot": -8, "at": 30.6, "anim": "stamp", "sfx": "impact-bass-2"}],
    "stickers": [mascot("cat-interesting", 29.4, 70, 34, 38)],
})

# 13 STILL TO DO
def todo(text, times, big=None):
    items = [{"text": "[ ]", "style": "arcade", "size": 4, "at": times[0], "color": "grey"},
             {"text": text, "style": "poster", "size": 7.5, "at": times}]
    if big:
        items.append(big)
    return {"mt": 0.8, "gap": 1.2, "items": items}
S.append({
    "id": "todo", "start": 31.44, "end": 36.52, "enter": "whip-left", "enterSfx": "swish",
    "camera": [{"type": "reset", "at": 31.44}, {"type": "pulse", "at": 36.0, "scale": 1.05}],
    "box": {"x": 8, "y": 14, "w": 62},
    "rows": [
        {"items": [{"text": "We Still Need To…", "style": "editorial-italic", "size": 7, "at": [31.44, 31.6, 31.76, 32.0]}]},
        todo("TEST THE PAPER", [32.08, 32.32, 32.48]),
        todo("BUILD THE MODEL", [33.04, 33.28, 33.44]),
        todo("FIGURE OUT THE", [34.24, 34.56, 34.72], {"text": "COST", "style": "titan", "color": KO, "size": 9, "at": 36.0, "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-1"}),
    ],
    "floaters": [{"text": "how much?!", "style": "marker", "size": 5, "x": 82, "y": 86, "rot": -6, "at": 35.0, "anim": "pop"}],
    "stickers": [
        mascot("monkey-doctor", 32.2, 78, 6, 30),
        mascot("monkey-shades-cash", 34.96, 74, 44, 34, sfx="ding"),
    ],
})

# 14 TACKLING NEXT (music back, full)
S.append({
    "id": "next", "start": 36.56, "end": 38.2, "enter": "zoom", "enterSfx": "impact-bass-1",
    "camera": [{"type": "shake", "at": 37.4, "dur": 0.3, "amp": 1.5}] + pulses(36.6, 38.2, 1.03),
    "box": {"x": 8, "y": 22, "w": 66},
    "rows": [
        {"items": [{"text": "And That's What We're", "style": "editorial-italic", "size": 6.5, "at": [36.56, 36.72, 36.96, 37.12]}]},
        {"mt": 0.2, "items": [{"text": "TACKLING", "style": "blast", "color": KY, "size": 17, "at": 37.36, "anim": "slam-right", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-2"}]},
        {"mt": 0.2, "gap": 1.2, "items": [{"id": "nxt", "text": "NEXT", "style": "titan", "size": 10, "at": 37.76, "anim": "slam"}]},
    ],
    "draws": [{"shape": "arrow-right", "x": 23, "y": 55.5, "w": 14, "h": 7, "weight": 1.1, "color": "ink", "at": 37.9, "dur": 0.15}],
    "stickers": [mascot("gibbon-leap", 37.3, 66, 46, 30, anim="slide-left", sfx="swish")],
})

# 15 WOULD YOU BUILD ONE?
S.append({
    "id": "question", "start": 38.24, "end": 39.56, "enter": "whip-up", "enterSfx": "swish",
    "box": {"x": 8, "y": 16, "w": 66},
    "rows": [
        {"items": [{"text": "Would You", "style": "editorial-italic", "size": 7, "at": [38.24, 38.48]}]},
        {"mt": -0.2, "items": [{"text": "BUILD ONE?", "style": "titan", "color": KY, "size": 14, "at": [38.64, 38.88], "anim": "slam", "fx": "extrude", "fxColor": "ink", "sfx": "impact-bass-1"}]},
    ],
    "floaters": [
        tag("YES", 39.0, 22, 72, size=7, rot=-4, bg=MT, fg=INK, sfx={"name": "pop", "volume": 0.5}),
        tag("NO", 39.12, 42, 72, size=7, rot=4, bg="#E41E24", fg="white"),
    ],
    "stickers": [mascot("monkey-pray", 38.7, 72, 36, 42)],
})

# 16 BE HONEST
S.append({
    "id": "honest", "start": 39.6, "end": 40.4, "enter": "zoom", "enterSfx": "impact-bass-2",
    "box": {"x": 8, "y": 32, "w": 60},
        "rows": [{"items": [{"text": "BE HONEST.", "style": "stencil", "size": 16, "box": KY, "radius": 0.06, "pad": "0.08em 0.3em 0.02em", "at": 39.6, "anim": "stamp"}]}],
    "stickers": [mascot("cat-what", 39.7, 72, 30, 40)],
})

# 17 OUTRO
S.append({
    "id": "follow", "start": 40.44, "end": 42.9, "enter": "whip-up", "enterSfx": "swish",
    "camera": pulses(40.6, 42.9, 1.03),
    "box": {"x": 15, "y": 30, "w": 70},
    "rows": [
        {"align": "center", "items": [{"text": "Tell Us In The Comments", "style": "editorial-italic", "size": 6.5, "at": 40.46}]},
        {"align": "center", "mt": -0.2, "items": [{"text": "FOLLOW", "style": "titan", "color": KY, "size": 17, "at": 40.7, "anim": "pop-letters", "fx": ["extrude", "sticker"], "fxColor": "ink", "sfx": "pop"}]},
        {"align": "center", "mt": 0.6, "items": [{"text": "for Day 11", "style": "marker", "size": 5, "at": 41.1, "anim": "pop"}]},
    ],
    "stickers": [
        mascot("monkey-heart-hands", 40.9, 78, 10, 32),
        img("kit-box", 40.6, 3, 56, 30, anim="slide-right", rot=-6),
    ],
})

spec = {
    "meta": {"day": 10, "title": "Day 10 - Zero to Something: the first DIY kit concept", "duration": 42.9,
             "handle": "@your.soulpreneur", "watermark": {"text": "DAY 10"}, "progress": True},
    "audio": [
        {"id": "vo", "src": "audio/day-10-vo.m4a", "volume": 1},
        {"id": "music", "src": "audio/music-bed.m4a", "volume": 1},
    ],
    "scenes": S,
}
json.dump(spec, open("episodes/day-10/reel.spec.json", "w"), indent=2, ensure_ascii=False)
print("scenes", len(S))
