// Runtime for typography reels: measure (fonts loaded) -> fit -> anchor stickers -> build one paused GSAP timeline.
// Everything is deterministic: no clocks, no unseeded randomness, all positions derived from layout.
(function () {
  var C = window.__REEL__;
  var U = C.U;
  function $(id) {
    return document.getElementById(id);
  }

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

  // Scale the giant "DAY N" watermark to a fixed share of the frame width.
  function fitWatermark() {
    var wm = $("wm");
    var w = wm.scrollWidth;
    if (!w) return;
    var fs = parseFloat(getComputedStyle(wm).fontSize);
    wm.style.fontSize = (fs * (C.W * C.wmWidth)) / w + "px";
  }

  // Rows with data-fit scale (up or down) to that share of the block width — the poster look where
  // stacked lines share one edge. Any other row wider than its block shrinks so nothing leaves the frame.
  function fitRows() {
    Array.prototype.forEach.call(document.querySelectorAll(".block"), function (block) {
      var bw = block.clientWidth;
      Array.prototype.forEach.call(block.querySelectorAll(".row"), function (row) {
        var target = row.dataset.fit ? bw * parseFloat(row.dataset.fit) : bw;
        var pad = parseFloat(getComputedStyle(row).paddingLeft) + parseFloat(getComputedStyle(row).paddingRight);
        var natural = 0;
        Array.prototype.forEach.call(row.children, function (c, k) {
          natural += c.getBoundingClientRect().width + (k ? parseFloat(getComputedStyle(row).columnGap) || 0 : 0);
        });
        natural += pad;
        if (!row.dataset.fit && natural <= bw + 1) return;
        if (!natural) return;
        var f = target / natural;
        if (Math.abs(f - 1) < 0.005) return;
        Array.prototype.forEach.call(row.querySelectorAll(":scope > .it:not(.ist)"), function (it) {
          it.style.fontSize = parseFloat(getComputedStyle(it).fontSize) * f + "px";
        });
        Array.prototype.forEach.call(row.querySelectorAll(".ist img"), function (img) {
          img.style.height = img.getBoundingClientRect().height * f + "px";
        });
        if (!row.dataset.fit) console.warn("[reel] row shrunk to fit: x" + f.toFixed(2) + " in " + block.parentNode.parentNode.id);
      });
    });
  }

  // Stickers anchored to a word: centre the sticker on a point of the word's box.
  function placeAnchors() {
    var rootRect = $("root").getBoundingClientRect();
    C.anchors.forEach(function (a) {
      var el = $(a.id);
      var target = $(a.to);
      if (!el || !target) {
        console.warn("[reel] anchor target missing: " + a.to);
        return;
      }
      var r = target.getBoundingClientRect();
      var img = el.querySelector("img");
      var h = el.getBoundingClientRect().height;
      var ratio = img && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
      var w = h * ratio;
      var x = { l: r.left, c: (r.left + r.right) / 2, r: r.right }[a.pos.indexOf("l") >= 0 ? "l" : a.pos.indexOf("r") >= 0 ? "r" : "c"];
      var y = { t: r.top, c: (r.top + r.bottom) / 2, b: r.bottom }[a.pos.indexOf("t") >= 0 ? "t" : a.pos.indexOf("b") >= 0 ? "b" : "c"];
      el.style.left = x - rootRect.left - w / 2 + a.dx + "px";
      el.style.top = y - rootRect.top - h / 2 + a.dy + "px";
    });
  }

  function enter(tl, el, anim, at, dur) {
    switch (anim) {
      case "pop": // sticker slap: instant appear slightly big, then a tiny settle bounce
        tl.fromTo(el, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: dur || 0.12, ease: "power2.out" }, at);
        tl.fromTo(el, { y: -0.7 * U }, { y: 0, duration: 0.22, ease: "back.out(3)" }, at + 0.1);
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
      case "drop":
        tl.fromTo(el, { opacity: 0, y: -6 * U }, { opacity: 1, y: 0, duration: dur || 0.22, ease: "back.out(1.4)" }, at);
        break;
      case "slide-left": // enters from the left
        tl.fromTo(el, { opacity: 0, x: -8 * U }, { opacity: 1, x: 0, duration: dur || 0.22, ease: "power3.out" }, at);
        break;
      case "slide-right": // enters from the right
        tl.fromTo(el, { opacity: 0, x: 8 * U }, { opacity: 1, x: 0, duration: dur || 0.22, ease: "power3.out" }, at);
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
        tl.fromTo(el, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: dur || 0.3, ease: "power2.out" }, at);
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
        case "hide":
          tl.set(el, { opacity: 0 }, s.at);
          break;
        case "chars": // typewriter
          for (i = 0; i < s.n; i++) tl.set($(s.id + "-c" + i), { opacity: 1 }, s.at + (i * s.dur) / s.n);
          break;
        case "words": // word-by-word on the voiceover's word times
          for (i = 0; i < s.n; i++) tl.set($(s.id + "-w" + i), { opacity: 1 }, s.times[Math.min(i, s.times.length - 1)]);
          break;
        case "ul": // underline / strike draws from the left
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
        case "exit":
          tl.to(el, { opacity: 0, duration: s.dur, ease: "none" }, s.at);
          break;
        case "wobble": {
          var cycles = Math.max(1, Math.floor((s.end - s.at) / 0.5));
          tl.fromTo(el, { rotation: -s.amp }, { rotation: s.amp, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: cycles * 2 - 1 }, s.at);
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
