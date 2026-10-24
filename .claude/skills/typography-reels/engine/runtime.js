// Runtime for typography reels: measure (fonts loaded) -> fit -> anchor -> build one paused GSAP timeline.
// Everything is deterministic: no clocks, no unseeded randomness, all positions derived from layout.
(function () {
  var C = window.__REEL__;
  var U = C.U;
  function $(id) {
    return document.getElementById(id);
  }
  function each(sel, fn, rootEl) {
    Array.prototype.forEach.call((rootEl || document).querySelectorAll(sel), fn);
  }

  // <lottie> (stripped by build.mjs when the video has no Lottie stickers)
  // Lottie stickers: created immediately (paused) and registered for HyperFrames' Lottie adapter,
  // which seeks them to composition time. Data is embedded, so nothing is fetched at render time.
  window.__hfLottie = window.__hfLottie || [];
  if (window.lottie) {
    each(".lot", function (el) {
      var data = C.lottie[el.getAttribute("data-lottie")];
      if (!data) return;
      var anim = window.lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: JSON.parse(JSON.stringify(data)),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      window.__hfLottie.push(anim);
    });
  }
  // </lottie>

  function loadFonts() {
    var all = [];
    document.fonts.forEach(function (ff) {
      all.push(ff.load().catch(function () {}));
    });
    return Promise.all(all).then(function () {
      return document.fonts.ready;
    });
  }
  function decodeImages() {
    return Promise.all(
      Array.prototype.map.call(document.images, function (img) {
        return img.decode ? img.decode().catch(function () {}) : null;
      }),
    );
  }

  // Giant "DAY N" watermark: size to a share of the frame width and centre the *ink* (not the text box),
  // so letters like "1" or a trailing space never push it off-centre.
  function fitWatermark() {
    var wm = $("wm");
    var cs = getComputedStyle(wm);
    var ctx = document.createElement("canvas").getContext("2d");
    var baseFs = parseFloat(cs.fontSize);
    var lsEm = (parseFloat(cs.letterSpacing) || 0) / baseFs;
    function measure(fs) {
      ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + fs + "px " + cs.fontFamily;
      if ("letterSpacing" in ctx) ctx.letterSpacing = lsEm * fs + "px";
      return ctx.measureText(wm.textContent);
    }
    var m = measure(baseFs);
    var inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    if (!inkW) return;
    var fs = (baseFs * C.W * C.wmWidth) / inkW;
    m = measure(fs);
    wm.style.fontSize = fs + "px";
    // origin x so the ink is centred; baseline y so the ink's vertical middle sits at wmY
    var originX = C.W / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    var baseline = C.H * C.wmY + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    var fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
    var baselineFromTop = (fs - (fa + fd)) / 2 + fa; // line-height: 1
    wm.style.left = originX + "px";
    wm.style.top = baseline - baselineFromTop + "px";
  }

  // Rows with data-fit scale (up or down) to that share of the block width — the poster look where
  // stacked lines share one edge. Any other row wider than its block shrinks so nothing leaves the frame.
  function fitRows() {
    each(".block", function (block) {
      var bw = block.clientWidth;
      each(".row", function (row) {
        var rs = getComputedStyle(row);
        var target = row.dataset.fit ? bw * parseFloat(row.dataset.fit) : bw;
        var pad = parseFloat(rs.paddingLeft) + parseFloat(rs.paddingRight);
        var natural = 0;
        Array.prototype.forEach.call(row.children, function (c, k) {
          natural += c.getBoundingClientRect().width + (k ? parseFloat(rs.columnGap) || 0 : 0);
        });
        natural += pad;
        if (!row.dataset.fit && natural <= bw + 1) return;
        if (!natural) return;
        var f = target / natural;
        if (Math.abs(f - 1) < 0.005) return;
        each(":scope > .it:not(.ist)", function (it) {
          it.style.fontSize = parseFloat(getComputedStyle(it).fontSize) * f + "px";
        }, row);
        each(".ist img, .ist .lot", function (img) {
          img.style.height = img.getBoundingClientRect().height * f + "px";
        }, row);
        if (!row.dataset.fit) console.warn("[reel] row shrunk to fit: x" + f.toFixed(2) + " in " + block.parentNode.parentNode.id);
      }, block);
    });
  }

  function scalePath(d, sx, sy) {
    var k = 0;
    return d.replace(/[MLCSQT]|-?\d*\.?\d+/g, function (tok) {
      if (/[A-Z]/.test(tok)) return " " + tok;
      var v = parseFloat(tok) * (k++ % 2 === 0 ? sx : sy);
      return String(Math.round(v * 100) / 100);
    });
  }

  // Stickers anchored to a word (centre on a point of its box), and strokes drawn around a word.
  function placeAnchors() {
    var rootRect = $("root").getBoundingClientRect();
    C.anchors.forEach(function (a) {
      var el = $(a.id);
      var target = $(a.to || a.around);
      if (!el || !target) {
        console.warn("[reel] anchor target missing: " + (a.to || a.around));
        return;
      }
      var r = target.getBoundingClientRect();
      if (a.around) {
        var w = r.width + 2 * a.pad, h = r.height + 2 * a.pad;
        el.style.left = r.left - rootRect.left - a.pad + "px";
        el.style.top = r.top - rootRect.top - a.pad + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";
        $(a.id + "-svg").setAttribute("viewBox", "0 0 " + w + " " + h);
        a.paths.forEach(function (p, k) {
          $(a.id + "-p" + k).setAttribute("d", scalePath(p, w / 100, h / 100));
        });
        return;
      }
      var media = el.querySelector("img, .lot");
      var hgt = el.getBoundingClientRect().height;
      var ratio = media && media.naturalHeight ? media.naturalWidth / media.naturalHeight : 1;
      var wid = hgt * ratio;
      var x = { l: r.left, c: (r.left + r.right) / 2, r: r.right }[a.pos.indexOf("l") >= 0 ? "l" : a.pos.indexOf("r") >= 0 ? "r" : "c"];
      var y = { t: r.top, c: (r.top + r.bottom) / 2, b: r.bottom }[a.pos.indexOf("t") >= 0 ? "t" : a.pos.indexOf("b") >= 0 ? "b" : "c"];
      el.style.left = x - rootRect.left - wid / 2 + a.dx + "px";
      el.style.top = y - rootRect.top - hgt / 2 + a.dy + "px";
    });
  }

  function enter(tl, el, anim, at, dur) {
    switch (anim) {
      case "pop": // sticker slap: instant appear slightly big, then a tiny settle bounce
        tl.fromTo(el, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: dur || 0.12, ease: "power2.out" }, at);
        tl.fromTo(el, { y: -0.7 * U }, { y: 0, duration: 0.22, ease: "back.out(3)" }, at + 0.1);
        break;
      case "boing": // big elastic pop for hero stickers
        tl.fromTo(el, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: dur || 0.55, ease: "elastic.out(1.1, 0.45)" }, at);
        break;
      case "swing": // "We Have No Idea": arcs up from small + tilted
        tl.fromTo(
          el,
          { opacity: 0, rotation: -9, scale: 0.55, y: 2 * U, transformOrigin: "0% 100%" },
          { opacity: 1, rotation: 0, scale: 1, y: 0, duration: dur || 0.27, ease: "back.out(1.6)" },
          at,
        );
        break;
      case "rise": // "GOING TO BUILD": springs up from the baseline with vertical motion blur
        tl.fromTo(
          el,
          { opacity: 0, scaleY: 0.15, y: 1.5 * U, filter: "blur(6px)", transformOrigin: "50% 100%" },
          { opacity: 1, scaleY: 1, y: 0, filter: "blur(0px)", duration: dur || 0.33, ease: "power3.out" },
          at,
        );
        break;
      case "stamp": // emphatic slam-in
        tl.fromTo(el, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: dur || 0.16, ease: "power4.in" }, at);
        break;
      case "slam": // giant slam with overshoot + tilt
        tl.fromTo(el, { opacity: 0, scale: 2.6, rotation: -6 }, { opacity: 1, scale: 1, rotation: 0, duration: dur || 0.22, ease: "back.out(2.2)" }, at);
        break;
      case "zoom": // grows from tiny
        tl.fromTo(el, { opacity: 0, scale: 0.1 }, { opacity: 1, scale: 1, duration: dur || 0.3, ease: "back.out(1.8)" }, at);
        break;
      case "drop":
        tl.fromTo(el, { opacity: 0, y: -6 * U }, { opacity: 1, y: 0, duration: dur || 0.22, ease: "back.out(1.4)" }, at);
        break;
      case "slide-left": // enters from the left
        tl.fromTo(el, { opacity: 0, x: -8 * U }, { opacity: 1, x: 0, duration: dur || 0.22, ease: "power3.out" }, at);
        break;
      case "slide-right": // enters from the right
        tl.fromTo(el, { opacity: 0, x: 8 * U }, { opacity: 1, x: 0, duration: dur || 0.22, ease: "power3.out" }, at);
        break;
      case "slam-left": // flies in from far left and collides
        tl.fromTo(el, { opacity: 0, x: -0.6 * C.W }, { opacity: 1, x: 0, duration: dur || 0.28, ease: "power4.out" }, at);
        break;
      case "slam-right": // flies in from far right and collides
        tl.fromTo(el, { opacity: 0, x: 0.6 * C.W }, { opacity: 1, x: 0, duration: dur || 0.28, ease: "power4.out" }, at);
        break;
      case "slide-up":
        tl.fromTo(el, { opacity: 0, y: 4 * U }, { opacity: 1, y: 0, duration: dur || 0.22, ease: "power3.out" }, at);
        break;
      case "fade":
        tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur || 0.25, ease: "none" }, at);
        break;
      case "blur":
        tl.fromTo(el, { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: dur || 0.3, ease: "power2.out" }, at);
        break;
      case "wipe": // reveal left -> right
        tl.fromTo(el, { opacity: 1, clipPath: "inset(-30% 100% -30% -10%)" }, { clipPath: "inset(-30% -30% -30% -10%)", duration: dur || 0.3, ease: "power2.out" }, at);
        break;
      case "print": // reveal top -> bottom in steps, like paper coming out of a printer
        tl.fromTo(el, { opacity: 1, clipPath: "inset(-10% -10% 100% -10%)" }, { clipPath: "inset(-10% -10% -30% -10%)", duration: dur || 0.6, ease: "steps(8)" }, at);
        break;
      case "stretch": // "Toooo": grows out to the right
        tl.fromTo(el, { opacity: 1, scaleX: 0.15, transformOrigin: "0% 50%" }, { scaleX: 1, duration: dur || 0.35, ease: "power2.out" }, at);
        break;
      case "spin-in":
        tl.fromTo(el, { opacity: 0, rotation: -180, scale: 0.2 }, { opacity: 1, rotation: 0, scale: 1, duration: dur || 0.35, ease: "back.out(1.5)" }, at);
        break;
      case "shake": // appear, then a nervous shake
        tl.set(el, { opacity: 1 }, at);
        tl.fromTo(el, { x: -0.6 * U }, { x: 0.6 * U, duration: 0.05, repeat: 5, yoyo: true, ease: "none" }, at);
        tl.set(el, { x: 0 }, at + 0.3);
        break;
      default: // "cut" — the house default: words simply appear on the spoken syllable
        tl.set(el, { opacity: 1 }, at);
    }
  }

  function letters(tl, s) {
    var els = [];
    for (var i = 0; i < s.n; i++) els.push($(s.id + "-c" + i));
    var st = s.stagger != null ? s.stagger : 0.035;
    switch (s.anim) {
      case "bounce":
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, y: -1.1 * s.em }, { opacity: 1, y: 0, duration: s.dur || 0.5, ease: "bounce.out" }, s.at + i * st);
        });
        break;
      case "drop-letters":
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, y: -0.6 * s.em, rotation: s.rand[i][0] * 20 }, { opacity: 1, y: 0, rotation: 0, duration: s.dur || 0.3, ease: "back.out(2)" }, s.at + i * st);
        });
        break;
      case "pop-letters":
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: s.dur || 0.28, ease: "back.out(3)" }, s.at + i * (s.stagger != null ? s.stagger : 0.03));
        });
        break;
      case "rise-letters":
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, y: 0.5 * s.em }, { opacity: 1, y: 0, duration: s.dur || 0.25, ease: "power3.out" }, s.at + i * (s.stagger != null ? s.stagger : 0.025));
        });
        break;
      case "spin-letters":
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, rotation: -360, scale: 0.3 }, { opacity: 1, rotation: 0, scale: 1, duration: s.dur || 0.4, ease: "back.out(1.6)" }, s.at + i * st);
        });
        break;
      case "scatter": // letters fly in from random places and assemble
        els.forEach(function (el, i) {
          var r = s.rand[i];
          tl.fromTo(
            el,
            { opacity: 0, x: r[0] * 1.6 * s.em, y: r[1] * 1.2 * s.em, rotation: r[2] * 140 },
            { opacity: 1, x: 0, y: 0, rotation: 0, duration: s.dur || 0.45, ease: "power3.out" },
            s.at + i * (s.stagger != null ? s.stagger : 0.012),
          );
        });
        break;
      case "fix": // letters start jumbled, then snap into line ("FIXING", "SORTED")
        var fixAt = s.fixAt != null ? s.fixAt : s.at + 0.45;
        els.forEach(function (el, i) {
          var r = s.rand[i];
          tl.set(el, { rotation: r[0] * 28, y: r[1] * 0.28 * s.em, x: r[2] * 0.08 * s.em }, s.at);
          tl.to(el, { rotation: 0, y: 0, x: 0, duration: 0.2, ease: "back.out(2.5)" }, fixAt + i * (s.stagger != null ? s.stagger : 0.012));
        });
        break;
      case "wave": // appear, then keep bobbing like a wave
        els.forEach(function (el, i) {
          tl.fromTo(el, { opacity: 0, y: 0.3 * s.em }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, s.at + i * 0.03);
          var cycles = Math.max(1, Math.floor((s.end - s.at - 0.3) / 0.6));
          tl.fromTo(el, { y: -0.07 * s.em }, { y: 0.07 * s.em, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: cycles * 2 - 1 }, s.at + 0.25 + i * 0.06);
        });
        break;
      case "jitter": // "crazy": every letter twitches on its own
        s.steps.forEach(function (row, k) {
          row.forEach(function (v, i) {
            tl.set(els[i], { rotation: v[0], y: v[1] * s.em }, s.at + k * 0.12);
          });
        });
        break;
      case "flicker": // neon sign stutter
        var seq = [1, 0, 1, 0.2, 1, 0, 0.6, 1];
        els.forEach(function (el, i) {
          seq.forEach(function (o, k) {
            tl.set(el, { opacity: o }, s.at + k * 0.05 + (i % 3) * 0.03);
          });
        });
        break;
    }
  }

  function sceneEnter(tl, s) {
    var inn = $(s.id + "-in"), cam = $(s.id + "-cam");
    var d = s.dur || 0.22;
    switch (s.type) {
      case "whip-left": // arrives travelling left
        tl.fromTo(inn, { x: 0.35 * C.W, filter: "blur(14px)" }, { x: 0, filter: "blur(0px)", duration: d, ease: "power3.out" }, s.at);
        break;
      case "whip-right":
        tl.fromTo(inn, { x: -0.35 * C.W, filter: "blur(14px)" }, { x: 0, filter: "blur(0px)", duration: d, ease: "power3.out" }, s.at);
        break;
      case "whip-up":
        tl.fromTo(inn, { y: 0.4 * C.H, filter: "blur(14px)" }, { y: 0, filter: "blur(0px)", duration: d, ease: "power3.out" }, s.at);
        break;
      case "zoom":
        tl.fromTo(cam, { scale: 1.4 }, { scale: 1, duration: d + 0.05, ease: "power3.out" }, s.at);
        tl.fromTo(inn, { filter: "blur(10px)" }, { filter: "blur(0px)", duration: d, ease: "power2.out" }, s.at);
        break;
      case "zoom-out":
        tl.fromTo(cam, { scale: 0.75 }, { scale: 1, duration: d + 0.05, ease: "back.out(1.6)" }, s.at);
        break;
      case "drop":
        tl.fromTo(inn, { y: -0.5 * C.H }, { y: 0, duration: d + 0.08, ease: "bounce.out" }, s.at);
        break;
      case "spin":
        tl.fromTo(cam, { rotation: -10, scale: 0.7 }, { rotation: 0, scale: 1, duration: d + 0.1, ease: "back.out(1.7)" }, s.at);
        break;
      case "blur":
        tl.fromTo(inn, { filter: "blur(18px)" }, { filter: "blur(0px)", duration: d, ease: "power2.out" }, s.at);
        break;
    }
  }
  function sceneExit(tl, s) {
    var inn = $(s.id + "-in"), cam = $(s.id + "-cam");
    switch (s.type) {
      case "fade":
        tl.to(inn, { opacity: 0, duration: s.dur, ease: "none" }, s.at);
        break;
      case "whip-left": // leaves travelling left
        tl.to(inn, { x: -0.35 * C.W, filter: "blur(14px)", duration: s.dur, ease: "power3.in" }, s.at);
        break;
      case "whip-right":
        tl.to(inn, { x: 0.35 * C.W, filter: "blur(14px)", duration: s.dur, ease: "power3.in" }, s.at);
        break;
      case "zoom":
        tl.to(cam, { scale: 1.5, duration: s.dur, ease: "power3.in" }, s.at);
        tl.to(inn, { opacity: 0, duration: s.dur, ease: "power2.in" }, s.at);
        break;
      case "drop":
        tl.to(inn, { y: 0.6 * C.H, duration: s.dur, ease: "power3.in" }, s.at);
        break;
    }
  }
  function camera(tl, s) {
    var inn = $(s.id + "-in"), cam = $(s.id + "-cam");
    switch (s.type) {
      case "punch": // snap zoom and hold
        tl.to(cam, { scale: s.scale || 1.08, duration: s.dur || 0.12, ease: "power3.out" }, s.at);
        break;
      case "pulse": // quick zoom in and back
        tl.to(cam, { scale: s.scale || 1.06, duration: 0.08, ease: "power2.out" }, s.at);
        tl.to(cam, { scale: 1, duration: 0.25, ease: "power2.out" }, s.at + 0.08);
        break;
      case "reset":
        tl.to(cam, { scale: 1, rotation: 0, duration: s.dur || 0.2, ease: "power2.out" }, s.at);
        break;
      case "tilt":
        tl.to(cam, { rotation: s.deg || -3, duration: s.dur || 0.2, ease: "back.out(2)" }, s.at);
        break;
      case "shake": // screen shake
        var n = Math.max(2, Math.round((s.dur || 0.3) / 0.04));
        for (var i = 0; i < n; i++) {
          var a = (s.amp || 1.2) * U * (1 - i / n);
          tl.set(inn, { x: (i % 2 ? -1 : 1) * a, y: (i % 3 === 0 ? 1 : -1) * a * 0.6 }, s.at + i * 0.04);
        }
        tl.set(inn, { x: 0, y: 0 }, s.at + n * 0.04);
        break;
      case "flash":
        tl.fromTo($(s.id + "-fl"), { opacity: s.opacity || 0.9 }, { opacity: 0, duration: s.dur || 0.18, ease: "power2.out" }, s.at);
        break;
    }
  }

  function build(tl) {
    C.plan.forEach(function (s) {
      var el = $(s.id);
      var i;
      switch (s.k) {
        case "item":
        case "sticker":
          if (!el) return console.warn("[reel] missing " + s.id);
          enter(tl, el, s.anim, s.at, s.dur);
          if (s.out != null) tl.set(el, { opacity: 0 }, s.out);
          break;
        case "letters":
          letters(tl, s);
          break;
        case "hide":
          tl.set(el, { opacity: 0 }, s.at);
          break;
        case "chars": // typewriter
          for (i = 0; i < s.n; i++) tl.set($(s.id + "-c" + i), { opacity: 1 }, s.at + (i * s.dur) / s.n);
          break;
        case "words": // word-by-word on the voiceover's word times
          for (i = 0; i < s.n; i++) tl.set($(s.id + "-w" + i), { opacity: 1 }, s.times[Math.min(i, s.times.length - 1)]);
          break;
        case "count": {
          var o = { v: s.from };
          var cel = el;
          tl.to(o, { v: s.to, duration: s.dur, ease: "power2.out", onUpdate: function () { cel.textContent = s.prefix + Math.round(o.v) + s.suffix; } }, s.at);
          tl.set(cel, { opacity: 1 }, s.at);
          break;
        }
        case "echo":
          tl.set(el, { opacity: s.op }, s.at);
          break;
        case "ul": // underline / strike / highlighter draws from the left
          tl.fromTo(el, { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: s.dur, ease: "power2.out" }, s.at);
          break;
        case "draw": {
          tl.set(el, { opacity: 1 }, s.at);
          var body = [], heads = [];
          for (i = 0; i < s.n; i++) (i < s.split ? body : heads).push($(s.id + "-p" + i));
          var bodyDur = heads.length ? s.dur * 0.75 : s.dur;
          tl.to(body, { strokeDashoffset: 0, duration: bodyDur, ease: "power1.inOut" }, s.at);
          if (heads.length) tl.to(heads, { strokeDashoffset: 0, duration: s.dur - bodyDur, ease: "none" }, s.at + bodyDur);
          break;
        }
        case "enter":
          sceneEnter(tl, s);
          break;
        case "exitfx":
          sceneExit(tl, s);
          break;
        case "camera":
          camera(tl, s);
          break;
        case "drift":
          tl.fromTo(el, { scale: 1 }, { scale: s.to, duration: s.end - s.at, ease: "none" }, s.at);
          break;
        case "wobble": {
          var cycles = Math.max(1, Math.floor((s.end - s.at) / 0.5));
          tl.fromTo(el, { rotation: -s.amp }, { rotation: s.amp, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: cycles * 2 - 1 }, s.at);
          break;
        }
        case "float": {
          var fc = Math.max(1, Math.floor((s.end - s.at) / 1.2));
          tl.fromTo(el, { y: -s.amp }, { y: s.amp, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: fc * 2 - 1 }, s.at);
          break;
        }
        case "spin":
          var spinTo = { rotation: 360 * s.turns, duration: s.end - s.at, ease: "none" };
          if (s.svgOrigin) spinTo.svgOrigin = s.svgOrigin;
          tl.fromTo(el, { rotation: 0 }, spinTo, s.at);
          break;
        case "fall":
          tl.set(el, { opacity: 1 }, s.at);
          tl.fromTo(el, { y: s.from, rotation: 0 }, { y: s.to, rotation: s.spin, duration: s.dur, ease: "power1.in" }, s.at);
          break;
        case "burst":
          tl.fromTo(el, { opacity: 1, x: 0, y: 0, scale: 0.3, rotation: 0 }, { x: s.dx, y: s.dy, scale: 1, rotation: s.rot, duration: s.dur * 0.6, ease: "power3.out" }, s.at);
          tl.to(el, { opacity: 0, duration: s.dur * 0.4, ease: "power1.in" }, s.at + s.dur * 0.6);
          break;
        case "glitch":
          s.steps.forEach(function (row, f) {
            row.forEach(function (b, k) {
              tl.set($(s.id + "-b" + k), { top: b.top + "%", height: b.h + "%", x: (b.left * C.W) / 100, backgroundColor: b.c }, s.at + f / s.fps);
            });
          });
          break;
      }
    });
  }

  loadFonts()
    .then(decodeImages)
    .then(function () {
      var root = $("root");
      root.classList.add("reel-measuring");
      fitWatermark();
      fitRows();
      placeAnchors();
      root.classList.remove("reel-measuring");
      var tl = gsap.timeline({ paused: true });
      build(tl);
      window.__timelines["main"] = tl;
      if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
    });
})();
