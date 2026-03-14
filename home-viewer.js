import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

const viewerElement = document.getElementById("homeModelViewer");
const statusElement = document.getElementById("homeViewerStatus");

if (viewerElement) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
  camera.position.set(0, 1.4, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  viewerElement.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 30;

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(3, 6, 5);
  scene.add(directionalLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-4, 2, -3);
  scene.add(fillLight);

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
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    camera.position.set(distance * 0.45, distance * 0.3, distance);
    camera.near = Math.max(maxDim / 100, 0.01);
    camera.far = Math.max(maxDim * 100, 200);
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.minDistance = Math.max(maxDim * 0.15, 0.2);
    controls.maxDistance = Math.max(maxDim * 8, 30);
    controls.update();
  }

  function resizeRenderer() {
    const width = viewerElement.clientWidth || 1;
    const height = viewerElement.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  setStatus("Loading 3D model...");

  const mtlLoader = new MTLLoader();
  mtlLoader.setPath("assets/Smart3DScanner/");
  mtlLoader.load(
    "obj.mtl",
    (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(
        "assets/Smart3DScanner/tinker.obj",
        (obj) => {
          scene.add(obj);
          fitCameraToObject(obj);
          hideStatus();
        },
        undefined,
        () => {
          loadObjFallback();
        }
      );
    },
    undefined,
    () => {
      loadObjFallback();
    }
  );

  function loadObjFallback() {
    const objLoader = new OBJLoader();
    objLoader.load(
      "assets/Smart3DScanner/tinker.obj",
      (obj) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xa0b4c8,
              roughness: 0.55,
              metalness: 0.15,
            });
          }
        });
        scene.add(obj);
        fitCameraToObject(obj);
        hideStatus();
      },
      undefined,
      () => {
        setStatus("Could not load 3D model.", true);
      }
    );
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);
  animate();
}
