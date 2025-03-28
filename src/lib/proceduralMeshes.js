// File: src/lib/proceduralMeshes.js
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'; // Optional for merging later

// --- Improved Material Definitions ---
// Use slightly less shiny materials for a more organic/diagrammatic look
const baseMaterialSettings = {
    roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.95, // Less transparent default
    clippingPlanes: [], clipIntersection: false,
};
const deepStructureMaterialSettings = {
    roughness: 0.8, metalness: 0.0, transparent: true, opacity: 0.98,
    clippingPlanes: [], clipIntersection: false,
};
const nerveMaterialSettings = {
    roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    clippingPlanes: [], clipIntersection: false,
};

// Base Materials
const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x666600, opacity: 1.0 }); // Stronger highlight
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xbbbb00, opacity: 1.0 }); // Even stronger select
const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0044cc, opacity: 1.0 });
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0077ff, opacity: 1.0 });
const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x33cc44, opacity: 0.95 });
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x66ff77, opacity: 1.0 });


// --- Configuration Data ---
// Adjusted positions and scales for slightly better layout
const lobeConfig = [
    // Slightly elongated shapes instead of pure spheres
    { name: 'Frontal Lobe', color: 0x4a90e2, position: { x: 0, y: 1.8, z: 3.0 }, scale: { x: 4, y: 3, z: 3.5 } },
    { name: 'Parietal Lobe', color: 0xf5a623, position: { x: 0, y: 2.8, z: -0.8 }, scale: { x: 3.5, y: 2.8, z: 4 } },
    { name: 'Temporal Lobe', color: 0x7ed321, position: { x: -3.0, y: -0.6, z: 0.8 }, scale: { x: 2.5, y: 2.0, z: 4.5 } },
    { name: 'Occipital Lobe', color: 0xbd10e0, position: { x: 0, y: 1.5, z: -4.0 }, scale: { x: 3, y: 2.5, z: 2.5 } },
    { name: 'Cerebellum', color: 0x9013fe, position: { x: 0, y: -2.0, z: -3.0 }, scale: { x: 3, y: 2, z: 2.5 }, shape: 'multiSphere' }, // Use custom shape
    { name: 'Brainstem', color: 0x50e3c2, position: { x: 0, y: -2.5, z: -1.0 }, scale: { x: 1, y: 1, z: 1 }, shape: 'brainstem' }, // Use custom shape
];

const deepStructureConfig = [
    // Use paired ellipsoids for Thalamus
    { name: 'Thalamus', color: 0xff6b6b, function: 'Major sensory and motor relay station.', position: { x: -0.8, y: 0.6, z: -0.5 }, scale: { x: 1.2, y: 0.8, z: 1.0 }, shape: 'ellipsoid' },
    { name: 'Hypothalamus', color: 0xffd166, function: 'Regulates hormones, temperature, hunger, etc.', position: { x: 0, y: -0.7, z: 0.6 }, scale: { x: 0.6, y: 0.4, z: 0.5 }, shape: 'box' }, // Use box
    // Improved Hippocampus curve
    { name: 'Hippocampus', color: 0x06d6a0, function: 'Crucial for forming new memories.', position: { x: -1.8, y: -0.4, z: -0.5 }, scale: { x: 1, y: 1, z: 1 }, shape: 'hippocampusCurve' },
    // Almond shape (ellipsoid) for Amygdala
    { name: 'Amygdala', color: 0x118ab2, function: 'Involved in processing emotions, especially fear.', position: { x: -2.2, y: -0.5, z: 0.9 }, scale: { x: 0.6, y: 0.4, z: 0.5 }, shape: 'ellipsoid' },
    { name: 'Pituitary Gland', color: 0xef476f, function: 'Master gland controlling hormone release.', position: { x: 0, y: -1.2, z: 0.9 }, radius: 0.25 }, // Smaller sphere
];

const cranialNerveConfig = [ /* Keep paths as before, or refine further if needed */ ];

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) {
    const original = baseMaterial.clone(); original.color.setHex(baseColorHex);
    const highlight = highlightMaterial.clone(); highlight.color.setHex(baseColorHex);
    const selected = selectedMaterial.clone(); selected.color.setHex(baseColorHex);
    return { original, highlight, selected };
}

// --- Improved Geometry Generation ---

// Creates a slightly squashed sphere (ellipsoid)
function createEllipsoidGeometry(radius, scale) {
    const geom = new THREE.SphereGeometry(radius, 32, 16);
    geom.scale(scale.x, scale.y, scale.z);
    return geom;
}

// Simple brainstem shape (stacked cylinders)
function createBrainstemGeometry() {
    const midbrainGeom = new THREE.CylinderGeometry(0.6, 0.7, 1.0, 16);
    midbrainGeom.translate(0, 1.0, 0); // Position relative to origin
    const ponsGeom = new THREE.CylinderGeometry(0.7, 0.8, 1.2, 16);
    ponsGeom.translate(0, -0.1, 0);
    const medullaGeom = new THREE.CylinderGeometry(0.8, 0.5, 1.5, 16);
    medullaGeom.translate(0, -1.3, 0);

    // Merge geometries - requires BufferGeometryUtils
    const mergedGeom = BufferGeometryUtils.mergeGeometries([midbrainGeom, ponsGeom, medullaGeom]);
    if (mergedGeom) {
         mergedGeom.center(); // Center the combined geometry
         return mergedGeom;
    } else {
        console.warn("Brainstem geometry merge failed, using fallback.");
        // Fallback if merge fails (e.g., different attributes)
        const fallbackGeom = new THREE.CylinderGeometry(0.6, 0.6, 3.0, 16);
        return fallbackGeom;
    }
}

// Slightly more detailed Cerebellum (group of spheres)
function createCerebellumGeometry() {
    const group = new THREE.Group();
    const mainSphere = createEllipsoidGeometry(1, {x: 1.5, y: 0.8, z: 1.2});
    group.add(new THREE.Mesh(mainSphere)); // Add base shape

    // Add smaller spheres for texture/detail
    const numDetails = 15;
    const detailRadius = 0.3;
    for(let i=0; i<numDetails; i++) {
        const detailGeom = new THREE.SphereGeometry(detailRadius * (0.8 + Math.random()*0.4), 8, 6); // Vary size
        const phi = Math.acos(-1 + (2 * i) / numDetails); // Distribute somewhat evenly
        const theta = Math.sqrt(numDetails * Math.PI) * phi;
        const mesh = new THREE.Mesh(detailGeom);
        mesh.position.setFromSphericalCoords(1.3, phi, theta); // Position on surface of larger sphere
         // Slightly push outwards/inwards randomly
        mesh.position.multiplyScalar(0.8 + Math.random() * 0.3);
        group.add(mesh);
    }
    // Convert group to single geometry (optional but good for performance)
    // Note: This requires iterating through children and merging, complex
    // For now, returning the group and scaling the group might be easier
    // Or create a single merged geometry if BufferGeometryUtils is reliable
     let mergedCerebellumGeom = null;
     const geometriesToMerge = [];
     group.traverse(child => {
         if (child.isMesh) {
            child.updateMatrix(); // Ensure matrix is up-to-date
            const clonedGeom = child.geometry.clone();
            clonedGeom.applyMatrix4(child.matrix); // Apply transformation
            geometriesToMerge.push(clonedGeom);
         }
     });
     if (geometriesToMerge.length > 0) {
         mergedCerebellumGeom = BufferGeometryUtils.mergeGeometries(geometriesToMerge);
         if(mergedCerebellumGeom) mergedCerebellumGeom.center();
     }

     return mergedCerebellumGeom || createEllipsoidGeometry(1.5, {x: 1.5, y: 1, z: 1.2}); // Fallback
}

// Improved Hippocampus Curve
function createHippocampusCurve() {
     // More points for a smoother C-shape
     return new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),      // Start near amygdala position
        new THREE.Vector3(0.5, 0.1, -0.8), // Curve backwards and slightly up
        new THREE.Vector3(0.6, 0.15, -1.8),
        new THREE.Vector3(0.4, 0.1, -2.5), // Curve downwards
        new THREE.Vector3(-0.2, -0.1, -2.8), // Curve forwards again
        new THREE.Vector3(-0.8, -0.2, -2.5) // End point
     ]);
}


// --- Mesh Creation Functions (Using new geometries) ---

function createLobes(lobesGroup, meshesList) {
    lobeConfig.forEach(config => {
        let geometry;
        // Use custom shapes if defined
        if (config.shape === 'multiSphere') {
            geometry = createCerebellumGeometry(); // Cerebellum specific
             geometry.scale(config.scale.x, config.scale.y, config.scale.z); // Scale after creation
        } else if (config.shape === 'brainstem') {
            geometry = createBrainstemGeometry();
             geometry.scale(config.scale.x, config.scale.y, config.scale.z);
        }
        else {
            // Default to ellipsoid for other lobes
            geometry = createEllipsoidGeometry(1.5, config.scale); // Base radius 1.5, apply lobe scale
        }

        const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        mesh.userData = {
            name: config.name, type: 'lobe',
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: `The ${config.name}. Key roles include... [Add specific info later]`
        };
        lobesGroup.add(mesh);
        meshesList.push(mesh);
    });

    // Mirror Temporal Lobe (adjust position based on new scale/pos)
    const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        // temporalLobeMesh.rotation.y = -Math.PI / 16; // Keep rotation if desired
        const temporalLobeMeshRight = temporalLobeMesh.clone(); // Clone includes geometry+transform
        temporalLobeMeshRight.position.x *= -1; // Mirror position
        temporalLobeMeshRight.rotation.y *= -1; // Mirror rotation

        const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        temporalLobeMeshRight.userData = {
            name: temporalLobeMesh.userData.name, type: temporalLobeMesh.userData.type,
            originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
            info: temporalLobeMesh.userData.info
        };
        temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial; // Assign cloned material
        lobesGroup.add(temporalLobeMeshRight);
        meshesList.push(temporalLobeMeshRight);
    }
}

function createDeepStructures(deepGroup, meshesList) {
    deepStructureConfig.forEach(config => {
        let geometry;
        let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);

        // Select geometry based on config.shape
        if (config.shape === 'ellipsoid') {
            geometry = createEllipsoidGeometry(1.0, config.scale); // Base radius 1, use config scale
        } else if (config.shape === 'box') {
             geometry = new THREE.BoxGeometry(config.scale.x * 2, config.scale.y * 2, config.scale.z * 2); // Use scale for size
        } else if (config.shape === 'hippocampusCurve') {
            const curve = createHippocampusCurve();
            geometry = new THREE.TubeGeometry(curve, 20, 0.25, 8, false); // Adjust segments/radius
            // Position is applied to mesh below, curve starts at 0,0,0 relative
        } else {
            // Default to Sphere
            geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8);
        }

        const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.copy(meshPosition); // Apply position AFTER geometry creation

        // Add right-side counterpart for paired structures
        if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) {
             const meshRight = mesh.clone();
             meshRight.position.x *= -1; // Mirror position X

             // Create new materials for the right side
             const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
             meshRight.userData = {
                 name: config.name, type: 'deep_structure', function: config.function,
                 originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
                 info: `${config.name}: ${config.function}`
             };
             meshRight.material = meshRight.userData.originalMaterial; // Assign material
             deepGroup.add(meshRight);
             meshesList.push(meshRight);
         }

        // Set userData for the original (left or central) mesh
        mesh.userData = {
            name: config.name, type: 'deep_structure', function: config.function,
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: `${config.name}: ${config.function}`
        };
        deepGroup.add(mesh);
        meshesList.push(mesh);
    });
}

// Nerves remain TubeGeometry - adjust radius if needed
function createCranialNerves(nervesGroup, meshesList) {
    const nerveRadius = 0.06; // Slightly thinner nerves
    const radialSegments = 5;
    const tubularSegmentsMultiplier = 10; // More segments for smoother curves

    cranialNerveConfig.forEach(config => {
        const points = config.path.map(p => new THREE.Vector3(p.x, p.y, p.z));
        if (points.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeLength = curve.getLength();
        const tubularSegments = Math.max(10, Math.ceil(tubeLength * tubularSegmentsMultiplier));
        const geometry = new THREE.TubeGeometry(curve, tubularSegments, nerveRadius, radialSegments, false);
        const materials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);

        const fullName = `CN ${config.num}: ${config.name}`;
        const fullInfo = `${fullName} (${config.type}) - Function: ${config.function}`;

        if (!['I'].includes(config.num)) {
            const meshRight = mesh.clone();
            const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));
            if(rightPoints.length >= 2) {
                const rightCurve = new THREE.CatmullRomCurve3(rightPoints);
                const rightTubeLength = rightCurve.getLength();
                const rightTubularSegments = Math.max(10, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                meshRight.geometry.dispose();
                meshRight.geometry = new THREE.TubeGeometry(rightCurve, rightTubularSegments, nerveRadius, radialSegments, false);
            }
            const rightMaterials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
            meshRight.userData = {
                name: fullName, type: 'cranial_nerve', function: config.function,
                nerveInfo: { num: config.num, name: config.name, type: config.type },
                originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
                info: fullInfo
            };
            meshRight.material = meshRight.userData.originalMaterial;
            nervesGroup.add(meshRight);
            meshesList.push(meshRight);
        }

        mesh.userData = {
            name: fullName, type: 'cranial_nerve', function: config.function,
            nerveInfo: { num: config.num, name: config.name, type: config.type },
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: fullInfo
        };
        nervesGroup.add(mesh);
        meshesList.push(mesh);
    });
}


// --- Main Function to Create Entire Model ---
function createBrainModel() {
    const brainGroup = new THREE.Group(); const lobesGroup = new THREE.Group();
    const deepGroup = new THREE.Group(); const nervesGroup = new THREE.Group();
    const allMeshes = [];
    lobesGroup.name = "Lobes"; deepGroup.name = "DeepStructures"; nervesGroup.name = "CranialNerves";
    createLobes(lobesGroup, allMeshes);
    createDeepStructures(deepGroup, allMeshes);
    createCranialNerves(nervesGroup, allMeshes);
    brainGroup.add(lobesGroup); brainGroup.add(deepGroup); brainGroup.add(nervesGroup);
    brainGroup.position.y = -0.5; // Keep overall adjustment
    console.log("Procedural brain model created."); // Add log
    return { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes };
}

export { createBrainModel };