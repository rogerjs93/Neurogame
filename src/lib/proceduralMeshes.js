// File: src/lib/proceduralMeshes.js
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// --- Material Definitions (Keep as is) ---
const baseMaterialSettings = { roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.95, clippingPlanes: [], clipIntersection: false, };
const deepStructureMaterialSettings = { roughness: 0.8, metalness: 0.0, transparent: true, opacity: 0.98, clippingPlanes: [], clipIntersection: false, };
const nerveMaterialSettings = { roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.9, side: THREE.DoubleSide, clippingPlanes: [], clipIntersection: false, };
const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x666600, opacity: 1.0 });
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xbbbb00, opacity: 1.0 });
const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0044cc, opacity: 1.0 });
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x0077ff, opacity: 1.0 });
const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x33cc44, opacity: 0.95 });
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x66ff77, opacity: 1.0 });

// --- Configuration Data (Keep as is) ---
const lobeConfig = [ /* ... */ ];
const deepStructureConfig = [ /* ... */ ];
const cranialNerveConfig = [ /* ... */ ];

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) { /* ... */ }

// --- Improved Geometry Generation ---

// Helper function to apply simple vertex displacement
function applyVertexDisplacement(geometry, magnitude = 0.1, frequency = 5.0) {
    const positionAttribute = geometry.attributes.position;
    const normalAttribute = geometry.attributes.normal;
    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();

    if (!positionAttribute || !normalAttribute) {
        console.warn("Geometry missing position or normal attributes for displacement.");
        return;
    }

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        normal.fromBufferAttribute(normalAttribute, i);

        // Simple displacement based on vertex position using sine waves
        // Combine waves along different axes for more variation
        const displacement = magnitude * (
            Math.sin(frequency * vertex.x) * Math.cos(frequency * vertex.z) +
            Math.sin(frequency * vertex.y * 0.8) * Math.cos(frequency * vertex.x * 1.2) +
            Math.sin(frequency * vertex.z * 1.1) * Math.cos(frequency * vertex.y * 0.9)
        ) / 3.0; // Average the displacement

        // Move vertex along its normal
        vertex.addScaledVector(normal, displacement);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positionAttribute.needsUpdate = true;
    // Normals might need recalculation if displacement is large
    // geometry.computeVertexNormals(); // Uncomment if lighting looks wrong after displacement
}


function createEllipsoidGeometry(radius, scale, applyDisplacement = false) {
    // Use higher detail for lobes to allow for displacement
    const detail = applyDisplacement ? 48 : 32;
    const geom = new THREE.SphereGeometry(radius, detail, detail / 2);
    geom.scale(scale.x, scale.y, scale.z);

    if (applyDisplacement) {
        geom.computeVertexNormals(); // Ensure normals are computed BEFORE displacement
        applyVertexDisplacement(geom, 0.15, 4.0); // Apply displacement (adjust magnitude/frequency)
    }
    return geom;
}

function createBrainstemGeometry() { /* ... (keep from previous version) ... */ }
function createCerebellumGeometry() { /* ... (keep from previous version) ... */ }
function createHippocampusCurve() { /* ... (keep from previous version) ... */ }


// --- Mesh Creation Functions (Populate .info) ---

function createLobes(lobesGroup, meshesList) {
    // More specific (though still placeholder) info
    const lobeInfoMap = {
        'Frontal Lobe': 'Associated with planning, decision-making, working memory, personality, and voluntary movement (motor cortex).',
        'Parietal Lobe': 'Processes sensory information (touch, temperature, pain, pressure), spatial awareness, navigation, and proprioception.',
        'Temporal Lobe': 'Involved in processing auditory information, language comprehension (Wernicke\'s area), memory formation, and object recognition.',
        'Occipital Lobe': 'Primarily responsible for processing visual information received from the eyes.',
        'Cerebellum': 'Coordinates voluntary movements (posture, balance, coordination, speech), resulting in smooth, balanced muscular activity. Also involved in some cognitive functions.',
        'Brainstem': 'Connects cerebrum and cerebellum to spinal cord. Controls vital autonomic functions (breathing, heart rate, sleep, eating). Includes midbrain, pons, and medulla oblongata.'
    };

    lobeConfig.forEach(config => {
        let geometry;
        let isLobeShape = !['Cerebellum', 'Brainstem'].includes(config.name); // Check if it's a main lobe

        if (config.shape === 'multiSphere') { geometry = createCerebellumGeometry(); geometry.scale(config.scale.x, config.scale.y, config.scale.z); }
        else if (config.shape === 'brainstem') { geometry = createBrainstemGeometry(); geometry.scale(config.scale.x, config.scale.y, config.scale.z); }
        else {
            // Apply displacement ONLY to the main cerebral lobes
            geometry = createEllipsoidGeometry(1.5, config.scale, isLobeShape);
        }

        const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        // --- Populate .info ---
        mesh.userData = {
            name: config.name, type: 'lobe',
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: lobeInfoMap[config.name] || 'General brain region information.' // Use map or fallback
        };
        lobesGroup.add(mesh); meshesList.push(mesh);
    });

    // Mirror Temporal Lobe
    const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        const temporalLobeMeshRight = temporalLobeMesh.clone();
        temporalLobeMeshRight.position.x *= -1; temporalLobeMeshRight.rotation.y *= -1;
        const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        // --- Ensure mirrored lobe also gets info ---
        temporalLobeMeshRight.userData = {
            name: temporalLobeMesh.userData.name, type: temporalLobeMesh.userData.type,
            originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
            info: temporalLobeMesh.userData.info // Copy info from original
        };
        temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;
        lobesGroup.add(temporalLobeMeshRight); meshesList.push(temporalLobeMeshRight);
    }
}

function createDeepStructures(deepGroup, meshesList) {
    deepStructureConfig.forEach(config => {
        let geometry; let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
        if (config.shape === 'ellipsoid') { geometry = createEllipsoidGeometry(1.0, config.scale); }
        else if (config.shape === 'box') { geometry = new THREE.BoxGeometry(config.scale.x * 2, config.scale.y * 2, config.scale.z * 2); }
        else if (config.shape === 'hippocampusCurve') { const curve = createHippocampusCurve(); geometry = new THREE.TubeGeometry(curve, 20, 0.25, 8, false); }
        else { geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8); }

        const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original); mesh.position.copy(meshPosition);
        // --- Combine name and function for .info ---
        const structureInfo = `${config.name}: ${config.function || 'Key deep brain structure.'}`;

        if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) {
             const meshRight = mesh.clone(); meshRight.position.x *= -1;
             const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
             meshRight.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: structureInfo }; // Add info
             meshRight.material = meshRight.userData.originalMaterial; deepGroup.add(meshRight); meshesList.push(meshRight);
         }

        mesh.userData = { name: config.name, type: 'deep_structure', function: config.function, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: structureInfo }; // Add info
        deepGroup.add(mesh); meshesList.push(mesh);
    });
}

function createCranialNerves(nervesGroup, meshesList) {
    const nerveRadius = 0.06; const radialSegments = 5; const tubularSegmentsMultiplier = 10;
    cranialNerveConfig.forEach(config => {
        const points = config.path.map(p => new THREE.Vector3(p.x, p.y, p.z)); if (points.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(points); const tubeLength = curve.getLength();
        const tubularSegments = Math.max(10, Math.ceil(tubeLength * tubularSegmentsMultiplier));
        const geometry = new THREE.TubeGeometry(curve, tubularSegments, nerveRadius, radialSegments, false);
        const materials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        const fullName = `CN ${config.num}: ${config.name}`;
        // --- Combine details for .info ---
        const nerveInfo = `${fullName} (${config.type}) - Function: ${config.function || 'Sensory/Motor/Mixed nerve.'}`;

        if (!['I'].includes(config.num)) {
            const meshRight = mesh.clone(); const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));
            if(rightPoints.length >= 2) {
                const rightCurve = new THREE.CatmullRomCurve3(rightPoints); const rightTubeLength = rightCurve.getLength();
                const rightTubularSegments = Math.max(10, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                meshRight.geometry.dispose(); meshRight.geometry = new THREE.TubeGeometry(rightCurve, rightTubularSegments, nerveRadius, radialSegments, false);
            }
            const rightMaterials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
            meshRight.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected, info: nerveInfo }; // Add info
            meshRight.material = meshRight.userData.originalMaterial; nervesGroup.add(meshRight); meshesList.push(meshRight);
        }

        mesh.userData = { name: fullName, type: 'cranial_nerve', function: config.function, nerveInfo: { num: config.num, name: config.name, type: config.type }, originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected, info: nerveInfo }; // Add info
        nervesGroup.add(mesh); meshesList.push(mesh);
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
    brainGroup.position.y = -0.5;
    console.log("Procedural brain model created.");
    return { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes };
}

export { createBrainModel };