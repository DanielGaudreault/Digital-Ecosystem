// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x90caf9);

// CAMERA
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(50, 40, 60);
camera.lookAt(0, 0, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// CONTROLS
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// LIGHTS (extra bright)
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(100, 150, 80);
scene.add(sun);

// DEBUG CUBE (so you ALWAYS see something)
const debugCube = new THREE.Mesh(
  new THREE.BoxGeometry(5, 5, 5),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
debugCube.position.set(0, 5, 0);
scene.add(debugCube);

// GROUND
const groundGeo = new THREE.PlaneGeometry(200, 200, 1, 1);
groundGeo.rotateX(-Math.PI / 2);

const groundMat = new THREE.MeshLambertMaterial({
  color: 0x8bc34a,
  flatShading: true,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
scene.add(ground);

// LAKE
const lakeGeo = new THREE.CircleGeometry(20, 32);
lakeGeo.rotateX(-Math.PI / 2);
const lakeMat = new THREE.MeshLambertMaterial({
  color: 0x4fc3f7,
  flatShading: true,
});
const lake = new THREE.Mesh(lakeGeo, lakeMat);
lake.position.set(-30, 0.1, 10);
scene.add(lake);

// TREES
function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 4, 6),
    new THREE.MeshLambertMaterial({ color: 0x8d6e63, flatShading: true })
  );
  trunk.position.set(x, 2, z);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(3, 6, 6),
    new THREE.MeshLambertMaterial({ color: 0x4caf50, flatShading: true })
  );
  crown.position.set(x, 6, z);

  scene.add(trunk, crown);
}

for (let i = 0; i < 30; i++) {
  createTree(
    (Math.random() - 0.5) * 150,
    (Math.random() - 0.5) * 150
  );
}

// CREATURE
function createCreature(color = 0xd97a4a) {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });

  const body = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 1.5), mat);
  body.position.set(0, 1.5, 0);
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.2), mat);
  head.position.set(2.5, 2, 0);
  group.add(head);

  group.position.set(
    (Math.random() - 0.5) * 80,
    0,
    (Math.random() - 0.5) * 80
  );

  group.userData = {
    dir: new THREE.Vector2(Math.random() - 0.5, Math.random() - 0.5).normalize(),
    speed: 0.05,
  };

  scene.add(group);
  return group;
}

const creatures = [];
for (let i = 0; i < 10; i++) {
  creatures.push(createCreature());
}

function updateCreatures() {
  creatures.forEach((c) => {
    const d = c.userData;

    c.position.x += d.dir.x * d.speed;
    c.position.z += d.dir.y * d.speed;

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
