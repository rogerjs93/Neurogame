import * as THREE from 'three';

// --- Material Definitions ---
const baseMaterialSettings = {
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
};
const deepStructureMaterialSettings = { // Slightly different look
    roughness: 0.6,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95
};
const nerveMaterialSettings = {
    roughness: 0.8,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide // Good for thin tubes
};

// Base Materials (Define once)
const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);
const highlightMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0x555555, opacity: 1.0 });
const selectedMaterialBase = new THREE.MeshStandardMaterial({ ...baseMaterialSettings, emissive: 0xAAAAAA, opacity: 1.0 });

const deepStructureDefaultBase = new THREE.MeshStandardMaterial(deepStructureMaterialSettings);
const deepStructureHighlightBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x3344ff, opacity: 1.0 }); // Blueish highlight
const deepStructureSelectedBase = new THREE.MeshStandardMaterial({ ...deepStructureMaterialSettings, emissive: 0x6677ff, opacity: 1.0 }); // Stronger blueish highlight

const nerveDefaultBase = new THREE.MeshStandardMaterial(nerveMaterialSettings);
const nerveHighlightBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x44ff66, opacity: 0.95 }); // Greenish highlight
const nerveSelectedBase = new THREE.MeshStandardMaterial({ ...nerveMaterialSettings, emissive: 0x88ffaa, opacity: 1.0 }); // Stronger greenish highlight


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
    { name: 'Hippocampus', color: 0x06d6a0, function: 'Crucial for forming new memories.', position: { x: -1.5, y: -0.2, z: -1.0 }, shape: 'curve', scale: { x: 1, y: 1, z: 1 } }, // Position is start of curve
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
    highlight.color.setHex(baseColorHex); // Keep base color

    const selected = selectedMaterial.clone();
    selected.color.setHex(baseColorHex); // Keep base color

    return { original, highlight, selected };
}

// --- Mesh Creation Functions ---

function createLobes(group, meshesList) {
    lobeConfig.forEach(config => {
        const geometry = new THREE.SphereGeometry(1.5, 32, 16);
        geometry.scale(config.scale.x, config.scale.y, config.scale.z);

        const materials = createMaterials(config.color, defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);

        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        mesh.userData = {
            name: config.name,
            type: 'lobe',
            originalMaterial: materials.original,
            highlightMaterial: materials.highlight,
            selectedMaterial: materials.selected,
            info: `The ${config.name}. Key roles include higher cognitive functions, sensory processing, vision, or auditory processing.` // Generic lobe info
        };

        group.add(mesh);
        meshesList.push(mesh);
    });

    // Mirror Temporal Lobe
    const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        temporalLobeMesh.rotation.y = -Math.PI / 16;
        const temporalLobeMeshRight = temporalLobeMesh.clone();
        temporalLobeMeshRight.position.x *= -1;
        temporalLobeMeshRight.rotation.y *= -1;

        // Create new materials for the right side to avoid sharing instances
        const rightMaterials = createMaterials(temporalLobeMesh.userData.originalMaterial.color.getHex(), defaultMaterialBase, highlightMaterialBase, selectedMaterialBase);

        temporalLobeMeshRight.userData = {
            name: temporalLobeMesh.userData.name,
            type: temporalLobeMesh.userData.type,
            originalMaterial: rightMaterials.original,
            highlightMaterial: rightMaterials.highlight,
            selectedMaterial: rightMaterials.selected,
            info: temporalLobeMesh.userData.info
        };
        temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;

        group.add(temporalLobeMeshRight);
        meshesList.push(temporalLobeMeshRight);
    }
}

function createDeepStructures(group, meshesList) {
    deepStructureConfig.forEach(config => {
        let geometry;
        let meshPosition = new THREE.Vector3(config.position.x, config.position.y, config.position.z);

        if (config.shape === 'curve') {
             const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0), // Start curve relative to position
                new THREE.Vector3(0.5, 0.2, -1.0),
                new THREE.Vector3(0.2, 0.1, -2.0),
             ]);
             geometry = new THREE.TubeGeometry(curve, 10, 0.3, 8, false);
             geometry.scale(config.scale.x, config.scale.y, config.scale.z);
             // Position applied to mesh below
        } else {
            geometry = new THREE.SphereGeometry(config.radius || 0.5, 16, 8);
             // Position applied to mesh below
        }

        const materials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);
        const mesh = new THREE.Mesh(geometry, materials.original);
        mesh.position.copy(meshPosition); // Apply position

        // Add right-side counterpart for paired structures
        let meshRight = null;
        if (['Amygdala', 'Hippocampus', 'Thalamus'].includes(config.name)) { // Thalamus is also paired
             meshRight = mesh.clone();
             meshRight.position.x *= -1; // Mirror position X

             // Create new materials for the right side
             const rightMaterials = createMaterials(config.color, deepStructureDefaultBase, deepStructureHighlightBase, deepStructureSelectedBase);

             meshRight.userData = {
                 name: config.name, // Keep same name
                 type: 'deep_structure',
                 function: config.function,
                 originalMaterial: rightMaterials.original,
                 highlightMaterial: rightMaterials.highlight,
                 selectedMaterial: rightMaterials.selected,
                 info: `${config.name}: ${config.function}`
             };
             meshRight.material = meshRight.userData.originalMaterial;

             group.add(meshRight);
             meshesList.push(meshRight);
         }

        // Set userData for the original (left or central) mesh
        mesh.userData = {
            name: config.name,
            type: 'deep_structure',
            function: config.function,
            originalMaterial: materials.original,
            highlightMaterial: materials.highlight,
            selectedMaterial: materials.selected,
            info: `${config.name}: ${config.function}`
        };

        group.add(mesh);
        meshesList.push(mesh);
    });
}


function createCranialNerves(group, meshesList) {
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

        // Add right-side counterpart (most nerves are paired)
        let meshRight = null;
        // Nerves II through XII are typically paired originating from brainstem/diencephalon
        if (!['I'].includes(config.num)) { // Exclude Olfactory (often shown centrally initially)
            meshRight = mesh.clone(); // Clone the mesh first

            // Create mirrored path points
            const rightPoints = config.path.map(p => new THREE.Vector3(-p.x, p.y, p.z));

            if(rightPoints.length >= 2) {
                const rightCurve = new THREE.CatmullRomCurve3(rightPoints);
                const rightTubeLength = rightCurve.getLength();
                const rightTubularSegments = Math.max(8, Math.ceil(rightTubeLength * tubularSegmentsMultiplier));
                // Create and assign *new* geometry for the right side
                meshRight.geometry.dispose(); // Dispose old geometry
                meshRight.geometry = new THREE.TubeGeometry(rightCurve, rightTubularSegments, nerveRadius, radialSegments, false);
            }

            // Create new materials for the right side
            const rightMaterials = createMaterials(config.color, nerveDefaultBase, nerveHighlightBase, nerveSelectedBase);

            meshRight.userData = {
                name: fullName, // Same name
                type: 'cranial_nerve',
                function: config.function,
                nerveInfo: { num: config.num, name: config.name, type: config.type },
                originalMaterial: rightMaterials.original,
                highlightMaterial: rightMaterials.highlight,
                selectedMaterial: rightMaterials.selected,
                info: fullInfo // Same info
            };
            meshRight.material = meshRight.userData.originalMaterial; // Assign the material

            group.add(meshRight);
            meshesList.push(meshRight);
        }

        // Set userData for the original (left or central) mesh
        mesh.userData = {
            name: fullName,
            type: 'cranial_nerve',
            function: config.function,
            nerveInfo: { num: config.num, name: config.name, type: config.type },
            originalMaterial: materials.original,
            highlightMaterial: materials.highlight,
            selectedMaterial: materials.selected,
            info: fullInfo
        };

        group.add(mesh);
        meshesList.push(mesh);
    });
}

// --- Main Function to Create Entire Model ---
function createBrainModel() {
    const brainGroup = new THREE.Group();
    const allMeshes = []; // Flat list for interaction

    createLobes(brainGroup, allMeshes);
    createDeepStructures(brainGroup, allMeshes);
    createCranialNerves(brainGroup, allMeshes);

    brainGroup.position.y = -0.5; // Adjust overall position
    return { brainGroup, allMeshes };
}

<<<<<<< HEAD
export { createBrainModel }; // Export the main function
=======
export { createBrainModel }; // Export the main function
>>>>>>> 6d0e3509b060d413bb2268cc0a34a16f0e8d46c5
