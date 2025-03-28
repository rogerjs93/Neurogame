// File: src/lib/interaction.js
import * as THREE from 'three';
import { camera, renderer } from './sceneSetup.js';
import { handleSelection } from './gameLogic.js';
import { displayInfo, hideInfo } from './uiManager.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let interactableObjects = [];
let hoveredObject = null;
let selectedObject = null;

function initInteraction(objectsToInteract) {
    if (!Array.isArray(objectsToInteract)) { // Add check
         console.error("initInteraction received invalid input:", objectsToInteract);
         interactableObjects = [];
         return;
    }
    interactableObjects = objectsToInteract;
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onClick, false);
    renderer.domElement.addEventListener('mousedown', onMouseDownOutside, false);
    console.log(`Interaction initialized with ${interactableObjects.length} objects.`);
}

function applyMaterial(object, materialType) {
    if (!object || !object.userData || !object.userData.originalMaterial) { return; }
    let targetMaterial = object.userData.originalMaterial;
    switch (materialType) {
        case 'highlight': targetMaterial = object.userData.highlightMaterial || targetMaterial; break;
        case 'selected': targetMaterial = object.userData.selectedMaterial || targetMaterial; break;
    }
    if (object.material !== targetMaterial) { object.material = targetMaterial; }
}

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
        console.log("Clicked on:", clickedObj.userData?.name || 'Unknown Object', clickedObj);
        if (clickedObj.userData && clickedObj.userData.originalMaterial) {
            if (selectedObject && selectedObject !== clickedObj) { applyMaterial(selectedObject, 'original'); }
            selectedObject = clickedObj;
            applyMaterial(selectedObject, 'selected');
            console.log("Attempting to display info:", selectedObject.userData.name, selectedObject.userData.info);
            if (typeof selectedObject.userData.info !== 'undefined') {
                 displayInfo(selectedObject.userData.name, selectedObject.userData.info);
            } else {
                 console.warn("Object clicked, but userData.info is missing:", selectedObject.userData);
                 displayInfo(selectedObject.userData.name, "[Information not available]");
            }
            handleSelection(selectedObject);
            event.stopPropagation();
        } else {
             console.warn("Clicked object ignored (missing userData or originalMaterial):", clickedObj);
             if (selectedObject) { applyMaterial(selectedObject, 'original'); selectedObject = null; hideInfo(); }
        }
    }
}

function onMouseDownOutside(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const visibleObjects = getVisibleInteractableObjects();
    const intersects = raycaster.intersectObjects(visibleObjects, false);
    if (intersects.length === 0) {
        if (selectedObject) { applyMaterial(selectedObject, 'original'); selectedObject = null; }
        hideInfo();
    }
}
export { initInteraction };