import * as THREE from 'three';

const CATEGORY_COLORS: Record<string, number> = {
  default: 0x0071e3,
  cloud: 0x5856d6,
  sre: 0x34c759,
  'ai-agent': 0xff2d55,
  thoughts: 0xff9500,
  projects: 0x00c7be,
};

export function initScene(canvas: HTMLCanvasElement, category: string = 'default') {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1, 7);
  camera.lookAt(0, 0, 0);

  const mouse = new THREE.Vector2(0, 0);

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let color = new THREE.Color(CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default);
  const shapes: THREE.LineSegments[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.LineBasicMaterial[] = [];

  const configs = [
    { geo: () => new THREE.IcosahedronGeometry(1.0, 1), pos: [-2.5, 1.2, 0], scale: 1 },
    { geo: () => new THREE.OctahedronGeometry(0.7, 0), pos: [2.8, -0.3, -1], scale: 1 },
    { geo: () => new THREE.TorusGeometry(0.6, 0.2, 8, 24), pos: [0.5, -1.8, 0.5], scale: 1 },
    { geo: () => new THREE.TetrahedronGeometry(0.8, 0), pos: [-1.8, -1.2, -0.5], scale: 1 },
    { geo: () => new THREE.BoxGeometry(0.9, 0.9, 0.9), pos: [1.8, 1.5, -0.5], scale: 1 },
    { geo: () => new THREE.DodecahedronGeometry(0.6, 0), pos: [-0.3, 0.5, 1.5], scale: 1 },
    { geo: () => new THREE.ConeGeometry(0.5, 1.2, 6), pos: [3.5, 1.0, 0.5], scale: 0.8 },
    { geo: () => new THREE.TorusKnotGeometry(0.4, 0.12, 64, 8), pos: [-3.0, -0.2, 1], scale: 0.9 },
  ];

  function buildShapes() {
    shapes.forEach(s => scene.remove(s));
    geos.forEach(g => g.dispose());
    mats.forEach(m => m.dispose());
    shapes.length = 0;
    geos.length = 0;
    mats.length = 0;

    configs.forEach(({ geo, pos, scale }, i) => {
      const g = geo();
      const edges = new THREE.EdgesGeometry(g);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.15,
      });
      const wireframe = new THREE.LineSegments(edges, mat);
      wireframe.position.set(pos[0], pos[1], pos[2]);
      wireframe.scale.setScalar(scale);
      wireframe.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.4,
        rotSpeedY: (Math.random() - 0.5) * 0.4,
        rotSpeedZ: (Math.random() - 0.5) * 0.2,
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatPhase: Math.random() * Math.PI * 2,
        baseX: pos[0],
        baseY: pos[1],
        idx: i,
      };
      scene.add(wireframe);
      shapes.push(wireframe);
      geos.push(g);
      geos.push(edges);
      mats.push(mat);
    });
  }

  buildShapes();

  const gridGeo = new THREE.BufferGeometry();
  const gridSize = 14;
  const gridDiv = 28;
  const gridVerts: number[] = [];
  for (let i = 0; i <= gridDiv; i++) {
    const p = (i / gridDiv - 0.5) * gridSize;
    gridVerts.push(-gridSize / 2, 0, p, gridSize / 2, 0, p);
    gridVerts.push(p, 0, -gridSize / 2, p, 0, gridSize / 2);
  }
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridVerts, 3));
  const gridMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.04 });
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  grid.position.y = -3.2;
  grid.rotation.x = -Math.PI * 0.08;
  scene.add(grid);

  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    shapes.forEach((s) => {
      const d = s.userData;
      s.rotation.x += d.rotSpeedX * 0.008;
      s.rotation.y += d.rotSpeedY * 0.008;
      s.rotation.z += d.rotSpeedZ * 0.008;
      s.position.y = d.baseY + Math.sin(t * d.floatSpeed + d.floatPhase) * 0.4;
      s.position.x = d.baseX + Math.sin(t * 0.2 + d.floatPhase) * 0.15 + mouse.x * 0.15 * (d.idx % 2 === 0 ? 1 : -1);
    });

    grid.rotation.z = t * 0.005;
    camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (1 + mouse.y * 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  return {
    setCategory(cat: string) {
      color = new THREE.Color(CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.default);
      buildShapes();
      gridMat.color.copy(color);
    },
    destroy() {
      geos.forEach(g => g.dispose());
      mats.forEach(m => m.dispose());
      gridGeo.dispose();
      gridMat.dispose();
      renderer.dispose();
    },
  };
}
