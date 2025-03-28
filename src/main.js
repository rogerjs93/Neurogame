import * as THREE from 'three';
import { initScene, startAnimationLoop, scene } from './lib/sceneSetup.js';
import { createBrainModel } from './lib/proceduralMeshes.js'; // Updated import
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
        // Optional: Display error message on the page itself
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Error initializing UI. Check console.';
        errorDiv.style.color = 'red';
        errorDiv.style.position = 'absolute';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(errorDiv);
    } else {
        try {
            // 3. Create Procedural Meshes (Lobes, Deep Structures, Nerves)
            const { brainGroup, allMeshes } = createBrainModel();
            scene.add(brainGroup); // Add the group containing everything

            // 4. Initialize Interaction (Raycasting, Hover, Click)
            initInteraction(allMeshes); // Pass the single flat array

            // 5. Start the Game Logic
            startGame(allMeshes); // Pass all meshes for data extraction

            // 6. Start the Animation Loop (Render loop)
            startAnimationLoop(() => {
                // Any per-frame updates needed can go here
                // e.g., animating something constantly
            });

            console.log("Neuro Explorer Phase 2 Initialized!");

        } catch (error) {
            console.error("Error during main initialization:", error);
             // Optional: Display error message on the page itself
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `Error during initialization: ${error.message}. Check console.`;
            errorDiv.style.color = 'red';
            errorDiv.style.position = 'absolute';
            errorDiv.style.top = '50%';
            errorDiv.style.left = '50%';
            errorDiv.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(errorDiv);
        }
    }
}