/* Rabuan deck runtime: scaling, navigation, entrance + idle animation, step reveals, print mode. */
(function () {
  const PRINT = /[?&]print\b/.test(location.search);
  if (PRINT) document.documentElement.classList.add("print");
  gsap.registerPlugin(SplitText, MotionPathPlugin);
  if (/[?&]shot\b/.test(location.search)) gsap.ticker.lagSmoothing(0);

  const stage = document.getElementById("stage");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const bar = document.getElementById("bar");
  const count = document.getElementById("count");
  let cur = -1, step = 0;
  const enterTl = new Map();   // slide -> timeline
  const idleTw = new Map();    // slide -> array of tweens

  // page numbers
  slides.forEach((s, i) => {
    const p = s.querySelector(".pnum");
    if (p) p.textContent = String(i + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
  });

  /* ---------- scale ---------- */
  function fit() {
    if (PRINT) return;
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transformOrigin = "50% 50%";
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener("resize", fit); fit();

  /* ---------- number formatting ---------- */
  function fmt(v, dec) {
    return v.toLocaleString("id-ID", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  /* ---------- entrance builder ---------- */
  function addAnim(tl, el, at) {
    const type = el.dataset.a;
    const d = el.dataset.d !== undefined ? parseFloat(el.dataset.d) : at;
    switch (type) {
      case "up": tl.from(el, { y: 44, autoAlpha: 0, duration: .8, ease: "power3.out" }, d); break;
      case "down": tl.from(el, { y: -30, autoAlpha: 0, duration: .7, ease: "power3.out" }, d); break;
      case "fade": tl.from(el, { autoAlpha: 0, duration: .9, ease: "power1.out" }, d); break;
      case "left": tl.from(el, { x: -70, autoAlpha: 0, duration: .8, ease: "power3.out" }, d); break;
      case "right": tl.from(el, { x: 70, autoAlpha: 0, duration: .8, ease: "power3.out" }, d); break;
      case "pop": tl.from(el, { scale: .55, autoAlpha: 0, duration: .7, ease: "back.out(1.8)" }, d); break;
      case "mask": tl.fromTo(el, { clipPath: "inset(0 100% 0 0 round 22px)" }, { clipPath: "inset(0 0% 0 0 round 22px)", duration: 1.1, ease: "power4.inOut" }, d); break;
      case "maskup": tl.fromTo(el, { clipPath: "inset(100% 0 0 0 round 22px)" }, { clipPath: "inset(0% 0 0 0 round 22px)", duration: 1.0, ease: "power4.inOut" }, d); break;
      case "zoom": tl.from(el, { scale: 1.25, autoAlpha: 0, duration: 1.4, ease: "power3.out" }, d); break;
      case "grow-x": tl.from(el, { scaleX: 0, transformOrigin: "left center", duration: 1, ease: "power3.inOut" }, d); break;
      case "grow-y": tl.from(el, { scaleY: 0, transformOrigin: "center bottom", duration: .9, ease: "power3.out" }, d); break;
      case "split": {
        const sp = new SplitText(el, { type: "lines,words", linesClass: "sl" });
        sp.lines.forEach(l => { l.style.overflow = "hidden"; l.style.paddingBottom = ".08em"; l.style.marginBottom = "-.08em"; });
        tl.from(sp.words, { yPercent: 115, duration: .85, ease: "power4.out", stagger: .035 }, d);
        break;
      }
      case "count": {
        const to = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || "0", 10);
        const pre = el.dataset.pre || "", suf = el.dataset.suf || "";
        const o = { v: 0 };
        tl.from(el, { autoAlpha: 0, duration: .3 }, d);
        tl.to(o, { v: to, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = pre + fmt(o.v, dec) + suf; } }, d);
        break;
      }
      case "draw": {
        const paths = el.tagName === "path" || el.tagName === "line" || el.tagName === "polyline" ? [el] : el.querySelectorAll("path,line,polyline,circle,rect");
        paths.forEach(p => {
          const len = p.getTotalLength ? p.getTotalLength() : 1000;
          tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", onComplete: () => { p.style.strokeDasharray = ""; } }, d);
        });
        break;
      }
      case "stagger": {
        const kids = Array.from(el.children);
        tl.from(kids, { y: 34, autoAlpha: 0, duration: .7, ease: "power3.out", stagger: parseFloat(el.dataset.st || ".09") }, d);
        break;
      }
      default: tl.from(el, { autoAlpha: 0, duration: .6 }, d);
    }
  }

  function buildEnter(slide) {
    const tl = gsap.timeline({ paused: true });
    let t = .15;
    slide.querySelectorAll("[data-a]").forEach(el => {
      if (el.closest("[data-step]")) return;
      addAnim(tl, el, t);
      t += .07;
    });
    return tl;
  }

  function stepsOf(slide) {
    const set = new Set();
    slide.querySelectorAll("[data-step]").forEach(e => set.add(parseInt(e.dataset.step, 10)));
    return Array.from(set).sort((a, b) => a - b);
  }

  function showStep(slide, n, animate) {
    slide.querySelectorAll("[data-step]").forEach(e => {
      const k = parseInt(e.dataset.step, 10);
      if (k <= n) {
        if (animate && k === n) {
          gsap.fromTo(e, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .6, ease: "power3.out" });
          e.querySelectorAll("[data-a]").forEach((c, i) => { const tl = gsap.timeline(); addAnim(tl, c, .1 + i * .06); });
        } else gsap.set(e, { autoAlpha: 1, y: 0 });
      } else gsap.set(e, { autoAlpha: 0 });
    });
    slide.dataset.stepNow = n;
    window.Scenes && Scenes.step(slide, n);
    slide.dispatchEvent(new CustomEvent("step", { detail: { n, animate } }));
  }

  /* ---------- idle loops ---------- */
  function startIdle(slide) {
    const tws = [];
    // dots travelling along svg paths: <circle class="runner" data-path="#id" data-dur="3">
    slide.querySelectorAll(".runner").forEach((c, i) => {
      const path = slide.querySelector(c.dataset.path);
      if (!path) return;
      const dur = parseFloat(c.dataset.dur || "3");
      tws.push(gsap.to(c, { duration: dur, repeat: -1, ease: "none", delay: parseFloat(c.dataset.delay || (i * .4)),
        motionPath: { path, align: path, alignOrigin: [.5, .5] } }));
    });
    // gentle breathing on [data-breathe]
    slide.querySelectorAll("[data-breathe]").forEach((e, i) => {
      tws.push(gsap.to(e, { scale: 1.035, duration: 2.4 + (i % 3) * .4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * .3 }));
    });
    // bars that wobble slightly [data-wobble]
    slide.querySelectorAll("[data-wobble]").forEach((e, i) => {
      tws.push(gsap.to(e, { scaleY: .94, transformOrigin: "center bottom", duration: 1.8 + i * .2, yoyo: true, repeat: -1, ease: "sine.inOut" }));
    });
    // ticker numbers [data-tick] alternate between their value and +/- jitter feel
    slide.querySelectorAll("[data-glow]").forEach((e, i) => {
      tws.push(gsap.to(e, { opacity: .45, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * .25 }));
    });
    idleTw.set(slide, tws);
  }
  function stopIdle(slide) {
    (idleTw.get(slide) || []).forEach(t => t.kill());
    idleTw.delete(slide);
  }

  /* ---------- progress rail: little tank truck travelling A -> D ---------- */
  const rail = document.getElementById("rail");
  const railIdx = slides.map((s, i) => s.dataset.rail === "off" ? -1 : i).filter(i => i >= 0);
  const railFirst = railIdx[0], railLast = railIdx[railIdx.length - 1];
  const railPos = i => (i - railFirst) / Math.max(1, railLast - railFirst);
  if (rail) {
    const track = rail.querySelector(".track");
    ["A", "B", "C", "D"].forEach(sec => {
      const i = slides.findIndex(s => s.dataset.sec === sec && s.dataset.rail !== "off");
      if (i < 0) return;
      const st = document.createElement("div");
      st.className = "stn"; st.dataset.sec = sec; st.style.left = (railPos(i) * 100) + "%";
      st.innerHTML = `<i></i><span>${sec} · ${slides[i].dataset.secName || ""}</span>`;
      track.appendChild(st);
    });
  }
  function updateRail(i) {
    if (!rail) return;
    const s = slides[i];
    const off = s.dataset.rail === "off";
    rail.classList.toggle("off", off);
    rail.classList.toggle("on-dark", s.classList.contains("dark"));
    if (off) return;
    const p = railPos(i);
    gsap.to(rail.querySelector(".fill"), { scaleX: p, duration: 1.1, ease: "power2.inOut" });
    gsap.to(rail.querySelector(".mt"), { left: (p * 100) + "%", duration: 1.1, ease: "power2.inOut" });
    rail.querySelectorAll(".stn").forEach(st => st.classList.toggle("past", parseFloat(st.style.left) <= p * 100 + .01));
    rail.querySelectorAll(".mt .wh").forEach(w => gsap.fromTo(w, { rotation: 0 }, { rotation: 540, duration: 1.1, ease: "power2.inOut", transformOrigin: "50% 50%" }));
  }

  /* ---------- navigation ---------- */
  function go(i, dir = 1) {
    if (i < 0 || i >= slides.length || i === cur) return;
    const prev = slides[cur], next = slides[i];
    if (prev) {
      prev.classList.remove("active");
      prev.classList.add("leaving");
      gsap.to(prev, { autoAlpha: 0, duration: .45, ease: "power2.in", onComplete: () => { prev.classList.remove("leaving"); gsap.set(prev, { clearProps: "opacity,visibility" }); } });
      stopIdle(prev);
      window.Scenes && Scenes.unmount(prev);
      const otl = enterTl.get(prev); if (otl) otl.pause(0);
      prev.dispatchEvent(new CustomEvent("leave"));
    }
    cur = i;
    next.classList.add("active");
    gsap.fromTo(next, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, ease: "power2.out", clearProps: "opacity,visibility" });
    let tl = enterTl.get(next);
    if (!tl) { tl = buildEnter(next); enterTl.set(next, tl); }
    tl.restart();
    const st = stepsOf(next);
    step = dir < 0 && st.length ? st[st.length - 1] : 0;
    window.Scenes && Scenes.mount(next);
    next.dispatchEvent(new CustomEvent("enter"));
    showStep(next, step, false);
    startIdle(next);
    updateRail(i);
    if (bar) bar.style.width = ((i + 1) / slides.length * 100) + "%";
    count.textContent = (i + 1) + " / " + slides.length;
    history.replaceState(null, "", "#" + (i + 1));
  }

  function next() {
    const s = slides[cur], st = stepsOf(s);
    const nx = st.find(k => k > step);
    if (nx !== undefined) { step = nx; showStep(s, step, true); return; }
    go(cur + 1, 1);
  }
  function prev() {
    const s = slides[cur], st = stepsOf(s);
    const pv = st.filter(k => k < step && k > 0).pop();
    if (step > 0) { step = pv || 0; showStep(s, step, false); return; }
    go(cur - 1, -1);
  }

  if (PRINT) {
    // every slide in its final state; 3D frozen to images by scenes bundle
    slides.forEach(s => s.querySelectorAll("[data-step]").forEach(e => { e.style.opacity = 1; e.style.visibility = "visible"; }));
    window.addEventListener("load", () => { window.Scenes ? Scenes.snapshotAll(slides).then(() => { window.__ready = true; document.title += " ✓"; }) : (window.__ready = true); });
    return;
  }

  addEventListener("keydown", e => {
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") go(0, -1);
    else if (e.key === "End") go(slides.length - 1, 1);
    else if (e.key === "f" || e.key === "F") { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  });
  addEventListener("click", e => { if (e.button !== 0 || e.target.closest("[data-click]")) return; (e.clientX < innerWidth * .25 ? prev : next)(); });
  let tx = null;
  addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) (dx < 0 ? next : prev)(); tx = null; });

  const start = Math.max(0, Math.min(slides.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
  document.fonts.ready.then(() => go(start, 1));
})();
