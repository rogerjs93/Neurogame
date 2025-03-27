import * as THREE from 'three';
import { camera, renderer, scene } from './sceneSetup.js'; // Import needed Three.js elements
import { handleLobeSelection } from './gameLogic.js'; // Import game logic handler

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let interactableObjects = []; // Will hold the lobe meshes
let hoveredObject = null;
let selectedObject = null;

function initInteraction(objectsToInteract) {
    interactableObjects = objectsToInteract; // Store the meshes passed from main.js

    // Add event listeners to the renderer's canvas
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(interactableObjects);

    // --- Handle Hover ---
    if (intersects.length > 0) {
        const firstIntersect = intersects[0].object;
        // Check if it's a lobe and not already hovered
        if (firstIntersect.userData.type === 'lobe' && firstIntersect !== hoveredObject) {
            // Unhover previous object
            if (hoveredObject && hoveredObject !== selectedObject) { // Don't unhighlight selected
                hoveredObject.material = hoveredObject.userData.originalMaterial;
            }
            // Hover current object
            hoveredObject = firstIntersect;
            if (hoveredObject !== selectedObject) { // Don't overwrite selected highlight
                 hoveredObject.material = hoveredObject.userData.highlightMaterial;
            }
        }
    } else {
        // No intersection or intersected object is not a lobe
        if (hoveredObject && hoveredObject !== selectedObject) { // Don't unhighlight selected
             hoveredObject.material = hoveredObject.userData.originalMaterial;
        }
        hoveredObject = null;
    }
}

function onClick(event) {
     // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        const clickedObj = intersects[0].object;

        if (clickedObj.userData.type === 'lobe') {
            // --- Handle Selection ---
            // Deselect previous object
            if (selectedObject && selectedObject !== clickedObj) {
                selectedObject.material = selectedObject.userData.originalMaterial;
            }

             // Select the new object
            selectedObject = clickedObj;
            selectedObject.material = selectedObject.userData.selectedMaterial; // Apply selected highlight

            // --- Trigger Game Logic ---
            handleLobeSelection(clickedObj.userData.name); // Pass the name to the game
        }
    } else {
         // Optional: Clicking outside deselects
         if (selectedObject) {
             selectedObject.material = selectedObject.userData.originalMaterial;
             selectedObject = null;
         }
    }
}

// Export lobeMeshes so gameLogic can access names if needed
export { initInteraction, interactableObjects as lobeMeshes };