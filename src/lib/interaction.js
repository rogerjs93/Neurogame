import * as THREE from 'three';
import { camera, renderer } from './sceneSetup.js';
import { handleSelection } from './gameLogic.js';
import { displayInfo, hideInfo } from './uiManager.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let interactableObjects = []; // Master list of ALL interactable meshes
let hoveredObject = null;
let selectedObject = null;

function initInteraction(objectsToInteract) {
    interactableObjects = objectsToInteract; // Store the master list

    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
    renderer.domElement.addEventListener('mousedown', onMouseDownOutside, false);
}

// Helper to apply material state
function applyMaterial(object, materialType) {
    if (!object || !object.userData || !object.userData.originalMaterial) return;

    switch (materialType) {
        case 'original':
            object.material = object.userData.originalMaterial;
            break;
        case 'highlight':
            object.material = object.userData.highlightMaterial || object.userData.originalMaterial;
            break;
        case 'selected':
            object.material = object.userData.selectedMaterial || object.userData.originalMaterial;
            break;
        default:
            object.material = object.userData.originalMaterial;
    }
}

// --- Filter for Visible Objects ---
function getVisibleInteractableObjects() {
    // Filter the master list to include only objects whose 'visible' property is true
    // AND whose parent groups up the chain are also visible.
    return interactableObjects.filter(obj => {
        if (!obj || !obj.isObject3D) return false; // Basic check if obj is valid
        let current = obj;
        while (current) {
            // Check current object's visibility
            if (!current.visible) return false;
            // Stop if we reach the scene itself or if there's no parent
            if (current.isScene || !current.parent) break;
            // Move up to the parent
            current = current.parent;
        }
        return true; // Only return true if object and all parents up to the scene are visible
    });
}

// --- Event Handlers using Filtered Raycasting ---
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // *** Use filtered list for intersection test ***
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false); // Raycast only against visible objects
    // *********************************************

    const firstIntersect = intersects.length > 0 ? intersects[0].object : null;

    // Handle Hover Exit (check against firstIntersect)
    if (hoveredObject && hoveredObject !== firstIntersect) {
        if (hoveredObject !== selectedObject) { // Don't unhighlight selected object
            applyMaterial(hoveredObject, 'original');
        }
        hoveredObject = null;
    }

    // Handle Hover Enter (using firstIntersect from visible objects)
    if (firstIntersect && firstIntersect !== hoveredObject) {
         // If something else was hovered, reset it (unless it's selected)
         if (hoveredObject && hoveredObject !== selectedObject) {
            applyMaterial(hoveredObject, 'original');
         }
         hoveredObject = firstIntersect;
         if (hoveredObject !== selectedObject) { // Don't overwrite selected highlight
             applyMaterial(hoveredObject, 'highlight');
         }
    }
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // *** Use filtered list for intersection test ***
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false); // Raycast only against visible objects
    // *********************************************

    if (intersects.length > 0) {
        const clickedObj = intersects[0].object; // This object is guaranteed to be visible

        if (clickedObj.userData) { // Check if it has our userData properties
            // Deselect previous if different
            if (selectedObject && selectedObject !== clickedObj) {
                applyMaterial(selectedObject, 'original');
            }

            // Select new object
            selectedObject = clickedObj;
            applyMaterial(selectedObject, 'selected'); // Apply selected look

            // Update UI and Game Logic
            displayInfo(selectedObject.userData.name, selectedObject.userData.info);
            handleSelection(selectedObject); // Notify game logic

            // Prevent this click from triggering the background click handler
            event.stopPropagation();
        }
    }
    // If intersects.length is 0, the click was outside; onMouseDownOutside will handle it.
}

// Handles clicks on the background (canvas)
function onMouseDownOutside(event) {
    // Check if the click actually missed all VISIBLE interactable objects
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // *** Use filtered list for intersection test ***
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false);
    // *********************************************

    if (intersects.length === 0) { // Truly clicked outside any VISIBLE interactable object
        if (selectedObject) {
            applyMaterial(selectedObject, 'original'); // Deselect visually
            selectedObject = null; // Forget selection
        }
        hideInfo(); // Hide the info panel
    }
    // If intersects.length > 0, the 'click' event on the object already handled it.
}

// Export only the init function as it sets everything up
export { initInteraction };