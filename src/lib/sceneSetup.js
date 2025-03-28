import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;

function initScene(canvasElement) {
    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // Match CSS background

    // 2. Camera
    const fov = 60; // Slightly reduce FOV for less distortion?
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100; // Reduce far plane if model isn't huge
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 2, 18); // Adjust initial camera position

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
        logarithmicDepthBuffer: false, // Often helps with z-fighting but can have issues with clipping. Start false.
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = false; // Keep shadows off for now unless needed

    // *** ENABLE LOCAL CLIPPING ***
    // This allows materials to decide if they are clipped, but we use global clipping here.
    // It's good practice to enable it if you might use material-specific clipping later.
    renderer.localClippingEnabled = true;
    // We will manage global planes directly via renderer.clippingPlanes
    // *****************************

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly brighter ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Slightly less intense directional
    directionalLight.position.set(8, 15, 10);
    // directionalLight.castShadow = true; // Keep off for performance
    scene.add(directionalLight);
    // Optional: Add another light from a different angle
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-8, -5, -10);
    scene.add(directionalLight2);


    // 5. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3; // Allow closer zoom
    controls.maxDistance = 40; // Limit zoom out
    controls.maxPolarAngle = Math.PI / 1.1; // Prevent orbiting too far underneath

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize, false);

    return { scene, camera, renderer, controls };
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startAnimationLoop(updateCallback) {
    if (!renderer || !scene || !camera) {
        console.error("Cannot start animation loop: Renderer, Scene, or Camera not initialized.");
        return;
    }
    function animate() {
        requestAnimationFrame(animate);

        controls.update(); // Update controls

        if (updateCallback) {
            updateCallback(); // Call external update logic
        }

        renderer.render(scene, camera); // Render the scene
    }
    animate(); // Start the loop
}

// Function to update global clipping planes used by the renderer
function setGlobalClippingPlanes(planesArray) {
    if (renderer) {
        // Assign the array directly. Three.js handles empty arrays correctly (disables clipping).
        renderer.clippingPlanes = planesArray || []; // Ensure it's always an array
    } else {
        console.warn("Renderer not available to set clipping planes.");
    }
}

// Export necessary components and the new function
export { initScene, startAnimationLoop, setGlobalClippingPlanes, scene, camera, renderer, controls };