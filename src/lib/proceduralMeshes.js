// File: src/lib/proceduralMeshes.js
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// --- Import Simplex Noise ---
import { createNoise3D } from 'simplex-noise';
// --------------------------

// --- Material Definitions (Keep as is) ---
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

// --- Configuration Data (Keep as is) ---
const lobeConfig = [ /* ... */ ];
const deepStructureConfig = [ /* ... */ ];
const cranialNerveConfig = [ /* ... */ ];

// --- Noise Instance ---
const noise3D = createNoise3D(); // Create one noise instance

// --- Helper Function for Materials ---
function createMaterials(baseColorHex, baseMaterial, highlightMaterial, selectedMaterial) { /* ... */ }

// --- Geometry Generation Helper Functions ---

// --- MODIFIED applyVertexDisplacement using Simplex Noise ---
function applyVertexDisplacement(geometry, baseMagnitude = 0.15, baseFrequency = 1.5, numOctaves = 3, persistence = 0.5, lacunarity = 2.0) {
    const positionAttribute = geometry.attributes.position;
    const normalAttribute = geometry.attributes.normal;
    const vertex = new THREE.Vector3();
    const normal = new THREE.Vector3();

    if (!positionAttribute || !normalAttribute) { console.warn("Geometry missing attributes for displacement."); return; }
    if (!geometry.hasAttribute('normal')) { geometry.computeVertexNormals(); console.log("Computed vertex normals before displacement."); }
    const normals = geometry.attributes.normal; // Use computed normals

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        normal.fromBufferAttribute(normals, i);

        let noiseValue = 0;
        let frequency = baseFrequency;
        let amplitude = 1.0; // Start with amplitude 1, scale with magnitude later

        // Fractal Noise (fBM - Fractal Brownian Motion)
        for (let o = 0; o < numOctaves; o++) {
            // Get 3D noise value based on vertex position * frequency
            // noise3D returns values between -1 and 1
            let n = noise3D(vertex.x * frequency, vertex.y * frequency, vertex.z * frequency);
            noiseValue += n * amplitude;

            // Prepare for next octave
            amplitude *= persistence; // Amplitude decreases each octave
            frequency *= lacunarity; // Frequency increases each octave
        }

        // Normalize noiseValue roughly (depends on octaves/persistence)
        // and scale by baseMagnitude
        const displacement = baseMagnitude * noiseValue;

        // Apply displacement along the normal
        vertex.addScaledVector(normal, displacement);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positionAttribute.needsUpdate = true;
    // Recompute normals AFTER displacement for accurate lighting
    geometry.computeVertexNormals();
}
// -------------------------------------------------------------

// Creates an ellipsoid, uses new displacement function
function createEllipsoidGeometry(radius, scale, applyDisplacement = false) {
    try {
        const detail = applyDisplacement ? 64 : 32; // INCREASED DETAIL for better displacement results
        const geom = new THREE.SphereGeometry(radius, detail, detail / 2);
        geom.scale(scale.x, scale.y, scale.z);
        if (applyDisplacement) {
            if (!geom.attributes.normal) geom.computeVertexNormals(); // Ensure normals exist
            applyVertexDisplacement(geom, 0.2, 1.0, 4, 0.5, 2.0); // Use new function with fBM settings
        }
        return geom;
    } catch (error) { console.error("Error creating ellipsoid:", error); return new THREE.SphereGeometry(radius, 8, 6); }
}

// --- Other Geometry Helpers (Keep as before) ---
function createBrainstemGeometry() { /* ... */ }
function createCerebellumGeometry() { /* ... */ }
function createHippocampusCurve() { /* ... */ }

// --- Mesh Creation Functions ---
// Modified createLobes to use the potentially displaced ellipsoid
function createLobes(lobesGroup, meshesList) {
    console.log("Creating Lobes...");
    const lobeInfoMap = { /* ... */ };
    lobeConfig.forEach((config, index) => {
        try {
            let geometry; let isLobeShape = !['Cerebellum', 'Brainstem'].includes(config.name);
            // console.log(`  Generating geometry for ${config.name}... Shape: ${config.shape || 'ellipsoid'}`); // Less verbose logging

            if (config.shape === 'multiSphere') { geometry = createCerebellumGeometry(); }
            else if (config.shape === 'brainstem') { geometry = createBrainstemGeometry(); }
            else {
                // Apply displacement to cerebral lobes
                geometry = createEllipsoidGeometry(1.5, config.scale, isLobeShape);
            }
            if (!geometry) throw new Error("Geometry creation returned null or undefined.");

            // Scale after creation ONLY for non-ellipsoid base shapes now
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
    // Mirror Temporal Lobe (logic remains same)
    try {
        const temporalLobeMesh = meshesList.find(m => m.userData.name === 'Temporal Lobe');
        if (temporalLobeMesh) { /* ... mirror logic ... */ }
    } catch (error) { console.error("Error mirroring Temporal Lobe:", error); }
    console.log(`Finished creating Lobes. Total meshes in list: ${meshesList.length}`);
}

// --- createDeepStructures, createCranialNerves (Keep as before) ---
function createDeepStructures(deepGroup, meshesList) { /* ... */ }
function createCranialNerves(nervesGroup, meshesList) { /* ... */ }

// --- Main createBrainModel function (Keep as before) ---
function createBrainModel() { /* ... */ }

export { createBrainModel };