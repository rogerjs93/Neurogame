// File: src/lib/sceneSetup.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;

function initScene(canvasElement) {
    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // 2. Camera
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 18); // Adjusted initial position

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
        logarithmicDepthBuffer: false, // Keep false unless z-fighting is severe
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false; // Keep shadows off for performance
    renderer.localClippingEnabled = true; // REQUIRED for clipping

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(8, 15, 10);
    scene.add(directionalLight);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-8, -5, -10);
    scene.add(directionalLight2);

    // 5. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 1.1;
    controls.enabled = true; // Start enabled

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);

    console.log("Scene setup complete."); // Add log
    return { scene, camera, renderer, controls };
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Modified to only handle rendering, controls update moved to main loop check
function startAnimationLoop(updateCallback) {
    if (!renderer || !scene || !camera) {
        console.error("Cannot start animation loop: Renderer, Scene, or Camera not initialized.");
        return;
    }
    function animate() {
        requestAnimationFrame(animate);

        // Controls update is now handled in main.js's loop IF enabled

        if (updateCallback) { updateCallback(); } // Call external update logic if provided

        try {
             renderer.render(scene, camera); // Render the scene
        } catch (error) {
            console.error("Error during render:", error);
            // Potentially stop the loop or add more robust error handling
        }
    }
    animate(); // Start the loop
}

function setGlobalClippingPlanes(planesArray) {
    if (renderer) {
        renderer.clippingPlanes = planesArray || [];
    } else {
        console.warn("Renderer not available to set clipping planes.");
    }
}

export { initScene, startAnimationLoop, setGlobalClippingPlanes, scene, camera, renderer, controls };