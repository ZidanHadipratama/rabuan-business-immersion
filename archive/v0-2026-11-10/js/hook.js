/* Hook slide: 10 s thinking timer, clickable answer cards, answer reveal on step 1. */
(function () {
  const s = document.getElementById("hook");
  if (!s) return;
  const q = s.querySelector(".q"), ans = s.querySelector(".ans");
  const ring = s.querySelector(".timer .ring"), num = s.querySelector(".timer .n"), cap = s.querySelector(".timer .cap");
  const opts = Array.from(s.querySelectorAll(".opt"));
  const LEN = 326.7;
  let timer = null, pulse = null;

  opts.forEach(o => o.addEventListener("click", () => {
    if (s.dataset.stepNow === "1") return;
    opts.forEach(x => x.classList.toggle("pick", x === o && !o.classList.contains("pick")));
  }));

  function startTimer() {
    timer && timer.kill(); pulse && pulse.kill();
    const o = { v: 10 };
    gsap.set(ring, { strokeDashoffset: 0, stroke: "#7FD3FF" });
    num.textContent = "10"; cap.textContent = "Waktu berpikir";
    timer = gsap.timeline({ delay: 1.6 })
      .to(ring, { strokeDashoffset: LEN, duration: 10, ease: "none" }, 0)
      .to(o, { v: 0, duration: 10, ease: "none", onUpdate: () => { const n = Math.ceil(o.v); if (num.textContent !== String(n)) { num.textContent = n; gsap.fromTo(num, { scale: 1.25 }, { scale: 1, duration: .4, ease: "power2.out" }); } } }, 0)
      .call(() => {
        num.textContent = "?"; cap.textContent = "Jawabannya?";
        gsap.set(ring, { strokeDashoffset: 0, stroke: "#E9A23B" });
        pulse = gsap.to(num, { scale: 1.18, duration: .7, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });
  }

  function question() {
    gsap.killTweensOf([q, ans]);
    gsap.set(q, { autoAlpha: 1, y: 0 });
    gsap.set(ans, { autoAlpha: 0, visibility: "hidden" });
    opts.forEach(o => o.classList.remove("correct", "wrong"));
  }

  function answer(animate) {
    timer && timer.kill(); pulse && pulse.kill();
    gsap.set(num, { scale: 1 });
    num.textContent = "✓"; cap.textContent = "Terjawab";
    gsap.set(ring, { strokeDashoffset: 0, stroke: "#AAC237" });
    const d = animate ? 1.0 : 0;
    gsap.to(q, { autoAlpha: 0, y: -40, duration: animate ? .5 : 0, ease: "power2.in" });
    gsap.fromTo(ans, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: animate ? .8 : 0, delay: d, ease: "power3.out" });
    if (animate) gsap.from(ans.querySelector("h3"), { scale: .9, transformOrigin: "left center", duration: 1, delay: d, ease: "back.out(2)" });
    const sumEl = ans.querySelector("[data-sum]"), parts = ans.querySelectorAll(".sum > span");
    if (animate) {
      gsap.from(parts, { autoAlpha: 0, y: 14, duration: .45, stagger: .12, delay: 4.2, ease: "power2.out" });
      const o = { v: 0 }; sumEl.textContent = "0";
      gsap.to(o, { v: 32, duration: 1.2, delay: 4.9, ease: "power2.out", onUpdate: () => sumEl.textContent = Math.round(o.v) });
    } else sumEl.textContent = "32";
    setTimeout(() => {
      opts.forEach(o => { const ok = o.dataset.opt === "B"; o.classList.toggle("correct", ok); o.classList.toggle("wrong", !ok); o.classList.remove("pick"); });
    }, animate ? 900 : 0);
  }

  s.addEventListener("enter", () => { opts.forEach(o => o.classList.remove("pick")); question(); startTimer(); });
  s.addEventListener("leave", () => { timer && timer.kill(); pulse && pulse.kill(); });
  s.addEventListener("step", e => { e.detail.n >= 1 ? answer(e.detail.animate) : (s.classList.contains("active") && question()); });

  if (document.documentElement.classList.contains("print")) answer(false);
})();
