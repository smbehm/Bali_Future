/**
 * TreeBackground.tsx
 *
 * Procedural 3D growing tree as a fixed fullscreen background.
 * Inspired by gregtatum/growth (https://github.com/gregtatum/growth)
 *
 * Behavior:
 *   - Auto-grows from seedling → full tree over 4 seconds on page load
 *   - Scroll down: reveals denser foliage + orbits camera around tree
 *
 * Integration (drop into src/components/TreeBackground.tsx):
 *   1. npm install three @types/three
 *   2. import TreeBackground from './components/TreeBackground'
 *   3. Place <TreeBackground /> as FIRST child of your root layout element
 *   4. Ensure content containers have:  position: relative; z-index: 1
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── Tree tuning ──────────────────────────────────────────────────────────────
const MAX_DEPTH         = 6;       // recursion levels (trunk = 0)
const TRUNK_LENGTH      = 2.4;     // world units
const TRUNK_RADIUS      = 0.13;
const LEN_FACTOR        = 0.700;   // child length ratio per level
const RAD_FACTOR        = 0.620;   // child radius ratio per level
const SPREAD_ANGLE      = 0.52;    // radians outward lean per child
const BRANCH_COUNT      = [3, 3, 2, 2, 2, 2] as const; // children per depth level
const AUTOGROW_SECS     = 4.0;
const SCROLL_GROW_BONUS = 0.38;    // max extra growth fraction from scroll
const ORBIT_RADIANS     = Math.PI * 1.30; // camera arc on full scroll (~234°)

// ─── Types ────────────────────────────────────────────────────────────────────
interface TreeNode {
  pivot:       THREE.Object3D;
  mesh:        THREE.Mesh;
  isLeaf:      boolean;
  revealTime:  number;   // 0..1, BFS order
  growScale:   number;   // current animated value
  baseRotX:    number;
  baseRotZ:    number;
  windPhase:   number;
  windFreq:    number;
  windAmp:     number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04090F);
    scene.fog = new THREE.FogExp2(0x04090F, 0.026);

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      56,
      window.innerWidth / window.innerHeight,
      0.1, 80
    );
    // Start slightly off-axis for visual interest
    camera.position.set(0.6, 1.8, 9.2);
    camera.lookAt(0, 4.8, 0);

    // ── Lighting ─────────────────────────────────────────────────────────────
    // Low ambient — night scene
    scene.add(new THREE.AmbientLight(0x172640, 0.65));

    // Warm amber ground fill — campfire / lantern feel
    const warmLight = new THREE.PointLight(0xFF9922, 2.8, 16);
    warmLight.position.set(1.2, 0.3, 3.5);
    scene.add(warmLight);

    // Cool jade canopy fill
    const coolLight = new THREE.PointLight(0x00DDAA, 1.6, 24);
    coolLight.position.set(-2.8, 8.0, 2.0);
    scene.add(coolLight);

    // Subtle backlight
    const rimLight = new THREE.DirectionalLight(0xFFDDCC, 0.45);
    rimLight.position.set(4, 12, -3);
    scene.add(rimLight);

    // ── Ground disc ───────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 56),
      new THREE.MeshLambertMaterial({ color: 0x050C05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    scene.add(ground);

    // ── Shared materials (bark by depth band, leaves) ─────────────────────────
    const BARK_COLS   = [0x6E3E1C, 0x7E4E28, 0x8E5E30] as const;
    const BARK_EMIS   = [0x1E0A04, 0x200C06, 0x220E08] as const;
    const barkMats    = BARK_COLS.map((c, i) =>
      new THREE.MeshLambertMaterial({ color: c, emissive: BARK_EMIS[i] })
    );

    const leafMat = new THREE.MeshLambertMaterial({
      color:    0x1A5C28,
      emissive: 0x0A2210,
      transparent: true,
      opacity:  0.86,
    });

    const barkAt = (d: number) => barkMats[Math.min(d, barkMats.length - 1)];

    // ── Tree generation (gregtatum-style: all geometry pre-built, BFS-ordered) ─
    const allNodes: TreeNode[] = [];

    function buildBranch(
      parent: THREE.Object3D,
      depth:  number,
      len:    number,
      rad:    number,
      rotX:   number,
      rotY:   number,
      queue:  TreeNode[]
    ): void {
      if (depth > MAX_DEPTH) return;

      const isLeaf = depth === MAX_DEPTH;

      // Pivot anchored at parent tip; rotation tilts branch outward
      const pivot = new THREE.Object3D();
      pivot.rotation.set(rotX, rotY, 0, 'YXZ');
      parent.add(pivot);

      let mesh: THREE.Mesh;

      if (isLeaf) {
        // Leaf cluster — sphere, grows uniformly
        const geo = new THREE.SphereGeometry(len * 1.35, 7, 5);
        mesh = new THREE.Mesh(geo, leafMat);
        mesh.scale.setScalar(0);
      } else {
        // Branch cylinder — base at Y=0, tip at Y=len
        const segs = depth < 2 ? 8 : 6;
        const geo  = new THREE.CylinderGeometry(rad * 0.62, rad, len, segs, 1);
        geo.translate(0, len / 2, 0); // pivot at base
        mesh = new THREE.Mesh(geo, barkAt(depth));
        mesh.scale.y = 0;
      }

      pivot.add(mesh);

      const node: TreeNode = {
        pivot,
        mesh,
        isLeaf,
        revealTime: 0,       // assigned below after BFS ordering
        growScale:  0,
        baseRotX:   rotX,
        baseRotZ:   0,
        windPhase:  Math.random() * Math.PI * 2,
        windFreq:   0.35 + Math.random() * 1.0,
        // deeper branches sway more; all zero at reveal
        windAmp:    (0.012 + (depth / MAX_DEPTH) * 0.055) * (0.7 + Math.random() * 0.6),
      };

      queue.push(node);
      allNodes.push(node);

      if (isLeaf) return; // leaf nodes don't sprout children

      /*
       * gregtatum approach: create a "tip" object that is a child of the
       * scaled mesh.  When mesh.scale.y animates 0→1, tip moves upward with
       * the growing branch end, so all children are always attached to the
       * correct world position.
       */
      const tip = new THREE.Object3D();
      tip.position.y = len;
      mesh.add(tip); // tip.worldY = mesh.worldY + scale.y * len  ✓

      const numKids = BRANCH_COUNT[Math.min(depth, BRANCH_COUNT.length - 1)];
      for (let i = 0; i < numKids; i++) {
        const az  = ((Math.PI * 2) / numKids) * i
                  + 0.75 + (Math.random() - 0.5) * 0.45;
        const pol = SPREAD_ANGLE * (1 + depth * 0.07)
                  + (Math.random() - 0.5) * 0.13;
        const kLen = len * LEN_FACTOR * (0.86 + Math.random() * 0.28);
        const kRad = rad * RAD_FACTOR;
        buildBranch(tip, depth + 1, kLen, kRad, pol, az, queue);
      }
    }

    const treeRoot = new THREE.Object3D();
    scene.add(treeRoot);

    const bfsQueue: TreeNode[] = [];
    buildBranch(treeRoot, 0, TRUNK_LENGTH, TRUNK_RADIUS, 0, 0, bfsQueue);

    // BFS order maps directly to load order → natural growth from trunk outward
    const total = Math.max(bfsQueue.length - 1, 1);
    bfsQueue.forEach((n, i) => { n.revealTime = i / total; });

    // ── Firefly particles ─────────────────────────────────────────────────────
    const N   = 260;
    const pos = new Float32Array(N * 3);
    const vel: [number, number, number][] = [];

    for (let i = 0; i < N; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = Math.random() * 13;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 11;
      vel.push([
        (Math.random() - 0.5) * 0.0045,
        0.0015 + Math.random() * 0.007,
        (Math.random() - 0.5) * 0.0035,
      ]);
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const pMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color:      0xFFDE60,
      size:       0.058,
      transparent: true,
      opacity:    0.72,
      blending:   THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(pMesh);

    // ── Animation state ───────────────────────────────────────────────────────
    const t0       = performance.now();
    let lastT      = t0;
    let scrollFrac = 0;
    let camAz      = 0;   // current camera azimuth (smoothed)

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollFrac = max > 1 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Easing ────────────────────────────────────────────────────────────────
    const easeOutExpo = (t: number) =>
      t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const smoothstep = (t: number) => {
      const c = Math.max(0, Math.min(1, t));
      return c * c * (3 - 2 * c);
    };

    // ── Render loop ───────────────────────────────────────────────────────────
    let raf: number;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const now     = performance.now();
      const elapsed = (now - t0) / 1000;
      const dt      = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      /*
       * growProgress 0→1:
       *   - Auto drive: easeOutExpo over AUTOGROW_SECS
       *   - Scroll adds up to SCROLL_GROW_BONUS (reveals final-level detail)
       */
      const autoG     = easeOutExpo(Math.min(elapsed / AUTOGROW_SECS, 1.0));
      const growProg  = Math.min(autoG + scrollFrac * SCROLL_GROW_BONUS, 1.0);

      // Animate all tree nodes
      for (const n of allNodes) {
        const shouldShow = n.revealTime <= growProg;
        const targetG    = shouldShow ? 1.0 : 0.0;
        const rate       = targetG > n.growScale ? 3.2 : 5.5;
        n.growScale     += (targetG - n.growScale) * Math.min(dt * rate, 1.0);
        n.growScale      = Math.max(0, Math.min(1, n.growScale));

        const g = smoothstep(n.growScale);

        if (n.isLeaf) {
          n.mesh.scale.setScalar(g);
        } else {
          n.mesh.scale.y = g;
        }

        // Wind sway — applied fresh each frame around base rotation
        if (g > 0.04) {
          const s  = Math.sin(elapsed * n.windFreq + n.windPhase) * n.windAmp * g;
          const sz = Math.cos(elapsed * n.windFreq * 0.65 + n.windPhase + 1.2) * n.windAmp * 0.7 * g;
          n.pivot.rotation.x = n.baseRotX + s;
          n.pivot.rotation.z = n.baseRotZ + sz;
        }
      }

      // Camera orbit — smooth lerp toward scroll-driven target azimuth
      const targetAz = scrollFrac * ORBIT_RADIANS;
      camAz += (targetAz - camAz) * 0.055;

      const radius  = 9.2 - scrollFrac * 2.0;
      const height  = 1.8 + scrollFrac * 2.8;
      const lookAtY = 4.8 + scrollFrac * 1.8;

      camera.position.set(
        Math.sin(camAz) * radius,
        height,
        Math.cos(camAz) * radius,
      );
      camera.lookAt(0, lookAtY, 0);

      // Particle drift
      const pa = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) {
        pa[i * 3]     += vel[i][0];
        pa[i * 3 + 1] += vel[i][1];
        pa[i * 3 + 2] += vel[i][2];
        if (pa[i * 3 + 1] > 14) {
          pa[i * 3 + 1] = -0.3;
          pa[i * 3]     = (Math.random() - 0.5) * 13;
          pa[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      // Breathe warm light
      warmLight.intensity = 2.5 + Math.sin(elapsed * 1.05) * 0.6;

      renderer.render(scene, camera);
    };

    tick();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          Array.isArray(m) ? m.forEach((x) => x.dispose()) : m.dispose();
        }
      });
      pGeo.dispose();
      renderer.dispose();

      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         0,
        pointerEvents:  'none',
        overflow:       'hidden',
      }}
    />
  );
}
