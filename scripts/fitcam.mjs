// Fit the answer-slide start camera so the 3D truck lands where the truck sits in photo DSCF2614.
import * as THREE from "three";
const W = 1920, H = 1080, fov = 26;
// model points → photo stage pixels (read off the hook slide at zoom 1)
const pairs = [
  [[-4.5, 3.1, 0], [950, 585]],     // tank rear, top centre
  [[-4.85, 0.75, 0], [940, 742]],   // rear bumper centre
  [[5.1, 3.1, -1.18], [690, 527]],  // cab front-top, left corner
  [[2.85, 3.15, -1.0], [775, 520]], // tank front-top, left
  [[-2.9, 0.0, -1.0], [835, 770]],  // rear tandem, left tyre contact
];
const cam = new THREE.PerspectiveCamera(fov, W / H, 0.1, 500);
const v = new THREE.Vector3();
function err(p) {
  const [d, az, el, tx, ty, tz] = p;
  cam.position.set(tx + d * Math.cos(el) * Math.cos(az), ty + d * Math.sin(el), tz + d * Math.cos(el) * Math.sin(az));
  cam.lookAt(tx, ty, tz); cam.updateMatrixWorld();
  let e = 0;
  for (const [m, s] of pairs) { v.set(...m).project(cam); const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H; e += (x - s[0]) ** 2 + (y - s[1]) ** 2; }
  return e;
}
let best = null, be = Infinity;
for (let i = 0; i < 400000; i++) {
  const p = [20 + Math.random() * 60, Math.PI + (Math.random() - 0.5) * 2.4, 0.1 + Math.random() * 0.8, (Math.random() - 0.5) * 30, Math.random() * 12, (Math.random() - 0.5) * 30];
  const e = err(p); if (e < be) { be = e; best = p; }
}
// local refine
for (let k = 0; k < 200000; k++) { const s = 0.5 * (1 - k / 200000) + 0.002; const p = best.map((x, i) => x + (Math.random() - 0.5) * s * [4, 0.1, 0.05, 2, 1, 2][i]); const e = err(p); if (e < be) { be = e; best = p; } }
err(best);
console.log("rms px", Math.sqrt(be / pairs.length).toFixed(1));
console.log("pos", cam.position.toArray().map(n => +n.toFixed(2)), "target", best.slice(3).map(n => +n.toFixed(2)));
