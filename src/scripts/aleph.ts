// The one rendered object on the site: a machined aleph in dark glass and
// anodised blue steel, lit like a product photograph. Idle Y rotation; scroll
// tilts it on X and swings the key light so the glass catches differently down
// the hero. prefers-reduced-motion (or no WebGL) leaves the CSS stand-in in place.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const SPINE_TILT = -0.42; // ~24deg lean, matching the logo
const COUNTER_TILT = 0.66; // ~38deg counter-strokes
const IDLE_SPEED = 0.15; // rad/s

function makeBar(w: number, h: number, d: number, material: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  return mesh;
}

export function initAleph(): void {
  const stage = document.querySelector<HTMLElement>('[data-aleph]');
  if (!stage) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS stand-in stays as the lit rest pose

  // Defer the heavy WebGL init (shader compile, env-map generation) so it does
  // not stall the hero entrance animation during the first second on load.
  const run = (): void => {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return; // no WebGL — keep the fallback
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const canvas = renderer.domElement;
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 0.6s ease';
  stage.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.2, 6.2);

  // Materials.
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0e1116,
    metalness: 0,
    roughness: 0.08,
    transmission: 0.55,
    thickness: 1.4,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const anodised = new THREE.MeshStandardMaterial({
    color: 0x2229de,
    metalness: 0.9,
    roughness: 0.34,
  });

  // Assemble the mark: a tall glass spine, two parallel steel counter-strokes.
  const group = new THREE.Group();

  const spine = makeBar(0.42, 2.5, 0.42, glass);
  spine.rotation.z = SPINE_TILT;
  group.add(spine);

  const left = makeBar(0.32, 1.15, 0.36, anodised);
  left.rotation.z = COUNTER_TILT;
  left.position.set(-0.62, 0.5, 0.06);
  group.add(left);

  const right = makeBar(0.32, 1.15, 0.36, anodised);
  right.rotation.z = COUNTER_TILT;
  right.position.set(0.62, -0.5, 0.06);
  group.add(right);

  group.rotation.x = 0.12;
  scene.add(group);

  // Shadow catcher (transparent plane that only shows the contact shadow).
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.ShadowMaterial({ opacity: 0.45 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -2.1;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Lights: one soft key + a low fill.
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.radius = 6;
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x2a3040, 0.6));

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  // Scroll progress across the hero (0 at top, 1 once scrolled a viewport).
  let scrollT = 0;
  const onScroll = (): void => {
    const rect = stage.getBoundingClientRect();
    scrollT = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const clock = new THREE.Clock();
  let running = true;
  let firstFrame = true;

  const render = (): void => {
    if (!running) return;
    const dt = clock.getDelta();
    group.rotation.y += IDLE_SPEED * dt;
    group.rotation.x = 0.12 + scrollT * 0.6;
    // Swing the key light with scroll so highlights travel down the object.
    const angle = 3 - scrollT * 4;
    key.position.set(angle, 5, 4);
    renderer.render(scene, camera);
    if (firstFrame) {
      // Crossfade in once there's a real frame to show (no hard pop, and the
      // CSS stand-in fades out via [data-aleph-ready]).
      firstFrame = false;
      canvas.style.opacity = '1';
      stage.setAttribute('data-aleph-ready', '');
    }
    requestAnimationFrame(render);
  };
  render();

  // Pause when the hero is fully offscreen to save the GPU.
  const io = new IntersectionObserver(
    ([entry]) => {
      running = entry.isIntersecting;
      if (running) {
        clock.getDelta();
        render();
      }
    },
    { threshold: 0 }
  );
  io.observe(stage);
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 1500 });
  } else {
    window.setTimeout(run, 400);
  }
}
