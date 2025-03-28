// File: src/lib/proceduralMeshes.js
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// --- Material Definitions ---
const baseMaterialSettings = { roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.95, clippingPlanes: [], clipIntersection: false };
const deepStructureMaterialSettings = { roughness: 0.8, metalness: 0.0, transparent: true, opacity: 0.98, clippingPlanes: [], clipIntersection: false };
const nerveMaterialSettings = { roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.9, side: THREE.DoubleSide, clippingPlanes: [], clipIntersection: false };
const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x666600, opacity: 1.0 });
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xbbbb00, opacity: 1.0 });
const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0044cc, opacity: 1.0 });
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0077ff, opacity: 1.0 });
const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x33cc44, opacity: 0.95 });
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x66ff77, opacity: 1.0 });

// --- Configuration Data ---
const lobeConfig = [
    { name: 'Frontal Lobe', color: 0x4a90e2, position: { x: 0, y: 1.8, z: 3.0 }, scale: { x: 4, y: 3, z: 3.5 } },
    { name: 'Parietal Lobe', color: 0xf5a623, position: { x: 0, y: 2.8, z: -0.8 }, scale: { x: 3.5, y: 2.8, z: 4 } },
    { name: 'Temporal Lobe', color: 0x7ed321, position: { x: -3.0, y: -0.6, z: 0.8 }, scale: { x: 2.5, y: 2.0, z: 4.5 } },
    { name: 'Occipital Lobe', color: 0xbd10e0, position: { x: 0, y: 1.5, z: -4.0 }, scale: { x: 3, y: 2.5, z: 2.5 } },
    { name: 'Cerebellum', color: 0x9013fe, position: { x: 0, y: -2.0, z: -3.0 }, scale: { x: 3, y: 2, z: 2.5 }, shape: 'multiSphere' },
    { name: 'Brainstem', color: 0x50e3c2, position: { x: 0, y: -2.5, z: -1.0 }, scale: { x: 1, y: 1, z: 1 }, shape: 'brainstem' },
];
const deepStructureConfig = [
    { name: 'Thalamus', color: 0xff6b6b, function: 'Major sensory and motor relay station.', position: { x: -0.8, y: 0.6, z: -0.5 }, scale: { x: 1.2, y: 0.8, z: 1.0 }, shape: 'ellipsoid' },
    { name: 'Hypothalamus', color: 0xffd166, function: 'Regulates hormones, temperature, hunger, etc.', position: { x: 0, y: -0.7, z: 0.6 }, scale: { x: 0.6, y: 0.4, z: 0.5 }, shape: 'box' },
    { name: 'Hippocampus', color: 0x06d6a0, function: 'Crucial for forming new memories.', position: { x: -1.8, y: -0.4, z: -0.5 }, scale: { x: 1, y: 1, z: 1 }, shape: 'hippocampusCurve' },
    { name: 'Amygdala', color: 0x118ab2, function: 'Involved in processing emotions, especially fear.', position: { x: -2.2, y: -0.5, z: 0.9 }, scale: { x: 0.6, y: 0.4, z: 0.5 }, shape: 'ellipsoid' },
    { name: 'Pituitary Gland', color: 0xef476f, function: 'Master gland controlling hormone release.', position: { x: 0, y: -1.2, z: 0.9 }, radius: 0.25 },
];
const cranialNerveConfig = [ /* ... data ... */ ];

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) {
    const original = baseMaterial.clone(); original.color.setHex(baseColorHex);
    const highlight = highlightMaterial.clone(); highlight.color.setHex(baseColorHex);
    const selected = selectedMaterial.clone(); selected.color.setHex(baseColorHex);
    return { original, highlight, selected };
}

// --- Robust Geometry Generation ---
function applyVertexDisplacement(geometry, magnitude = 0.1, frequency = 5.0) { /* ... no change needed ... */ }

function createEllipsoidGeometry(radius, scale, applyDisplacement = false) {
    try {
        const detail = applyDisplacement ? 48 : 32;
        const geom = new THREE.SphereGeometry(radius, detail, detail / 2);
        geom.scale(scale.x, scale.y, scale.z);
        if (applyDisplacement) {
            geom.computeVertexNormals(); applyVertexDisplacement(geom, 0.15, 4.0);
        }
        return geom;
    } catch (error) {
        console.error("Error creating ellipsoid geometry:", error);
        return new THREE.SphereGeometry(radius, 8, 6); // Simple fallback
    }
}

function createBrainstemGeometry() {
    try {
        const midbrainGeom = new THREE.CylinderGeometry(0.6, 0.7, 1.0, 16); midbrainGeom.translate(0, 1.0, 0);
        const ponsGeom = new THREE.CylinderGeometry(0.7, 0.8, 1.2, 16); ponsGeom.translate(0, -0.1, 0);
        const medullaGeom = new THREE.CylinderGeometry(0.8, 0.5, 1.5, 16); medullaGeom.translate(0, -1.3, 0);

        const geometries = [midbrainGeom, ponsGeom, medullaGeom].filter(g => g); // Filter out nulls if any failed
        if (geometries.length === 0) throw new Error("No valid brainstem component geometries created.");

        const mergedGeom = BufferGeometryUtils.mergeGeometries(geometries);
        if (mergedGeom) {
            mergedGeom.center();
            return mergedGeom;
        } else {
            console.warn("Brainstem geometry merge returned null, using fallback.");
            return new THREE.CylinderGeometry(0.6, 0.6, 3.0, 16); // Fallback
        }
    } catch (error) {
        console.error("Error creating brainstem geometry:", error);
        return new THREE.CylinderGeometry(0.6, 0.6, 3.0, 16); // Fallback
    }
}

function createCerebellumGeometry() {
     try {
        const group = new THREE.Group();
        const mainSphere = createEllipsoidGeometry(1, {x: 1.5, y: 0.8, z: 1.2});
        group.add(new THREE.Mesh(mainSphere));
        const numDetails = 15; const detailRadius = 0.3;
        for(let i=0; i<numDetails; i++) {
            const detailGeom = new THREE.SphereGeometry(detailRadius * (0.8 + Math.random()*0.4), 8, 6);
            const phi = Math.acos(-1 + (2 * i) / numDetails); const theta = Math.sqrt(numDetails * Math.PI) * phi;
            const mesh = new THREE.Mesh(detailGeom);
            mesh.position.setFromSphericalCoords(1.3, phi, theta);
            mesh.position.multiplyScalar(0.8 + Math.random() * 0.3);
            group.add(mesh);
        }
         let mergedCerebellumGeom = null; const geometriesToMerge = [];
         group.traverse(child => {
             if (child.isMesh && child.geometry) { // Added check for geometry
                child.updateMatrixWorld(true); // Force update world matrix
                const clonedGeom = child.geometry.clone();
                clonedGeom.applyMatrix4(child.matrixWorld); // Use world matrix
                geometriesToMerge.push(clonedGeom);
             }
         });
         if (geometriesToMerge.length > 0) {
             mergedCerebellumGeom = BufferGeometryUtils.mergeGeometries(geometriesToMerge);
             if(mergedCerebellumGeom) {
                 mergedCerebellumGeom.center();
                 return mergedCerebellumGeom;
             } else {
                 console.warn("Cerebellum geometry merge returned null, using fallback.");
             }
         } else {
            console.warn("No geometries found to merge for Cerebellum, using fallback.");
         }
         // Fallback if merging failed or no geometries found
         return createEllipsoidGeometry(1.5, {x: 1.5, y: 1, z: 1.2});
     } catch (error) {
        console.error("Error creating cerebellum geometry:", error);
        return createEllipsoidGeometry(1.5, {x: 1.5, y: 1, z: 1.2}); // Fallback
     }
}

function createHippocampusCurve() { /* ... no change ... */ }


// --- Mesh Creation Functions (With Logging) ---
function createLobes(lobesGroup, meshesList) {
    console.log("Creating Lobes..."); // Log start
    const lobeInfoMap = { /* ... info ... */ };
    lobeConfig.forEach((config, index) => {
        try { // Add try-catch around each mesh creation
            let geometry; let isLobeShape = !['Cerebellum', 'Brainstem'].includes(config.name);
            if (config.shape === 'multiSphere') { geometry = createCerebellumGeometry(); geometry.scale(config.scale.x, config.scale.y, config.scale.z); }
            else if (config.shape === 'brainstem') { geometry = createBrainstemGeometry(); geometry.scale(config.scale.x, config.scale.y, config.scale.z); }
            else { geometry = createEllipsoidGeometry(1.5, config.scale, isLobeShape); }

            if (!geometry) throw new Error("Geometry creation failed."); // Check if geometry is valid

            const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
            const mesh = new THREE.Mesh(geometry, materials.original);
            mesh.position.set(config.position.x, config.position.y, config.position.z);
            mesh.userData = { name: config.name, type: 'lobe', originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: lobeInfoMap[config.name] || 'Info...' };

            lobesGroup.add(mesh);
            meshesList.push(mesh); // Push the created mesh
            // console.log(` -> Added ${config.name}, meshesList length: ${meshesList.length}`); // Log success

        } catch (error) {
            console.error(`Error creating mesh for ${config.name} (index ${index}):`, error);
            // Continue to next iteration if one fails
        }
    });

    // Mirror Temporal Lobe (with try-catch)
    try {
        const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
        if (temporalLobeMesh) {
            const temporalLobeMeshRight = temporalLobeMesh.clone();
            temporalLobeMeshRight.position.x *= -1; temporalLobeMeshRight.rotation.y *= -1;
            const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
            temporalLobeMeshRight.userData = { name: temporalLobeMesh.userData.name, type: temporalLobeMesh.userData.type, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: temporalLobeMesh.userData.info };
            temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;
            lobesGroup.add(temporalLobeMeshRight);
            meshesList.push(temporalLobeMeshRight); // Push the mirror
             // console.log(` -> Added mirrored Temporal Lobe, meshesList length: ${meshesList.length}`);
        }
    } catch (error) {
        console.error("Error creating mirrored Temporal Lobe:", error);
    }
     console.log(`Finished creating Lobes. Total meshes added: ${meshesList.length}`); // Log end
}

function createDeepStructures(deepGroup, meshesList) {
    console.log("Creating Deep Structures..."); // Log start
    const initialLength = meshesList.length;
    deepStructureConfig.forEach((config, index) => {
         try { // Add try-catch
            let geometry; let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
            if (config.shape === 'ellipsoid') { geometry = createEllipsoidGeometry(1.0, config.scale); }
            else if (config.shape === 'box') { geometry = new THREE.BoxGeometry(config.scale.x * 2, config.scale.y * 2, config.scale.z * 2); }
            else if (config.shape === 'hippocampusCurve') { const curve = createHippocampusCurve(); geometry = new THREE.TubeGeometry(curve, 20, 0.25, 8, false); }
            else { geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8); }

             if (!geometry) throw new Error("Geometry creation failed.");

            const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
            const mesh = new THREE.Mesh(geometry, materials.original); mesh.position.copy(meshPosition);
            const structureInfo = `${config.name}: ${config.function || 'Info...'}`;

            if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) {
                 const meshRight = mesh.clone(); meshRight.position.x *= -1;
                 const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
                 meshRight.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: structureInfo };
                 meshRight.material = meshRight.userData.originalMaterial; deepGroup.add(meshRight);
                 meshesList.push(meshRight); // Push mirror
            }

            mesh.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: structureInfo };
            deepGroup.add(mesh);
            meshesList.push(mesh); // Push original/central
             // console.log(` -> Added ${config.name}, meshesList length: ${meshesList.length}`);

         } catch (error) {
             console.error(`Error creating mesh for ${config.name} (index ${index}):`, error);
         }
    });
     console.log(`Finished creating Deep Structures. Total meshes added: ${meshesList.length - initialLength}`);
}

function createCranialNerves(nervesGroup, meshesList) {
    console.log("Creating Cranial Nerves..."); // Log start
    const initialLength = meshesList.length;
    const nerveRadius = 0.06; const radialSegments = 5; const tubularSegmentsMultiplier = 10;
    cranialNerveConfig.forEach((config, index) => {
        try { // Add try-catch
            const points = config.path.map(p => new THREE.Vector3(p.x, p.y, p.z)); if (points.length < 2) return; // Use return inside forEach to skip iteration
            const curve = new THREE.CatmullRomCurve3(points); const tubeLength = curve.getLength();
            const tubularSegments = Math.max(10, Math.ceil(tubeLength * tubularSegmentsMultiplier));
            const geometry = new THREE.TubeGeometry(curve, tubularSegments, nerveRadius, radialSegments, false);
            if (!geometry) throw new Error("TubeGeometry creation failed.");

            const materials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
            const mesh = new THREE.Mesh(geometry, materials.original);
            const fullName = `CN ${config.num}: ${config.name}`;
            const nerveInfo = `${fullName} (${config.type}) - Function: ${config.function || 'Info...'}`;

            if (!['I'].includes(config.num)) {
                const meshRight = mesh.clone(); const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));
                if(rightPoints.length >= 2) {
                    const rightCurve = new THREE.CatmullRomCurve3(rightPoints); const rightTubeLength = rightCurve.getLength();
                    const rightTubularSegments = Math.max(10, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                    meshRight.geometry.dispose(); meshRight.geometry = new THREE.TubeGeometry(rightCurve, rightTubularSegments, nerveRadius, radialSegments, false);
                    if (!meshRight.geometry) throw new Error("Mirrored TubeGeometry creation failed.");
                }
                const rightMaterials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
                meshRight.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: nerveInfo };
                meshRight.material = meshRight.userData.originalMaterial; nervesGroup.add(meshRight);
                meshesList.push(meshRight); // Push mirror
            }

            mesh.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: nerveInfo };
            nervesGroup.add(mesh);
            meshesList.push(mesh); // Push original/central
             // console.log(` -> Added ${fullName}, meshesList length: ${meshesList.length}`);

        } catch (error) {
            console.error(`Error creating mesh for CN ${config.num} (${config.name}) (index ${index}):`, error);
        }
    });
    console.log(`Finished creating Cranial Nerves. Total meshes added: ${meshesList.length - initialLength}`);
}


// --- Main Function to Create Entire Model ---
function createBrainModel() {
    const brainGroup = new THREE.Group(); const lobesGroup = new THREE.Group();
    const deepGroup = new THREE.Group(); const nervesGroup = new THREE.Group();
    const allMeshes = []; // Initialize empty array
    lobesGroup.name = "Lobes"; deepGroup.name = "DeepStructures"; nervesGroup.name = "CranialNerves";

    // Populate the specific groups and the flat list
    createLobes(lobesGroup, allMeshes);
    createDeepStructures(deepGroup, allMeshes);
    createCranialNerves(nervesGroup, allMeshes);

    // Add subgroups to the main brain group
    brainGroup.add(lobesGroup); brainGroup.add(deepGroup); brainGroup.add(nervesGroup);
    brainGroup.position.y = -0.5;

    console.log(`Procedural brain model creation finished. Total meshes in allMeshes: ${allMeshes.length}`); // Log final count
    if (allMeshes.length === 0) {
        console.error("CRITICAL: allMeshes array is empty after creation functions!");
    }
    return { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes }; // Return the populated array
}

export { createBrainModel };