import * as THREE from 'three';

// --- Material Definitions ---
const baseMaterialSettings = {
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
    clippingPlanes: [], // Initialize for potential local clipping if needed later
    clipIntersection: false,
};
const deepStructureMaterialSettings = {
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
    clippingPlanes: [],
    clipIntersection: false,
};
const nerveMaterialSettings = {
    roughness: 0.8,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide, // Good for thin tubes
    clippingPlanes: [],
    clipIntersection: false,
};

// Base Materials (Define once)
// Note: We will apply global clipping via renderer, but materials need the property
const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x555555, opacity: 1.0 });
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xAAAAAA, opacity: 1.0 });

const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x3344ff, opacity: 1.0 });
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x6677ff, opacity: 1.0 });

const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x44ff66, opacity: 0.95 });
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x88ffaa, opacity: 1.0 });


// --- Configuration Data ---
const lobeConfig = [
    { name: 'Frontal Lobe', color: 0x4a90e2, position: { x: 0, y: 1.5, z: 2.5 }, scale: { x: 3, y: 2.5, z: 3 } },
    { name: 'Parietal Lobe', color: 0xf5a623, position: { x: 0, y: 2.5, z: -0.5 }, scale: { x: 2.8, y: 2.5, z: 3.5 } },
    { name: 'Temporal Lobe', color: 0x7ed321, position: { x: -2.5, y: -0.5, z: 0.5 }, scale: { x: 2, y: 1.8, z: 4 } },
    { name: 'Occipital Lobe', color: 0xbd10e0, position: { x: 0, y: 1.5, z: -3.5 }, scale: { x: 2.5, y: 2, z: 2 } },
    { name: 'Cerebellum', color: 0x9013fe, position: { x: 0, y: -1.5, z: -2.5 }, scale: { x: 2.5, y: 1.5, z: 2 } },
    { name: 'Brainstem', color: 0x50e3c2, position: { x: 0, y: -2.0, z: -0.5 }, scale: { x: 0.8, y: 2.5, z: 0.8 } }
];

const deepStructureConfig = [
    { name: 'Thalamus', color: 0xff6b6b, function: 'Major sensory and motor relay station.', position: { x: 0, y: 0.5, z: -0.5 }, radius: 1.0 },
    { name: 'Hypothalamus', color: 0xffd166, function: 'Regulates hormones, temperature, hunger, etc.', position: { x: 0, y: -0.5, z: 0.5 }, radius: 0.5 },
    { name: 'Hippocampus', color: 0x06d6a0, function: 'Crucial for forming new memories.', position: { x: -1.5, y: -0.2, z: -1.0 }, shape: 'curve', scale: { x: 1, y: 1, z: 1 } },
    { name: 'Amygdala', color: 0x118ab2, function: 'Involved in processing emotions, especially fear.', position: { x: -1.8, y: -0.3, z: 0.5 }, radius: 0.4 },
    { name: 'Pituitary Gland', color: 0xef476f, function: 'Master gland controlling hormone release.', position: { x: 0, y: -1.0, z: 0.8 }, radius: 0.3 },
];

// S=Sensory, M=Motor, B=Both
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

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) {
    const original = baseMaterial.clone();
    original.color.setHex(baseColorHex);

    const highlight = highlightMaterial.clone();
    highlight.color.setHex(baseColorHex);

    const selected = selectedMaterial.clone();
    selected.color.setHex(baseColorHex);

    return { original, highlight, selected };
}

// --- Mesh Creation Functions (Add to specific groups) ---

function createLobes(lobesGroup, meshesList) {
    lobeConfig.forEach(config => {
        const geometry = new THREE.SphereGeometry(1.5, 32, 16);
        geometry.scale(config.scale.x, config.scale.y, config.scale.z);
        const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.set(config.position.x, config.position.y, config.position.z);
        mesh.userData = {
            name: config.name, type: 'lobe',
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: `The ${config.name}. Key roles include higher cognitive functions, sensory processing, vision, or auditory processing.`
        };
        lobesGroup.add(mesh); // Add to specific group
        meshesList.push(mesh);
    });

    // Mirror Temporal Lobe
    const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        temporalLobeMesh.rotation.y = -Math.PI / 16;
        const temporalLobeMeshRight = temporalLobeMesh.clone();
        temporalLobeMeshRight.position.x *= -1;
        temporalLobeMeshRight.rotation.y *= -1;
        const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);
        temporalLobeMeshRight.userData = {
            name: temporalLobeMesh.userData.name, type: temporalLobeMesh.userData.type,
            originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
            info: temporalLobeMesh.userData.info
        };
        temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;
        lobesGroup.add(temporalLobeMeshRight); // Add to specific group
        meshesList.push(temporalLobeMeshRight);
    }
}

function createDeepStructures(deepGroup, meshesList) {
    deepStructureConfig.forEach(config => {
        let geometry;
        let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);

        if (config.shape === 'curve') {
             const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 0.2, -1.0), new THREE.Vector3(0.2, 0.1, -2.0),
             ]);
             geometry = new THREE.TubeGeometry(curve, 10, 0.3, 8, false);
             geometry.scale(config.scale.x, config.scale.y, config.scale.z);
        } else {
            geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8);
        }

        const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.copy(meshPosition); // Apply position

        // Add right-side counterpart
        if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) {
             const meshRight = mesh.clone();
             meshRight.position.x *= -1;
             const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
             meshRight.userData = {
                 name: config.name, type: 'deep_structure', function: config.function,
                 originalMaterial: rightMaterials.original, highlightMaterial: rightMaterials.highlight, selectedMaterial: rightMaterials.selected,
                 info: `${config.name}: ${config.function}`
             };
             meshRight.material = meshRight.userData.originalMaterial;
             deepGroup.add(meshRight); // Add to specific group
             meshesList.push(meshRight);
         }

        // Set userData for the original mesh
        mesh.userData = {
            name: config.name, type: 'deep_structure', function: config.function,
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: `${config.name}: ${config.function}`
        };
        deepGroup.add(mesh); // Add to specific group
        meshesList.push(mesh);
    });
}

function createCranialNerves(nervesGroup, meshesList) {
    const nerveRadius = 0.08;
    const radialSegments = 6;
    const tubularSegmentsMultiplier = 8;

    cranialNerveConfig.forEach(config => {
        const points = config.path.map(p => new THREE.Vector3(p.x, p.y, p.z));
        if (points.length < 2) return;
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeLength = curve.getLength();
        const tubularSegments = Math.max(8, Math.ceil(tubeLength * tubularSegmentsMultiplier));
        const geometry = new THREE.TubeGeometry(curve, tubularSegments, nerveRadius, radialSegments, false);
        const materials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);

        const fullName = `CN ${config.num}: ${config.name}`;
        const fullInfo = `${fullName} (${config.type}) - Function: ${config.function}`;

        // Add right-side counterpart
        if (!['I'].includes(config.num)) {
            const meshRight = mesh.clone();
            const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));
            if(rightPoints.length >= 2) {
                const rightCurve = new THREE.CatmullRomCurve3(rightPoints);
                const rightTubeLength = rightCurve.getLength();
                const rightTubularSegments = Math.max(8, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                meshRight.geometry.dispose(); // Dispose old geometry before assigning new one
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
            nervesGroup.add(meshRight); // Add to specific group
            meshesList.push(meshRight);
        }

        // Set userData for the original mesh
        mesh.userData = {
            name: fullName, type: 'cranial_nerve', function: config.function,
            nerveInfo: { num: config.num, name: config.name, type: config.type },
            originalMaterial: materials.original, highlightMaterial: materials.highlight, selectedMaterial: materials.selected,
            info: fullInfo
        };
        nervesGroup.add(mesh); // Add to specific group
        meshesList.push(mesh);
    });
}

// --- Main Function to Create Entire Model (Return Groups) ---
function createBrainModel() {
    const brainGroup = new THREE.Group(); // Master group for overall positioning
    const lobesGroup = new THREE.Group();
    const deepGroup = new THREE.Group();
    const nervesGroup = new THREE.Group();
    const allMeshes = []; // Still need flat list for interaction

    lobesGroup.name = "Lobes";
    deepGroup.name = "DeepStructures";
    nervesGroup.name = "CranialNerves";

    // Populate the specific groups
    createLobes(lobesGroup, allMeshes);
    createDeepStructures(deepGroup, allMeshes);
    createCranialNerves(nervesGroup, allMeshes);

    // Add subgroups to the main brain group
    brainGroup.add(lobesGroup);
    brainGroup.add(deepGroup);
    brainGroup.add(nervesGroup);

    brainGroup.position.y = -0.5; // Adjust overall position

    // Return the master group, subgroups, and the flat mesh list
    return { brainGroup, lobesGroup, deepGroup, nervesGroup, allMeshes };
}

export { createBrainModel };