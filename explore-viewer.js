import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const viewerElement = document.getElementById("exploreModelViewer");
const statusElement = document.getElementById("exploreViewerStatus");
const axisXEl = document.getElementById("axisX");
const axisYEl = document.getElementById("axisY");
const axisZEl = document.getElementById("axisZ");
const axisDistEl = document.getElementById("axisDist");
const axisAzEl = document.getElementById("axisAz");
const axisPolEl = document.getElementById("axisPol");
const axesHud = document.getElementById("axesHud");

if (viewerElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14100c);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 3000);
  camera.position.set(0, 1.5, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewerElement.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 40;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const hemi = new THREE.HemisphereLight(0xfff5e6, 0x1a1510, 0.85);
  hemi.position.set(0, 1, 0);
  scene.add(hemi);

  const directionalLight = new THREE.DirectionalLight(0xfff3d7, 1.45);
  directionalLight.position.set(5, 9, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 80;
  directionalLight.shadow.camera.left = -25;
  directionalLight.shadow.camera.right = 25;
  directionalLight.shadow.camera.top = 25;
  directionalLight.shadow.camera.bottom = -25;
  directionalLight.shadow.bias = -0.0002;
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xc5d8ff, 0.75);
  backLight.position.set(-6, 4, -5);
  scene.add(backLight);

  const rimLight = new THREE.DirectionalLight(0xffe4a8, 0.35);
  rimLight.position.set(0, 2, -8);
  scene.add(rimLight);

  let gridHelper = null;
  let floorPlane = null;

  function setStatus(message, isError = false) {
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.classList.toggle("viewer-status-error", isError);
    statusElement.style.display = "block";
  }

  function hideStatus() {
    if (!statusElement) return;
    statusElement.style.display = "none";
  }

  function fitCameraToObject(object3D) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    object3D.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.45;

    camera.position.set(distance * 0.4, distance * 0.25, distance);
    camera.near = Math.max(maxDim / 100, 0.01);
    camera.far = Math.max(maxDim * 120, 200);
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.minDistance = Math.max(maxDim * 0.2, 0.2);
    controls.maxDistance = Math.max(maxDim * 10, 40);
    controls.update();

    // Scale axes helper to model size
    axesHelper.scale.setScalar(maxDim * 0.45);

    if (!scene.fog) {
      scene.fog = new THREE.Fog(0x14100c, 8, 80);
    }
    scene.fog.near = Math.max(maxDim * 2.5, 3);
    scene.fog.far = Math.max(maxDim * 28, 45);

    if (gridHelper) scene.remove(gridHelper);
    const gSize = maxDim * 3.2;
    gridHelper = new THREE.GridHelper(gSize, 28, 0x6b5428, 0x2a2218);
    gridHelper.position.y = -maxDim * 0.52;
    scene.add(gridHelper);

    if (floorPlane) scene.remove(floorPlane);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x120e0a,
      roughness: 0.92,
      metalness: 0.05,
    });
    floorPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(gSize * 1.2, gSize * 1.2),
      floorMat
    );
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = gridHelper.position.y - 0.002;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);
  }

  function resizeRenderer() {
    const width = viewerElement.clientWidth || 1;
    const height = viewerElement.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // AxesHelper: red=X, green=Y, blue=Z
  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);

  // Show HUD after model loads
  if (axesHud) axesHud.style.display = "none";

  const MODEL_MAP = {
    pharaoh: "assets/Smart3DScanner/egyptian+pharaoh+mask+3d+model.glb",
    PharaonicObelisk: "assets/3d_models/Pharaonic obelisk.glb",
    PyramidArtifact: "assets/3d_models/Pyramid Artifact.glb",
    GoldenSarcophagus: "assets/3d_models/Golden Sarcophagus.glb",
  };

  const params = new URLSearchParams(window.location.search);
  const modelKey = params.get("model") || "pharaoh";
  const modelPath =
    MODEL_MAP[modelKey] || MODEL_MAP.pharaoh;

  const loader = new GLTFLoader();
  setStatus("Loading 3D model...");

  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];
            mats.forEach((m) => {
              if (m && "envMapIntensity" in m) m.envMapIntensity = 1;
            });
          }
        }
      });
      scene.add(model);
      fitCameraToObject(model);
      hideStatus();
      if (axesHud) axesHud.style.display = "flex";
    },
    undefined,
    () => {
      setStatus("Could not load 3D model.", true);
    }
  );

  const _offset = new THREE.Vector3();
  const _spherical = new THREE.Spherical();

  function updateAxesHud() {
    // Camera world position updates when orbiting / zooming; target updates when panning
    const cx = camera.position.x;
    const cy = camera.position.y;
    const cz = camera.position.z;

    if (axisXEl) axisXEl.textContent = cx.toFixed(2);
    if (axisYEl) axisYEl.textContent = cy.toFixed(2);
    if (axisZEl) axisZEl.textContent = cz.toFixed(2);

    _offset.copy(camera.position).sub(controls.target);
    const dist = _offset.length();
    if (axisDistEl) axisDistEl.textContent = dist.toFixed(2);

    if (dist < 1e-8) {
      if (axisAzEl) axisAzEl.textContent = "0.0";
      if (axisPolEl) axisPolEl.textContent = "0.0";
    } else {
      _spherical.setFromVector3(_offset);
      const azDeg = THREE.MathUtils.radToDeg(_spherical.theta);
      const polDeg = THREE.MathUtils.radToDeg(_spherical.phi);
      if (axisAzEl) axisAzEl.textContent = Number.isFinite(azDeg) ? azDeg.toFixed(1) : "—";
      if (axisPolEl) axisPolEl.textContent = Number.isFinite(polDeg) ? polDeg.toFixed(1) : "—";
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateAxesHud();
    renderer.render(scene, camera);
  }

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);
  animate();
}
