// Pertamina 24 KL rigid tank truck (mobil tangki), modelled from real reference photos:
//   - Wikimedia Commons "Benoa Bali Indonesia-Petamina-tank-truck-01.jpg" (CEphoto, Uwe Aranas, CC BY-SA 3.0):
//     side view, proportions, 3 axles, red cab, red/white tank, rear ladder.
//   - BI photo DSCF2614 (ITJ Plumpang, 7 Oct 2026): rear livery "24000 ℓ", "135" call centre, top rails.
//   - BI photo DSCF2387: "32.000 ℓ" tank, "PT. PERTAMINA PATRA NIAGA".
// Compartments: 8.000 L each (Heppy Wulansari, Pjs VP Corporate Communication Pertamina, Otomotifnet 7 Jan 2023),
// so 24 KL = 3 compartments.
import * as THREE from "three";
import { RoundedBoxGeometry } from "../lib/three/addons/geometries/RoundedBoxGeometry.js";
import { PAINT, mat, canvasTex, svgImage } from "./common.js";
import logoSvg from "../assets/brand/ppn-color.svg";

/* tank cross-section: superellipse |y/b|^n + |z/a|^n = 1 */
export const TANK = { x0: -4.25, x1: 2.85, cy: 2.28, a: 1.22, b: 0.9, n: 2.6, comps: 3 };
const L = TANK.x1 - TANK.x0;
const sgnPow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
export function section(phi, s = 1) {
  // phi: 0 = bottom, increasing towards +z (right side), PI = top
  const c = Math.cos(phi - Math.PI / 2), sn = Math.sin(phi - Math.PI / 2);
  const e = 2 / TANK.n;
  return { z: TANK.a * s * sgnPow(c, e), y: TANK.cy + TANK.b * s * sgnPow(sn, e) };
}

function shellGeometry(scale = 1, segU = 96, segV = 96) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segU; i++) {
    const u = i / segU, x = TANK.x0 + u * L;
    for (let j = 0; j <= segV; j++) {
      const v = j / segV, p = section(v * Math.PI * 2, scale);
      pos.push(x, p.y, p.z); uv.push(u, v);
    }
  }
  for (let i = 0; i < segU; i++) for (let j = 0; j < segV; j++) {
    const a = i * (segV + 1) + j, b = a + segV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* dished end: rings shrink to the axis over `depth`. dir = -1 rear, +1 front */
function capGeometry(x, dir, depth = 0.34, segR = 14, segV = 96) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segR; i++) {
    const t = i / segR, s = Math.sqrt(Math.max(0, 1 - t * t)), dx = dir * depth * t;
    for (let j = 0; j <= segV; j++) {
      const p = section((j / segV) * Math.PI * 2, s);
      pos.push(x + dx, p.y, p.z);
      uv.push((p.z / TANK.a + 1) / 2, ((p.y - TANK.cy) / TANK.b + 1) / 2);
    }
  }
  for (let i = 0; i < segR; i++) for (let j = 0; j < segV; j++) {
    const a = i * (segV + 1) + j, b = a + segV + 1;
    if (dir < 0) idx.push(a, a + 1, b, b, a + 1, b + 1); else idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function sectionShape(s = 1, n = 96) {
  const sh = new THREE.Shape();
  for (let j = 0; j <= n; j++) {
    const p = section((j / n) * Math.PI * 2, s);
    j ? sh.lineTo(p.z, p.y - TANK.cy) : sh.moveTo(p.z, p.y - TANK.cy);
  }
  return sh;
}

const hex = (c) => "#" + c.toString(16).padStart(6, "0");

/* Side livery, painted onto the shell's (u along length, v around section) map.
   Canvas top half = left side (bottom edge at y=0), bottom half = right side (bottom at y=H). */
function liveryTexture(onReady) {
  const W = 4096, H = 2048;
  const tex = canvasTex(W, H, () => {});
  const g = tex.userData.g;
  const ppmU = W / L, ppmV = H / 6.6; // pixels per metre along length / around section (perimeter ≈ 6.6 m)
  const boundary = (u) => { const t = Math.min(1, Math.max(0, (u - 0.6) / 0.15)); const sm = t * t * (3 - 2 * t); return 0.56 - sm * 0.44; };
  function paint(logo) {
    g.fillStyle = hex(PAINT.white); g.fillRect(0, 0, W, H);
    // red top: |y - H/2| < H/2 (1 - b(u))
    g.fillStyle = hex(PAINT.tankRed); g.beginPath();
    for (let x = 0; x <= W; x += 8) { const b = boundary(x / W); g.lineTo(x, H / 2 - (H / 2) * (1 - b)); }
    for (let x = W; x >= 0; x -= 8) { const b = boundary(x / W); g.lineTo(x, H / 2 + (H / 2) * (1 - b)); }
    g.closePath(); g.fill();
    // grey skirt along the bottom of the white band
    g.fillStyle = hex(PAINT.grey); g.fillRect(0, 0, W, H * 0.055); g.fillRect(0, H * 0.945, W, H * 0.055);
    // reflective conspicuity marking (red/white) just above the skirt, as on DSCF2614
    for (let x = 0; x < W; x += 120) { g.fillStyle = (x / 120) % 2 ? "#ffffff" : hex(PAINT.tankRed); g.fillRect(x, H * 0.055, 120, H * 0.012); g.fillRect(x, H * 0.933, 120, H * 0.012); }

    // place an item at (u along length, s up the side) on both sides; left side is the
    // same artwork rotated 180° in place (u runs rear→front on both sides).
    const item = (uC, s, draw) => {
      for (const left of [false, true]) {
        g.save();
        if (left) { g.translate(uC * W, s * H * 0.5); g.scale(-1, -1); }
        else g.translate(uC * W, H - s * H * 0.5);
        draw(); g.restore();
      }
    };
    if (logo) item(0.4, 0.36, () => {
      const lw = 2.7 * ppmU, lh = (2.7 * 50 / 168) * ppmV;
      g.drawImage(logo, -lw / 2, -lh / 2, lw, lh);
    });
    item(0.4, 0.17, () => {
      g.scale(ppmU / ppmV, 1);
      g.fillStyle = hex(PAINT.tankRed); g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `700 ${0.11 * ppmV}px "Rethink Sans", sans-serif`;
      g.fillText("PERTAMINA CALL CENTER 135", 0, 0);
    });
    tex.needsUpdate = true;
  }
  paint(null);
  const img = svgImage(logoSvg);
  img.onload = () => { paint(img); onReady && onReady(); };
  return tex;
}

function rearTexture() {
  return canvasTex(1024, 768, (g, W, H) => {
    g.fillStyle = hex(PAINT.white); g.fillRect(0, 0, W, H);
    g.fillStyle = hex(PAINT.tankRed); g.fillRect(0, 0, W, H * 0.46);
    g.fillStyle = hex(PAINT.grey); g.fillRect(0, H * 0.94, W, H * 0.06);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `800 ${H * 0.13}px "Rethink Sans", sans-serif`;
    g.fillText("24000 ℓ", W / 2, H * 0.3);
    g.fillStyle = hex(PAINT.tankRed);
    g.font = `800 ${H * 0.2}px "Rethink Sans", sans-serif`;
    g.fillText("135", W / 2, H * 0.67);
    g.font = `700 ${H * 0.045}px "Rethink Sans", sans-serif`;
    g.fillText("EMERGENCY CALL", W / 2, H * 0.53);
    // class 3 flammable liquid placard
    g.save(); g.translate(W * 0.2, H * 0.68); g.rotate(Math.PI / 4);
    g.fillStyle = hex(PAINT.tankRed); g.fillRect(-55, -55, 110, 110);
    g.strokeStyle = "#fff"; g.lineWidth = 5; g.strokeRect(-46, -46, 92, 92); g.restore();
    g.fillStyle = "#fff"; g.font = `800 ${H * 0.06}px "Rethink Sans", sans-serif`; g.fillText("3", W * 0.2, H * 0.71);
  });
}

function wheel(x, z, dual) {
  const g = new THREE.Group();
  const R = 0.52, Wd = 0.3;
  const tireM = mat(PAINT.tire, { roughness: 0.9 }), rimM = mat(PAINT.rim, { metalness: 0.6, roughness: 0.35 }), hubM = mat(0x2A2E33, { roughness: 0.6 });
  const one = (dz) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Wd, 40), tireM); t.rotation.x = Math.PI / 2; t.position.z = dz;
    const sidewall = new THREE.Mesh(new THREE.TorusGeometry(R - 0.06, 0.06, 10, 40), tireM); sidewall.position.z = dz + Math.sign(z) * Wd / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.6, R * 0.6, Wd + 0.02, 32), rimM); rim.rotation.x = Math.PI / 2; rim.position.z = dz;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.22, R * 0.22, Wd + 0.06, 16), hubM); hub.rotation.x = Math.PI / 2; hub.position.z = dz;
    [t, sidewall, rim, hub].forEach(m => { m.castShadow = true; g.add(m); });
  };
  one(0); if (dual) one(-Math.sign(z) * 0.32);
  g.position.set(x, R, z);
  return g;
}

export function buildTruck() {
  const truck = new THREE.Group();
  const shellMats = [];

  /* ---- tank shell ---- */
  const livery = liveryTexture();
  const shellM = mat(0xffffff, { map: livery, roughness: 0.32, metalness: 0.05, side: THREE.FrontSide });
  shellMats.push(shellM);
  const shell = new THREE.Mesh(shellGeometry(), shellM); shell.castShadow = true; truck.add(shell);

  const innerM = mat(0x4A535C, { roughness: 0.75, metalness: 0.3, side: THREE.BackSide });
  shellMats.push(innerM);
  truck.add(new THREE.Mesh(shellGeometry(0.985), innerM));

  const rearM = mat(0xffffff, { map: rearTexture(), roughness: 0.32 });
  const frontM = mat(PAINT.tankRed, { roughness: 0.32 });
  shellMats.push(rearM, frontM);
  const rear = new THREE.Mesh(capGeometry(TANK.x0, -1), rearM); rear.castShadow = true; truck.add(rear);
  const front = new THREE.Mesh(capGeometry(TANK.x1, 1, 0.22), frontM); front.castShadow = true; truck.add(front);

  /* ---- compartments: bulkheads, liquid, manholes ---- */
  const compLen = L / TANK.comps;
  const bulkM = mat(0x7D8892, { roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide });
  shellMats.push(bulkM);
  const bulkheads = [];
  for (let i = 1; i < TANK.comps; i++) {
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sectionShape(0.985)), bulkM);
    m.rotation.y = Math.PI / 2; m.position.set(TANK.x0 + i * compLen, TANK.cy, 0);
    truck.add(m); bulkheads.push(m);
  }
  const liquids = [];
  for (let i = 0; i < TANK.comps; i++) {
    const level = new THREE.Plane(new THREE.Vector3(0, -1, 0), TANK.cy - TANK.b); // keeps y < constant; animated
    const lm = mat(0xffffff, { roughness: 0.18, metalness: 0, transparent: true, opacity: 0.92, side: THREE.DoubleSide, clippingPlanes: [level] });
    const geo = new THREE.ExtrudeGeometry(sectionShape(0.975), { depth: compLen - 0.06, bevelEnabled: false, curveSegments: 4 });
    const m = new THREE.Mesh(geo, lm);
    m.rotation.y = Math.PI / 2; // extrude along -x after rotation
    m.position.set(TANK.x0 + i * compLen + 0.03, TANK.cy, 0);
    truck.add(m);
    liquids.push({ mesh: m, mat: lm, plane: level, fill: 0 });
  }
  const manholes = [];
  const lidM = mat(PAINT.steel, { metalness: 0.7, roughness: 0.3 });
  for (let i = 0; i < TANK.comps; i++) {
    const x = TANK.x0 + (i + 0.5) * compLen;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.14, 28), lidM);
    collar.position.set(x, TANK.cy + TANK.b + 0.05, 0); collar.castShadow = true;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 28), lidM);
    lid.position.set(x, TANK.cy + TANK.b + 0.14, 0);
    truck.add(collar, lid); manholes.push({ collar, lid });
  }

  /* ---- top walkway & fold-down rails (red, DSCF2614) ---- */
  const railM = mat(PAINT.tankRed, { roughness: 0.45 });
  const walk = new THREE.Mesh(new THREE.BoxGeometry(L - 0.4, 0.04, 0.5), mat(0x6E7780, { metalness: 0.5, roughness: 0.5 }));
  walk.position.set((TANK.x0 + TANK.x1) / 2, TANK.cy + TANK.b + 0.03, 0); truck.add(walk);
  for (const z of [-0.62, 0.62]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, L - 0.5, 8), railM);
    rail.rotation.z = Math.PI / 2; rail.position.set((TANK.x0 + TANK.x1) / 2, TANK.cy + TANK.b + 0.42, z); truck.add(rail);
    for (let k = 0; k <= 6; k++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), railM);
      post.position.set(TANK.x0 + 0.3 + k * (L - 0.6) / 6, TANK.cy + TANK.b + 0.2, z * 0.92); truck.add(post);
    }
  }

  /* ---- chassis, guards, cabinets ---- */
  const chM = mat(PAINT.chassis, { roughness: 0.7 });
  for (const z of [-0.48, 0.48]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(9.9, 0.26, 0.12), chM); r.position.set(0.15, 1.02, z); r.castShadow = true; truck.add(r);
  }
  const cradle = new THREE.Mesh(new THREE.BoxGeometry(L - 0.3, 0.18, 1.3), chM); cradle.position.set((TANK.x0 + TANK.x1) / 2, 1.24, 0); truck.add(cradle);
  const cabM = mat(0x2B3036, { roughness: 0.6, metalness: 0.3 });
  for (const z of [-1.0, 1.0]) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.6, 0.36), cabM); box.position.set(-0.4, 0.95, z); box.castShadow = true; truck.add(box);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.06), mat(0x9AA3AB, { metalness: 0.6 })); guard.position.set(1.6, 0.72, z * 1.12); truck.add(guard);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 12), mat(0x3A4148, { metalness: 0.5 }));
    pipe.rotation.z = Math.PI / 2; pipe.position.set(-1.3, 1.25, z * 1.05); truck.add(pipe);
  }
  // mudguards over rear tandem
  for (const z of [-1.08, 1.08]) {
    const mg = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.42, 24, 1, true, -Math.PI / 2, Math.PI), mat(0x22262B, { side: THREE.DoubleSide }));
    mg.rotation.x = Math.PI / 2; mg.rotation.z = Math.PI / 2; mg.scale.set(1, 1, 2.1); mg.position.set(-2.25, 0.62, z); truck.add(mg);
  }
  // rear bumper, lights, ladder (rear right, Commons ref)
  const bump = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 2.4), chM); bump.position.set(-4.75, 0.78, 0); bump.castShadow = true; truck.add(bump);
  const stripeT = canvasTex(256, 32, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? "#fff" : "#D3202C"; g.beginPath(); g.moveTo(x, h); g.lineTo(x + 16, 0); g.lineTo(x + 32, 0); g.lineTo(x + 16, h); g.fill(); } });
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.2), mat(0xffffff, { map: stripeT, roughness: 0.4 })); stripe.rotation.y = -Math.PI / 2; stripe.position.set(-4.86, 0.78, 0); truck.add(stripe);
  const lampM = mat(0xff3b2f, { emissive: 0xaa1010, emissiveIntensity: 0.5 });
  for (const z of [-1.0, 1.0]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.3), lampM); l.position.set(-4.87, 0.8, z); truck.add(l); }
  const ladM = mat(0xC9CED3, { metalness: 0.7, roughness: 0.3 });
  for (const dz of [0.62, 0.98]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 8), ladM); s.position.set(-4.62, 2.25, dz); truck.add(s); }
  for (let k = 0; k < 8; k++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 6), ladM); r.rotation.x = Math.PI / 2; r.position.set(-4.62, 1.1 + k * 0.32, 0.8); truck.add(r); }

  /* ---- cab (cab-over, red; Commons ref) ---- */
  const cabRed = mat(PAINT.cabRed, { roughness: 0.36, metalness: 0.12 });
  const cab = new THREE.Mesh(new RoundedBoxGeometry(2.0, 2.2, 2.36, 5, 0.16), cabRed);
  cab.position.set(4.12, 2.02, 0); cab.castShadow = true; truck.add(cab);
  const roof = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.34, 2.16, 3, 0.14), cabRed); roof.position.set(3.92, 3.24, 0); roof.castShadow = true; truck.add(roof);
  const glassM = mat(0x2C3E50, { roughness: 0.05, metalness: 0.85, envMapIntensity: 1.6 });
  const frameM = mat(0x16191C, { roughness: 0.6 });
  const ws = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.92, 2.06, 2, 0.03), glassM); ws.position.set(5.115, 2.52, 0); truck.add(ws);
  const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 1.6), frameM); wiper.position.set(5.15, 2.08, 0); truck.add(wiper);
  for (const z of [-1, 1]) {
    const zf = z * 1.185;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.74, 0.02), frameM); frame.position.set(4.62, 2.55, zf); truck.add(frame);
    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.64, 0.025), glassM); sw.position.set(4.62, 2.55, zf + z * 0.005); truck.add(sw);
    const qw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.5, 0.025), glassM); qw.position.set(3.55, 2.62, zf); truck.add(qw);
    for (const x of [4.12, 5.08]) { const seam = new THREE.Mesh(new THREE.BoxGeometry(0.018, 1.6, 0.012), frameM); seam.position.set(x, 1.92, zf); truck.add(seam); }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.03), mat(0xC0C5CA, { metalness: 0.8 })); handle.position.set(4.3, 2.1, zf + z * 0.01); truck.add(handle);
    const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), frameM); mirrorArm.rotation.x = Math.PI / 2; mirrorArm.position.set(5.08, 2.75, z * 1.32); truck.add(mirrorArm);
    const mirror = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.46, 0.2, 2, 0.03), frameM); mirror.position.set(5.08, 2.55, z * 1.48); truck.add(mirror);
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.24), chM); step.position.set(4.45, 0.95, z * 0.98); truck.add(step);
    const step2 = step.clone(); step2.position.y = 0.62; truck.add(step2);
    const fender = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.36, 24, 1, true, 0, Math.PI), mat(0x1E2226, { side: THREE.DoubleSide }));
    fender.rotation.x = Math.PI / 2; fender.position.set(4.15, 0.55, z * 1.0); truck.add(fender);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.56, 1.5), mat(0x23272C, { metalness: 0.4 })); grille.position.set(5.13, 1.56, 0); truck.add(grille);
  for (let k = 0; k < 5; k++) { const slat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 1.46), mat(0x8E959C, { metalness: 0.7 })); slat.position.set(5.15, 1.34 + k * 0.11, 0); truck.add(slat); }
  const fbump = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.38, 2.42, 2, 0.06), mat(0xC4C9CE, { metalness: 0.55, roughness: 0.35 })); fbump.position.set(5.16, 0.95, 0); fbump.castShadow = true; truck.add(fbump);
  const headM = mat(0xffffff, { emissive: 0xfff2d0, emissiveIntensity: 0.7, roughness: 0.1 });
  for (const z of [-0.88, 0.88]) { const h = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.18, 0.4, 2, 0.03), headM); h.position.set(5.33, 1.0, z); truck.add(h); }
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 12), mat(0xffb020, { emissive: 0xff8a00, emissiveIntensity: 0.8 })); beacon.position.set(3.7, 3.46, 0.7); truck.add(beacon);

  /* ---- wheels: front single, rear tandem dual ---- */
  const wheels = [];
  for (const z of [-1.0, 1.0]) {
    wheels.push(wheel(4.15, z, false));
    wheels.push(wheel(-1.6, z, true));
    wheels.push(wheel(-2.92, z, true));
  }
  wheels.forEach(w => truck.add(w));

  truck.traverse(o => { if (o.isMesh && o.castShadow === false) o.castShadow = true; });

  return { truck, shellMats, bulkheads, liquids, manholes, wheels, compLen };
}
