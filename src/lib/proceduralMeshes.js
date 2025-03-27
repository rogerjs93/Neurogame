import * as THREE from 'three';

// --- Configuration for Lobes ---
const lobeConfig = [
    { name: 'Frontal Lobe', color: 0x4a90e2, position: { x: 0, y: 1.5, z: 2.5 }, scale: { x: 3, y: 2.5, z: 3 } },
    { name: 'Parietal Lobe', color: 0xf5a623, position: { x: 0, y: 2.5, z: -0.5 }, scale: { x: 2.8, y: 2.5, z: 3.5 } },
    { name: 'Temporal Lobe', color: 0x7ed321, position: { x: -2.5, y: -0.5, z: 0.5 }, scale: { x: 2, y: 1.8, z: 4 } },
    { name: 'Occipital Lobe', color: 0xbd10e0, position: { x: 0, y: 1.5, z: -3.5 }, scale: { x: 2.5, y: 2, z: 2 } },
    { name: 'Cerebellum', color: 0x9013fe, position: { x: 0, y: -1.5, z: -2.5 }, scale: { x: 2.5, y: 1.5, z: 2 } },
    { name: 'Brainstem', color: 0x50e3c2, position: { x: 0, y: -2.0, z: -0.5 }, scale: { x: 0.8, y: 2.5, z: 0.8 } }
];

// --- Material Definitions ---
// Define base materials once
const baseMaterialSettings = {
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
};

const defaultMaterialBase = new THREE.MeshStandardMaterial(baseMaterialSettings);

const highlightMaterialBase = new THREE.MeshStandardMaterial({
    ...baseMaterialSettings, // Spread base settings
    emissive: 0x555555, // Add emissive for highlight
    opacity: 1.0
});

const selectedMaterialBase = new THREE.MeshStandardMaterial({
    ...baseMaterialSettings, // Spread base settings
    emissive: 0xAAAAAA, // Stronger emissive for selected
    opacity: 1.0,
    // wireframe: true // Optional: Use wireframe for selection
});


// --- Function to Create Lobes ---
function createProceduralLobes() {
    const brainGroup = new THREE.Group();
    const lobeMeshes = []; // Array to hold the meshes for interaction

    lobeConfig.forEach(config => {
        // Using SphereGeometry and scaling it - simple start
        const geometry = new THREE.SphereGeometry(1.5, 32, 16); // Base size
        geometry.scale(config.scale.x, config.scale.y, config.scale.z); // Apply non-uniform scale

        // Using BoxGeometry - alternative simple shape
        // const geometry = new THREE.BoxGeometry(config.scale.x, config.scale.y, config.scale.z);

        // Clone base materials and set unique color for this lobe
        const originalMaterial = defaultMaterialBase.clone();
        originalMaterial.color.setHex(config.color);

        const highlightMaterial = highlightMaterialBase.clone();
        highlightMaterial.color.setHex(config.color); // Keep base color

        const selectedMaterial = selectedMaterialBase.clone();
        selectedMaterial.color.setHex(config.color); // Keep base color


        const mesh = new THREE.Mesh(geometry, originalMaterial); // Start with original material
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        // Store metadata for identification and interaction
        mesh.userData = {
            name: config.name,
            type: 'lobe',
            originalMaterial: originalMaterial, // Store the specific cloned material instance
            highlightMaterial: highlightMaterial, // Store the specific cloned material instance
            selectedMaterial: selectedMaterial, // Store the specific cloned material instance
        };

        brainGroup.add(mesh);
        lobeMeshes.push(mesh);
    });

    // --- Handle Mirroring for Temporal Lobe ---
    const temporalLobeMesh = lobeMeshes.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        // Apply asymmetry adjustments to the first one if desired
        temporalLobeMesh.rotation.y = -Math.PI / 16; // Slight inward rotation (optional)

        // Clone the first temporal lobe mesh to create the second one
        const temporalLobeMeshRight = temporalLobeMesh.clone(); // Clones geometry, position, rotation, scale

        // Mirror its position and rotation
        temporalLobeMeshRight.position.x *= -1;
        temporalLobeMeshRight.rotation.y *= -1;

        // --- Correctly Handle userData and Materials for the Clone ---
        // Create a new userData object for the cloned mesh
        temporalLobeMeshRight.userData = {
            name: temporalLobeMesh.userData.name, // Keep the same name
            type: temporalLobeMesh.userData.type, // Keep the same type
            // Create *new* clones of the materials specific to the right lobe
            originalMaterial: temporalLobeMesh.userData.originalMaterial.clone(),
            highlightMaterial: temporalLobeMesh.userData.highlightMaterial.clone(),
            selectedMaterial: temporalLobeMesh.userData.selectedMaterial.clone(),
        };
        // Set the cloned mesh's active material to its own unique original material
        temporalLobeMeshRight.material = temporalLobeMeshRight.userData.originalMaterial;
        // --- End Corrected Handling ---

        // Add the mirrored lobe to the group and the interactable list
        brainGroup.add(temporalLobeMeshRight);
        lobeMeshes.push(temporalLobeMeshRight);
    }
    // --- End Mirroring ---

    brainGroup.position.y = -0.5; // Center the group roughly vertically
    return { brainGroup, lobeMeshes };
}

export { createProceduralLobes };