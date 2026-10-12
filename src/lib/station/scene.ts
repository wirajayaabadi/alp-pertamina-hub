import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CAMERA, PLATFORM } from './config';
import { MeshKit } from './helpers';
import { createMaterials, setupLighting } from './materials';
import { SURFACE, buildCar, buildStation } from './build-station';
import { createCarCycle } from './car-animation';

export interface StationSceneOptions {
  fontFamily: string;
  logoSrc: string;
  reducedMotion: boolean;
  /** Frame pertama sudah benar-benar digambar. */
  onReady: () => void;
  /** Konteks WebGL hilang saat berjalan. */
  onContextLost: () => void;
  onContextRestored: () => void;
  onPlayingChange: (playing: boolean) => void;
  /** Sudut kamera berbeda dari sudut awal (setelah drag). */
  onViewChange: (rotated: boolean) => void;
}

export interface StationSceneController {
  /** Rotasi drag aktif (hanya perangkat dengan pointer presisi). */
  readonly canRotate: boolean;
  play: () => void;
  pause: () => void;
  resetView: () => void;
  setReducedMotion: (reduced: boolean) => void;
  dispose: () => void;
}

const deg = THREE.MathUtils.degToRad;

/**
 * Membuat adegan SPBU di dalam `container`. Melempar error bila WebGL tidak dapat
 * diinisialisasi; resource yang sempat dibuat sudah dibersihkan sebelum error dilempar.
 */
export function createStationScene(container: HTMLElement, options: StationSceneOptions): StationSceneController {
  const cleanups: Array<() => void> = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const fn of cleanups.reverse()) {
      try {
        fn();
      } catch (error) {
        console.error('SPBU 3D: gagal membersihkan resource', error);
      }
    }
    cleanups.length = 0;
  };
  const listen = (target: EventTarget, type: string, handler: (event: Event) => void, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, handler, opts);
    cleanups.push(() => target.removeEventListener(type, handler, opts));
  };

  try {
    const width = () => container.clientWidth;
    const height = () => container.clientHeight;
    const isMobile = () => width() < 640;

    // --- Renderer -----------------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    const canvas = renderer.domElement;
    cleanups.push(() => {
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    });
    renderer.setClearColor(0x000000, 0);
    const maxRatio = isMobile() ? 1.5 : 1.75;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, maxRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.localClippingEnabled = true;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.display = 'block';
    container.appendChild(canvas);

    // --- Adegan ---------------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 200);
    const kit = new MeshKit(renderer, options.fontFamily);
    const mats = createMaterials();
    const { env } = setupLighting(scene, renderer, isMobile());

    const station = buildStation(kit, mats);
    scene.add(station.root);

    // Bayangan lembut di bawah diorama.
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.14 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -PLATFORM.thickness - 0.002;
    floor.receiveShadow = true;
    scene.add(floor);
    const contactTex = kit.canvasTexture(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      g.addColorStop(0, 'rgba(30,35,45,0.5)');
      g.addColorStop(0.6, 'rgba(30,35,45,0.22)');
      g.addColorStop(1, 'rgba(30,35,45,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    });
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(PLATFORM.width * 1.45, PLATFORM.depth * 1.5),
      new THREE.MeshBasicMaterial({ map: contactTex.texture, transparent: true, depthWrite: false }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = -PLATFORM.thickness - 0.001;
    scene.add(contact);

    // Bounding box untuk framing kamera dihitung dari SPBU statis (tanpa mobil yang bergerak).
    const bounds = new THREE.Box3().setFromObject(station.root);

    const edge = PLATFORM.width / 2 - 0.1;
    const car = buildCar(kit, mats, [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), edge),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), edge),
    ]);
    scene.add(car.group);
    const cycle = createCarCycle(car, SURFACE);

    // --- Logo (aset lokal) ---------------------------------------------------------
    const logo = new Image();
    logo.decoding = 'async';
    const onLogo = () => {
      if (disposed) return;
      station.applyLogo(logo);
      requestRender();
    };
    listen(logo, 'load', onLogo);
    listen(logo, 'error', () => console.warn('SPBU 3D: logo tidak dapat dimuat, papan tampil tanpa logo.'));
    logo.src = options.logoSrc;

    // --- Kamera & kontrol ----------------------------------------------------------
    const controls = new OrbitControls(camera, canvas);
    cleanups.push(() => controls.dispose());
    const canRotate = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    controls.enabled = canRotate;
    controls.enableZoom = false; // roda mouse tetap menggulir halaman
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.55;
    controls.minAzimuthAngle = deg(CAMERA.azimuth - CAMERA.azimuthRange);
    controls.maxAzimuthAngle = deg(CAMERA.azimuth + CAMERA.azimuthRange);
    controls.minPolarAngle = deg(90 - CAMERA.elevation - CAMERA.elevationRange[1]);
    controls.maxPolarAngle = deg(90 - CAMERA.elevation - CAMERA.elevationRange[0]);
    // OrbitControls memasang touch-action:none; kembalikan agar geser vertikal tetap menggulir halaman.
    canvas.style.touchAction = 'pan-y';
    if (canRotate) canvas.style.cursor = 'grab';

    const viewDir = new THREE.Vector3(
      Math.sin(deg(CAMERA.azimuth)) * Math.cos(deg(CAMERA.elevation)),
      Math.sin(deg(CAMERA.elevation)),
      Math.cos(deg(CAMERA.azimuth)) * Math.cos(deg(CAMERA.elevation)),
    );
    const homePosition = new THREE.Vector3();
    const homeTarget = new THREE.Vector3();
    const corners = Array.from({ length: 8 }, () => new THREE.Vector3());
    const ndc = new THREE.Vector3();
    let sized = false;

    function projectedExtent(target: THREE.Vector3, distance: number) {
      camera.position.copy(target).addScaledVector(viewDir, distance);
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const c of corners) {
        ndc.copy(c).project(camera);
        minX = Math.min(minX, ndc.x);
        maxX = Math.max(maxX, ndc.x);
        minY = Math.min(minY, ndc.y);
        maxY = Math.max(maxY, ndc.y);
      }
      return { minX, maxX, minY, maxY };
    }

    /** Hitung jarak & titik bidik kamera agar seluruh SPBU muat dan terpusat di ruang yang tersedia. */
    function computeHome() {
      const { min, max } = bounds;
      let i = 0;
      for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) corners[i++].set(x, y, z);
      const [fx, fy] = CAMERA.fill[isMobile() ? 'mobile' : 'desktop'];
      // Bagian bawah bingkai dipakai tombol kontrol: sempitkan area vertikal dan geser objek ke atas.
      const inset = Math.min(0.3, (CAMERA.bottomInset / Math.max(1, height())) * 2);
      const target = bounds.getCenter(new THREE.Vector3());
      let distance = 30;
      for (let pass = 0; pass < 3; pass++) {
        let lo = 4;
        let hi = 250;
        for (let k = 0; k < 32; k++) {
          const mid = (lo + hi) / 2;
          const e = projectedExtent(target, mid);
          const fits = e.maxX - e.minX <= 2 * fx && e.maxY - e.minY <= 2 * fy - inset;
          if (fits) hi = mid;
          else lo = mid;
        }
        distance = hi;
        // Geser titik bidik agar hasil proyeksi berada tepat di tengah bingkai.
        const e = projectedExtent(target, distance);
        const halfH = distance * Math.tan(deg(CAMERA.fov / 2));
        const halfW = halfH * camera.aspect;
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
        target.addScaledVector(right, ((e.maxX + e.minX) / 2) * halfW);
        target.addScaledVector(up, ((e.maxY + e.minY) / 2 - inset / 2) * halfH);
      }
      homeTarget.copy(target);
      homePosition.copy(target).addScaledVector(viewDir, distance);
    }

    const spherical = new THREE.Spherical();
    function layout() {
      const w = width();
      const h = height();
      if (!w || !h) return; // tunggu ukuran nyata; aspect 0 menghasilkan NaN
      renderer.setSize(w, h, false);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Simpan sudut pengguna (jika sudah memutar) lalu terapkan jarak baru.
      spherical.setFromVector3(camera.position.clone().sub(controls.target));
      const keepAngle = sized && rotated;
      computeHome();
      if (keepAngle) {
        const homeDistance = homePosition.distanceTo(homeTarget);
        spherical.radius = homeDistance;
        controls.target.copy(homeTarget);
        camera.position.setFromSpherical(spherical).add(homeTarget);
      } else {
        camera.position.copy(homePosition);
        controls.target.copy(homeTarget);
      }
      camera.lookAt(controls.target);
      controls.update();
      sized = true;
      requestRender();
    }

    // --- Status interaksi -----------------------------------------------------------
    let reduced = options.reducedMotion;
    let playing = !reduced;
    let userPaused = false;
    let rotated = false;
    let resetting = false;
    let resetStart = 0;
    const resetFromPos = new THREE.Vector3();
    const resetFromTarget = new THREE.Vector3();
    let needsRender = true;
    let visible = true;
    let contextLost = false;
    let readySent = false;
    let simTime = cycle.restTime;
    if (playing) simTime = 0;
    cycle.apply(simTime);

    function requestRender() {
      needsRender = true;
    }
    function setPlaying(next: boolean) {
      if (playing === next) return;
      playing = next;
      options.onPlayingChange(playing);
      requestRender();
    }
    function updateRotated() {
      const next =
        camera.position.distanceTo(homePosition) > 0.05 || controls.target.distanceTo(homeTarget) > 0.05;
      if (next !== rotated) {
        rotated = next;
        options.onViewChange(rotated);
      }
    }
    /** Hentikan sisa momentum drag (damping) agar kamera tidak bergeser lagi. */
    function stopMomentum() {
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      controls.enableDamping = damping;
    }
    function snapHome() {
      resetting = false;
      camera.position.copy(homePosition);
      controls.target.copy(homeTarget);
      stopMomentum();
      updateRotated();
      requestRender();
    }

    controls.addEventListener('start', () => {
      resetting = false;
      canvas.style.cursor = 'grabbing';
    });
    controls.addEventListener('end', () => {
      canvas.style.cursor = 'grab';
    });
    controls.addEventListener('change', () => {
      updateRotated();
      requestRender();
    });

    layout();
    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(container);
    cleanups.push(() => resizeObserver.disconnect());

    // Kurangi kerja render saat adegan di luar layar atau tab tidak aktif.
    let lastFrame = performance.now();
    let onScreen = true;
    let tabVisible = !document.hidden;
    const syncVisibility = () => {
      visible = onScreen && tabVisible;
      lastFrame = performance.now();
      requestRender();
    };
    const intersection = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        syncVisibility();
      },
      { threshold: 0.01 },
    );
    intersection.observe(container);
    cleanups.push(() => intersection.disconnect());
    listen(document, 'visibilitychange', () => {
      tabVisible = !document.hidden;
      syncVisibility();
    });

    listen(canvas, 'webglcontextlost', (event) => {
      event.preventDefault();
      if (disposed) return;
      contextLost = true;
      options.onContextLost();
    });
    listen(canvas, 'webglcontextrestored', () => {
      if (disposed) return;
      contextLost = false;
      requestRender();
      options.onContextRestored();
    });

    // --- Loop -----------------------------------------------------------------------
    let rafId = 0;
    let fpsFrames = 0;
    let fpsTime = 0;
    function frame(now: number) {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
      lastFrame = now;
      if (!visible || contextLost || !sized) return;

      if (playing) {
        simTime += dt;
        cycle.apply(simTime);
        needsRender = true;
      }
      if (resetting) {
        // Transisi berbasis waktu nyata: durasinya sama di perangkat cepat maupun lambat.
        const p = Math.min(1, (now - resetStart) / CAMERA.resetDuration);
        const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
        camera.position.lerpVectors(resetFromPos, homePosition, e);
        controls.target.lerpVectors(resetFromTarget, homeTarget, e);
        camera.lookAt(controls.target);
        if (p >= 1) snapHome();
        needsRender = true;
      } else if (controls.enabled && controls.update(dt)) needsRender = true;

      if (!needsRender) return;
      needsRender = false;
      renderer.render(scene, camera);
      if (!readySent) {
        readySent = true;
        options.onReady();
      }

      // Turunkan resolusi raster bila perangkat konsisten lambat.
      if (playing) {
        fpsFrames++;
        fpsTime += dt;
        if (fpsTime > 3) {
          if (fpsFrames / fpsTime < 40 && pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.25);
            renderer.setPixelRatio(pixelRatio);
            layout();
          }
          fpsFrames = 0;
          fpsTime = 0;
        }
      }
    }
    renderer.compile(scene, camera);
    rafId = requestAnimationFrame(frame);
    cleanups.push(() => cancelAnimationFrame(rafId));

    // Lepas seluruh geometry, material, dan texture milik adegan.
    cleanups.push(() => {
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const list = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
        list.forEach((m) => materials.add(m));
      });
      materials.forEach((m) => {
        for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose();
        m.dispose();
      });
      Object.values(mats).forEach((m) => m.dispose());
      kit.dispose();
      env.dispose();
    });

    return {
      canRotate,
      play: () => {
        userPaused = false;
        setPlaying(true);
      },
      pause: () => {
        userPaused = true;
        setPlaying(false);
      },
      resetView: () => {
        if (reduced) {
          snapHome();
          return;
        }
        stopMomentum();
        resetFromPos.copy(camera.position);
        resetFromTarget.copy(controls.target);
        resetStart = performance.now();
        resetting = true;
        requestRender();
      },
      setReducedMotion: (next: boolean) => {
        if (next === reduced) return;
        reduced = next;
        if (reduced) {
          setPlaying(false);
          snapHome();
        } else if (!userPaused) {
          setPlaying(true);
        }
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
