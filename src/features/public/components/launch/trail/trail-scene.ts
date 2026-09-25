// The hero's WebGL layer (three.js + one small point shader). Clicks travel as
// particles from a post (the mark's dots) through the audience to the brand's
// site; the ones that become sign-ups turn green and settle into the ledger
// column as rows. The flow rate follows the real demo-workspace counts. No
// React here: TrailCanvas owns the lifecycle (load after paint, pause
// off-screen, dispose).
import * as THREE from "three";
import { layoutTrail, type Point, type TrailLayout } from "./trail-layout";

export type TrailCounts = { posts: number; links: number; clicks: number; signups: number };
type Particle = { active: boolean; path: [Point, Point, Point]; t: number; speed: number; signup: boolean };

const INK = new THREE.Color("#111111");
const MONEY = new THREE.Color("#0f7b4a");
const AUDIENCE = 56;
const CURVE_STEPS = 10;
const POOL = 260;
const FRAME_MS = 1000 / 60;
const POINTER_RADIUS = 120;

const POINT_VERTEX = /* glsl */ `
  attribute float aSize; attribute vec3 aColor; attribute float aAlpha;
  varying vec3 vColor; varying float vAlpha;
  uniform float uScale;
  void main() {
    vColor = aColor; vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale;
  }`;
const POINT_FRAGMENT = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.36, d));
  }`;

function bezier(p: [Point, Point, Point], t: number, out: Point) {
  const u = 1 - t;
  out.x = u * u * p[0].x + 2 * u * t * p[1].x + t * t * p[2].x;
  out.y = u * u * p[0].y + 2 * u * t * p[1].y + t * t * p[2].y;
}

export function createTrailScene(canvas: HTMLCanvasElement, counts: TrailCounts) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  let layout: TrailLayout = layoutTrail(1, 1, { audience: AUDIENCE, ledgerRows: counts.signups });
  let rest: Point[] = [];

  // edges: source → audience → site, redrawn when the pointer bends the cloud
  const edgeGeo = new THREE.BufferGeometry();
  const edgePos = new Float32Array(AUDIENCE * CURVE_STEPS * 2 * 2 * 3);
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePos, 3));
  const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.07 }));

  // points: sources, audience, site, ledger dots, then the particle pool
  const fixed = 3 + AUDIENCE + 1;
  const total = fixed + POOL + 12;
  const pos = new Float32Array(total * 3);
  const size = new Float32Array(total);
  const color = new Float32Array(total * 3);
  const alpha = new Float32Array(total);
  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pointGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  pointGeo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  pointGeo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
  const pointMat = new THREE.ShaderMaterial({ vertexShader: POINT_VERTEX, fragmentShader: POINT_FRAGMENT, transparent: true, depthTest: false, uniforms: { uScale: { value: 1 } } });
  const points = new THREE.Points(pointGeo, pointMat);

  // ledger rows: one thin bar per sign-up, printed in as green arrivals land
  const rowGeo = new THREE.PlaneGeometry(1, 1);
  const rowMat = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.22, side: THREE.DoubleSide });
  const rows = new THREE.InstancedMesh(rowGeo, rowMat, 12);
  rows.count = 0;
  // one unit plane scaled per instance: its own bounds say nothing about where rows are
  rows.frustumCulled = false;
  const markGeo = new THREE.BufferGeometry();
  markGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
  const markLine = new THREE.Line(markGeo, new THREE.LineBasicMaterial({ color: INK }));
  scene.add(edges, markLine, rows, points);

  const pool: Particle[] = Array.from({ length: POOL }, () => ({ active: false, path: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], t: 0, speed: 0, signup: false }));
  const pointer = { x: -9999, y: -9999 };
  const tmp = { x: 0, y: 0 };
  const matrix = new THREE.Matrix4();
  // clicks per second on screen: enough to read as a flow, scaled by the real ratio
  const signupShare = counts.clicks > 0 ? Math.min(0.25, Math.max(0.06, (counts.signups / counts.clicks) * 8)) : 0;
  const spawnPerSecond = Math.min(48, 12 + Math.log10(1 + counts.clicks) * 10);
  let settled = 0;
  let queued = 0;
  let spawnDebt = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  let fade = 1;
  let pulse = 0;

  function setFixed(i: number, p: Point, look: { s: number; c: THREE.Color; a: number }) {
    pos[i * 3] = p.x;
    pos[i * 3 + 1] = p.y;
    size[i] = look.s;
    color.set([look.c.r, look.c.g, look.c.b], i * 3);
    alpha[i] = look.a;
  }

  function resize(width: number, height: number) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.75, 1.5));
    renderer.setSize(width, height, false);
    camera.right = width;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    pointMat.uniforms.uScale.value = renderer.getPixelRatio();
    layout = layoutTrail(width, height, { audience: AUDIENCE, ledgerRows: counts.signups });
    rest = layout.audience.map((p) => ({ ...p }));
    layout.sources.forEach((p, i) => setFixed(i, p, { s: width < 640 ? 14 : 20, c: INK, a: 1 }));
    (markGeo.attributes.position.array as Float32Array).set(layout.sources.flatMap((p) => [p.x, p.y, 0]));
    markGeo.attributes.position.needsUpdate = true;
    setFixed(3 + AUDIENCE, layout.site, { s: 10, c: INK, a: 0.9 });
    for (let r = 0; r < rows.count; r++) placeRow(r);
  }

  function placeRow(r: number) {
    const L = layout.ledger;
    matrix.makeScale(L.rowWidth, L.rowHeight * 0.55, 1);
    matrix.setPosition(L.x + L.rowWidth / 2 + 10, L.top + r * L.rowHeight, 0);
    rows.setMatrixAt(r, matrix);
    rows.instanceMatrix.needsUpdate = true;
    setFixed(fixed + POOL + r, { x: L.x, y: L.top + r * L.rowHeight }, { s: 7, c: MONEY, a: 1 });
  }

  // the path a click takes, drawn as a polyline of CURVE_STEPS segments
  const a = { x: 0, y: 0 };
  const b = { x: 0, y: 0 };
  function writeCurve(i: number, path: [Point, Point, Point]) {
    let o = i * CURVE_STEPS * 2 * 2 * 3;
    for (let k = 0; k < CURVE_STEPS * 2; k++) {
      bezier(path, k / (CURVE_STEPS * 2), a);
      bezier(path, (k + 1) / (CURVE_STEPS * 2), b);
      edgePos[o++] = a.x; edgePos[o++] = a.y; edgePos[o++] = 0;
      edgePos[o++] = b.x; edgePos[o++] = b.y; edgePos[o++] = 0;
    }
  }

  function spawn() {
    const p = pool.find((q) => !q.active);
    if (!p) return;
    const a = Math.floor(Math.random() * AUDIENCE);
    p.active = true;
    p.t = 0;
    p.speed = 0.55 + Math.random() * 0.45;
    // the column prints its real rows in the first seconds, then sign-ups keep arriving at the real share
    p.signup = settled + queued < layout.ledger.rows ? (queued++, true) : Math.random() < signupShare;
    p.path = [layout.sources[layout.parentOf[a]], layout.audience[a], layout.site];
  }

  function step(dt: number) {
    // the audience leans away from the pointer and springs back
    layout.audience.forEach((p, i) => {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const d = Math.hypot(dx, dy);
      const push = d < POINTER_RADIUS ? ((POINTER_RADIUS - d) / POINTER_RADIUS) * 18 : 0;
      p.x += (rest[i].x + (d ? (dx / d) * push : 0) - p.x) * 0.12;
      p.y += (rest[i].y + (d ? (dy / d) * push : 0) - p.y) * 0.12;
      const lit = d < POINTER_RADIUS ? 0.9 : 0.35;
      setFixed(3 + i, p, { s: 5, c: INK, a: lit * fade });
      writeCurve(i, [layout.sources[layout.parentOf[i]], p, layout.site]);
    });
    edgeGeo.attributes.position.needsUpdate = true;

    spawnDebt += spawnPerSecond * dt;
    while (spawnDebt >= 1) {
      spawn();
      spawnDebt -= 1;
    }
    pool.forEach((p, i) => {
      const idx = fixed + i;
      if (!p.active) {
        alpha[idx] = 0;
        return;
      }
      p.t += p.speed * dt;
      if (p.t >= 1) {
        p.active = false;
        if (p.signup && settled < layout.ledger.rows) {
          placeRow(settled++);
          rows.count = settled;
        }
        if (p.signup) pulse = 1;
        alpha[idx] = 0;
        return;
      }
      bezier(p.path, p.t, tmp);
      setFixed(idx, tmp, { s: p.signup ? 13 : 8, c: p.signup && p.t > 0.35 ? MONEY : INK, a: (p.signup ? 1 : 0.85) * fade });
    });
    for (const name of ["position", "aSize", "aColor", "aAlpha"]) pointGeo.attributes[name].needsUpdate = true;
    pulse = Math.max(0, pulse - dt * 3);
    setFixed(3 + AUDIENCE, layout.site, { s: 12 + pulse * 18, c: pulse > 0.05 ? MONEY : INK, a: fade });
    edges.material.opacity = 0.07 * fade;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (now - last < FRAME_MS - 1) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    renderer.render(scene, camera);
  }

  return {
    resize,
    setPointer(x: number, y: number) {
      pointer.x = x;
      pointer.y = y;
    },
    /** 1 while the hero is in view, easing to 0 as it scrolls away */
    setFade(value: number) {
      fade = value;
    },
    /** a tap sends a handful of clicks at once — the playful bit */
    burst(count = 14) {
      spawnDebt += count;
    },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      cancelAnimationFrame(raf);
      edgeGeo.dispose();
      markGeo.dispose();
      markLine.material.dispose();
      pointGeo.dispose();
      rowGeo.dispose();
      pointMat.dispose();
      rowMat.dispose();
      edges.material.dispose();
      renderer.dispose();
    },
  };
}

export type TrailScene = ReturnType<typeof createTrailScene>;
