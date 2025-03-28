// File: src/main.js

import * as THREE from 'three';
import { initScene, startAnimationLoop, setGlobalClippingPlanes, scene as mainScene, camera as mainCamera, controls as mainControls, renderer } from './lib/sceneSetup.js';
import { createBrainModel } from './lib/proceduralMeshes.js';
import { initUI } from './lib/uiManager.js';
import { startGame } from './lib/gameLogic.js';
import { initInteraction } from './lib/interaction.js';

// --- State Management ---
let brainModelGroup; // Reference to the main group holding brain parts

// --- References to Model Groups ---
let modelGroups = {
    lobes: null,
    deep: null,
    nerves: null,
};

// --- Clipping Plane Definitions ---
const clipPlanes = {
    X: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    Y: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    Z: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
};
const originalNormals = {
    X: new THREE.Vector3(1, 0, 0),
    Y: new THREE.Vector3(0, 1, 0),
    Z: new THREE.Vector3(0, 0, 1),
};
let activeClipPlane = null;


// --- Callback Functions for UI ---
function handleLayerToggle(layersState) {
    if (modelGroups.lobes) modelGroups.lobes.visible = layersState.lobes;
    if (modelGroups.deep) modelGroups.deep.visible = layersState.deep;
    if (modelGroups.nerves) modelGroups.nerves.visible = layersState.nerves;
}

function handleClippingChange(clippingState) {
    if (!renderer) { return; }

    if (!clippingState.enabled) {
        setGlobalClippingPlanes([]);
        activeClipPlane = null;
    } else {
        const axis = clippingState.axis;
        activeClipPlane = clipPlanes[axis];

        if (activeClipPlane) {
            activeClipPlane.constant = clippingState.position;
            activeClipPlane.normal.copy(originalNormals[axis]);
            if (clippingState.negate) {
                activeClipPlane.negate();
            }
            setGlobalClippingPlanes([activeClipPlane]);
        } else {
             console.error("Invalid clipping axis selected:", axis);
             setGlobalClippingPlanes([]);
        }
    }
}

// --- Main Initialization ---
function main() {
    const canvas = document.getElementById('bg-brain');
    if (!canvas) { console.error("Canvas element #bg-brain not found!"); document.body.innerHTML = '<h1 style="color: red;">Error: Canvas not found.</h1>'; return; }

    const sceneComponents = initScene(canvas);
    if (!sceneComponents || !renderer) { console.error("Scene setup failed."); document.body.innerHTML = '<h1 style="color: red;">Error: Scene setup failed. Check console.</h1>'; return; }

    if (!initUI(handleLayerToggle, handleClippingChange)) {
        console.error("Failed to initialize UI.");
    }

    try {
        const { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes } = createBrainModel();
        brainModelGroup = brainGroup;
        modelGroups.lobes = lobesGroup;
        modelGroups.deep = deepGroup;
        modelGroups.nerves = nervesGroup;
        mainScene.add(brainGroup);

        initInteraction(allMeshes);
        startGame(allMeshes);

        startAnimationLoop(() => {
            if(mainControls && mainControls.enabled) mainControls.update(); // Check if controls exist and are enabled
            // No TWEEN update needed
            // Render call is handled inside startAnimationLoop in sceneSetup.js
        });

        mainControls.enabled = true; // Start with controls enabled

        console.log("Neuro Explorer - Brain Anatomy Initialized!");

    } catch (error) {
        console.error("Error during main initialization sequence:", error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Runtime Error: ${error.message}. Check console.`;
        errorDiv.style.cssText = 'color: red; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 2px solid red; z-index: 100;';
        document.body.appendChild(errorDiv);
    }
}
main();