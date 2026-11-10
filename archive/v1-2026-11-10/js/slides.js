/* Per-slide behaviour that the generic data-a choreography does not cover. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const slides = $$(".slide");
  slides.forEach((s, i) => { const pg = $(".pg", s); if (pg) pg.textContent = String(i + 1); });

  /* ---------- hook: slow push (#028), countdown (#164), clickable options ---------- */
  const hook = $("#hook");
  if (hook) {
    const zoom = $("[data-zoom]", hook), timer = $(".timer", hook), opts = $$(".opt", hook);
    let zt = null, ct = null;
    opts.forEach(o => o.addEventListener("click", () => {
      opts.forEach(x => x.classList.toggle("pick", x === o && !o.classList.contains("pick")));
      gsap.fromTo(o, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }));
    hook.addEventListener("enter", (e) => {
      zt && zt.kill(); ct && ct.kill();
      opts.forEach(o => o.classList.remove("pick"));
      timer.classList.remove("done");
      gsap.set(zoom, { scale: 1 });
      if (e.detail && e.detail.animate === false) return;
      zt = M.zoom(zoom, 1.16, 13);
      ct = M.countdown(timer, 10, () => timer.classList.add("done"));
    });
    hook.addEventListener("leave", () => { ct && ct.kill(); });
  }

  /* ---------- answer slide: 3D dissolves over the photo (#044), then the config strip on step 1 ---------- */
  const ans = $(".slide.answer");
  if (ans) {
    const three = $(".three", ans), photo = $(".bleed", ans);
    ans.addEventListener("enter", (e) => {
      const still = (e.detail && e.detail.animate === false) || M.reduce;
      gsap.set(three, { autoAlpha: still ? 1 : 0, yPercent: 0, scale: 1 });
      gsap.set(photo, { autoAlpha: 1 });
      if (!still) { const tl = gsap.timeline(); M.dissolve(three, tl, 0.5, 1.5); tl.set(photo, { autoAlpha: 0 }); }
      else gsap.set(photo, { autoAlpha: 0 });
    });
    ans.addEventListener("step", (e) => {
      const up = e.detail.n >= 1;
      gsap.to(three, { yPercent: up ? -21 : 0, duration: e.detail.animate ? 0.9 : 0, ease: "sig" });
      gsap.to($$(".ans-text, .quote, .model-note", ans), { autoAlpha: up ? 0 : 1, duration: e.detail.animate ? 0.4 : 0, ease: "exit" });
      const segs = $$(".configs .segs i", ans);
      if (up && e.detail.animate) M.bars(segs, gsap.timeline(), 0.3); else gsap.set(segs, { scaleX: 1 });
    });
  }

  /* ---------- truck sprite riders (#126) ---------- */
  function riders() {
    if (!window.truckSprite) return;
    window.truckSprite().then(url => {
      $$(".rider-slot").forEach(slot => {
        const img = new Image(); img.src = url; img.alt = ""; img.id = slot.dataset.rider;
        img.className = "rider " + (slot.dataset.cls || ""); slot.replaceWith(img);
      });
      const j = $(".slide.journey");
      if (j) j.addEventListener("enter", (e) => {
        const r = $("#rider"); gsap.killTweensOf(r);
        gsap.set(r, { autoAlpha: 1 });
        if (e.detail && e.detail.animate === false) { gsap.set(r, { motionPath: { path: "#road", align: "#road", alignOrigin: [0.5, 0.92], autoRotate: true, start: 1, end: 1 } }); return; }
        gsap.set(r, { motionPath: { path: "#road", align: "#road", alignOrigin: [0.5, 0.92], autoRotate: true, start: 0, end: 0 } });
        M.ride(r, "#road", 9, 1.6);
      });
      const a4 = $(".slide.a4");
      if (a4) a4.addEventListener("enter", (e) => {
        const r = $("#rider2"); gsap.killTweensOf(r);
        if (e.detail && e.detail.animate === false) { gsap.set(r, { motionPath: { path: "#vcPath", align: "#vcPath", alignOrigin: [0.5, 0.95], start: 1, end: 1 } }); return; }
        gsap.set(r, { motionPath: { path: "#vcPath", align: "#vcPath", alignOrigin: [0.5, 0.95], start: 0, end: 0 } });
        gsap.to(r, { duration: 7, delay: 0.6, ease: "sine.inOut", motionPath: { path: "#vcPath", align: "#vcPath", alignOrigin: [0.5, 0.95] } });
      });
      const d4 = $(".slide.d4 .rits");
      if (d4) { d4.innerHTML = Array.from({ length: 23 }, () => `<img src="${url}" alt="">`).join(""); }
      // the slide may already be showing when the sprite arrives
      const now = slides[window.Deck ? window.Deck.index : -1];
      if (now && (now.matches(".journey, .a4, .d4"))) now.dispatchEvent(new CustomEvent("enter", { detail: { animate: true } }));
    });
  }
  document.fonts.ready.then(() => setTimeout(riders, 50));

  /* ---------- C3 impact level bars (#002) ---------- */
  const c3 = $(".slide.c3");
  if (c3) c3.addEventListener("enter", (e) => { const tl = gsap.timeline(); M.bars($$(".lv i", c3), tl, 0.5); if (e.detail && e.detail.animate === false) tl.progress(1); });

  /* ---------- D3 gantt (#002) and milestones ---------- */
  const d3 = $(".slide.d3");
  if (d3) d3.addEventListener("enter", (e) => {
    const tl = gsap.timeline();
    M.bars($$(".bar", d3), tl, 0.6);
    tl.fromTo($$(".g-ms i", d3), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2.5)", stagger: 0.2 }, 1.7);
    if (e.detail && e.detail.animate === false) tl.progress(1);
  });

  /* ---------- D4: 23 trips appear one by one ---------- */
  const d4s = $(".slide.d4");
  if (d4s) d4s.addEventListener("enter", (e) => {
    const imgs = $$(".rits img", d4s);
    if (!imgs.length) return;
    const tl = gsap.timeline();
    tl.fromTo(imgs, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: "emph", stagger: 0.06 }, 3.2);
    if (e.detail && e.detail.animate === false) tl.progress(1);
  });

  /* ---------- C2: arrows between columns draw per row (#004) ---------- */
  const c2 = $(".slide.c2");
  if (c2) c2.addEventListener("enter", (e) => {
    const svg = $(".rca-arrows", c2), box = $(".rca", c2).getBoundingClientRect();
    const k = box.width / $(".rca", c2).offsetWidth || 1;
    svg.setAttribute("viewBox", `0 0 ${$(".rca", c2).offsetWidth} ${$(".rca", c2).offsetHeight}`);
    svg.innerHTML = "";
    const tl = gsap.timeline();
    $$(".rca-row", c2).forEach((row, ri) => {
      const ps = $$("p", row).slice(0, 3);
      for (let i = 0; i < 2; i++) {
        const a = ps[i].getBoundingClientRect(), b = ps[i + 1].getBoundingClientRect();
        const x1 = (a.right - box.left) / k + 6, x2 = (b.left - box.left) / k - 10, y = (a.top - box.top) / k + 16;
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", `M${x1} ${y} H${x2} M${x2 - 8} ${y - 6} L${x2} ${y} L${x2 - 8} ${y + 6}`);
        p.setAttribute("stroke", i ? "#EA1E30" : "#9AA9BA"); p.setAttribute("stroke-width", "2.5"); p.setAttribute("stroke-linecap", "round");
        svg.appendChild(p);
        M.draw(p, tl, 0.5 + ri * 0.3 + i * 0.25, 0.5);
      }
    });
    if (e.detail && e.detail.animate === false) tl.progress(1);
  });
})();
