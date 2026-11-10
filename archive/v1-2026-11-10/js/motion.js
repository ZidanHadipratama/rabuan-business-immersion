/* Motion vocabulary for the deck.
   Personality: Corporate (motion-design skill). One signature curve for most moves,
   an emphasized curve for entrances, an accelerate curve for exits.
   Moves ported from Motion Prompt (MIT, (c) 2026 Shohei Ohtaki, showheyohtaki.github.io/motion-prompt):
   #005 Mask reveal, #007 Count-up, #002 Stagger, #004 Line draw, #044 Cross dissolve,
   #028 Zoom in, #164 Countdown timer, #126 Motion path. Timings and easings follow each element's spec. */
(function () {
  gsap.registerPlugin(SplitText, MotionPathPlugin, CustomEase);
  CustomEase.create("sig", "M0,0 C0.2,0 0,1 1,1");          // MD3 standard, 80% of moves
  CustomEase.create("emph", "M0,0 C0.05,0.7 0.1,1 1,1");     // entrances, attention
  CustomEase.create("exit", "M0,0 C0.3,0 1,1 1,1");          // exits
  CustomEase.create("quint", "M0,0 C0.22,1 0.36,1 1,1");     // #005 eOut5

  if (/[?&]shot\b/.test(location.search)) gsap.ticker.lagSmoothing(0); // headless captures render slowly
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const D = { quick: 0.3, std: 0.6, slow: 1.1 };
  const fmt = (v, dec) => v.toLocaleString("id-ID", { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const M = {
    reduce, D,

    /* #005 Mask reveal: a rule grows (0.1–0.5 s, in-out), then each line rises from behind
       its own edge (0.35–1.0 s, quint out); the second line follows 0.2 s later. */
    mask(el, tl, at = 0) {
      if (!el._split) el._split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ln", autoSplit: false });
      const lines = el._split.lines;
      const rule = el.parentElement.querySelector(":scope > .rule");
      if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power1.inOut", transformOrigin: "0 50%" }, at + 0.1);
      tl.fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 0.65, ease: "quint", stagger: 0.2 }, at + 0.35);
      return tl;
    },

    /* #007 Count-up: 0.45–2.9 s, quartic out, then a 7% damped pop on landing. */
    count(el, tl, at = 0) {
      const target = parseFloat(el.dataset.count);
      const dec = +(el.dataset.dec || 0);
      const o = { v: 0 };
      el.textContent = fmt(0, dec);
      tl.to(o, { v: target, duration: 2.45, ease: "power4.out", onUpdate: () => (el.textContent = fmt(o.v, dec)) }, at + 0.45);
      tl.add(() => {
        const t = { p: 0 };
        gsap.to(t, { p: 1, duration: 0.6, ease: "none", onUpdate: () => { const s = t.p * 0.6; gsap.set(el, { scale: 1 + 0.07 * Math.exp(-7 * s) * Math.cos(15 * s) }); }, onComplete: () => gsap.set(el, { scale: 1 }) });
      }, at + 2.9);
      return tl;
    },

    /* #002 Stagger: item i starts at 0.15 + 0.12 i, 0.5 s. The element's back-out (2.6) is
       softened to 1.2 to stay within the Corporate personality's 0–3% overshoot. */
    bars(els, tl, at = 0, prop = "scaleX") {
      els.forEach((b, i) => tl.fromTo(b, { [prop]: 0 }, { [prop]: 1, duration: 0.5, ease: "back.out(1.2)" }, at + 0.15 + i * 0.12));
      return tl;
    },

    /* #004 Line draw: the path draws 0.4–1.95 s (sine in-out) with a dot on its tip;
       an arrowhead pops (back out 2.5) at 1.9 s. */
    draw(path, tl, at = 0, dur = 1.55) {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(path, { strokeDashoffset: 0, duration: dur, ease: "sine.inOut" }, at + 0.4);
      const head = path.dataset.head && document.querySelector(path.dataset.head);
      if (head) tl.fromTo(head, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, at + 0.4 + dur - 0.05);
      return tl;
    },

    /* #044 Cross dissolve: incoming laid over the outgoing, 0 → 100% in 1.5 s, quad in-out.
       The outgoing picture stays opaque underneath. */
    dissolve(incoming, tl, at = 0, dur = 1.5) {
      tl.fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: "power1.inOut" }, at);
      return tl;
    },

    /* #028 Zoom in: focal length interpolated exponentially, cubic in-out.
       Ratio and duration are scaled down for a slow push on a still photo. */
    zoom(img, ratio = 1.16, dur = 14) {
      const o = { p: 0 };
      return gsap.to(o, { p: 1, duration: dur, ease: "power3.inOut", onUpdate: () => gsap.set(img, { scale: Math.pow(ratio, o.p) }) });
    },

    /* #164 Countdown timer: each second, only the changing digit slides up and out
       while the new one comes in from below (0.32 s, in-out). */
    countdown(root, secs, onDone) {
      const digits = root.querySelectorAll(".dg");
      const set = (n) => { const s = String(n).padStart(2, "0"); digits.forEach((d, i) => (d.querySelector(".cur").textContent = s[i])); };
      set(secs);
      let n = secs;
      const tl = gsap.timeline({ delay: 1.2 });
      for (let k = 1; k <= secs; k++) {
        tl.add(() => {
          const was = String(n).padStart(2, "0"); n -= 1; const now = String(n).padStart(2, "0");
          digits.forEach((d, i) => {
            if (was[i] === now[i]) return;
            const cur = d.querySelector(".cur"), nxt = d.querySelector(".nxt");
            nxt.textContent = now[i];
            gsap.fromTo(cur, { yPercent: 0 }, { yPercent: -100, duration: 0.32, ease: "power1.inOut" });
            gsap.fromTo(nxt, { yPercent: 100 }, { yPercent: 0, duration: 0.32, ease: "power1.inOut", onComplete: () => { cur.textContent = now[i]; gsap.set([cur, nxt], { yPercent: 0 }); gsap.set(nxt, { yPercent: 100 }); } });
          });
          if (n === 0 && onDone) gsap.delayedCall(0.4, onDone);
        }, k - 1);
      }
      return tl;
    },

    /* #126 Motion path: the object follows a dotted path and turns with it. */
    ride(obj, path, dur = 9, delay = 0) {
      return gsap.to(obj, { duration: dur, delay, ease: "sine.inOut", motionPath: { path, align: path, alignOrigin: [0.5, 0.92], autoRotate: true } });
    },

    fmt,
  };
  window.M = M;
})();
