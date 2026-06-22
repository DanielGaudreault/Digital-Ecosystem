import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90caf9); // soft sky

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 25, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// LIGHTS
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(30, 50, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

// GROUND (low-poly plane)
const groundGeo = new THREE.PlaneGeometry(120, 120, 25, 25);
groundGeo.rotateX(-Math.PI / 2);

const pos = groundGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const y = pos.getY(i);
  pos.setY(i, y + (Math.random() - 0.5) * 2.0);
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
const lakeGeo = new THREE.CircleGeometry(15, 32);
lakeGeo.rotateX(-Math.PI / 2);
const lakeMat = new THREE.MeshLambertMaterial({
  color: 0x4fc3f7,
  flatShading: true,
});
const lake = new THREE.Mesh(lakeGeo, lakeMat);
lake.position.set(-15, 0.05, 5);
lake.receiveShadow = false;
scene.add(lake);

// TREES
function createTree(x, z) {
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 6);
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x8d6e63,
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, 1.5, z);
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  const crownGeo = new THREE.ConeGeometry(2.2, 4.5, 6);
  const crownMat = new THREE.MeshLambertMaterial({
    color: 0x4caf50,
    flatShading: true,
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.set(0, 3.5, 0);
  crown.castShadow = true;

  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(crown);
  scene.add(tree);
}

for (let i = 0; i < 35; i++) {
  const x = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;
  // keep most trees away from the lake center
  if (Math.hypot(x + 15, z - 5) < 18) continue;
  createTree(x, z);
}

// CREATURE (low-poly fox/wolf)
function createCreature(color = 0xd97a4a) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
  });

  const bodyGeo = new THREE.BoxGeometry(3.5, 1.2, 1.2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.position.set(0, 1.2, 0);
  group.add(body);

  const headGeo = new THREE.BoxGeometry(1.4, 1.0, 1.0);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.castShadow = true;
  head.position.set(2.2, 1.5, 0);
  group.add(head);

  const earGeo = new THREE.ConeGeometry(0.25, 0.6, 4);
  const ear1 = new THREE.Mesh(earGeo, bodyMat);
  const ear2 = ear1.clone();
  ear1.position.set(2.5, 2.0, 0.3);
  ear2.position.set(2.5, 2.0, -0.3);
  ear1.rotation.z = Math.PI;
  ear2.rotation.z = Math.PI;
  ear1.castShadow = ear2.castShadow = true;
  group.add(ear1, ear2);

  const legGeo = new THREE.BoxGeometry(0.3, 0.9, 0.3);
  const legOffsets = [
    [-1.2, 0.45, 0.4],
    [-1.2, 0.45, -0.4],
    [1.0, 0.45, 0.4],
    [1.0, 0.45, -0.4],
  ];
  legOffsets.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, bodyMat);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  });

  const tailGeo = new THREE.ConeGeometry(0.4, 1.6, 5);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(-2.1, 1.3, 0);
  tail.rotation.z = Math.PI / 3;
  tail.castShadow = true;
  group.add(tail);

  group.position.set(
    (Math.random() - 0.5) * 60,
    0,
    (Math.random() - 0.5) * 60
  );
  group.userData = {
    dir: new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize(),
    speed: 0.05 + Math.random() * 0.05,
    wiggleOffset: Math.random() * Math.PI * 2,
  };

  scene.add(group);
  return group;
}

const creatures = [];
for (let i = 0; i < 18; i++) {
  const colors = [0xd97a4a, 0xc46a3a, 0xa85f3a, 0xb0bec5];
  const color = colors[Math.floor(Math.random() * colors.length)];
  creatures.push(createCreature(color));
}

// SIMPLE WANDER + LITTLE BODY BOB
function updateCreatures(time) {
  creatures.forEach((c) => {
    const data = c.userData;

    if (Math.random() < 0.01) {
      const angleChange = (Math.random() - 0.5) * 0.6;
      data.dir.rotateAround(new THREE.Vector2(0, 0), angleChange);
    }

    c.position.x += data.dir.x * data.speed * 60 * 0.016;
    c.position.z += data.dir.y * data.speed * 60 * 0.016;

    const angle = Math.atan2(data.dir.x, data.dir.y);
    c.rotation.y = angle;

    const limit = 55;
    if (c.position.x > limit || c.position.x < -limit) data.dir.x *= -1;
    if (c.position.z > limit || c.position.z < -limit) data.dir.y *= -1;

    const bob = Math.sin(time * 2 + data.wiggleOffset) * 0.05;
    c.position.y = bob;
  });
}

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LOOP
function animate(t) {
  const time = t * 0.001;
  requestAnimationFrame(animate);
  controls.update();
  updateCreatures(time);
  renderer.render(scene, camera);
}
animate();
