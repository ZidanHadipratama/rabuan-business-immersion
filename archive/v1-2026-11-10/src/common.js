// Shared Three.js renderer and helpers. One WebGLRenderer; its canvas moves into the
// container of whichever slide is active, and only that slide's scene renders.
import * as THREE from "three";
import { RoomEnvironment } from "../lib/three/addons/environments/RoomEnvironment.js";

export const PRINT = /[?&]print\b/.test(location.search);
export const SHOT = /[?&]shot\b/.test(location.search);

export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: PRINT || SHOT });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const pmrem = new THREE.PMREMGenerator(renderer);
export const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.9, ...o });

/* Paint colours sampled from the reference photos (V034 Commons, DSCF2614/2387 BI). */
export const PAINT = {
  tankRed: 0xD3202C, cabRed: 0xA8192A, white: 0xF2F3F0, grey: 0x8C949C, chassis: 0x1B1E22,
  steel: 0xA9B2BA, tire: 0x141619, glass: 0x1A2733, rim: 0xD9DDE0,
};

export function keyLights(scene, { key = 2.4, fill = 0.9, hemi = 0.7, shadow = 14, sun = [10, 16, -8] } = {}) {
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xe6eef6, 0x3a3f45, hemi));
  const k = new THREE.DirectionalLight(0xfff4e6, key);
  k.position.set(...sun); k.castShadow = true;
  k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0004; k.shadow.normalBias = 0.03;
  const s = k.shadow.camera; s.left = -shadow; s.right = shadow; s.top = shadow; s.bottom = -shadow; s.near = 1; s.far = 70;
  scene.add(k);
  const f = new THREE.DirectionalLight(0xbcd6f0, fill); f.position.set(-12, 7, 10); scene.add(f);
  return k;
}

export function canvasTex(w, h, paint) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); paint(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.userData.canvas = c; t.userData.g = g;
  return t;
}

export function svgImage(svgText) {
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
  return img;
}

/* Scene host: registers a slide scene with the shared render loop. */
const hosts = new Set();
let active = null, last = performance.now();
export function host(el, slide, { scene, camera, update }) {
  const h = { el, slide, scene, camera, update, t: 0, visible: false };
  hosts.add(h);
  const fitCam = () => { camera.aspect = el.clientWidth / el.clientHeight || 16 / 9; camera.updateProjectionMatrix(); };
  h.attach = () => {
    el.appendChild(renderer.domElement);
    renderer.setSize(el.clientWidth, el.clientHeight, false);
    renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
    fitCam(); active = h; h.visible = true;
  };
  slide.addEventListener("enter", () => h.attach());
  slide.addEventListener("leave", () => { if (active === h) h.visible = false; });
  slide.addEventListener("print", () => { h.attach(); update && update(10, 0); renderer.render(scene, camera); const img = new Image(); img.src = renderer.domElement.toDataURL(); img.className = "print-shot"; el.appendChild(img); });
  return h;
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (active && active.visible) {
    active.t += dt;
    active.update && active.update(active.t, dt);
    renderer.render(active.scene, active.camera);
  }
  requestAnimationFrame(loop);
}
if (!PRINT) requestAnimationFrame(loop);
