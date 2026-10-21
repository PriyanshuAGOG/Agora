# Title-card concept library (Days 8–75)

The line is always **"This is Day N of going from Zero to Something."** The design is new every day.
The rule from Days 2–5 (see `style-bible.md` §6):

> The **numeral is the hero** (45–60% of frame height, mint), and the **ZERO → SOMETHING journey travels along, through or around the numeral**. Parts appear in spoken order. One mascot reacts. A stroke or path draws last.

Keep a log of which concept each day used (`series-log.md` in the user's episode folder) so nothing repeats inside a 10-day window.

---

## A. Recipes that work for any number

| Recipe | How to build it with the engine |
| --- | --- |
| **Stroke path**: words ride the numeral's stroke (as in Day 2) | giant `pixel` / `block` / `victorian` numeral item; "ZERO" as a `box` item at the stroke's start; "SOMETHING" floater at the stroke's end; optional `draws` arrow along the stroke |
| **Climb**: words climb a vertical stem (as in Day 4) | numeral `block`; `floaters` "ZERO" (tiny, at the foot) + "TO SOMETHING" (`vertical: true`) running up the stem |
| **Orbit**: text on the curve (as in Day 5) | `arcs` entry following a bowl or loop (`cx`, `cy`, `r`, `start`, `end` in degrees) |
| **Sleeping zero**: the O / 0 is literally zero | sleepy-zzz monkey on the O; arrow to "SOMETHING" |
| **Rhyme swap**: DAY → YAY / PLAY / PAY / SLAY | a mascot holds a yellow scribble tag over the D (`tag` with style `hand`, colour `#FFD400`) |
| **Order flip**: "THIS IS" small at the end (as in Day 5) | first item right-aligned and tiny, numeral in the middle |
| **Progress meter**: N of 75 | a `draws` underline or bracket as a bar, "ZERO" at the left end, "SOMETHING" at the right, a tiny "N/75" label; mascot rides the bar |

## B. Two-digit numerals: concepts by number shape

| Digits contain… | Concept |
| --- | --- |
| **a 0** (10, 20, 30, 40, 50, 60, 70) | **The 0 *is* ZERO**: write "ZERO" inside the 0's counter (tiny caps). The other digit is the road away from it: the 1 is a pole you climb, the 2 a slide, the 3 a staircase, the 4 a flag, the 5 a hook, the 6 a snail, the 7 a cliff. "SOMETHING" sits at the far end of that digit |
| **repeated digits** (11, 22, 33, 44, 55, 66) | **Twins and ladders**: 11 is a ladder (draw rungs between the 1s, "ZERO" on the bottom rung, "SOMETHING" on the top); 22 is two swans racing; 33 is a pair of lips or a heart turned sideways; 44 is two flags; 55 is a pair of hooks; 66 is a pair of eyes looking at SOMETHING |
| **ascending digits** (12, 23, 34, 45, 56, 67) | **Staircase**: the second digit sits higher than the first (`dy`), "ZERO" at the foot of the first and "SOMETHING" on top of the second; a mascot climbs |
| **an 8** (8, 18, 28, 38, 48, 58, 68) | *(Day 8 used: **two stacked rings** (`circle` draws) with a gem landing on the top ring → engagement ring; the drawn `figure-eight` stroke is still unused for 18/28…)*. Next time try **Infinity**: rotate the 8 by 90° (`rot: 90`) into ∞ ("infinite ideas"), "ZERO" in one loop and "SOMETHING" in the other; or a snowman or sunglasses |
| **a 9** (9, 19, 29, 39, 49, 59, 69) | *(Day 9 used: **Balloon**, the `nine-balloon` draw: the mint 9 is drawn from the string's end up the wavy tail and round the loop, "ZERO" at the string's end with a cheering monkey holding it, a thin ink tracer repeats the journey, "SOMETHING" slams inside the balloon with a sparkle burst, a real 🎈 floats off)*. Next time try **a magnifier** (the loop is the lens, the tail the handle, SOMETHING magnified inside) or **a music note** |
| **a 7** (7, 17, 27, 37, 47, 57, 67) | *(Day 7 used: the 7 drawn with `seven`, tracer `seven-climb` from ZERO at the foot up to SOMETHING at the bar's end)*. **Cliff / ramp**: "ZERO" at the top-left of the 7's bar, the arrow skis down the diagonal to "SOMETHING" |
| **a 1** (1x) | **Pole / rocket**: the 1 as a rocket stem (🚀 sticker at its top), "ZERO" on the launch pad and "SOMETHING" in the sky |
| **a 6** (6, 16, 26…) | **Snail shell / swirl**: "To Something" spiralling inward on an arc |

## C. Milestone days (go bigger)

| Day | Idea |
| --- | --- |
| 10 | "1" + "0" with "ZERO" inside the 0; the first double digit gets a party-popper sticker and a confetti `rain` (🎉) |
| 25 | "a quarter of the way": a progress bar filled 25%, "25/75" |
| 30 | a month in: a calendar-page style "30", with a mascot tearing off the page |
| 37–38 | halfway (37.5): a split frame, "ZERO" on the left half and "SOMETHING" on the right, "HALFWAY" stamp |
| 50 | "50" as a scoreboard or speedometer needle at two-thirds |
| 69 | keep it clean: use a recipe from §A |
| 74 | "one more day" countdown look |
| 75 | finale: the numeral made of the full journey's keywords; "SOMETHING" finally in black, "ZERO" crossed out (a `cross` draw) |

## D. Variety knobs (rotate them so no two consecutive cards feel alike)

- **Numeral style:** pixel → block → ornate serif → outlined → chunky toy → condensed → handwritten. Never the same style two days running.
- **Where "This Is" sits:** left / top / right-small / tucked inside the numeral.
- **Mascot role:** cheering, sleeping on the zero, riding the path, eating a letter, peeking from behind the numeral.
- **Path type:** arrow swoosh, curl, squiggle, staircase, arc, vertical climb.
- **Guest cast:** every ~7–10 days a different animal cast for one episode (cats were Day 4).
