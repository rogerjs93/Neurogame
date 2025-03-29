// File: src/main.js
import * as THREE from 'three';
import { initScene, startAnimationLoop, setGlobalClippingPlanes, scene as mainScene, camera as mainCamera, controls as mainControls, renderer } from './lib/sceneSetup.js';
import { loadBrainModel } from './lib/modelLoader.js'; // Use model loader
import { initUI, displayInstruction } from './lib/uiManager.js';
import { startGame } from './lib/gameLogic.js';
import { initInteraction } from './lib/interaction.js';

// --- State ---
// Store references to loaded meshes by type for layer toggling
const loadedMeshGroups = {
    lobes: [],
    deep_structure: [],
    cranial_nerve: [], // Add if you load nerves later
};

// --- Clipping Planes ---
const clipPlanes = { X: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), Y: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), Z: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0) };
const originalNormals = { X: new THREE.Vector3(1, 0, 0), Y: new THREE.Vector3(0, 1, 0), Z: new THREE.Vector3(0, 0, 1) };
let activeClipPlane = null;

// --- UI Callbacks ---
function handleLayerToggle(layersState) {
    console.log("Toggling layers:", layersState);
    loadedMeshGroups.lobes.forEach(mesh => { if(mesh) mesh.visible = layersState.lobes; });
    loadedMeshGroups.deep_structure.forEach(mesh => { if(mesh) mesh.visible = layersState.deep; });
    loadedMeshGroups.cranial_nerve.forEach(mesh => { if(mesh) mesh.visible = layersState.nerves; });
}

function handleClippingChange(clippingState) {
    if (!renderer) return;
    if (!clippingState.enabled) { setGlobalClippingPlanes([]); activeClipPlane = null; }
    else {
        const axis = clippingState.axis; activeClipPlane = clipPlanes[axis];
        if (activeClipPlane) {
            activeClipPlane.constant = clippingState.position;
            activeClipPlane.normal.copy(originalNormals[axis]);
            if (clippingState.negate) activeClipPlane.negate();
            setGlobalClippingPlanes([activeClipPlane]);
        } else { setGlobalClippingPlanes([]); }
    }
}

// --- Main Initialization ---
function main() {
    const canvas = document.getElementById('bg-brain');
    if (!canvas) { console.error("Canvas element #bg-brain not found!"); return; }
    const sceneComponents = initScene(canvas);
    if (!sceneComponents || !renderer) { console.error("Scene setup failed."); return; }

    // Setup UI (Pass callbacks including layer toggle now)
    if (!initUI(handleLayerToggle, handleClippingChange)) {
        console.error("Failed to initialize UI.");
    }

    // Load Model
    displayInstruction("Loading Brain Model...");
    loadBrainModel(mainScene, (interactableObjects, categorizedMeshes) => { // Expect categorizedMeshes too
        console.log("loadBrainModel callback executed.");
        if (!interactableObjects || interactableObjects.length === 0) {
            console.error("Model loaded, but no interactable objects found or loading failed!");
            displayInstruction("Error loading model!"); return;
        }
        // Store categorized meshes for layer toggling
        if (categorizedMeshes) {
            loadedMeshGroups.lobes = categorizedMeshes.lobe || [];
            loadedMeshGroups.deep_structure = categorizedMeshes.deep_structure || [];
            loadedMeshGroups.cranial_nerve = categorizedMeshes.cranial_nerve || [];
            // Trigger initial layer state based on checkboxes
             handleLayerToggle({
                 lobes: document.getElementById('toggle-lobes')?.checked ?? true,
                 deep: document.getElementById('toggle-deep')?.checked ?? true,
                 nerves: document.getElementById('toggle-nerves')?.checked ?? true,
             });
        } else {
             console.warn("Categorized meshes not returned from loader, layer toggling may fail.");
        }


        try {
            initInteraction(interactableObjects);
            startGame(interactableObjects);
            displayInstruction("Explore the brain!");

            startAnimationLoop(() => {
                if (mainControls && mainControls.enabled) mainControls.update();
            });
            mainControls.enabled = true;

            console.log("Neuro Explorer - Brain Anatomy Initialized with Loaded Model!");
        } catch (error) {
            console.error("Error during post-load initialization:", error);
            displayInstruction("Error initializing application.");
        }
    }); // End of loadBrainModel call
}
main();