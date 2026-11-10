// ITJ Plumpang as a three-stage schematic (Kel 13, slide 13.2): Receiving → Storage & QC → Distribution.
// Tank look from DSCF2614/2611 (white shell, red top band); filling shed from DSCF2387/2401 (white roof, red fascia).
import * as THREE from "three";
import { RoundedBoxGeometry } from "../lib/three/addons/geometries/RoundedBoxGeometry.js";
import { host, keyLights, mat, canvasTex, PAINT } from "./common.js";
import { buildTruck } from "./truck.js";

const gsap = window.gsap;

function tank(r, h) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), mat(0xF1F2EF, { roughness: 0.45 }));
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.004, r * 1.004, h * 0.08, 48, 1, true), mat(PAINT.tankRed, { roughness: 0.45 }));
  band.position.y = h * 0.93; g.add(band);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.01, r * 0.18, 48), mat(0xE4E6E3, { roughness: 0.5 }));
  roof.position.y = h + r * 0.09; roof.castShadow = true; g.add(roof);
  const lvl = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 0.08, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0x2FB5FF, transparent: true, opacity: 0 }));
  lvl.position.y = 0.2; g.add(lvl);
  g.userData = { lvl, h };
  return g;
}

export function terminalScene(el, slide) {
  const scene = new THREE.Scene();
  keyLights(scene, { key: 2.3, sun: [14, 22, 10], shadow: 30 });
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat(0xEEF2F6, { roughness: 1, envMapIntensity: 0.2 }));
  gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), mat(0xC4CDD6, { roughness: 1 }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = 0.01; pad.receiveShadow = true; scene.add(pad);

  /* receiving: pipeline from the left edge (Balongan 212 km) and a jetty line */
  const pipeM = mat(0xE2B53A, { roughness: 0.5, metalness: 0.3 });
  const pipePath = new THREE.CatmullRomCurve3([new THREE.Vector3(-40, 0.6, -4), new THREE.Vector3(-22, 0.6, -4), new THREE.Vector3(-18, 0.6, -2), new THREE.Vector3(-12, 0.6, -2)]);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipePath, 60, 0.32, 12), pipeM); pipe.castShadow = true; scene.add(pipe);
  const jettyPath = new THREE.CatmullRomCurve3([new THREE.Vector3(-30, 0.6, 14), new THREE.Vector3(-20, 0.6, 9), new THREE.Vector3(-14, 0.6, 3), new THREE.Vector3(-12, 0.6, 1)]);
  const jetty = new THREE.Mesh(new THREE.TubeGeometry(jettyPath, 60, 0.26, 12), pipeM); scene.add(jetty);
  const flowM = new THREE.MeshBasicMaterial({ color: 0x7FD3FF });
  const flow = [];
  [pipePath, jettyPath].forEach(path => { for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), flowM); d.userData = { path, o: i / 14 }; d.visible = false; scene.add(d); flow.push(d); } });

  /* storage: 3 × 3 tank field */
  const tanks = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const t = tank(2.6 - (j === 1 ? 0.3 : 0), 5.2 + (i % 2) * 0.8);
    t.position.set(-6 + i * 6.4, 0, -6 + j * 6.2); scene.add(t); tanks.push(t);
  }

  /* distribution: filling shed + trucks */
  const shed = new THREE.Group();
  const roof = new THREE.Mesh(new RoundedBoxGeometry(9, 0.5, 12, 2, 0.1), mat(0xF4F4F2, { roughness: 0.5 })); roof.position.y = 6.2; roof.castShadow = true; shed.add(roof);
  const fascia = new THREE.Mesh(new THREE.BoxGeometry(9.1, 0.6, 12.1), mat(PAINT.tankRed, { roughness: 0.45 })); fascia.position.y = 5.75; shed.add(fascia);
  for (const x of [-4, 4]) for (const z of [-5.5, 0, 5.5]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.6, 0.4), mat(0x9AA4AE, { metalness: 0.5 })); c.position.set(x, 2.8, z); c.castShadow = true; shed.add(c); }
  shed.position.set(19, 0, 0); scene.add(shed);
  const trucks = [];
  for (let k = 0; k < 3; k++) {
    const T = buildTruck(); T.truck.scale.setScalar(0.62); T.truck.rotation.y = Math.PI / 2;
    T.truck.position.set(16 + k * 3.1, 0, -1); scene.add(T.truck); trucks.push(T.truck);
  }

  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.5, 400);
  const orbit = { a: -0.5, r: 56, y: 32 };
  const look = new THREE.Vector3(5, 1, 3);
  const st = { flow: 0, store: 0, go: 0 };

  function update(t) {
    const a = orbit.a + Math.sin(t * 0.08) * 0.05;
    camera.position.set(Math.sin(a) * orbit.r + 3, orbit.y, Math.cos(a) * orbit.r);
    camera.lookAt(look);
    flow.forEach(d => { d.visible = st.flow > 0.01; const p = d.userData.path.getPointAt((d.userData.o + t * 0.12) % 1); d.position.copy(p); d.scale.setScalar(st.flow); });
    tanks.forEach((tk, i) => { const { lvl, h } = tk.userData; lvl.material.opacity = st.store * 0.9; lvl.position.y = 0.2 + (h - 0.6) * st.store * (0.55 + 0.35 * Math.sin(i * 1.7) ** 2); });
    trucks.forEach((tr, k) => { const d = Math.max(0, st.go * 1.2 - k * 0.2); tr.position.z = -1 + d * 11; });
  }

  slide.addEventListener("enter", () => { st.flow = st.store = st.go = 0; });
  slide.addEventListener("step", (e) => {
    const n = e.detail.n, an = e.detail.animate;
    const to = { flow: n >= 1 ? 1 : 0, store: n >= 2 ? 1 : 0, go: n >= 3 ? 1 : 0 };
    gsap.to(st, { ...to, duration: an ? 1.6 : 0, ease: "sig" });
  });
  slide.addEventListener("print", () => Object.assign(st, { flow: 1, store: 1, go: 0.3 }));
  host(el, slide, { scene, camera, update });
}
