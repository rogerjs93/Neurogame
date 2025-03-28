import * as THREE from 'three';
// Import specific function for clipping
import { initScene, startAnimationLoop, setGlobalClippingPlanes, scene, renderer } from './lib/sceneSetup.js';
import { createBrainModel } from './lib/proceduralMeshes.js';
import { initUI } from './lib/uiManager.js';
import { startGame } from './lib/gameLogic.js';
import { initInteraction } from './lib/interaction.js';

// --- References to Model Groups ---
let modelGroups = {
    lobes: null,
    deep: null,
    nerves: null,
};

// --- Clipping Plane Definitions ---
// Define planes once, we'll manipulate their 'constant' and potentially 'normal'
const clipPlanes = {
    X: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), // Normal points +X (clips things with lower X)
    Y: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), // Normal points +Y (clips things with lower Y)
    Z: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), // Normal points +Z (clips things with lower Z)
};
const originalNormals = { // Store original normals for resetting after negation
    X: new THREE.Vector3(1, 0, 0),
    Y: new THREE.Vector3(0, 1, 0),
    Z: new THREE.Vector3(0, 0, 1),
};
let activeClipPlane = null; // The currently active THREE.Plane object


// --- Callback Functions for UI ---

// Called when layer checkboxes change
function handleLayerToggle(layersState) {
    if (modelGroups.lobes) modelGroups.lobes.visible = layersState.lobes;
    if (modelGroups.deep) modelGroups.deep.visible = layersState.deep;
    if (modelGroups.nerves) modelGroups.nerves.visible = layersState.nerves;
    console.log("Layer visibility updated:", layersState); // Debug
}

// Called when any clipping control changes
function handleClippingChange(clippingState) {
    if (!renderer) {
        console.warn("Renderer not ready for clipping changes.");
        return;
    }
    // console.log("Clipping state change:", clippingState); // Debug

    if (!clippingState.enabled) {
        setGlobalClippingPlanes([]); // Disable clipping by passing empty array
        activeClipPlane = null;
    } else {
        const axis = clippingState.axis; // 'X', 'Y', or 'Z'
        activeClipPlane = clipPlanes[axis];

        if (activeClipPlane) {
            // 1. Set Position (Constant)
            // The 'constant' is the distance from the origin along the plane's normal.
            // A positive constant moves the plane in the direction of the normal.
            activeClipPlane.constant = clippingState.position;

            // 2. Set Orientation (Normal & Negation)
            // Ensure the normal is reset to its original direction before potentially negating
            activeClipPlane.normal.copy(originalNormals[axis]);
            if (clippingState.negate) {
                activeClipPlane.negate(); // Flip the normal vector
            }

            // Apply the single active plane globally
            setGlobalClippingPlanes([activeClipPlane]);
        } else {
             console.error("Invalid clipping axis selected:", axis);
             setGlobalClippingPlanes([]); // Disable if axis is wrong
        }
    }
}


// --- Main Initialization ---
function main() {
    const canvas = document.getElementById('bg');
    if (!canvas) {
        console.error("Canvas element #bg not found!");
        document.body.innerHTML = '<h1 style="color: red;">Error: Canvas not found.</h1>'; // Basic error display
        return;
    }

    // 1. Setup Scene, Camera, Renderer, Controls
    // Check if initScene was successful
    const sceneComponents = initScene(canvas);
    if (!sceneComponents || !sceneComponents.renderer) {
         console.error("Scene setup failed.");
         document.body.innerHTML = '<h1 style="color: red;">Error: Scene setup failed. Check console.</h1>';
         return;
    }

    // 2. Setup UI Elements (Pass callbacks)
    if (!initUI(handleLayerToggle, handleClippingChange)) {
        console.error("Failed to initialize UI. Application may not function correctly.");
        // Allow app to continue but UI might be broken
    }

    try {
        // 3. Create Procedural Meshes & Store Group References
        const { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes } = createBrainModel();
        modelGroups.lobes = lobesGroup;
        modelGroups.deep = deepGroup;
        modelGroups.nerves = nervesGroup;
        scene.add(brainGroup); // Add the main group containing all subgroups

        // 4. Initialize Interaction (Raycasting, Hover, Click)
        initInteraction(allMeshes); // Pass the flat list of all interactable meshes

        // 5. Start the Game Logic
        startGame(allMeshes); // Pass meshes for game data setup

        // 6. Start the Animation Loop
        startAnimationLoop(() => {
            // Any per-frame updates can go here if needed
        });

        console.log("Neuro Explorer Phase 2+ Initialized!");

    } catch (error) {
        console.error("Error during main initialization sequence:", error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Runtime Error: ${error.message}. Check console.`;
        errorDiv.style.cssText = 'color: red; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 2px solid red;';
        document.body.appendChild(errorDiv);
    }
}

// Run the main initialization function when the script loads
main();