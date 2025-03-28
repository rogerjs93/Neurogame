// File: src/main.js

import * as THREE from 'three';
import { initScene, startAnimationLoop, setGlobalClippingPlanes, scene as mainScene, camera as mainCamera, controls as mainControls, renderer } from './lib/sceneSetup.js';
import { createBrainModel } from './lib/proceduralMeshes.js';
// --- REMOVED updatePotentialGraph import ---
import { initUI, setUIMode } from './lib/uiManager.js';
import { startGame } from './lib/gameLogic.js';
import { initInteraction } from './lib/interaction.js';

// --- Import Action Potential Scene ---
import {
    initActionPotentialScene,
    updateActionPotential,
    playAnimation as playAPAnimation,
    pauseAnimation as pauseAPAnimation,
    stepAnimation as stepAPAnimation,
    resetSimulation as resetAPSimulation,
    // --- REMOVED getCurrentPotential import ---
} from './lib/actionPotentialScene.js';

// --- State Management ---
let currentView = 'brain';
let brainModelGroup;
let apScene, apCamera, apControls;

// --- References to Model Groups (for brain view) ---
let modelGroups = { lobes: null, deep: null, nerves: null };

// --- Clipping Plane Definitions (for brain view) ---
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
    if (!renderer || currentView !== 'brain') {
        setGlobalClippingPlanes([]); return;
    }
    if (!clippingState.enabled) {
        setGlobalClippingPlanes([]); activeClipPlane = null;
    } else {
        const axis = clippingState.axis; activeClipPlane = clipPlanes[axis];
        if (activeClipPlane) {
            activeClipPlane.constant = clippingState.position;
            activeClipPlane.normal.copy(originalNormals[axis]);
            if (clippingState.negate) { activeClipPlane.negate(); }
            setGlobalClippingPlanes([activeClipPlane]);
        } else { setGlobalClippingPlanes([]); }
    }
}

function handleViewToggle() {
    if (currentView === 'brain') { switchToAPView(); }
    else { switchToBrainView(); }
}

function handleAPControl(action) {
    if (currentView !== 'ap') return;
    switch (action) {
        case 'play': playAPAnimation(); break;
        case 'pause': pauseAPAnimation(); break;
        case 'step': stepAPAnimation(); break;
        case 'reset': resetAPSimulation(); break;
        default: console.warn("Unknown AP control action:", action);
    }
}

// --- View Switching Logic ---
function switchToAPView() {
    if (!apScene || !apCamera || !apControls || !mainControls) { console.error("Cannot switch to AP view: scenes not fully initialized."); return; }
    if (currentView === 'ap') return;
    currentView = 'ap'; setUIMode('ap');
    mainControls.enabled = false;
    if (brainModelGroup) brainModelGroup.visible = false;
    setGlobalClippingPlanes([]); // Turn off clipping
    apControls.enabled = true; apControls.reset(); apControls.target.set(0, 0, 0);
    console.log("Switched to Action Potential View");
}

function switchToBrainView() {
    if (!mainControls || !brainModelGroup || !apControls) { console.error("Cannot switch to Brain view: scenes not fully initialized."); return; }
    if (currentView === 'brain') return;
    currentView = 'brain'; setUIMode('brain');
    apControls.enabled = false; pauseAPAnimation();
    mainControls.enabled = true;
    if (brainModelGroup) brainModelGroup.visible = true;
    // Re-apply clipping based on UI state
    const clipEnabledCheckbox = document.getElementById('clip-enable');
    if (clipEnabledCheckbox && clipEnabledCheckbox.checked) {
        const currentClippingState = { enabled: true, axis: document.getElementById('clip-axis')?.value || 'X', position: parseFloat(document.getElementById('clip-slider')?.value || '0'), negate: document.getElementById('clip-negate')?.checked || false };
        handleClippingChange(currentClippingState);
    } else { setGlobalClippingPlanes([]); }
    console.log("Switched to Brain Anatomy View");
}

// --- Main Initialization ---
function main() {
    const canvas = document.getElementById('bg-brain');
    if (!canvas) { console.error("Canvas element #bg-brain not found!"); document.body.innerHTML = '<h1 style="color: red;">Error: Canvas not found.</h1>'; return; }

    const sceneComponents = initScene(canvas);
    if (!sceneComponents || !renderer) { console.error("Scene setup failed."); document.body.innerHTML = '<h1 style="color: red;">Error: Scene setup failed. Check console.</h1>'; return; }

    const apComponents = initActionPotentialScene(canvas, renderer);
    if (!apComponents || !apComponents.apScene) { console.error("Action Potential Scene setup failed."); document.body.innerHTML = '<h1 style="color: red;">Error: AP Scene setup failed. Check console.</h1>'; return; }
    apScene = apComponents.apScene; apCamera = apComponents.apCamera; apControls = apComponents.apControls;

    if (!initUI(handleLayerToggle, handleClippingChange, handleViewToggle, handleAPControl)) { console.error("Failed to initialize UI."); }

    try {
        const { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes } = createBrainModel();
        brainModelGroup = brainGroup; modelGroups.lobes = lobesGroup; modelGroups.deep = deepGroup; modelGroups.nerves = nervesGroup;
        mainScene.add(brainGroup);

        initInteraction(allMeshes);
        startGame(allMeshes);

        let lastTime = performance.now();
        startAnimationLoop(() => {
            const time = performance.now();
            const deltaTime = (time - lastTime) * 0.001;
            lastTime = time;

            if (currentView === 'brain') {
                if(mainControls.enabled) mainControls.update();
                renderer.render(mainScene, mainCamera);
            } else { // currentView === 'ap'
                updateActionPotential(deltaTime); // Update AP simulation state
                // Graph update is now handled via event bus listener in uiManager
                if(apControls.enabled) apControls.update();
                renderer.render(apScene, apCamera);
            }
        });

        switchToBrainView(); // Start in brain view
        console.log("Neuro Explorer Phase 3 Initialized!");

    } catch (error) {
        console.error("Error during main initialization sequence:", error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Runtime Error: ${error.message}. Check console.`;
        errorDiv.style.cssText = 'color: red; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 2px solid red; z-index: 100;';
        document.body.appendChild(errorDiv);
    }
}

// Run main initialization
main();