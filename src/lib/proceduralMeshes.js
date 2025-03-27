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
const defaultMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9
});

const highlightMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.1,
    emissive: 0x333300, // Slight yellow glow
    transparent: true,
    opacity: 1.0
});

const selectedMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.1,
    emissive: 0x666600, // Stronger yellow glow
    transparent: true,
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

        const material = defaultMaterial.clone(); // Clone to set unique color
        material.color.setHex(config.color);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(config.position.x, config.position.y, config.position.z);

        // Store metadata for identification and interaction
        mesh.userData = {
            name: config.name,
            type: 'lobe',
            originalMaterial: material, // Store original for hover-off/deselect
            highlightMaterial: highlightMaterial.clone().setValues({color: material.color, emissive: 0x555555}), // Keep base color, add emissive
            selectedMaterial: selectedMaterial.clone().setValues({color: material.color, emissive: 0xAAAAAA}), // Keep base color, stronger emissive
        };

        brainGroup.add(mesh);
        lobeMeshes.push(mesh);
    });

    // Adjust Temporal Lobe rotation slightly for better asymmetry (example)
    const temporalLobeMesh = lobeMeshes.find(m => m.userData.name === 'Temporal Lobe');
    if (temporalLobeMesh) {
        temporalLobeMesh.rotation.y = -Math.PI / 16; // Slight inward rotation

        // Add the other Temporal Lobe (mirrored)
        const temporalLobeMeshRight = temporalLobeMesh.clone();
        temporalLobeMeshRight.position.x *= -1; // Mirror position
        temporalLobeMeshRight.rotation.y *= -1; // Mirror rotation
        // Important: Clone userData materials too if you didn't share them
         temporalLobeMeshRight.userData = JSON.parse(JSON.stringify(temporalLobeMesh.userData)); // Deep copy simple data
         temporalLobeMeshRight.userData.originalMaterial = temporalLobeMesh.userData.originalMaterial.clone();
         temporalLobeMeshRight.userData.highlightMaterial = temporalLobeMesh.userData.highlightMaterial.clone();
         temporalLobeMeshRight.userData.selectedMaterial = temporalLobeMesh.userData.selectedMaterial.clone();


        brainGroup.add(temporalLobeMeshRight);
        lobeMeshes.push(temporalLobeMeshRight); // Add to interactable list
    }


    brainGroup.position.y = -0.5; // Center the group roughly vertically
    return { brainGroup, lobeMeshes };
}

export { createProceduralLobes };