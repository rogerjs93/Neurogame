import * as THREE from 'three';
import { camera, renderer } from './sceneSetup.js';
import { handleSelection } from './gameLogic.js'; // Updated function name
import { displayInfo, hideInfo } from './uiManager.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let interactableObjects = [];
let hoveredObject = null;
let selectedObject = null;

function initInteraction(objectsToInteract) {
    interactableObjects = objectsToInteract; // Expects a single flat array

    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
    // Use 'mousedown' on the canvas to catch clicks that don't hit an object
    renderer.domElement.addEventListener('mousedown', onMouseDownOutside, false);
}

// Helper to apply material state
function applyMaterial(object, materialType) {
    if (!object || !object.userData || !object.userData.originalMaterial) return; // Basic safety checks

    switch (materialType) {
        case 'original':
            object.material = object.userData.originalMaterial;
            break;
        case 'highlight':
            // Ensure highlight material exists before assigning
            object.material = object.userData.highlightMaterial || object.userData.originalMaterial;
            break;
        case 'selected':
            // Ensure selected material exists before assigning
            object.material = object.userData.selectedMaterial || object.userData.originalMaterial;
            break;
        default:
            object.material = object.userData.originalMaterial; // Fallback
    }
}

function onMouseMove(event) {
    // Optimization: only update raycaster if mouse moved significantly? Maybe not needed yet.
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false); // 'false' for non-recursive

    const firstIntersect = intersects.length > 0 ? intersects[0].object : null;

    // Handle Hover Exit
    if (hoveredObject && hoveredObject !== firstIntersect) {
        if (hoveredObject !== selectedObject) { // Don't unhighlight selected object
            applyMaterial(hoveredObject, 'original');
        }
        hoveredObject = null;
    }

    // Handle Hover Enter
    if (firstIntersect && firstIntersect !== hoveredObject) {
         hoveredObject = firstIntersect;
         if (hoveredObject !== selectedObject) { // Don't overwrite selected highlight
             applyMaterial(hoveredObject, 'highlight');
         }
    }
}

function onClick(event) {
    // Raycast again on click to be sure (mouse might have moved slightly)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const clickedObj = intersects[0].object;

        if (clickedObj.userData) { // Check if it's one of our interactive objects
            // Deselect previous, if it exists and is different
            if (selectedObject && selectedObject !== clickedObj) {
                applyMaterial(selectedObject, 'original');
            }

            // Select the new object
            selectedObject = clickedObj;
            applyMaterial(selectedObject, 'selected');

            // Display info in the UI panel
            displayInfo(selectedObject.userData.name, selectedObject.userData.info);

            // Trigger Game Logic - pass the whole object or just its data
            handleSelection(selectedObject); // Pass the mesh itself

            // Stop this event from bubbling up to the 'mousedown' listener on the canvas
            event.stopPropagation();
        }
    }
    // If intersects.length is 0, the click was outside; onMouseDownOutside will handle it.
}

// Handles clicks on the background (canvas)
function onMouseDownOutside(event) {
    // We need to check if the click actually missed all interactable objects
    // Raycast one more time on mousedown event coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length === 0) { // Truly clicked outside
        if (selectedObject) {
            applyMaterial(selectedObject, 'original'); // Deselect visually
            selectedObject = null; // Forget selection
        }
        hideInfo(); // Hide the info panel
    }
    // If intersects.length > 0, the 'click' event on the object will handle selection/info.
}

<<<<<<< HEAD
export { initInteraction }; // Only export the init function
=======
export { initInteraction }; // Only export the init function
>>>>>>> 6d0e3509b060d413bb2268cc0a34a16f0e8d46c5
