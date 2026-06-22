import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90caf9);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(30, 25, 40);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(50, 80, 40);
sun.castShadow = true;
scene.add(sun);

// DEBUG GRID (so you ALWAYS see something)
const grid = new THREE.GridHelper(200, 40, 0x444444, 0x888888);
scene.add(grid);

// GROUND
const groundGeo = new THREE.PlaneGeometry(200, 200, 30, 30);
groundGeo.rotateX(-Math.PI / 2);

const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  pos.setY(i, (Math.random() - 0.5) * 2.5);
}
pos.needsUpdate = true;
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshLambertMaterial({
  color: 0x8bc34a,
  flatShading: true,
});

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.receiveShadow = true;
scene.add(ground);

// LAKE
const lakeGeo = new THREE.CircleGeometry(18, 32);
lakeGeo.rotateX(-Math.PI / 2);

const lakeMat = new THREE.MeshLambertMaterial({
  color: 0x4fc3f7,
  flatShading: true,
});

const lake = new THREE.Mesh(lakeGeo, lakeMat);
lake.position.set(-20, 0.1, 10);
scene.add(lake);

// TREES
function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 3, 6),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63, flatShading: true })
  );
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 5, 6),
    new THREE.MeshLambertMaterial({ color: 0x4caf50, flatShading: true })
  );
  crown.position.set(x, 4, z);
  crown.castShadow = true;

  scene.add(trunk, crown);
}

for (let i = 0; i < 40; i++) {
  const x = (Math.random() - 0.5) * 150;
  const z = (Math.random() - 0.5) * 150;
  if (Math.hypot(x + 20, z - 10) < 25) continue;
  createTree(x, z);
}

// CREATURE
function createCreature(color = 0xd97a4a) {
  const group = new THREE.Group();

  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });

  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.2), mat);
  body.position.set(0, 1.2, 0);
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 1), mat);
  head.position.set(2.2, 1.5, 0);
  head.castShadow = true;
  group.add(head);

  const earGeo = new THREE.ConeGeometry(0.25, 0.6, 4);
  const ear1 = new THREE.Mesh(earGeo, mat);
  const ear2 = ear1.clone();
  ear1.position.set(2.5, 2, 0.3);
  ear2.position.set(2.5, 2, -0.3);
  ear1.rotation.z = ear2.rotation.z = Math.PI;
  group.add(ear1, ear2);

  const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
  const legs = [
    [-1.2, 0.45, 0.4],
    [-1.2, 0.45, -0.4],
    [1, 0.45, 0.4],
    [1, 0.45, -0.4],
  ];
  legs.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, mat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  });

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 5), mat);
  tail.position.set(-2.1, 1.3, 0);
  tail.rotation.z = Math.PI / 3;
  group.add(tail);

  group.position.set(
    (Math.random() - 0.5) * 40,
    0,
    (Math.random() - 0.5) * 40
  );

  group.userData = {
    dir: new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize(),
    speed: 0.03 + Math.random() * 0.04,
  };

  scene.add(group);
  return group;
}

const creatures = [];
for (let i = 0; i < 20; i++) {
  creatures.push(createCreature());
}

// MOVEMENT
function updateCreatures() {
  creatures.forEach((c) => {
    const d = c.userData;

    if (Math.random() < 0.01) {
      d.dir.rotateAround(new THREE.Vector2(0, 0), (Math.random() - 0.5) * 0.6);
    }

    c.position.x += d.dir.x * d.speed * 60 * 0.016;
    c.position.z += d.dir.y * d.speed * 60 * 0.016;

    c.rotation.y = Math.atan2(d.dir.x, d.dir.y);
  });
}

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LOOP
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateCreatures();
  renderer.render(scene, camera);
}
animate();
