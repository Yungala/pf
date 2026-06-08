// Ballpit — Three.js physics-driven sphere field.
// Source: React Bits (https://reactbits.dev) — adapted to plain ES module.
// Original component inspired by Kevin Levron: https://x.com/soju22/status/1858925191671271801

import {
  Vector3 as a,
  MeshPhysicalMaterial as c,
  InstancedMesh as d,
  Clock as e,
  AmbientLight as f,
  BoxGeometry as g,
  ShaderChunk as h,
  Scene as i,
  Color as l,
  Object3D as m,
  SRGBColorSpace as n,
  MathUtils as o,
  PMREMGenerator as p,
  Vector2 as r,
  WebGLRenderer as s,
  PerspectiveCamera as t,
  PointLight as u,
  ACESFilmicToneMapping as v,
  Plane as w,
  Raycaster as y,
  SphereGeometry as SphereGeo,
  Mesh as MeshCls
} from 'three';
import { RoomEnvironment as z } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

class x {
  #e; canvas; camera; cameraMinAspect; cameraMaxAspect; cameraFov;
  maxPixelRatio; minPixelRatio; scene; renderer; #t;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#i;
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  #s = false; #n = false; isDisposed = false;
  #o; #r; #a; #c = new e(); #h = { elapsed: 0, delta: 0 }; #l;
  constructor(e) { this.#e = { ...e }; this.#m(); this.#d(); this.#p(); this.resize(); this.#g(); }
  #m() { this.camera = new t(); this.cameraFov = this.camera.fov; }
  #d() { this.scene = new i(); }
  #p() {
    if (this.#e.canvas) this.canvas = this.#e.canvas;
    else if (this.#e.id) this.canvas = document.getElementById(this.#e.id);
    else console.error('Three: Missing canvas or id parameter');
    this.canvas.style.display = 'block';
    const e = { canvas: this.canvas, powerPreference: 'high-performance', ...(this.#e.rendererOptions ?? {}) };
    this.renderer = new s(e); this.renderer.outputColorSpace = n;
  }
  #g() {
    if (!(this.#e.size instanceof Object)) {
      window.addEventListener('resize', this.#f.bind(this));
      if (this.#e.size === 'parent' && this.canvas.parentNode) {
        this.#r = new ResizeObserver(this.#f.bind(this));
        this.#r.observe(this.canvas.parentNode);
      }
    }
    this.#o = new IntersectionObserver(this.#u.bind(this), { root: null, rootMargin: '0px', threshold: 0 });
    this.#o.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#v.bind(this));
  }
  #y() {
    window.removeEventListener('resize', this.#f.bind(this));
    this.#r?.disconnect(); this.#o?.disconnect();
    document.removeEventListener('visibilitychange', this.#v.bind(this));
  }
  #u(e) { this.#s = e[0].isIntersecting; this.#s ? this.#w() : this.#z(); }
  #v() { if (this.#s) { document.hidden ? this.#z() : this.#w(); } }
  #f() { if (this.#a) clearTimeout(this.#a); this.#a = setTimeout(this.resize.bind(this), 100); }
  resize() {
    let e, t;
    if (this.#e.size instanceof Object) { e = this.#e.size.width; t = this.#e.size.height; }
    else if (this.#e.size === 'parent' && this.canvas.parentNode) { e = this.canvas.parentNode.offsetWidth; t = this.canvas.parentNode.offsetHeight; }
    else { e = window.innerWidth; t = window.innerHeight; }
    this.size.width = e; this.size.height = t; this.size.ratio = e / t;
    this.#x(); this.#b(); this.onAfterResize(this.size);
  }
  #x() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) this.#A(this.cameraMinAspect);
      else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) this.#A(this.cameraMaxAspect);
      else this.camera.fov = this.cameraFov;
    }
    this.camera.updateProjectionMatrix(); this.updateWorldSize();
  }
  #A(e) {
    const t = Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / e);
    this.camera.fov = 2 * o.radToDeg(Math.atan(t));
  }
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const e = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(e / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }
  #b() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#t?.setSize(this.size.width, this.size.height);
    let e = window.devicePixelRatio;
    if (this.maxPixelRatio && e > this.maxPixelRatio) e = this.maxPixelRatio;
    else if (this.minPixelRatio && e < this.minPixelRatio) e = this.minPixelRatio;
    this.renderer.setPixelRatio(e); this.size.pixelRatio = e;
  }
  get postprocessing() { return this.#t; }
  set postprocessing(e) { this.#t = e; this.render = e.render.bind(e); }
  #w() {
    if (this.#n) return;
    const animate = () => {
      this.#l = requestAnimationFrame(animate);
      this.#h.delta = this.#c.getDelta();
      this.#h.elapsed += this.#h.delta;
      this.onBeforeRender(this.#h); this.render(); this.onAfterRender(this.#h);
    };
    this.#n = true; this.#c.start(); animate();
  }
  #z() { if (this.#n) { cancelAnimationFrame(this.#l); this.#n = false; this.#c.stop(); } }
  #i() { this.renderer.render(this.scene, this.camera); }
  clear() {
    this.scene.traverse(e => {
      if (e.isMesh && typeof e.material === 'object' && e.material !== null) {
        Object.keys(e.material).forEach(t => {
          const i = e.material[t];
          if (i !== null && typeof i === 'object' && typeof i.dispose === 'function') i.dispose();
        });
        e.material.dispose(); e.geometry.dispose();
      }
    });
    this.scene.clear();
  }
  dispose() {
    this.#y(); this.#z(); this.clear(); this.#t?.dispose();
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.isDisposed = true;
  }
}

const b = new Map(), A = new r();
let R = false;
function S(e) {
  const t = {
    position: new r(), nPosition: new r(),
    hover: false, touching: false,
    onEnter() {}, onMove() {}, onClick() {}, onLeave() {},
    ...e
  };
  (function (e, t) {
    if (!b.has(e)) {
      b.set(e, t);
      if (!R) {
        document.body.addEventListener('pointermove', M);
        document.body.addEventListener('pointerleave', L);
        document.body.addEventListener('click', C);
        document.body.addEventListener('touchstart', TouchStart, { passive: false });
        document.body.addEventListener('touchmove', TouchMove, { passive: false });
        document.body.addEventListener('touchend', TouchEnd, { passive: false });
        document.body.addEventListener('touchcancel', TouchEnd, { passive: false });
        R = true;
      }
    }
  })(e.domElement, t);
  t.dispose = () => {
    const t = e.domElement; b.delete(t);
    if (b.size === 0) {
      document.body.removeEventListener('pointermove', M);
      document.body.removeEventListener('pointerleave', L);
      document.body.removeEventListener('click', C);
      document.body.removeEventListener('touchstart', TouchStart);
      document.body.removeEventListener('touchmove', TouchMove);
      document.body.removeEventListener('touchend', TouchEnd);
      document.body.removeEventListener('touchcancel', TouchEnd);
      R = false;
    }
  };
  return t;
}
function M(e) { A.x = e.clientX; A.y = e.clientY; processInteraction(); }
function processInteraction() {
  for (const [elem, t] of b) {
    const i = elem.getBoundingClientRect();
    if (D(i)) {
      P(t, i);
      if (!t.hover) { t.hover = true; t.onEnter(t); }
      t.onMove(t);
    } else if (t.hover && !t.touching) { t.hover = false; t.onLeave(t); }
  }
}
function C(e) {
  A.x = e.clientX; A.y = e.clientY;
  for (const [elem, t] of b) {
    const i = elem.getBoundingClientRect();
    P(t, i); if (D(i)) t.onClick(t);
  }
}
function L() { for (const t of b.values()) if (t.hover) { t.hover = false; t.onLeave(t); } }
function TouchStart(e) {
  if (e.touches.length > 0) {
    e.preventDefault(); A.x = e.touches[0].clientX; A.y = e.touches[0].clientY;
    for (const [elem, t] of b) {
      const rect = elem.getBoundingClientRect();
      if (D(rect)) {
        t.touching = true; P(t, rect);
        if (!t.hover) { t.hover = true; t.onEnter(t); }
        t.onMove(t);
      }
    }
  }
}
function TouchMove(e) {
  if (e.touches.length > 0) {
    e.preventDefault(); A.x = e.touches[0].clientX; A.y = e.touches[0].clientY;
    for (const [elem, t] of b) {
      const rect = elem.getBoundingClientRect();
      P(t, rect);
      if (D(rect)) {
        if (!t.hover) { t.hover = true; t.touching = true; t.onEnter(t); }
        t.onMove(t);
      } else if (t.hover && t.touching) t.onMove(t);
    }
  }
}
function TouchEnd() {
  for (const [, t] of b) {
    if (t.touching) { t.touching = false; if (t.hover) { t.hover = false; t.onLeave(t); } }
  }
}
function P(e, t) {
  const { position: i, nPosition: s } = e;
  i.x = A.x - t.left; i.y = A.y - t.top;
  s.x = (i.x / t.width) * 2 - 1; s.y = (-i.y / t.height) * 2 + 1;
}
function D(e) {
  const { x: t, y: i } = A;
  const { left: s, top: n, width: o, height: r } = e;
  return t >= s && t <= s + o && i >= n && i <= n + r;
}

const { randFloat: k, randFloatSpread: E } = o;
const F = new a(), I = new a(), O = new a(), V = new a(), B = new a();
const N = new a(), _ = new a(), j = new a(), H = new a(), T = new a();

class W {
  constructor(e) {
    this.config = e;
    this.positionData = new Float32Array(3 * e.count).fill(0);
    this.velocityData = new Float32Array(3 * e.count).fill(0);
    this.sizeData = new Float32Array(e.count).fill(1);
    this.center = new a();
    this.#R(); this.setSizes();
  }
  #R() {
    const { config: e, positionData: t } = this;
    this.center.toArray(t, 0);
    for (let i = 1; i < e.count; i++) {
      const s = 3 * i;
      t[s] = E(2 * e.maxX); t[s + 1] = E(2 * e.maxY); t[s + 2] = E(2 * e.maxZ);
    }
  }
  setSizes() {
    const { config: e, sizeData: t } = this;
    t[0] = e.size0;
    for (let i = 1; i < e.count; i++) t[i] = k(e.minSize, e.maxSize);
  }
  update(e) {
    const { config: t, center: i, positionData: s, sizeData: n, velocityData: o } = this;
    let r = 0;
    if (t.controlSphere0) {
      r = 1; F.fromArray(s, 0); F.lerp(i, 0.1).toArray(s, 0);
      V.set(0, 0, 0).toArray(o, 0);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base); B.fromArray(o, base);
      B.y -= e.delta * t.gravity * n[idx];
      B.multiplyScalar(t.friction); B.clampLength(0, t.maxVelocity);
      I.add(B); I.toArray(s, base); B.toArray(o, base);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base); B.fromArray(o, base);
      const radius = n[idx];
      for (let jdx = idx + 1; jdx < t.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(s, otherBase); N.fromArray(o, otherBase);
        const otherRadius = n[jdx];
        _.copy(O).sub(I);
        const dist = _.length(); const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(_).normalize().multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j); B.sub(H); I.toArray(s, base); B.toArray(o, base);
          O.add(j); N.add(T); O.toArray(s, otherBase); N.toArray(o, otherBase);
        }
      }
      if (t.controlSphere0) {
        _.copy(F).sub(I);
        const dist = _.length(); const sumRadius0 = radius + n[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          j.copy(_.normalize()).multiplyScalar(diff);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j); B.sub(H);
        }
      }
      if (Math.abs(I.x) + radius > t.maxX) { I.x = Math.sign(I.x) * (t.maxX - radius); B.x = -B.x * t.wallBounce; }
      if (t.gravity === 0) {
        if (Math.abs(I.y) + radius > t.maxY) { I.y = Math.sign(I.y) * (t.maxY - radius); B.y = -B.y * t.wallBounce; }
      } else if (I.y - radius < -t.maxY) { I.y = -t.maxY + radius; B.y = -B.y * t.wallBounce; }
      const maxBoundary = Math.max(t.maxZ, t.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) { I.z = Math.sign(I.z) * (t.maxZ - radius); B.z = -B.z * t.wallBounce; }
      I.toArray(s, base); B.toArray(o, base);
    }
  }
}

class Y extends c {
  constructor(e) {
    super(e);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
      // Per-cube film grain — animated screen-space noise added to each cube's
      // rendered pixels (uGrainTime is stepped per frame from the render loop).
      uGrainTime: { value: 0 },
      uGrainStrength: { value: 0.04 }
    };
    this.defines.USE_UV = '';
    this.onBeforeCompile = e => {
      Object.assign(e.uniforms, this.uniforms);
      e.fragmentShader =
        '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n        uniform float uGrainTime;\n        uniform float uGrainStrength;\n        float grainHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }\n      ' +
        e.fragmentShader;
      e.fragmentShader = e.fragmentShader.replace(
        'void main() {',
        '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
      );
      const t = h.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
      );
      e.fragmentShader = e.fragmentShader.replace('#include <lights_fragment_begin>', t);
      // Add animated film grain to each cube's final color (after dithering).
      e.fragmentShader = e.fragmentShader.replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\n        {\n          float gr = (grainHash(gl_FragCoord.xy + vec2(uGrainTime, uGrainTime * 1.37)) - 0.5) * uGrainStrength;\n          gl_FragColor.rgb += gr;\n        }'
      );
      if (this.onBeforeCompile2) this.onBeforeCompile2(e);
    };
  }
}

const X = {
  count: 200, colors: [0, 0, 0],
  ambientColor: 16777215, ambientIntensity: 1, lightIntensity: 200,
  materialParams: { metalness: 0.5, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.15 },
  minSize: 0.5, maxSize: 1, size0: 1,
  gravity: 0.5, friction: 0.9975, wallBounce: 0.95,
  maxVelocity: 0.15, maxX: 5, maxY: 5, maxZ: 2,
  controlSphere0: false, followCursor: true
};

const U = new m();

class Z extends d {
  constructor(e, t = {}) {
    const i = { ...X, ...t };
    const s = new z();
    const n = new p(e, 0.04).fromScene(s).texture;
    // Rounded cubes — size matched to original unit sphere's bounding diameter;
    // radius is in world units (cube edge = 1.4, so 0.15 ≈ a soft "r-ish" corner).
    const o = new RoundedBoxGeometry(1.4, 1.4, 1.4, 4, 0.15);
    const r = new Y({ envMap: n, ...i.materialParams });
    r.envMapRotation.x = -Math.PI / 2;
    super(o, r, i.count);
    this.config = i; this.physics = new W(i);
    // Per-instance random orientation (Euler angles) + slow tumble axis.
    this.rotations = new Float32Array(3 * i.count);
    this.spins = new Float32Array(3 * i.count);
    for (let idx = 0; idx < i.count; idx++) {
      const base = 3 * idx;
      this.rotations[base]     = Math.random() * Math.PI * 2;
      this.rotations[base + 1] = Math.random() * Math.PI * 2;
      this.rotations[base + 2] = Math.random() * Math.PI * 2;
      this.spins[base]     = (Math.random() - 0.5) * 0.6;
      this.spins[base + 1] = (Math.random() - 0.5) * 0.6;
      this.spins[base + 2] = (Math.random() - 0.5) * 0.6;
    }
    // Per-instance visual scale multiplier (1 = normal). Used by the load-in
    // "grow" intro so cubes can bloom from 0 → 1 without touching the physics
    // sizes (collisions/positions stay computed at full size).
    this.introScale = new Float32Array(i.count).fill(1);
    this.#S(); this.setColors(i.colors);
  }
  #S() {
    this.ambientLight = new f(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new u(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  setColors(e) {
    if (Array.isArray(e) && e.length > 1) {
      const t = (function (e) {
        let t, i;
        function setColors(e) { t = e; i = []; t.forEach(col => { i.push(new l(col)); }); }
        setColors(e);
        return {
          setColors,
          getColorAt: function (ratio, out = new l()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (t.length - 1);
            const idx = Math.floor(scaled);
            const start = i[idx];
            if (idx >= t.length - 1) return start.clone();
            const alpha = scaled - idx; const end = i[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          }
        };
      })(e);
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, t.getColorAt(idx / this.count));
        if (idx === 0) this.light.color.copy(t.getColorAt(idx / this.count));
      }
      this.instanceColor.needsUpdate = true;
    }
  }
  update(e) {
    this.physics.update(e);
    for (let idx = 0; idx < this.count; idx++) {
      const base = 3 * idx;
      U.position.fromArray(this.physics.positionData, base);
      U.scale.setScalar(this.physics.sizeData[idx] * this.introScale[idx]);
      // Tumble each cube on its random axis.
      this.rotations[base]     += this.spins[base]     * e.delta;
      this.rotations[base + 1] += this.spins[base + 1] * e.delta;
      this.rotations[base + 2] += this.spins[base + 2] * e.delta;
      U.rotation.set(this.rotations[base], this.rotations[base + 1], this.rotations[base + 2]);
      U.updateMatrix();
      this.setMatrixAt(idx, U.matrix);
      if (idx === 0) this.light.position.copy(U.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

export function createBallpit(canvasEl, opts = {}) {
  const ctx = new x({
    canvas: canvasEl, size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  let spheres;
  ctx.renderer.toneMapping = v;
  ctx.camera.position.set(0, 0, 20);
  ctx.camera.lookAt(0, 0, 0);
  ctx.cameraMaxAspect = 1.5;
  ctx.resize();
  init(opts);

  // ---------- Drag-to-pick a cube ----------
  const ray = new y();
  const ndc = new r();
  const dragPlane = new w(new a(0, 0, 1), 0);
  const dragHit = new a();
  const dragOffset = new a();
  const dragTarget = new a();
  let draggedIdx = -1;
  let paused = false;
  // Programmatic ("auto") drag — used by the text-guard animation in the page.
  let autoIdx = -1;
  const autoTarget = new a();
  const _v = new a();
  let onManualRelease = () => {};
  let interactive = true;   // when false, pointer-drag is disabled (e.g. touch devices)
  const grainStill = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Load-in "grow" intro state ----
  let introStart = -1;        // performance.now() when the intro began (-1 = inactive)
  let introDur = 850;         // per-cube grow duration (ms)
  let introDelays = null;     // per-cube start offset (ms) for the staggered bloom
  let introMaxDelay = 0;
  // Soft overshoot so cubes "settle" rather than snap — gentle, not a hard pop.
  const easeOutBack = (t) => { const s = 1.32; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
  function advanceIntro() {
    const now = performance.now();
    const n = spheres.count;
    let allDone = true;
    for (let i = 0; i < n; i++) {
      const t = (now - introStart - introDelays[i]) / introDur;
      let v;
      if (t <= 0) { v = 0; allDone = false; }
      else if (t >= 1) { v = 1; }
      else { v = Math.max(0, easeOutBack(t)); allDone = false; }
      spheres.introScale[i] = v;
    }
    if (allDone) introStart = -1;
  }

  // ---- Load-in "slide-in" intro: cubes start just outside the canvas and are
  // pushed into their resting positions. Positions are driven entirely by this
  // animation (overriding physics) until every cube has arrived. ----
  let slideStart = -1;        // performance.now() when the slide began (-1 = inactive)
  let slideDur = 900;         // per-cube travel duration (ms)
  let slideDelays = null;     // per-cube start offset (ms) for a staggered push-in
  let slideFrom = null;       // Float32Array(n*3) off-canvas start positions
  let slideTo = null;         // Float32Array(n*3) resting target positions
  const slideVec = new a();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  function advanceSlide() {
    const now = performance.now();
    const n = spheres.count;
    let allDone = true;
    for (let i = 0; i < n; i++) {
      let t = (now - slideStart - slideDelays[i]) / slideDur;
      // Hand each cube to physics the MOMENT it arrives — don't hold the whole
      // field pinned until the last one lands, or every built-up overlap would
      // resolve in a single frame and "pop". Per-cube release spreads the gentle
      // collision settling across the full stagger window.
      if (t >= 1) continue;
      allDone = false;
      if (t < 0) t = 0;
      const k = easeOutCubic(t);
      const b = 3 * i;
      slideVec.set(
        slideFrom[b]     + (slideTo[b]     - slideFrom[b])     * k,
        slideFrom[b + 1] + (slideTo[b + 1] - slideFrom[b + 1]) * k,
        slideFrom[b + 2] + (slideTo[b + 2] - slideFrom[b + 2]) * k
      );
      pinCube(i, slideVec);   // force the position; zeroes velocity too
    }
    if (allDone) slideStart = -1;
  }

  // ---- Load-in "flow-in" intro: cubes start just OUTSIDE the visible canvas and
  // fly inward under their own momentum while the physics walls, temporarily
  // widened, ease back to the visible bounds. Physics runs live the whole time, so
  // cubes never lock to fixed targets — they pour in and keep drifting naturally. ----
  let flowStart = -1;         // performance.now() when the flow began (-1 = inactive)
  let flowDur = 1700;         // wall ease-in duration (ms)
  let flowFromMaxX = 0, flowFromMaxY = 0, flowToMaxX = 0, flowToMaxY = 0;
  let flowVelFrom = 0, flowVelTo = 0, flowVelDur = 700;   // speed-cap ramp (fast → normal)
  function advanceFlow() {
    const now = performance.now();
    const t = Math.min(1, (now - flowStart) / flowDur);
    const k = 1 - Math.pow(1 - t, 3);   // easeOutCubic — walls ease back to visible bounds
    spheres.config.maxX = flowFromMaxX + (flowToMaxX - flowFromMaxX) * k;
    spheres.config.maxY = flowFromMaxY + (flowToMaxY - flowFromMaxY) * k;
    // Speed cap starts boosted and decays back to normal over flowVelDur, so the
    // cubes rush in fast for the first fraction of a second then visibly slow down.
    const tv = Math.min(1, (now - flowStart) / flowVelDur);
    const kv = 1 - Math.pow(1 - tv, 3);
    spheres.config.maxVelocity = flowVelFrom + (flowVelTo - flowVelFrom) * kv;
    if (t >= 1) { spheres.config.maxVelocity = flowVelTo; flowStart = -1; }
  }

  canvasEl.style.touchAction = 'none';
  canvasEl.style.userSelect = 'none';
  canvasEl.style.webkitUserSelect = 'none';

  function setNDC(clientX, clientY) {
    const rect = canvasEl.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }
  function pickInstance(clientX, clientY) {
    setNDC(clientX, clientY);
    ray.setFromCamera(ndc, ctx.camera);
    // The cached InstancedMesh bounding sphere goes stale as cubes move,
    // which causes three.js's broad-phase to drop edge clicks before any
    // per-instance test runs. Invalidate so it recomputes from current positions.
    spheres.boundingSphere = null;
    const hits = ray.intersectObject(spheres);
    return hits.length > 0 ? hits[0] : null;
  }
  function onPointerDown(ev) {
    if (!interactive) return;
    const hit = pickInstance(ev.clientX, ev.clientY);
    if (!hit || hit.instanceId === undefined) return;
    draggedIdx = hit.instanceId;
    const base = 3 * draggedIdx;
    // Drag plane parallel to camera-XY, sitting at the cube's current z.
    dragPlane.set(new a(0, 0, 1), -spheres.physics.positionData[base + 2]);
    ray.ray.intersectPlane(dragPlane, dragHit);
    dragOffset.set(
      spheres.physics.positionData[base]     - dragHit.x,
      spheres.physics.positionData[base + 1] - dragHit.y,
      0
    );
    dragTarget.set(
      spheres.physics.positionData[base],
      spheres.physics.positionData[base + 1],
      spheres.physics.positionData[base + 2]
    );
    spheres.physics.velocityData[base]     = 0;
    spheres.physics.velocityData[base + 1] = 0;
    spheres.physics.velocityData[base + 2] = 0;
    canvasEl.style.cursor = 'grabbing';
    try { canvasEl.setPointerCapture(ev.pointerId); } catch (_) {}
  }
  function onPointerMove(ev) {
    if (draggedIdx < 0) {
      // Hover affordance — grab when over a cube, default otherwise.
      const hit = pickInstance(ev.clientX, ev.clientY);
      canvasEl.style.cursor = hit ? 'grab' : 'default';
      return;
    }
    setNDC(ev.clientX, ev.clientY);
    ray.setFromCamera(ndc, ctx.camera);
    ray.ray.intersectPlane(dragPlane, dragHit);
    dragTarget.x = dragHit.x + dragOffset.x;
    dragTarget.y = dragHit.y + dragOffset.y;
  }
  function onPointerUp(ev) {
    if (draggedIdx < 0) return;
    const released = draggedIdx;
    draggedIdx = -1;
    canvasEl.style.cursor = 'default';
    try { canvasEl.releasePointerCapture?.(ev.pointerId); } catch (_) {}
    onManualRelease(released);
  }
  function onPointerLeave() {
    if (draggedIdx < 0) canvasEl.style.cursor = 'default';
  }
  canvasEl.addEventListener('pointerdown', onPointerDown);
  canvasEl.addEventListener('pointermove', onPointerMove);
  canvasEl.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('pointerup', onPointerUp);
  canvasEl.addEventListener('pointercancel', onPointerUp);
  // -----------------------------------------

  function init(o) {
    if (spheres) { ctx.clear(); ctx.scene.remove(spheres); }
    spheres = new Z(ctx.renderer, o);
    // No cursor-driven sphere — the cursor only drags individual cubes now.
    spheres.config.controlSphere0 = false;
    ctx.scene.add(spheres);
  }

  // Pins one cube (manual OR auto drag) to a target world position and refreshes its matrix.
  function pinCube(idx, target) {
    const base = 3 * idx;
    spheres.physics.positionData[base]     = target.x;
    spheres.physics.positionData[base + 1] = target.y;
    spheres.physics.positionData[base + 2] = target.z;
    spheres.physics.velocityData[base]     = 0;
    spheres.physics.velocityData[base + 1] = 0;
    spheres.physics.velocityData[base + 2] = 0;
    U.position.copy(target);
    U.scale.setScalar(spheres.physics.sizeData[idx] * spheres.introScale[idx]);
    U.rotation.set(
      spheres.rotations[base],
      spheres.rotations[base + 1],
      spheres.rotations[base + 2]
    );
    U.updateMatrix();
    spheres.setMatrixAt(idx, U.matrix);
    spheres.instanceMatrix.needsUpdate = true;
  }

  // After physics, pin the dragged cube(s) to their target and refresh matrices.
  ctx.onBeforeRender = (e) => {
    if (introStart >= 0) advanceIntro();   // ramp intro scales BEFORE update writes matrices
    if (flowStart >= 0) advanceFlow();     // ease the widened walls back BEFORE physics
    if (!paused) spheres.update(e);
    // Step the per-cube film grain (~12 fps so it flickers like real grain).
    // Frozen for users who prefer reduced motion (grain texture still shows, just static).
    const gu = spheres.material && spheres.material.uniforms;
    if (gu && gu.uGrainTime) {
      gu.uGrainTime.value = grainStill ? 1.0 : (Math.floor(e.elapsed * 12) % 1000) * 1.13 + 1.0;
    }
    if (draggedIdx >= 0) pinCube(draggedIdx, dragTarget);
    if (autoIdx >= 0 && autoIdx !== draggedIdx) pinCube(autoIdx, autoTarget);
    if (slideStart >= 0) advanceSlide();   // drive the off-canvas push-in last
  };
  ctx.onAfterResize = (sz) => { spheres.config.maxX = sz.wWidth / 2; spheres.config.maxY = sz.wHeight / 2; };

  // ---- Projection / programmatic-drag helpers (used by the page's text-guard) ----
  function instanceWorld(idx) {
    const base = 3 * idx;
    return {
      x: spheres.physics.positionData[base],
      y: spheres.physics.positionData[base + 1],
      z: spheres.physics.positionData[base + 2]
    };
  }
  // World point → client (CSS px) coords, plus on-screen radius of the cube.
  function projectInstance(idx) {
    const rect = canvasEl.getBoundingClientRect();
    const w = instanceWorld(idx);
    _v.set(w.x, w.y, w.z).project(ctx.camera);
    const cx = rect.left + (_v.x * 0.5 + 0.5) * rect.width;
    const cy = rect.top + (-_v.y * 0.5 + 0.5) * rect.height;
    // radius: project a point offset by the cube's world size, measure pixel delta
    const sz = spheres.physics.sizeData[idx];
    _v.set(w.x + sz, w.y, w.z).project(ctx.camera);
    const ex = rect.left + (_v.x * 0.5 + 0.5) * rect.width;
    return { x: cx, y: cy, z: w.z, r: Math.abs(ex - cx) };
  }
  // Client (CSS px) coords → world point on the plane z = depth.
  function clientToWorld(clientX, clientY, depth = 0) {
    setNDC(clientX, clientY);
    ray.setFromCamera(ndc, ctx.camera);
    const pl = new w(new a(0, 0, 1), -depth);
    const out = new a();
    ray.ray.intersectPlane(pl, out);
    return out;
  }

  return {
    three: ctx,
    get spheres() { return spheres; },
    setCount(n) { init({ ...spheres.config, count: n }); },
    // Bloom all cubes in from scale 0 with a staggered, lightly-overshooting grow.
    playIntro({ duration = 850, stagger = 700 } = {}) {
      const n = spheres.count;
      introDelays = new Float32Array(n);
      introMaxDelay = 0;
      for (let i = 0; i < n; i++) {
        // Random stagger so cubes twinkle in organically instead of as a block.
        const d = Math.random() * stagger;
        introDelays[i] = d;
        if (d > introMaxDelay) introMaxDelay = d;
        spheres.introScale[i] = 0;
      }
      introDur = duration;
      introStart = performance.now();
    },
    // Pour the cubes in from just OUTSIDE the visible canvas: widen the physics
    // walls, drop each cube off-screen with an inward velocity, then ease the walls
    // back to the visible bounds while physics runs live. No fixed targets, no
    // pinning — cubes flow in and keep drifting, so nothing "locks into place".
    playFlowIn({ duration = 1700, expand = 1.9, boost = 4.5, velRamp = 700 } = {}) {
      const n = spheres.count;
      const cfg = spheres.config;
      const maxZ = cfg.maxZ || 2;
      // remember the visible bounds (the walls ease back to these), then widen them
      flowToMaxX = cfg.maxX; flowToMaxY = cfg.maxY;
      flowFromMaxX = cfg.maxX * expand; flowFromMaxY = cfg.maxY * expand;
      cfg.maxX = flowFromMaxX; cfg.maxY = flowFromMaxY;
      // speed cap: start boosted for a fast inrush, decay back to normal so the
      // cubes pour in quickly then slow down as they fill the frame.
      flowVelTo = cfg.maxVelocity;
      flowVelFrom = cfg.maxVelocity * boost;
      flowVelDur = velRamp;
      cfg.maxVelocity = flowVelFrom;
      const seedSpeed = flowVelFrom * 0.92;
      const pos = spheres.physics.positionData, vel = spheres.physics.velocityData;
      for (let i = 0; i < n; i++) {
        const b = 3 * i;
        // seed just past the visible edge (within the widened walls): pick a
        // direction, project it onto the visible rectangle, push a bit beyond.
        const ang = Math.random() * Math.PI * 2;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const edge = 1 / Math.max(Math.abs(dx) / flowToMaxX, Math.abs(dy) / flowToMaxY);
        const r = edge * (1.06 + Math.random() * 0.55);   // 1.06–1.6× past the edge
        pos[b]     = dx * r;
        pos[b + 1] = dy * r;
        pos[b + 2] = (Math.random() - 0.5) * 2 * maxZ;
        // aim at a random point inside the visible area (not dead centre, so the
        // cubes don't all pile up in the middle) and head there fast at first
        const tx = (Math.random() * 2 - 1) * flowToMaxX * 0.75;
        const ty = (Math.random() * 2 - 1) * flowToMaxY * 0.75;
        let vx = tx - pos[b], vy = ty - pos[b + 1];
        const vl = Math.hypot(vx, vy) || 1;
        vel[b]     = (vx / vl) * seedSpeed;
        vel[b + 1] = (vy / vl) * seedSpeed;
        vel[b + 2] = 0;
        spheres.introScale[i] = 1;   // full size for the whole flow
      }
      flowDur = duration;
      flowStart = performance.now();
    },
    // Slide every cube in from just outside the canvas to where it currently sits.
    // Reads the cubes' present positions as the targets (call AFTER arranging them),
    // then offsets each start point radially outward past the nearest edge so the
    // field looks pushed into frame. Cubes are full-size for the whole slide.
    playSlideIn({ duration = 950, stagger = 650, distance, settleSteps = 200 } = {}) {
      const n = spheres.count;
      const cfg = spheres.config;
      const maxX = cfg.maxX || 6, maxY = cfg.maxY || 5;
      const pos = spheres.physics.positionData, vel = spheres.physics.velocityData;

      // Pre-settle so the slide TARGETS are collision-free. The arranged ring packs
      // cubes with deep overlap; sliding onto overlapping targets and then releasing
      // to physics resolves every overlap in ONE frame — the field "pops" apart.
      // Run the solver now with strong damping so the cubes relax apart into an even,
      // organic, non-overlapping scatter (centre included) that hands off to physics
      // with no jolt — a smooth dispersal instead of a sudden pop.
      if (settleSteps > 0) {
        const ev = { delta: 1 / 60, elapsed: 0 };
        for (let s = 0; s < settleSteps; s++) {
          ev.elapsed += ev.delta;
          spheres.update(ev);
          for (let i = 0; i < vel.length; i++) vel[i] *= 0.88;   // bleed off energy
        }
        for (let i = 0; i < vel.length; i++) vel[i] = 0;   // freeze the settled layout
      }

      const push = distance || (Math.max(maxX, maxY) * 1.7);
      slideDelays = new Float32Array(n);
      slideFrom = new Float32Array(n * 3);
      slideTo = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const b = 3 * i;
        const tx = pos[b], ty = pos[b + 1], tz = pos[b + 2];
        slideTo[b] = tx; slideTo[b + 1] = ty; slideTo[b + 2] = tz;
        // push the start point out past the nearest edge, along the cube's
        // direction from centre (cubes are arranged in a perimeter ring).
        const len = Math.hypot(tx, ty) || 1;
        const dx = tx / len, dy = ty / len;
        slideFrom[b]     = tx + dx * push;
        slideFrom[b + 1] = ty + dy * push;
        slideFrom[b + 2] = tz;
        slideDelays[i] = Math.random() * stagger;
        spheres.introScale[i] = 1;        // full size for the whole slide
        // seed the cube off-canvas so frame 1 already shows it outside the view
        pos[b] = slideFrom[b]; pos[b + 1] = slideFrom[b + 1];
        vel[b] = vel[b + 1] = vel[b + 2] = 0;
      }
      slideDur = duration;
      slideStart = performance.now();
    },
    togglePause() { paused = !paused; },
    get count() { return spheres.physics.sizeData.length; },
    projectInstance,
    clientToWorld,
    grabCube(idx) {
      autoIdx = idx;
      const base = 3 * idx;
      autoTarget.set(
        spheres.physics.positionData[base],
        spheres.physics.positionData[base + 1],
        spheres.physics.positionData[base + 2]
      );
    },
    setCubeTarget(x, y, z) { autoTarget.set(x, y, z); },
    releaseCube() { autoIdx = -1; },
    get autoGrabbed() { return autoIdx; },
    get manualGrabbed() { return draggedIdx; },
    set onManualRelease(fn) { onManualRelease = typeof fn === 'function' ? fn : () => {}; },
    set interactive(v) { interactive = !!v; },
    get interactive() { return interactive; },
    // Return the instance index under a screen point, or -1.
    pickAt(clientX, clientY) {
      const hit = pickInstance(clientX, clientY);
      return hit && hit.instanceId !== undefined ? hit.instanceId : -1;
    },
    // Give a cube a velocity impulse (a light tap/flick).
    bumpCube(idx, vx, vy, vz = 0) {
      const b = 3 * idx;
      spheres.physics.velocityData[b]     += vx;
      spheres.physics.velocityData[b + 1] += vy;
      spheres.physics.velocityData[b + 2] += vz;
    },
    dispose() {
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      canvasEl.removeEventListener('pointermove', onPointerMove);
      canvasEl.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerup', onPointerUp);
      canvasEl.removeEventListener('pointercancel', onPointerUp);
      ctx.dispose();
    }
  };
}
