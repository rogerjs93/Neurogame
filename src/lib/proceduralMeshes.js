// File: src/lib/proceduralMeshes.js
import * as THREE from 'three';
// Import BufferGeometryUtils correctly
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// --- Import Simplex Noise ---
import { createNoise3D } from 'simplex-noise';
// --------------------------

// --- Material Definitions ---
const baseMaterialSettings = {
    roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.95,
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
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x666600, opacity: 1.0 });
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xbbbb00, opacity: 1.0 });
const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0044cc, opacity: 1.0 });
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0077ff, opacity: 1.0 });
const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x33cc44, opacity: 0.95 });
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x66ff77, opacity: 1.0 });


// --- Configuration Data ---
// Adjusted positions and scales for slightly better layout
const lobeConfig = [
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

const cranialNerveConfig = [
    { num: 'I', name: 'Olfactory', type: 'S', function: 'Smell.', color: 0xffa07a, path: [{ x: 0, y: 0.5, z: 4 }, { x: 0, y: 0, z: 5 }] },
    { num: 'II', name: 'Optic', type: 'S', function: 'Vision.', color: 0xffd700, path: [{ x: 0, y: -0.5, z: 1.5 }, { x: -0.5, y: -0.6, z: -1 }, { x: 0, y: 1.0, z: -3.7 }] },
    { num: 'III', name: 'Oculomotor', type: 'M', function: 'Most eye movements, pupil constriction.', color: 0xadd8e6, path: [{ x: 0.3, y: -1.5, z: 0.5 }, { x: 0.6, y: -1.0, z: 2.5 }, { x: 0.7, y: -0.5, z: 4.5 }] },
    { num: 'IV', name: 'Trochlear', type: 'M', function: 'Moves superior oblique eye muscle.', color: 0x90ee90, path: [{ x: -0.3, y: -1.7, z: -1.0 }, { x: -0.6, y: -1.0, z: 2.5 }, { x: -0.7, y: -0.5, z: 4.5 }] },
    { num: 'V', name: 'Trigeminal', type: 'B', function: 'Facial sensation, chewing.', color: 0xffb6c1, path: [{ x: 1.0, y: -1.8, z: -1.0 }, { x: 2.0, y: -1.5, z: 1.0 }, { x: 2.5, y: -1.0, z: 3.0 }] },
    { num: 'VI', name: 'Abducens', type: 'M', function: 'Moves lateral rectus eye muscle.', color: 0xdda0dd, path: [{ x: 0.2, y: -2.2, z: -0.2 }, { x: 0.5, y: -1.0, z: 2.5 }, { x: 0.6, y: -0.5, z: 4.5 }] },
    { num: 'VII', name: 'Facial', type: 'B', function: 'Facial expression, taste (ant. 2/3).', color: 0x87cefa, path: [{ x: 0.8, y: -2.0, z: -1.2 }, { x: 1.5, y: -1.8, z: 0.5 }, { x: 1.8, y: -1.5, z: 2.5 }] },
    { num: 'VIII', name: 'Vestibulocochlear', type: 'S', function: 'Hearing, balance.', color: 0x32cd32, path: [{ x: 1.2, y: -1.9, z: -1.5 }, { x: 1.8, y: -1.5, z: -0.5 }, { x: 2.2, y: -0.8, z: 0.5 } ] },
    { num: 'IX', name: 'Glossopharyngeal', type: 'B', function: 'Taste (post. 1/3), swallowing.', color: 0x6a5acd, path: [{ x: 0.6, y: -2.5, z: -1.0 }, { x: 1.0, y: -2.8, z: 0.5 }, { x: 1.2, y: -3.0, z: 2.0 }] },
    { num: 'X', name: 'Vagus', type: 'B', function: 'Visceral sensation/motor (heart, lungs, digestion).', color: 0x778899, path: [{ x: 0.5, y: -2.8, z: -0.8 }, { x: 0.8, y: -3.5, z: 0.5 }, { x: 0.8, y: -4.5, z: 2.0 } ] },
    { num: 'XI', name: 'Accessory', type: 'M', function: 'Moves head and shoulders (SCM, Trapezius).', color: 0xbdb76b, path: [{ x: 0.4, y: -3.2, z: -0.6 }, { x: 0.6, y: -4.0, z: 0.0 }, { x: 0.6, y: -4.5, z: 1.5 }] },
    { num: 'XII', name: 'Hypoglossal', type: 'M', function: 'Tongue movements.', color: 0xfa8072, path: [{ x: 0.3, y: -3.0, z: -0.4 }, { x: 0.4, y: -3.2, z: 1.0 }, { x: 0.4, y: -3.0, z: 2.5 }] },
];

// --- Noise Instance ---
const noise3D = createNoise3D(); // Create one noise instance for displacement

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) {
    const original = baseMaterial.clone(); original.color.setHex(baseColorHex);
    const highlight = highlightMaterial.clone(); highlight.color.setHex(baseColorHex);
    const selected = selectedMaterial.clone(); selected.color.setHex(baseColorHex);
    return { original, highlight, selected };
}

// --- Geometry Generation Helper Functions ---

// Applies simple displacement to vertices along their normals using Simplex Noise
function applyVertexDisplacement(geometry, baseMagnitude = 0.15, baseFrequency = 1.5, numOctaves = 3, persistence = 0.5, lacunarity = 2.0) {
    const positionAttribute = geometry.attributes.position;
    const normalAttribute = geometry.attributes.normal;
    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();

    if (!positionAttribute || !normalAttribute) { console.warn("Geometry missing attributes for displacement."); return; }
    if (!geometry.hasAttribute('normal')) { geometry.computeVertexNormals(); console.log("Computed vertex normals before displacement."); }
    const normals = geometry.attributes.normal; // Use potentially recomputed normals

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        normal.fromBufferAttribute(normals, i);

        let noiseValue = 0;
        let frequency = baseFrequency;
        let amplitude = 1.0;

        // Fractal Noise (fBM)
        for (let o = 0; o < numOctaves; o++) {
            let n = noise3D(vertex.x * frequency, vertex.y * frequency, vertex.z * frequency);
            noiseValue += n * amplitude;
            amplitude *= persistence; frequency *= lacunarity;
        }

        const displacement = baseMagnitude * noiseValue;
        vertex.addScaledVector(normal, displacement);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positionAttribute.needsUpdate = true;
    // Recompute normals AFTER displacement for accurate lighting
    geometry.computeVertexNormals();
}

// Creates an ellipsoid (squashed sphere)
function createEllipsoidGeometry(radius, scale, applyDisplacement = false) {
    try {
        const detail = applyDisplacement ? 64 : 32;
        const geom = new THREE.SphereGeometry(radius, detail, detail / 2);
        geom.scale(scale.x, scale.y, scale.z);
        if (applyDisplacement) {
            if (!geom.attributes.normal) geom.computeVertexNormals();
            applyVertexDisplacement(geom, 0.2, 1.0, 4, 0.5, 2.0); // Use new function
        }
        return geom;
    } catch (error) { console.error("Error creating ellipsoid:", error); return new THREE.SphereGeometry(radius, 8, 6); }
}

// Creates a simplified brainstem shape
function createBrainstemGeometry() {
    try {
        const midbrainGeom = new THREE.CylinderGeometry(0.6, 0.7, 1.0, 16); midbrainGeom.translate(0, 1.0, 0);
        const ponsGeom = new THREE.CylinderGeometry(0.7, 0.8, 1.2, 16); ponsGeom.translate(0, -0.1, 0);
        const medullaGeom = new THREE.CylinderGeometry(0.8, 0.5, 1.5, 16); medullaGeom.translate(0, -1.3, 0);
        const geometries = [midbrainGeom, ponsGeom, medullaGeom].filter(g => g instanceof THREE.BufferGeometry);
        if (geometries.length === 0) throw new Error("No valid brainstem components.");
        const mergedGeom = BufferGeometryUtils.mergeGeometries(geometries);
        if (mergedGeom) { mergedGeom.center(); return mergedGeom; }
        else { console.warn("Brainstem merge returned null, using fallback."); return new THREE.CylinderGeometry(0.6, 0.6, 3.0, 16); }
    } catch (error) { console.error("Error creating brainstem:", error); return new THREE.CylinderGeometry(0.6, 0.6, 3.0, 16); }
}

// Creates a more detailed cerebellum shape
function createCerebellumGeometry() {
     try {
        const group = new THREE.Group();
        const mainSphereGeom = createEllipsoidGeometry(1, {x: 1.5, y: 0.8, z: 1.2});
        if (!mainSphereGeom) throw new Error("Failed to create main cerebellum sphere.");
        group.add(new THREE.Mesh(mainSphereGeom));
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
             if (child.isMesh && child.geometry instanceof THREE.BufferGeometry) {
                child.updateMatrixWorld(true); const clonedGeom = child.geometry.clone();
                clonedGeom.applyMatrix4(child.matrixWorld); geometriesToMerge.push(clonedGeom);
             }
         });
         if (geometriesToMerge.length > 0) {
             mergedCerebellumGeom = BufferGeometryUtils.mergeGeometries(geometriesToMerge);
             if(mergedCerebellumGeom) { mergedCerebellumGeom.center(); return mergedCerebellumGeom; }
             else { console.warn("Cerebellum merge returned null, using fallback."); }
         } else { console.warn("No geometries to merge for Cerebellum, using fallback."); }
         return createEllipsoidGeometry(1.5, {x: 1.5, y: 1, z: 1.2}); // Fallback
     } catch (error) { console.error("Error creating cerebellum:", error); return createEllipsoidGeometry(1.5, {x: 1.5, y: 1, z: 1.2}); }
}

// Defines the path for the hippocampus curve
function createHippocampusCurve() {
     return new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.1, -0.8), new THREE.Vector3(0.6, 0.15, -1.8),
        new THREE.Vector3(0.4, 0.1, -2.5), new THREE.Vector3(-0.2, -0.1, -2.8), new THREE.Vector3(-0.8, -0.2, -2.5)
     ]);
}


// --- Mesh Creation Functions (With Logging & Info) ---
function createLobes(lobesGroup, meshesList) {
    console.log("Creating Lobes...");
    const lobeInfoMap = { 'Frontal Lobe': 'Planning, decision-making, voluntary movement.', 'Parietal Lobe': 'Sensory input, spatial awareness.', 'Temporal Lobe': 'Auditory processing, memory, language.', 'Occipital Lobe': 'Visual processing.', 'Cerebellum': 'Coordination, balance, motor learning.', 'Brainstem': 'Vital functions, relay.' };
    lobeConfig.forEach((config, index) => {
        try {
            let geometry; let isLobeShape = !['Cerebellum', 'Brainstem'].includes(config.name);
            // console.log(`  Generating geometry for ${config.name}...`); // Less verbose

            if (config.shape === 'multiSphere') { geometry = createCerebellumGeometry(); }
            else if (config.shape === 'brainstem') { geometry = createBrainstemGeometry(); }
            else { geometry = createEllipsoidGeometry(1.5, config.scale, isLobeShape); } // Apply displacement

            if (!geometry) throw new Error("Geometry creation returned null or undefined.");

            // Scale after creation for merged/complex shapes
            if (config.shape === 'multiSphere' || config.shape === 'brainstem') {
                 geometry.scale(config.scale.x, config.scale.y, config.scale.z);
            }

            const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
            const mesh = new THREE.Mesh(geometry, materials.original);
            mesh.position.set(config.position.x, config.position.y, config.position.z);
            mesh.userData = { name: config.name, type: 'lobe', originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: lobeInfoMap[config.name] || 'Brain region.' };
            lobesGroup.add(mesh); meshesList.push(mesh);
        } catch (error) { console.error(`Error creating mesh for ${config.name} (index ${index}):`, error); }
    });
    // Mirror Temporal Lobe
    try {
        const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
        if (temporalLobeMesh) {
            const temporalLobeMeshRight = temporalLobeMesh.clone();
            temporalLobeMeshRight.position.x *= -1; temporalLobeMeshRight.rotation.y *= -1;
            const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
            temporalLobeMeshRight.userData = { name: temporalLobeMesh.userData.name, type: temporalLobeMesh.userData.type, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: temporalLobeMesh.userData.info };
            temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;
            lobesGroup.add(temporalLobeMeshRight); meshesList.push(temporalLobeMeshRight);
        }
    } catch (error) { console.error("Error mirroring Temporal Lobe:", error); }
    console.log(`Finished creating Lobes. Total meshes in list now: ${meshesList.length}`);
}

function createDeepStructures(deepGroup, meshesList) {
    console.log("Creating Deep Structures...");
    const initialLength = meshesList.length;
    deepStructureConfig.forEach((config, index) => {
         try {
            let geometry; let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
            // console.log(`  Generating geometry for ${config.name}...`); // Less verbose

            if (config.shape === 'ellipsoid') { geometry = createEllipsoidGeometry(1.0, config.scale); }
            else if (config.shape === 'box') { geometry = new THREE.BoxGeometry(config.scale.x * 2, config.scale.y * 2, config.scale.z * 2); }
            else if (config.shape === 'hippocampusCurve') { const curve = createHippocampusCurve(); geometry = new THREE.TubeGeometry(curve, 20, 0.25, 8, false); }
            else { geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8); }

            if (!geometry) throw new Error("Geometry creation returned null or undefined.");

            const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
            const mesh = new THREE.Mesh(geometry, materials.original); mesh.position.copy(meshPosition);
            const structureInfo = `${config.name}: ${config.function || 'Deep structure.'}`;
            mesh.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: structureInfo };
            deepGroup.add(mesh); meshesList.push(mesh);

            // Mirroring paired structures
            if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) {
                // console.log(`   Mirroring ${config.name}...`);
                 const meshRight = mesh.clone(); meshRight.position.x *= -1;
                 const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
                 meshRight.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: structureInfo };
                 meshRight.material = meshRight.userData.originalMaterial;
                 deepGroup.add(meshRight); meshesList.push(meshRight);
            }
         } catch (error) { console.error(`Error creating mesh for ${config.name} (index ${index}):`, error); }
    });
    console.log(`Finished creating Deep Structures. Meshes added: ${meshesList.length - initialLength}. Total in list: ${meshesList.length}`);
}

function createCranialNerves(nervesGroup, meshesList) {
    console.log("Creating Cranial Nerves...");
    const initialLength = meshesList.length;
    const nerveRadius = 0.06; const radialSegments = 5; const tubularSegmentsMultiplier = 10;

    cranialNerveConfig.forEach((config, index) => {
        const fullName = `CN ${config.num}: ${config.name}`;
        try {
            const points = config.path.map(p => new THREE.Vector3(p.x, p.y, p.z));
            if (points.length < 2) { console.warn(`Skipping ${fullName}: needs >= 2 path points.`); return; }
            const curve = new THREE.CatmullRomCurve3(points);
            const tubeLength = curve.getLength();
            if (tubeLength <= 1e-6) { console.warn(`Skipping ${fullName}: curve has zero or negligible length.`); return; } // More robust length check
            const tubularSegments = Math.max(10, Math.ceil(tubeLength * tubularSegmentsMultiplier));
            const geometry = new THREE.TubeGeometry(curve, tubularSegments, nerveRadius, radialSegments, false);
            if (!geometry) throw new Error("Original TubeGeometry failed.");

            const materials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
            const mesh = new THREE.Mesh(geometry, materials.original);
            const nerveInfo = `${fullName} (${config.type}) - Function: ${config.function || 'Info...'}`;
            mesh.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: nerveInfo };
            nervesGroup.add(mesh); meshesList.push(mesh);

            // Mirroring
            if (!['I'].includes(config.num)) {
                let meshRight = null;
                try {
                    meshRight = mesh.clone();
                    const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));
                    if(rightPoints.length >= 2) {
                        const rightCurve = new THREE.CatmullRomCurve3(rightPoints);
                        const rightTubeLength = rightCurve.getLength();
                        if (rightTubeLength <= 1e-6) throw new Error("Mirrored curve zero length.");
                        const rightTubularSegments = Math.max(10, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                        if(meshRight.geometry) meshRight.geometry.dispose();
                        meshRight.geometry = new THREE.TubeGeometry(rightCurve, rightTubularSegments, nerveRadius, radialSegments, false);
                        if (!meshRight.geometry) throw new Error("Mirrored TubeGeometry failed.");

                        const rightMaterials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
                        meshRight.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: nerveInfo };
                        meshRight.material = meshRight.userData.originalMaterial;
                        nervesGroup.add(meshRight); meshesList.push(meshRight);
                    }
                } catch (mirrorError) {
                    console.error(`   Error mirroring ${fullName}:`, mirrorError);
                    if (meshRight && meshRight.parent) meshRight.parent.remove(meshRight); if (meshRight && meshRight.geometry) meshRight.geometry.dispose();
                }
            }
        } catch (error) { console.error(`Error creating mesh for ${fullName} (index ${index}):`, error); }
    });
    console.log(`Finished creating Cranial Nerves. Meshes added: ${meshesList.length - initialLength}. Total in list: ${meshesList.length}`);
}


// --- Main Function to Create Entire Model ---
// Ensure this structure returns the object correctly
function createBrainModel() {
    const brainGroup = new THREE.Group();
    const lobesGroup = new THREE.Group();
    const deepGroup = new THREE.Group();
    const nervesGroup = new THREE.Group();
    const allMeshes = []; // Initialize empty array HERE

    lobesGroup.name = "Lobes";
    deepGroup.name = "DeepStructures";
    nervesGroup.name = "CranialNerves";

    console.log("Starting brain model creation...");
    // Call functions to populate groups AND allMeshes
    createLobes(lobesGroup, allMeshes);
    createDeepStructures(deepGroup, allMeshes);
    createCranialNerves(nervesGroup, allMeshes);

    // Add populated groups to the main group
    brainGroup.add(lobesGroup);
    brainGroup.add(deepGroup);
    brainGroup.add(nervesGroup);

    brainGroup.position.y = -0.5; // Overall positioning

    console.log(`Procedural brain model creation finished. Final total meshes in allMeshes: ${allMeshes.length}`);
    if (allMeshes.length === 0) {
        console.error("CRITICAL: allMeshes array is empty after all creation functions!");
    }
    // Return the required object structure
    return { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes };
}

export { createBrainModel }; // Export the main function