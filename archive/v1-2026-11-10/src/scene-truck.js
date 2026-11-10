// Hook answer: photo-matched view → orbit to the side → cut the shell open → fill each compartment.
import * as THREE from "three";
import { host, keyLights, mat, PRINT } from "./common.js";
import { buildTruck, TANK } from "./truck.js";

const gsap = window.gsap;
/* Fuel dye colours (GridOto 7 Jul 2021, Tri Yuswidjadjanto, ITB): Pertalite hijau, Pertamax biru, Pertamax Turbo merah. */
const DYE = [0x2FA84F, 0x1E6FD9, 0xD9232F];

function ground(scene, color = 0x76797C) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(color, { roughness: 0.95, metalness: 0, envMapIntensity: 0.3 }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g);
  return g;
}

export function answerScene(el, slide) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xC9D3DB, 40, 140);
  keyLights(scene, { key: 2.6, sun: [-8, 18, -10] });
  ground(scene);
  const T = buildTruck();
  scene.add(T.truck);
  T.liquids.forEach((l, i) => { l.mat.color.setHex(DYE[i]); });

  const cut = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.5);
  T.shellMats.forEach(m => { m.clippingPlanes = [cut]; m.clipShadows = true; });
  T.liquids.forEach(l => { l.mat.clippingPlanes = [l.plane, cut]; });

  const camera = new THREE.PerspectiveCamera(26, 16 / 9, 0.1, 400);
  // pose A ≈ DSCF2614: elevated, behind and left of the truck; pose B: left side, eye level of the tank
  const A = { p: new THREE.Vector3(-36.86, 7.66, -11.15), t: new THREE.Vector3(-13.56, 4.81, -2.89) }; // fitted to DSCF2614 (scripts/fitcam.mjs)
  const B = { p: new THREE.Vector3(-0.6, 3.4, -23), t: new THREE.Vector3(-0.4, 3.35, 0) };
  const cam = { k: 0 };
  const tgt = new THREE.Vector3();
  const place = () => {
    camera.position.lerpVectors(A.p, B.p, cam.k);
    tgt.lerpVectors(A.t, B.t, cam.k);
    camera.lookAt(tgt);
  };
  place();

  const labels = Array.from(el.querySelectorAll(".lbl"));
  const v = new THREE.Vector3();
  const st = { fill: [0, 0, 0] };
  const levelOf = (f) => TANK.cy - TANK.b + f * TANK.b * 1.78;

  function update() {
    place();
    T.liquids.forEach((l, i) => { l.plane.constant = levelOf(st.fill[i]); l.mesh.visible = st.fill[i] > 0.001; });
    const w = el.clientWidth, h = el.clientHeight;
    labels.forEach((lb, i) => {
      v.set(TANK.x0 + (i + 0.5) * T.compLen, TANK.cy + TANK.b + 0.55, 0).project(camera);
      lb.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
    });
  }

  let tl = null;
  function reset() {
    tl && tl.kill();
    cam.k = 0; cut.constant = 1.5; st.fill = [0, 0, 0];
    gsap.set(labels, { autoAlpha: 0, y: 12 });
  }
  function play() {
    reset();
    tl = gsap.timeline();
    tl.to(cam, { k: 1, duration: 2.4, ease: "sig" }, 2.1);
    tl.to(cut, { constant: 0, duration: 1.3, ease: "sig" }, 4.3);
    T.liquids.forEach((l, i) => {
      // fluid material: 1.5× duration, small settle (motion-design material table)
      tl.to(st.fill, { [i]: 1, duration: 1.4, ease: "back.out(1.1)" }, 5.3 + i * 0.7);
      tl.to(labels[i], { autoAlpha: 1, y: 0, duration: 0.5, ease: "emph" }, 5.9 + i * 0.7);
    });
  }
  function final() { reset(); cam.k = 1; cut.constant = 0; st.fill = [1, 1, 1]; gsap.set(labels, { autoAlpha: 1, y: 0 }); }

  slide.addEventListener("enter", (e) => (e.detail && e.detail.animate === false) || window.M.reduce ? final() : play());
  slide.addEventListener("print", final);
  host(el, slide, { scene, camera, update });
  if (PRINT) final();
  return { final };
}

/* Closing: the same truck seen from the left side, rolling along (wheels turn, road scrolls). */
export function driveScene(el, slide) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05416D, 26, 70);
  keyLights(scene, { key: 2.4, sun: [-6, 16, -12] });
  const road = ground(scene, 0x3A4350);
  const dashes = new THREE.Group();
  for (let i = 0; i < 40; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.18), mat(0xEDEDED, { roughness: 0.8 })); d.rotation.x = -Math.PI / 2; d.position.set(-60 + i * 6, 0.01, 3.2); dashes.add(d); }
  scene.add(dashes);
  const T = buildTruck();
  scene.add(T.truck);
  const camera = new THREE.PerspectiveCamera(24, 16 / 9, 0.1, 400);
  camera.position.set(2.5, 4.2, -30); camera.lookAt(5.6, 4.6, 0);
  let speed = 0;
  slide.addEventListener("enter", () => { speed = 0; gsap.to({ s: 0 }, { s: 1, duration: 2, ease: "sig", onUpdate() { speed = this.targets()[0].s * 9; } }); });
  host(el, slide, {
    scene, camera,
    update(t, dt) {
      T.wheels.forEach(w => (w.rotation.z -= (speed * dt) / 0.52));
      dashes.position.x = -((t * speed) % 6);
      T.truck.position.y = Math.sin(t * 9) * 0.006 * (speed / 9);
    },
  });
  void road;
}

/* Small side-view render of the model for the journey map (rendered once to an image). */
export function truckSprite(renderer) {
  const scene = new THREE.Scene();
  keyLights(scene, { key: 2.2, sun: [-4, 14, -10] });
  const T = buildTruck(); scene.add(T.truck);
  const camera = new THREE.OrthographicCamera(-5.6, 5.8, 3.6, -0.2, 0.1, 100);
  camera.position.set(0.1, 1.7, -30); camera.lookAt(0.1, 1.7, 0);
  const size = renderer.getSize(new THREE.Vector2());
  renderer.setSize(460, 160, false);
  renderer.setClearColor(0x000000, 0);
  return new Promise(res => setTimeout(() => {
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL("image/png");
    renderer.setSize(size.x, size.y, false);
    res(url);
  }, 120));
}
