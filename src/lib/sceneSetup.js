// File: src/lib/sceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;

function initScene(canvasElement) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const fov = 60, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 18);
    renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true, logarithmicDepthBuffer: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false;
    renderer.localClippingEnabled = true; // Keep enabled
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); directionalLight.position.set(8, 15, 10); scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4); directionalLight2.position.set(-8, -5, -10); scene.add(directionalLight2);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05; controls.screenSpacePanning = false;
    controls.minDistance = 3; controls.maxDistance = 40; controls.maxPolarAngle = Math.PI / 1.1; controls.enabled = true;
    window.addEventListener('resize', onWindowResize, false);
    console.log("Scene setup complete.");
    return { scene, camera, renderer, controls };
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startAnimationLoop(updateCallback) {
    if (!renderer || !scene || !camera) { console.error("Cannot start animation loop: Critical component missing."); return; }
    function animate() {
        requestAnimationFrame(animate);
        // Controls update is handled in main.js now
        if (updateCallback) updateCallback();
        try { renderer.render(scene, camera); }
        catch (error) { console.error("Error during render:", error); }
    }
    animate();
}

function setGlobalClippingPlanes(planesArray) {
    if (renderer) { renderer.clippingPlanes = planesArray || []; }
    else { console.warn("Renderer not available to set clipping planes."); }
}

export { initScene, startAnimationLoop, setGlobalClippingPlanes, scene, camera, renderer, controls };