import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;

function initScene(canvasElement) {
    // 1. Scene
    scene = new THREE.Scene();

    // 2. Camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 15; // Move camera back initially

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows if needed later

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    // directionalLight.castShadow = true; // Enable shadows if needed
    scene.add(directionalLight);

    // 5. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooths rotation
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false; // Pan in 3D space
    controls.minDistance = 5;  // Prevent zooming too close
    controls.maxDistance = 50; // Prevent zooming too far

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer, controls };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startAnimationLoop(updateCallback) {
    function animate() {
        requestAnimationFrame(animate);

        // Update controls (required if enableDamping is true)
        controls.update();

        // Call any other update functions passed in
        if (updateCallback) {
            updateCallback();
        }

        // Render the scene
        renderer.render(scene, camera);
    }
    animate(); // Start the loop
}

export { initScene, startAnimationLoop, scene, camera, renderer, controls }; // Export variables if needed elsewhere directly