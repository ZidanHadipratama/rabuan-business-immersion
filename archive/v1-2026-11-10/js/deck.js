/* Deck engine: 1920×1080 stage scaled to the window, slide + step navigation,
   entrance choreography from data-a attributes, scene lifecycle, notes, print mode. */
(function () {
  const W = 1920, H = 1080;
  const qs = new URLSearchParams(location.search);
  const PRINT = qs.has("print");
  const root = document.documentElement;
  if (PRINT) root.classList.add("print");

  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const counter = document.getElementById("count");
  const notesEl = document.getElementById("notes");
  let cur = -1, step = 0, busy = null;

  slides.forEach((s, i) => {
    s.dataset.index = i + 1;
    const max = Math.max(0, ...Array.from(s.querySelectorAll("[data-step]")).map(e => +e.dataset.step));
    s.dataset.steps = max;
  });

  /* ---------- scale ---------- */
  function fit() {
    if (PRINT) return;
    const k = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(${(innerWidth - W * k) / 2}px, ${(innerHeight - H * k) / 2}px) scale(${k})`;
  }
  addEventListener("resize", fit); fit();

  /* ---------- choreography ---------- */
  function animate(el, tl, at) {
    const a = el.dataset.a;
    if (a === "mask") return M.mask(el, tl, at);
    if (a === "count") return M.count(el, tl, at);
    if (a === "draw") return M.draw(el, tl, at, +(el.dataset.dur || 1.55));
    if (a === "bars") return M.bars(Array.from(el.children), tl, at, el.dataset.prop || "scaleX");
    if (a === "fade") return tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: M.D.std, ease: "sig" }, at);
    if (a === "pop") return tl.fromTo(el, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: M.D.std, ease: "emph" }, at);
    if (a === "left") return tl.fromTo(el, { autoAlpha: 0, x: -48 }, { autoAlpha: 1, x: 0, duration: M.D.std, ease: "emph" }, at);
    if (a === "wipe") return tl.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "sig" }, at);
    if (a === "stagger") {
      const kids = Array.from(el.children);
      return tl.fromTo(kids, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: M.D.std, ease: "emph", stagger: +(el.dataset.st || 0.1) }, at);
    }
    return tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: M.D.std, ease: "emph" }, at); // rise
  }

  function entrance(s, stepN) {
    const tl = gsap.timeline();
    const items = Array.from(s.querySelectorAll("[data-a]")).filter(e => (+e.closest("[data-step]")?.dataset.step || 0) === stepN && (!e.dataset.step || +e.dataset.step === stepN));
    let t = 0;
    items.forEach(el => {
      const at = el.dataset.at !== undefined ? +el.dataset.at : t;
      animate(el, tl, at);
      t = at + (el.dataset.a === "mask" ? 0.45 : 0.14);
    });
    if (M.reduce) tl.progress(1);
    return tl;
  }

  function showStepContainers(s, n, animateIt) {
    s.querySelectorAll("[data-step]").forEach(e => {
      const k = +e.dataset.step;
      if (k <= n) {
        if (e.dataset.mode === "swap") { /* scene-driven */ }
        gsap.set(e, { autoAlpha: 1 });
      } else gsap.set(e, { autoAlpha: 0 });
    });
    if (animateIt) busy = entrance(s, n);
  }

  /* ---------- navigation ---------- */
  function go(n, st = 0, animateIt = true) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    const prev = slides[cur];
    const next = slides[n];
    if (prev && prev !== next) {
      prev.dispatchEvent(new CustomEvent("leave"));
      gsap.to(prev, { autoAlpha: 0, duration: M.reduce ? 0 : 0.35, ease: "exit", onComplete: () => prev.classList.remove("active") });
    }
    busy && busy.progress(1);
    cur = n; step = st;
    next.classList.add("active");
    gsap.killTweensOf(next);
    gsap.set(next, { autoAlpha: 1 });
    showStepContainers(next, 0, false);
    const tl = entrance(next, 0);
    if (!animateIt) tl.progress(1);
    for (let k = 1; k <= st; k++) { showStepContainers(next, k, true); busy.progress(1); }
    busy = tl;
    next.dispatchEvent(new CustomEvent("enter", { detail: { step: st, animate: animateIt } }));
    if (st) next.dispatchEvent(new CustomEvent("step", { detail: { n: st, animate: false } }));
    next.dataset.stepNow = st;
    history.replaceState(null, "", "#" + (n + 1) + (st ? "." + st : ""));
    counter.textContent = `${n + 1} / ${slides.length}`;
    notesEl.innerHTML = next.querySelector(".notes")?.innerHTML || "";
  }

  function forward() {
    const s = slides[cur];
    if (step < +s.dataset.steps) {
      step++;
      s.dataset.stepNow = step;
      showStepContainers(s, step, true);
      s.dispatchEvent(new CustomEvent("step", { detail: { n: step, animate: true } }));
      history.replaceState(null, "", "#" + (cur + 1) + "." + step);
    } else if (cur < slides.length - 1) go(cur + 1);
  }
  function back() {
    const s = slides[cur];
    if (step > 0) {
      step--;
      s.dataset.stepNow = step;
      showStepContainers(s, step, false);
      s.dispatchEvent(new CustomEvent("step", { detail: { n: step, animate: false } }));
      history.replaceState(null, "", "#" + (cur + 1) + (step ? "." + step : ""));
    } else if (cur > 0) go(cur - 1, +slides[cur - 1].dataset.steps, false);
  }

  addEventListener("keydown", e => {
    if (e.target.closest && e.target.closest("input,textarea")) return;
    const k = e.key;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(k)) { e.preventDefault(); forward(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); back(); }
    else if (k === "Home") go(0);
    else if (k === "End") go(slides.length - 1);
    else if (k === "f" || k === "F") { document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen(); }
    else if (k === "n" || k === "N") root.classList.toggle("show-notes");
  });
  stage.addEventListener("click", e => {
    if (e.target.closest("[data-click],a,button")) return;
    forward();
  });

  /* ---------- scenes ---------- */
  function mountScenes() {
    if (!window.Scenes) return;
    document.querySelectorAll("[data-scene]").forEach(el => {
      const f = window.Scenes[el.dataset.scene];
      if (!f) return;
      try { el._scene = f(el, el.closest(".slide")); }
      catch (err) { console.error("scene failed", el.dataset.scene, err); el.classList.add("scene-failed"); }
    });
  }

  /* ---------- start ---------- */
  document.fonts.ready.then(() => {
    mountScenes();
    if (PRINT) {
      slides.forEach(s => {
        s.classList.add("active");
        showStepContainers(s, +s.dataset.steps, false);
        s.querySelectorAll("[data-count]").forEach(c => (c.textContent = M.fmt(+c.dataset.count, +(c.dataset.dec || 0))));
        s.dispatchEvent(new CustomEvent("print"));
      });
      return;
    }
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
    go(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0, !(m && m[2]));
    if (qs.has("seek")) { const g = gsap.globalTimeline; const t0 = g.time(); g.pause(); g.time(t0 + +qs.get("seek")); } // verification captures
  });

  window.Deck = { go, forward, back, get index() { return cur; }, get step() { return step; } };
})();
