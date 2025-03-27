import * as THREE from 'three';
import { initScene, startAnimationLoop, scene } from './lib/sceneSetup.js';
import { createProceduralLobes } from './lib/proceduralMeshes.js';
import { initUI } from './lib/uiManager.js';
import { startGame } from './lib/gameLogic.js';
import { initInteraction } from './lib/interaction.js';

// --- Initialization ---
const canvas = document.getElementById('bg');
if (!canvas) {
    console.error("Canvas element #bg not found!");
} else {
    // 1. Setup Scene, Camera, Renderer, Controls
    initScene(canvas);

    // 2. Setup UI Elements
    if (!initUI()) {
        console.error("Failed to initialize UI.");
        // Handle error appropriately, maybe show a message on the page
    } else {
        // 3. Create Procedural Meshes
        const { brainGroup, lobeMeshes } = createProceduralLobes();
        scene.add(brainGroup); // Add the group containing all lobes to the scene

        // 4. Initialize Interaction (Raycasting, Hover, Click)
        // Pass the actual mesh objects to the interaction module
        initInteraction(lobeMeshes);

        // 5. Start the Game Logic
        startGame(lobeMeshes); // Pass meshes to get names for the game setup

        // 6. Start the Animation Loop (Render loop)
        startAnimationLoop(() => {
            // Any per-frame updates can go here if needed
            // e.g., brainGroup.rotation.y += 0.001; // Gentle auto-rotation
        });

        console.log("Neuro Explorer Phase 1 Initialized!");
    }
}