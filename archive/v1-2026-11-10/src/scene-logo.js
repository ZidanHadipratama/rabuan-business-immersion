// Cover: the three arrows of the official Pertamina symbol (paths taken from assets/brand/ppn-color.svg),
// extruded and lit. Red, green, blue as in the SVG.
import * as THREE from "three";
import { SVGLoader } from "../lib/three/addons/loaders/SVGLoader.js";
import { host, keyLights, mat } from "./common.js";
import logoSvg from "../assets/brand/ppn-color.svg";

const gsap = window.gsap;

export function logoScene(el, slide) {
  const scene = new THREE.Scene();
  keyLights(scene, { key: 2.2, fill: 1.2, hemi: 0.6, sun: [6, 10, 12] });
  const data = new SVGLoader().parse(logoSvg);
  const group = new THREE.Group();
  const parts = [];
  data.paths.slice(0, 3).forEach((p, i) => {
    const color = p.color.clone();
    const shapes = SVGLoader.createShapes(p);
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 3.2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.45, bevelSegments: 4, curveSegments: 10 });
    const m = new THREE.Mesh(geo, mat(color, { roughness: 0.28, metalness: 0.15, envMapIntensity: 1.2 }));
    m.castShadow = true;
    const g = new THREE.Group(); g.add(m); group.add(g); parts.push(g);
    void i;
  });
  // SVG y points down; flip and centre on the symbol (viewBox 0..51 × 0..39)
  group.scale.set(0.1, -0.1, 0.1);
  group.position.set(-2.57, 1.96, -0.16);
  const pivot = new THREE.Group(); pivot.add(group); scene.add(pivot);

  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 13);
  const st = { spin: 0 };

  function update(t) {
    pivot.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.32 + st.spin;
    pivot.rotation.x = 0.12 + Math.sin(t * 0.27) * 0.06;
    pivot.position.y = Math.sin(t * 0.6) * 0.08;
  }
  slide.addEventListener("enter", () => {
    parts.forEach((p, i) => gsap.fromTo(p.position, { x: -30 - i * 6 }, { x: 0, duration: 1.4, ease: "emph", delay: 0.2 + i * 0.14 }));
    gsap.fromTo(st, { spin: -1.2 }, { spin: 0, duration: 2.4, ease: "sig" });
  });
  host(el, slide, { scene, camera, update });
}
