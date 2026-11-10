// Three.js scenes for the Rabuan deck. Bundled by esbuild into js/scenes.bundle.js (IIFE, works on file://).
// One shared WebGLRenderer; its canvas moves into the active slide's .three container.
import * as THREE from "three";
import { RoundedBoxGeometry } from "../lib/three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "../lib/three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "../lib/three/addons/loaders/SVGLoader.js";

const PRINT = /[?&]print\b/.test(location.search);
const gsap = window.gsap;

/* ------------------------------------------------------------------ renderer */
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: PRINT });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.setClearColor(0x000000, 0);
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; });

/* ------------------------------------------------------------------ helpers */
const C = {
  red: 0xD7262E, redDeep: 0xB51A22, white: 0xF4F4F1, blue: 0x086DB5, green: 0xAAC237,
  steel: 0x9AA4AE, dark: 0x1A1F26, tire: 0x15181C, glass: 0x18242F,
};
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .1, envMapIntensity: .8, ...o });

function softDot(size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.4, "rgba(255,255,255,.45)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function stageFloor(radius, color, opacity = 1) {
  // radial-faded floor disc that melts into the slide background
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(.55, "rgba(255,255,255,.6)"); grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 64),
    new THREE.MeshStandardMaterial({ color, roughness: .95, metalness: 0, alphaMap: tex, transparent: true, opacity, depthWrite: false, envMapIntensity: .12 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}

function shadowCatcher(size, opacity = .35) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity }));
  m.rotation.x = -Math.PI / 2; m.position.y = .002; m.receiveShadow = true; return m;
}

function keyLights(scene, { key = 2.6, rim = 1.4, hemi = .55, shadow = 16 } = {}) {
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xdfe9f5, 0x1b2430, hemi));
  const k = new THREE.DirectionalLight(0xfff3e2, key);
  k.position.set(8, 14, 10); k.castShadow = true;
  k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -.0004; k.shadow.normalBias = .02;
  const s = k.shadow.camera; s.left = -shadow; s.right = shadow; s.top = shadow; s.bottom = -shadow; s.near = 1; s.far = 60;
  scene.add(k);
  const r = new THREE.DirectionalLight(0x8fc7ff, rim); r.position.set(-10, 6, -12); scene.add(r);
  return k;
}

/* ------------------------------------------------------------------ tank truck */
const TANK = { len: 7.4, ry: 1.0, rz: 1.18, cy: 2.5, x0: -4.55 }; // tank spans x0 .. x0+len
const COMP = 4; // 4 x 8 KL = 32 KL (as painted on the ITJ trucks: "32.000", "8.000")

function liveryTexture() {
  // cylinder UV: u around (0 = bottom, .25 = -z side, .5 = top, .75 = +z side), v along length (0 rear -> 1 front)
  const W = 1024, H = 2048;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  const band = (u0, u1, col) => { g.fillStyle = col; g.fillRect(u0 * W, 0, (u1 - u0) * W, H); };
  band(0, 1, "#F3F2EE");
  band(.30, .70, "#D7262E");            // red upper half
  band(.12, .16, "#D7262E");            // thin red skirt stripes both sides
  band(.84, .88, "#D7262E");
  band(.70, .705, "#9D1219"); band(.295, .30, "#9D1219");
  const side = (uc, flip) => {
    g.save();
    g.translate(uc * W, H / 2);
    g.rotate(flip ? Math.PI / 2 : -Math.PI / 2);
    g.fillStyle = "#1C2733";
    g.font = "800 92px PJS, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("PERTAMINA", -120, -6);
    g.fillStyle = "#D7262E"; g.font = "700 50px PJS, Arial, sans-serif";
    g.fillText("PATRA NIAGA", -120, 66);
    // logo marks
    const lx = 300;
    g.fillStyle = "#EA1E30"; g.fillRect(lx, -60, 60, 26);
    g.fillStyle = "#AAC237"; g.fillRect(lx + 6, -24, 60, 26);
    g.fillStyle = "#086DB5"; g.fillRect(lx - 14, -24, 18, 70);
    g.restore();
  };
  side(.78, false);
  side(.22, true);
  // compartment labels on the red top: "8.000"
  g.fillStyle = "#FFFFFF"; g.font = "700 46px JBM, monospace"; g.textAlign = "center";
  for (let i = 0; i < COMP; i++) {
    const v = (i + .5) / COMP;
    g.save(); g.translate(.62 * W, (1 - v) * H); g.rotate(-Math.PI / 2); g.fillText("8.000", 0, 0); g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function ellipCyl(len, ry, rz, seg = 64, open = false) {
  const g = new THREE.CylinderGeometry(1, 1, len, seg, 1, open, Math.PI / 2, Math.PI * 2);
  g.rotateZ(-Math.PI / 2);
  g.scale(1, ry, rz);
  return g;
}
function ellipDisc(ry, rz, seg = 64) {
  const g = new THREE.CircleGeometry(1, seg);
  g.rotateY(Math.PI / 2); g.scale(1, ry, rz); return g;
}

function buildTruck() {
  const truck = new THREE.Group();
  const body = new THREE.Group(); truck.add(body); // everything that bounces
  const cast = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

  // chassis + rear frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(10.2, .32, 1.5), mat(C.dark, { roughness: .7 }));
  chassis.position.set(-.1, 1.02, 0); body.add(chassis);

  // cab (cab-over)
  const cab = new THREE.Group(); cab.position.set(4.15, 0, 0); body.add(cab);
  const cabBox = new THREE.Mesh(new RoundedBoxGeometry(1.95, 2.25, 2.42, 6, .2), mat(C.red, { roughness: .35, metalness: .2 }));
  cabBox.position.set(0, 2.32, 0); cab.add(cabBox);
  const cabLow = new THREE.Mesh(new RoundedBoxGeometry(1.98, .62, 2.46, 4, .12), mat(C.white, { roughness: .4 }));
  cabLow.position.set(.01, 1.5, 0); cab.add(cabLow);
  const glassM = mat(C.glass, { roughness: .08, metalness: .6, envMapIntensity: 1.4 });
  const wind = new THREE.Mesh(new THREE.BoxGeometry(.05, .95, 2.1), glassM); wind.position.set(.99, 2.85, 0); cab.add(wind);
  [-1, 1].forEach(s => {
    const sw = new THREE.Mesh(new THREE.BoxGeometry(1.0, .8, .05), glassM); sw.position.set(.25, 2.85, s * 1.215); cab.add(sw);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(.12, .5, .08), mat(C.dark)); mirror.position.set(1.1, 2.75, s * 1.38); cab.add(mirror);
  });
  const grille = new THREE.Mesh(new THREE.BoxGeometry(.05, .5, 1.5), mat(0x2a2f36, { metalness: .5, roughness: .4 })); grille.position.set(1.0, 1.9, 0); cab.add(grille);
  const bumper = new THREE.Mesh(new RoundedBoxGeometry(.4, .38, 2.5, 3, .08), mat(0x2b3038, { metalness: .4, roughness: .5 })); bumper.position.set(1.0, 1.05, 0); cab.add(bumper);
  const headM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2cc, emissiveIntensity: 0 });
  [-1, 1].forEach(s => { const h = new THREE.Mesh(new THREE.BoxGeometry(.06, .2, .42), headM); h.position.set(1.21, 1.12, s * .88); cab.add(h); });
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.35, .12, 2.3), mat(C.white)); visor.position.set(.95, 3.42, 0); cab.add(visor);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .14, 16), new THREE.MeshStandardMaterial({ color: 0xffa300, emissive: 0xff8a00, emissiveIntensity: 1.2 }));
  beacon.position.set(0, 3.52, 0); cab.add(beacon);
  // exhaust stack
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.6, 12), mat(C.steel, { metalness: .8, roughness: .3 }));
  stack.position.set(-1.08, 3.0, -.95); cab.add(stack);

  // tank
  const tankG = new THREE.Group(); tankG.position.set(TANK.x0 + TANK.len / 2, TANK.cy, 0); body.add(tankG);
  const liv = liveryTexture();
  const shellMat = mat(0xffffff, { map: liv, roughness: .32, metalness: .15, envMapIntensity: 1.1, side: THREE.DoubleSide });
  const capMat = mat(C.red, { roughness: .32, metalness: .15, side: THREE.DoubleSide });
  const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99); // keeps x <= constant (world)
  shellMat.clippingPlanes = [clip]; capMat.clippingPlanes = [clip];
  const shell = new THREE.Mesh(ellipCyl(TANK.len, TANK.ry, TANK.rz, 96, true), shellMat);
  tankG.add(shell);
  const capGeo = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const capF = new THREE.Mesh(capGeo, capMat); capF.rotation.z = -Math.PI / 2; capF.scale.set(TANK.ry, .32, TANK.rz); capF.position.x = TANK.len / 2; tankG.add(capF);
  const capR = new THREE.Mesh(capGeo, capMat); capR.rotation.z = Math.PI / 2; capR.scale.set(TANK.ry, .32, TANK.rz); capR.position.x = -TANK.len / 2; tankG.add(capR);

  // x-ray ghost shell (always present, visible when opaque shell is clipped away)
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x7FD3FF, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ghost = new THREE.Mesh(ellipCyl(TANK.len, TANK.ry * 1.002, TANK.rz * 1.002, 96, true), ghostMat); tankG.add(ghost);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(ellipCyl(TANK.len, TANK.ry * 1.004, TANK.rz * 1.004, 28, true), 1),
    new THREE.LineBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0 }));
  tankG.add(wire);
  const ringGeo = new THREE.TorusGeometry(1, .012, 8, 96); ringGeo.rotateY(Math.PI / 2); ringGeo.scale(1, TANK.ry * 1.01, TANK.rz * 1.01);
  const ringMat = new THREE.LineBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0 });
  const rings = [];
  for (let i = 0; i <= 10; i++) { const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0 })); r.position.x = -TANK.len / 2 + TANK.len * i / 10; tankG.add(r); rings.push(r); }
  // scan ring (bright) that sweeps front->rear
  const scanMat = new THREE.MeshBasicMaterial({ color: 0xd8f3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const scan = new THREE.Mesh(new THREE.TorusGeometry(1, .045, 10, 96).rotateY(Math.PI / 2).scale(1, TANK.ry * 1.03, TANK.rz * 1.03), scanMat);
  tankG.add(scan);
  const scanGlow = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .5, 64, 1, true).rotateZ(-Math.PI / 2).scale(1, TANK.ry * 1.02, TANK.rz * 1.02),
    new THREE.MeshBasicMaterial({ color: 0x7FD3FF, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  tankG.add(scanGlow);

  // bulkheads + liquids
  const compLen = TANK.len / COMP;
  const bulkheads = [];
  const bhMat = new THREE.MeshStandardMaterial({ color: 0xcfe6f5, roughness: .3, metalness: .4, transparent: true, opacity: .9, side: THREE.DoubleSide, emissive: 0x2a5d80, emissiveIntensity: .3 });
  for (let i = 1; i < COMP; i++) {
    const b = new THREE.Mesh(ellipDisc(TANK.ry * .985, TANK.rz * .985), bhMat);
    b.userData.x = -TANK.len / 2 + compLen * i; b.position.set(b.userData.x, 0, 0); b.visible = false; tankG.add(b); bulkheads.push(b);
  }
  const PRODUCTS = [
    { name: "Pertalite", color: 0x2FB45A }, { name: "Pertalite", color: 0x2FB45A },
    { name: "Pertamax", color: 0x2F7BEA }, { name: "Pertamax Turbo", color: 0xE8414B },
  ];
  const liquids = [];
  for (let i = 0; i < COMP; i++) {
    const p = PRODUCTS[i];
    const lmat = new THREE.MeshPhysicalMaterial({ color: p.color, roughness: .15, metalness: 0, transmission: 0, transparent: true, opacity: .82, emissive: p.color, emissiveIntensity: .35, side: THREE.DoubleSide });
    const level = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0); // keeps y <= level (world)
    lmat.clippingPlanes = [level];
    const len = compLen * .96;
    const cx = -TANK.len / 2 + compLen * (i + .5);
    const vol = new THREE.Mesh(ellipCyl(len, TANK.ry * .965, TANK.rz * .965, 64, false), lmat);
    vol.position.x = cx; vol.visible = false; tankG.add(vol);
    // wavy surface
    const sg = new THREE.PlaneGeometry(len, 2, 24, 6); sg.rotateX(-Math.PI / 2);
    const smat = new THREE.MeshPhysicalMaterial({ color: p.color, roughness: .05, metalness: 0, clearcoat: 1, emissive: p.color, emissiveIntensity: .55, transparent: true, opacity: .95, side: THREE.DoubleSide });
    const surf = new THREE.Mesh(sg, smat); surf.position.x = cx; surf.visible = false; tankG.add(surf);
    liquids.push({ vol, surf, level, fill: 0, cx, len, base: sg.attributes.position.array.slice(), phase: i * 1.7, product: p });
  }

  // top: manholes + walkway + handrail
  const steelM = mat(C.steel, { metalness: .75, roughness: .35 });
  const manholes = [];
  for (let i = 0; i < COMP; i++) {
    const mh = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .16, 24), steelM);
    mh.position.set(-TANK.len / 2 + compLen * (i + .5), TANK.ry + .02, 0); tankG.add(mh); manholes.push(mh);
  }
  const walk = new THREE.Mesh(new THREE.BoxGeometry(TANK.len * .96, .04, .5), mat(0x5d656e, { metalness: .6 })); walk.position.set(0, TANK.ry + .1, 0); tankG.add(walk);
  [-1, 1].forEach(s => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, TANK.len * .9, 8).rotateZ(Math.PI / 2), steelM); rail.position.set(0, TANK.ry + .42, s * .42); tankG.add(rail);
    for (let i = 0; i <= 6; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .34, 6), steelM); post.position.set(-TANK.len * .45 + TANK.len * .9 * i / 6, TANK.ry + .26, s * .42); tankG.add(post); }
  });
  // bottom-loading cabinet + saddles
  const cabinet = new THREE.Mesh(new RoundedBoxGeometry(1.6, .55, .3, 3, .05), mat(0xC9CED4, { metalness: .6, roughness: .35 }));
  cabinet.position.set(TANK.x0 + TANK.len * .55, 1.45, 1.05); body.add(cabinet);
  for (let i = 0; i < 5; i++) { const sd = new THREE.Mesh(new THREE.BoxGeometry(.18, .5, 1.6), mat(C.dark)); sd.position.set(TANK.x0 + .6 + i * 1.55, 1.42, 0); body.add(sd); }
  // rear bumper + lights
  const rb = new THREE.Mesh(new THREE.BoxGeometry(.18, .28, 2.3), mat(0xE9B11D, { roughness: .5 })); rb.position.set(TANK.x0 - .25, .92, 0); body.add(rb);
  const tailM = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1010, emissiveIntensity: .8 });
  [-1, 1].forEach(s => { const tl = new THREE.Mesh(new THREE.BoxGeometry(.06, .14, .3), tailM); tl.position.set(TANK.x0 - .35, 1.0, s * .9); body.add(tl); });

  // wheels (not in body: they don't bounce)
  const wheels = [];
  const tireG = new THREE.CylinderGeometry(.56, .56, .38, 32).rotateX(Math.PI / 2);
  const hubG = new THREE.CylinderGeometry(.3, .3, .4, 20).rotateX(Math.PI / 2);
  const tireM = mat(C.tire, { roughness: .9 }), hubM = mat(0xB9C0C8, { metalness: .8, roughness: .3 });
  const axles = [{ x: 4.35, dual: false }, { x: -1.55, dual: true }, { x: -2.85, dual: true }];
  axles.forEach(a => {
    [-1, 1].forEach(s => {
      const offs = a.dual ? [.86, .46] : [.92];
      offs.forEach(o => {
        const w = new THREE.Group();
        w.add(new THREE.Mesh(tireG, tireM)); w.add(new THREE.Mesh(hubG, hubM));
        // spokes so rotation reads
        for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(.05, .44, .41), mat(0x7d858e, { metalness: .7 })); sp.rotation.z = k * Math.PI / 5; w.add(sp); }
        w.position.set(a.x, .56, s * o); truck.add(w); wheels.push(w);
      });
    });
    // mudguard
    if (a.x < 0) [-1, 1].forEach(s => { const mg = new THREE.Mesh(new THREE.BoxGeometry(2.6, .08, .6), mat(C.dark)); mg.position.set(-2.2, 1.24, s * .7); body.add(mg); });
  });

  cast(truck);
  // ghost/scan/liquid surfaces shouldn't cast heavy shadows
  [ghost, wire, scan, scanGlow, ...rings, ...liquids.map(l => l.surf)].forEach(o => { o.castShadow = false; o.receiveShadow = false; });

  return { truck, body, tankG, shellMat, capMat, clip, ghostMat, wire, rings, scanMat, scan, scanGlow, bulkheads, liquids, manholes, wheels, headM, beacon, stackTop: new THREE.Vector3(4.15 - 1.08, 3.85, -.95), compLen };
}

/* ------------------------------------------------------------------ scene: truck (hook + B2) */
function createTruckScene(el) {
  const mode = el.dataset.mode || "hook"; // hook | bridge | drive
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 16 / 9, .1, 200);
  const key = keyLights(scene, { key: 2.8, rim: 1.8, hemi: .45, shadow: 12 });
  const T = buildTruck();
  scene.add(T.truck);
  if (mode === "drive") scene.add(stageFloor(26, 0xE8E5DC, 1));
  else {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ map: softDot(256), color: 0x2a5d8f, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = .001; scene.add(pool);
  }
  scene.add(shadowCatcher(60, mode === "drive" ? .25 : .7));

  // road dashes (visible in drive mode)
  const dashes = new THREE.Group(); if (mode === "drive") scene.add(dashes);
  const dashM = new THREE.MeshBasicMaterial({ color: mode === "drive" ? 0xbfb8a8 : 0x3a5672 });
  for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .16), dashM); d.rotation.x = -Math.PI / 2; d.position.set(-26 + i * 4, .01, 2.35); dashes.add(d); }

  // spotlight from above for the hook stage
  if (mode !== "drive") {
    const spot = new THREE.SpotLight(0xdff0ff, 140, 40, Math.PI / 6.5, .7, 1.6);
    spot.position.set(0, 18, 4); spot.target.position.set(0, 1, 0); spot.castShadow = false;
    scene.add(spot, spot.target);
  }

  // exhaust puffs
  const puffTex = softDot();
  const puffs = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xb9c6d3, transparent: true, opacity: 0, depthWrite: false }));
    s.userData.t = i / 14; scene.add(s); puffs.push(s);
  }

  // labels (HTML) anchored to compartments
  const lbls = Array.from(el.querySelectorAll(".lbl[data-comp]"));
  const totalLbl = el.querySelector(".lbl[data-total]");
  const v3 = new THREE.Vector3();

  const st = { x: mode === "hook" ? -26 : 0, speed: 0, pitch: 0, xray: 0, scanX: 99, camA: mode === "drive" ? .62 : .78, camR: mode === "bridge" ? 27 : 21, lx: mode === "bridge" ? 6.6 : .2, t: 0, revealed: false, driving: mode === "drive", engine: 1 };
  let tl = null;

  function applyXray(p) {
    // p: 0..1 ; scan sweeps from front (+x) to rear
    const front = TANK.x0 + TANK.len + .6, rear = TANK.x0 - .6;
    const sx = front + (rear - front) * Math.min(1, p * 1.0);
    st.scanX = p <= 0 ? 99 : sx;
    T.clip.constant = st.scanX + T.truck.position.x;
    const on = p > 0 && p < 1;
    T.scanMat.opacity = on ? 1 : 0;
    T.scanGlow.material.opacity = on ? .25 : 0;
    const lx = st.scanX - (TANK.x0 + TANK.len / 2);
    T.scan.position.x = lx; T.scanGlow.position.x = lx;
    const g = Math.min(1, p * 1.4);
    T.ghostMat.opacity = .10 * g; T.wire.material.opacity = .35 * g;
    T.rings.forEach(r => r.material.opacity = .45 * g);
  }

  function setFill(i, f) {
    const L = T.liquids[i]; L.fill = f;
    L.vol.visible = f > .001; L.surf.visible = f > .001;
  }

  function reset(final) {
    tl && tl.kill(); tl = null;
    st.revealed = false;
    if (mode === "hook") { st.camA = .78; st.camR = 21; st.lx = .2; }
    T.bulkheads.forEach(b => { b.visible = false; b.position.y = 0; b.scale.set(1, 1, 1); });
    T.liquids.forEach((l, i) => setFill(i, 0));
    applyXray(0);
    lbls.forEach(l => l.classList.remove("on")); totalLbl && totalLbl.classList.remove("on");
    if (final) { reveal(true); }
  }

  function intro() {
    if (mode !== "hook") return;
    st.x = -26; st.speed = 0; st.engine = 1;
    T.headM.emissiveIntensity = 2.2;
    const o = { x: -26 };
    tl = gsap.timeline();
    tl.to(o, { x: 0, duration: 3.4, ease: "power3.out", onUpdate: () => { st.speed = (o.x - st.x); st.x = o.x; } });
    tl.to(st, { pitch: -.028, duration: .35, ease: "power2.out" }, 2.55);
    tl.to(st, { pitch: 0, duration: 1.1, ease: "elastic.out(1,.35)" }, 2.9);
    tl.to(T.headM, { emissiveIntensity: .25, duration: 1.2 }, 3.6);
  }

  function reveal(instant) {
    if (st.revealed) return; st.revealed = true;
    const x = { p: 0 };
    const t = gsap.timeline({ paused: instant });
    if (mode === "hook") t.to(st, { camA: .34, camR: 20.5, lx: -1.6, duration: 2.4, ease: "power2.inOut" }, 0);
    t.to(x, { p: 1, duration: 2.0, ease: "power2.inOut", onUpdate: () => applyXray(x.p) });
    T.bulkheads.forEach((b, i) => {
      t.call(() => { b.visible = true; }, null, 1.1 + i * .32);
      t.fromTo(b.position, { y: 2.6 }, { y: 0, duration: .55, ease: "bounce.out" }, 1.1 + i * .32);
    });
    T.liquids.forEach((l, i) => {
      const f = { v: 0 };
      t.to(f, { v: .78, duration: 1.3, ease: "power2.out", onUpdate: () => setFill(i, f.v) }, 2.3 + i * .45);
      if (lbls[i]) t.call(() => lbls[i].classList.add("on"), null, 2.6 + i * .45);
    });
    if (totalLbl) t.call(() => totalLbl.classList.add("on"), null, 2.3 + COMP * .45 + .4);
    if (instant) t.progress(1); else t.play();
    tl = t;
  }

  function update(dt, time) {
    st.t += dt;
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    // drive mode: truck parked at origin, world scrolls
    let roll = 0;
    if (st.driving) {
      const v = 6.5 * dt;
      dashes.children.forEach(d => { d.position.x -= v; if (d.position.x < -28) d.position.x += 56; });
      roll = v;
    } else roll = st.speed;
    T.truck.position.x = st.x;
    T.wheels.forEach(w => w.rotation.z -= roll / .56);
    // body: engine vibration + suspension pitch
    const vib = st.engine * (Math.sin(time * 47) * .006 + Math.sin(time * 31) * .004);
    T.body.position.y = vib + (st.driving ? Math.sin(time * 2.3) * .02 : 0);
    T.body.rotation.z = st.pitch + (st.driving ? Math.sin(time * 1.7) * .004 : 0);
    T.beacon.material.emissiveIntensity = 1 + Math.sin(time * 6) * .8;
    // liquids: clip planes + slosh
    T.liquids.forEach((l, i) => {
      if (!l.vol.visible) return;
      const wy = T.tankG.position.y + T.body.position.y;
      const lvl = -TANK.ry * .965 + 2 * TANK.ry * .965 * l.fill;      // local y of surface
      l.level.constant = wy + lvl;
      const h = Math.max(-.999, Math.min(.999, lvl / (TANK.ry * .965)));
      const w = 2 * TANK.rz * .965 * Math.sqrt(1 - h * h);
      l.surf.position.y = lvl; l.surf.scale.z = w / 2;
      const pos = l.surf.geometry.attributes.position, b = l.base;
      const amp = .05 + (st.driving ? .03 : 0);
      for (let k = 0; k < pos.count; k++) {
        const px = b[k * 3], pz = b[k * 3 + 2];
        pos.array[k * 3 + 1] = Math.sin(px * 3.1 + time * 2.6 + l.phase) * amp * .6 + Math.sin(pz * 4 + time * 1.9 + l.phase) * amp * .4;
      }
      pos.needsUpdate = true;
    });
    // exhaust puffs
    const ex = T.stackTop.clone(); ex.x += st.x;
    puffs.forEach(p => {
      p.userData.t = (p.userData.t + dt * .45) % 1;
      const u = p.userData.t;
      p.position.set(ex.x - u * 1.8 - (st.driving ? u * 3 : 0), ex.y + u * 2.2, ex.z - u * .5);
      p.scale.setScalar(.25 + u * 1.3);
      p.material.opacity = (1 - u) * .12 * st.engine;
    });
    // camera orbit
    const a = st.camA + Math.sin(st.t * .12) * (st.revealed ? .06 : .16) + mouse.x * .08;
    const r = st.camR;
    const ty = mode === "bridge" ? 2.4 : mode === "hook" ? 2.75 : 2.1;
    camera.position.set(Math.sin(a) * r + (mode === "bridge" ? 0 : 0), 6.2 + Math.sin(st.t * .2) * .4 - mouse.y * .6, Math.cos(a) * r);
    camera.lookAt(st.lx, ty, 0);
    // labels
    if (lbls.length || totalLbl) {
      const W = el.clientWidth, H = el.clientHeight;
      lbls.forEach((lb, i) => {
        const L = T.liquids[i];
        v3.set(L.cx + T.tankG.position.x + st.x, T.tankG.position.y + TANK.ry + (i % 2 ? 1.55 : .85), 0).project(camera);
        lb.style.transform = `translate(${(v3.x * .5 + .5) * W}px, ${(-v3.y * .5 + .5) * H}px) translate(-50%, -100%)`;
      });
      if (totalLbl) {
        v3.set(st.x + .4, .1, TANK.rz + .6).project(camera);
        totalLbl.style.transform = `translate(${(v3.x * .5 + .5) * W}px, ${(-v3.y * .5 + .5) * H}px) translate(-50%, 0)`;
      }
    }
  }

  return {
    scene, camera, update,
    enter() { reset(false); if (mode === "hook") intro(); else { st.x = 0; } if (mode === "bridge" || mode === "drive") reveal(mode === "bridge"); },
    leave() { tl && tl.kill(); },
    step(n) {
      if (mode === "hook") { if (n >= 1) reveal(false); else if (st.revealed) reset(false); }
      if (mode === "bridge") {
        if (n < 1 && st.x === 0) return;
        tl && tl.kill();
        if (n >= 1) { T.headM.emissiveIntensity = 2; tl = gsap.timeline().to(st, { x: 34, duration: 2.6, ease: "power2.in", onUpdate: function () { st.speed = (st.x - (this._px ?? st.x)) ; this._px = st.x; } }); }
        else { st.x = 0; st.speed = 0; T.headM.emissiveIntensity = .25; }
      }
    },
    pose(state) { // for print snapshots
      st.x = 0; st.speed = 0; st.pitch = 0; T.headM.emissiveIntensity = .25;
      reset(state === "final" || mode !== "hook");
      update(0, 1.2); update(.016, 1.3);
    },
  };
}

/* ------------------------------------------------------------------ scene: logo */
const LOGO_PATHS = [
  ["M44.3174 2.47C43.8144 1.7105 43.1314 1.0875 42.3294 0.6565C41.5274 0.2256 40.6314 0 39.7214 0H27.0254L34.0334 10.8134C34.5374 11.5717 35.2204 12.1933 36.0224 12.6229C36.8244 13.0525 37.7194 13.2768 38.6294 13.2756H51.3304L44.3174 2.47Z", 0xEA1E30],
];
function readLogoPaths() {
  // pull the 3 colored mark paths straight from the inlined official SVG
  const src = document.getElementById("ppn-svg");
  if (!src) return LOGO_PATHS;
  const out = [];
  src.content.querySelectorAll("path").forEach(p => {
    const f = (p.getAttribute("fill") || "").toUpperCase();
    if (["#EA1E30", "#AAC237", "#086DB5"].includes(f) && out.length < 3) out.push([p.getAttribute("d"), parseInt(f.slice(1), 16)]);
  });
  return out;
}

function createLogoScene(el) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, .1, 400);
  keyLights(scene, { key: 2.4, rim: 2.2, hemi: .5, shadow: 40 });
  const group = new THREE.Group(); scene.add(group);
  const loader = new SVGLoader();
  const pieces = [];
  const box = new THREE.Box3();
  readLogoPaths().forEach(([d, color]) => {
    const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`);
    const shapes = SVGLoader.createShapes(data.paths[0]);
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 5, bevelEnabled: true, bevelThickness: 1.1, bevelSize: .7, bevelSegments: 6, curveSegments: 24 });
    geo.rotateX(Math.PI); // svg y-down -> y-up without flipping winding
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color, roughness: .22, metalness: .25, clearcoat: 1, clearcoatRoughness: .15, envMapIntensity: 1.2 }));
    m.castShadow = true;
    const piece = new THREE.Group(); piece.add(m); group.add(piece);
    pieces.push(piece);
  });
  box.setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  pieces.forEach(p => {
    p.children[0].position.sub(center);
    // each piece pivots around its own centroid
    const pb = new THREE.Box3().setFromObject(p.children[0]); const pc = pb.getCenter(new THREE.Vector3());
    p.children[0].position.sub(pc); p.position.copy(pc); p.userData.home = pc.clone();
    p.userData.dir = pc.clone().normalize();
  });
  const S = el.dataset.scale ? parseFloat(el.dataset.scale) : 1;
  group.scale.setScalar(.12 * S);
  // glossy floor reflection-ish: soft floor + shadow
  const floor = shadowCatcher(80, .4); floor.position.y = -3.6; scene.add(floor);
  const st = { t: 0, spread: 1, spin: 0 };
  let tl = null;
  function update(dt) {
    st.t += dt;
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    const breathe = (Math.sin(st.t * .9) * .5 + .5) * .9;
    pieces.forEach((p, i) => {
      const off = st.spread * 18 + breathe * 1.4;
      p.position.copy(p.userData.home).addScaledVector(p.userData.dir, off);
      p.position.z = Math.sin(st.t * 1.1 + i * 2) * 1.2 + st.spread * (i - 1) * 14;
      p.rotation.y = Math.sin(st.t * .7 + i) * .12 + st.spread * (i - 1) * 1.2;
      p.rotation.x = Math.cos(st.t * .6 + i) * .06;
    });
    group.rotation.y = Math.sin(st.t * .35) * .38 + mouse.x * .25 + st.spin;
    group.rotation.x = -.08 + mouse.y * .12;
    group.position.y = Math.sin(st.t * .8) * .18 + (el.dataset.y ? parseFloat(el.dataset.y) : 0);
    group.position.x = el.dataset.x ? parseFloat(el.dataset.x) : 0;
    camera.position.set(0, .6, 15.5); camera.lookAt(0, 0, 0);
  }
  return {
    scene, camera, update,
    enter() { tl && tl.kill(); st.spread = 1; st.spin = -1.4; tl = gsap.timeline().to(st, { spread: 0, spin: 0, duration: 2.6, ease: "expo.out", delay: .2 }); },
    leave() { tl && tl.kill(); },
    step() {},
    pose() { st.spread = 0; st.spin = 0; st.t = 1.6; update(0); },
  };
}

/* ------------------------------------------------------------------ registry + loop */
const factories = { truck: createTruckScene, logo: createLogoScene };
const inst = new WeakMap();
let active = null, activeEl = null, last = 0, raf = 0;

function get(el) {
  let s = inst.get(el);
  if (!s) { const f = factories[el.dataset.scene]; if (!f) return null; s = f(el); inst.set(el, s); }
  return s;
}

function sizeTo(el, s) {
  const w = el.clientWidth, h = el.clientHeight;
  const stageEl = document.getElementById("stage");
  const scale = PRINT ? 1 : stageEl.getBoundingClientRect().width / 1920;
  renderer.setPixelRatio(PRINT ? 1.5 : Math.max(.75, Math.min(2, devicePixelRatio * scale)));
  renderer.setSize(w, h, false);
  s.camera.aspect = w / h; s.camera.updateProjectionMatrix();
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  if (!active) return;
  const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
  active.update(dt, now / 1000);
  renderer.render(active.scene, active.camera);
}

const Scenes = {
  mount(slide) {
    const el = slide.querySelector(".three[data-scene]");
    if (!el) return;
    const s = get(el); if (!s) return;
    el.prepend(renderer.domElement);
    active = s; activeEl = el;
    sizeTo(el, s);
    s.enter();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  },
  unmount(slide) {
    const el = slide.querySelector(".three[data-scene]");
    if (!el || el !== activeEl) return;
    active && active.leave();
    active = null; activeEl = null;
  },
  step(slide, n) {
    const el = slide.querySelector(".three[data-scene]");
    if (!el) return; const s = get(el); s && s.step(n);
  },
  async snapshotAll(slides) {
    for (const slide of slides) {
      for (const el of slide.querySelectorAll(".three[data-scene]")) {
        const s = get(el); if (!s) continue;
        el.prepend(renderer.domElement);
        sizeTo(el, s);
        s.pose(el.dataset.snap || "final");
        renderer.render(s.scene, s.camera);
        const img = new Image(); img.className = "snap"; img.src = renderer.domElement.toDataURL("image/png");
        el.prepend(img);
        el.querySelectorAll(".lbl").forEach(l => l.classList.add("on"));
        if (el.dataset.snap === "question") el.querySelectorAll(".lbl").forEach(l => l.classList.remove("on"));
      }
    }
    renderer.domElement.remove();
  },
};
addEventListener("resize", () => { if (active && activeEl) sizeTo(activeEl, active); });
window.Scenes = Scenes;
