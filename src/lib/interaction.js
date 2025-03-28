// File: src/lib/interaction.js
import * as THREE from 'three';
import { camera, renderer } from './sceneSetup.js';
import { handleSelection } from './gameLogic.js';
import { displayInfo, hideInfo } from './uiManager.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let interactableObjects = []; // Master list
let hoveredObject = null;
let selectedObject = null;

function initInteraction(objectsToInteract) {
    interactableObjects = objectsToInteract;
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
    renderer.domElement.addEventListener('mousedown', onMouseDownOutside, false);
    console.log(`Interaction initialized with ${interactableObjects.length} objects.`); // Add log
}

// Helper to apply material state
function applyMaterial(object, materialType) {
    if (!object || !object.userData || !object.userData.originalMaterial) {
        // console.warn("applyMaterial: Invalid object or missing material data", object);
        return;
    }
    let targetMaterial = object.userData.originalMaterial; // Default
    switch (materialType) {
        case 'highlight': targetMaterial = object.userData.highlightMaterial || targetMaterial; break;
        case 'selected': targetMaterial = object.userData.selectedMaterial || targetMaterial; break;
    }
    // Check if material actually needs changing
    if (object.material !== targetMaterial) {
        object.material = targetMaterial;
    }
}

// Filter for Visible Objects
function getVisibleInteractableObjects() {
    return interactableObjects.filter(obj => {
        if (!obj || !obj.isObject3D) return false;
        let current = obj;
        while (current) {
            if (!current.visible) return false;
            if (current.isScene || !current.parent) break;
            current = current.parent;
        }
        return true;
    });
}

// Event Handlers using Filtered Raycasting
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false);
    const firstIntersect = intersects.length > 0 ? intersects[0].object : null;

    if (hoveredObject && hoveredObject !== firstIntersect) {
        if (hoveredObject !== selectedObject) { applyMaterial(hoveredObject, 'original'); }
        hoveredObject = null;
    }
    if (firstIntersect && firstIntersect !== hoveredObject) {
         if (hoveredObject && hoveredObject !== selectedObject) { applyMaterial(hoveredObject, 'original'); }
         hoveredObject = firstIntersect;
         if (hoveredObject !== selectedObject) { applyMaterial(hoveredObject, 'highlight'); }
    }
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false);

    if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        if (clickedObj.userData && clickedObj.userData.originalMaterial) { // Ensure it's one of ours
            if (selectedObject && selectedObject !== clickedObj) { applyMaterial(selectedObject, 'original'); }
            selectedObject = clickedObj;
            applyMaterial(selectedObject, 'selected');
            displayInfo(selectedObject.userData.name, selectedObject.userData.info);
            handleSelection(selectedObject); // Pass mesh to game logic
            event.stopPropagation();
        } else {
            // console.warn("Clicked on object without expected userData:", clickedObj);
        }
    }
    // Background click handled by onMouseDownOutside
}

function onMouseDownOutside(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false);
    if (intersects.length === 0) { // Clicked outside any VISIBLE interactable object
        if (selectedObject) { applyMaterial(selectedObject, 'original'); selectedObject = null; }
        hideInfo();
    }
}
export { initInteraction };