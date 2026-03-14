import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const viewerElement = document.getElementById("exploreModelViewer");
const statusElement = document.getElementById("exploreViewerStatus");
const axisXEl = document.getElementById("axisX");
const axisYEl = document.getElementById("axisY");
const axisZEl = document.getElementById("axisZ");
const axesHud = document.getElementById("axesHud");

if (viewerElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1c1712);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 3000);
  camera.position.set(0, 1.5, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewerElement.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 40;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xfff3d7, 1.3);
  directionalLight.position.set(4, 7, 4);
  scene.add(directionalLight);

  const backLight = new THREE.DirectionalLight(0xc5d8ff, 0.6);
  backLight.position.set(-5, 3, -4);
  scene.add(backLight);

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
    axesHelper.scale.setScalar(maxDim * 0.5);
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

  const loader = new GLTFLoader();
  setStatus("Loading 3D model...");

  loader.load(
    "assets/Smart3DScanner/egyptian+pharaoh+mask+3d+model.glb",
    (gltf) => {
      const model = gltf.scene;
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

  function updateAxesHud() {
    if (!axisXEl || !axisYEl || !axisZEl) return;
    axisXEl.textContent = controls.target.x.toFixed(2);
    axisYEl.textContent = controls.target.y.toFixed(2);
    axisZEl.textContent = controls.target.z.toFixed(2);
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
