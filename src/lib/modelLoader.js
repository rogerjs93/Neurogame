// File: src/lib/modelLoader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- Material Definitions ---
const highlightEmissive = 0x777700; // Slightly less intense yellow
const selectedEmissive = 0xcccc00; // Brighter yellow
const defaultOpacity = 0.85; // Default opacity for brain parts
const highlightOpacity = 0.95;
const selectedOpacity = 1.0;


// Helper function to create highlight/selected variants of a material
function createMaterialVariants(originalMaterial) {
    // Ensure original material supports transparency if we change opacity
    if (!originalMaterial.transparent) {
        originalMaterial.transparent = true;
    }
    // Ensure original opacity is set if not defined or fully opaque
    if (originalMaterial.opacity === 1.0 || typeof originalMaterial.opacity === 'undefined') {
        originalMaterial.opacity = defaultOpacity;
    }

    const highlight = originalMaterial.clone();
    highlight.emissive = new THREE.Color(highlightEmissive);
    highlight.opacity = highlightOpacity;
    // Make sure highlight material is also transparent
    highlight.transparent = true;


    const selected = originalMaterial.clone();
    selected.emissive = new THREE.Color(selectedEmissive);
    selected.opacity = selectedOpacity;
    // Make sure selected material is also transparent
    selected.transparent = true;


    return { highlight, selected };
}

// Helper function to get info string based on display name
function getBrainPartInfo(name) {
    const infoMap = {
        'Frontal Lobe': 'Planning, decision-making, voluntary movement (motor cortex), personality.',
        'Parietal Lobe': 'Sensory input (touch, temp, pain), spatial awareness, navigation.',
        'Temporal Lobe': 'Auditory processing, memory formation, language comprehension.',
        'Occipital Lobe': 'Primary visual processing center.',
        'Insula Lobe': 'Consciousness, emotion, homeostasis, perception, self-awareness.',
        'Cerebellum': 'Coordinates movement, balance, posture, motor learning.',
        'Pons (Brainstem)': 'Relay signals, sleep, respiration, swallowing, bladder control, etc.',
        'Medulla (Brainstem)': 'Autonomic functions (breathing, heart rate, blood pressure).',
        'Thalamus': 'Major relay station for sensory and motor signals, consciousness, sleep, alertness.',
        'Hypothalamus': 'Links nervous system to endocrine system via pituitary gland; regulates temperature, hunger, thirst, sleep cycles.',
        'Hippocampus': 'Consolidation of short-term to long-term memory, spatial memory.',
        'Amygdala': 'Processing memory, decision-making, emotional responses (fear, anxiety, aggression).',
        'Caudate': 'Part of basal ganglia; involved in motor control, procedural learning, associative learning, inhibitory control.',
        'Putamen': 'Part of basal ganglia; regulates movements, influences learning.',
        'Nucleus Accumbens': 'Part of basal ganglia; central role in reward circuit, motivation, addiction.',
        'Globus Pallidus': 'Part of basal ganglia; involved in regulation of voluntary movement.',
        'Pituitary': 'Master gland controlling many hormonal functions (if present).',
        // Add default case
        'Default': 'Select a specific brain region for more information.'
    };
    // Handle potential combined names from brainstem parts
    if (name === 'Pons (Brainstem)') return infoMap['Pons (Brainstem)'];
    if (name === 'Medulla (Brainstem)') return infoMap['Medulla (Brainstem)'];
    // Otherwise, use the direct name or default
    return infoMap[name] || infoMap['Default'];
}


// --- Main Loading Function ---
function loadBrainModel(scene, onLoadCallback) {
    const loader = new GLTFLoader();
    // --- POINT TO THE HUMAN ATLAS FILENAME ---
    const modelPath = './human_brain_atlas_500um.glb';
    // ---------------------------------------

    console.log(`Loading model from: ${modelPath}`);

    loader.load(
        modelPath,
        // Success callback
        (gltf) => {
            console.log("GLTF model loaded successfully.", gltf);
            const loadedModel = gltf.scene;
            const interactableObjects = []; // Flat list for interaction.js
            // Store meshes by category for layer toggling in main.js
            const categorizedMeshes = {
                lobe: [],
                deep_structure: [],
                cranial_nerve: [] // Keep just in case nerves are added later
            };

            loadedModel.traverse((child) => {
                if (child.isMesh) {
                    // console.log(`Processing mesh: ${child.name}`); // Less verbose log

                    // Ensure material is standard and setup for effects/clipping
                    let currentMaterial = child.material;
                    if (!(currentMaterial instanceof THREE.MeshStandardMaterial)) {
                         // Convert non-standard materials if found
                        const standardMaterial = new THREE.MeshStandardMaterial({
                            color: currentMaterial.color || 0xffffff, map: currentMaterial.map || null,
                            roughness: 0.85, metalness: 0.1, transparent: true, opacity: defaultOpacity,
                            clippingPlanes: [], clipIntersection: false
                        });
                        child.material = standardMaterial;
                        currentMaterial = standardMaterial;
                    } else {
                        // Ensure existing standard materials have needed properties
                        currentMaterial.clippingPlanes = currentMaterial.clippingPlanes || [];
                        currentMaterial.clipIntersection = currentMaterial.clipIntersection || false;
                        currentMaterial.transparent = true;
                        // Only set default opacity if it's currently fully opaque
                        if (currentMaterial.opacity >= 1.0) {
                             currentMaterial.opacity = defaultOpacity;
                        }
                    }

                    // --- Identify Parts by Name (Matching Python export keys/display_names) ---
                    let partType = null;
                    let displayName = child.name.replace(/_/g, " "); // Use GLTF node name, replace underscores
                    const nameLower = child.name.toLowerCase();

                    // Match based on the display names (keys) used in the Python script's regions_map
                    if (nameLower.includes('frontal_lobe')) { partType = 'lobe'; displayName="Frontal Lobe"; }
                    else if (nameLower.includes('parietal_lobe')) { partType = 'lobe'; displayName="Parietal Lobe";}
                    else if (nameLower.includes('temporal_lobe')) { partType = 'lobe'; displayName="Temporal Lobe";}
                    else if (nameLower.includes('occipital_lobe')) { partType = 'lobe'; displayName="Occipital Lobe";}
                    else if (nameLower.includes('insula_lobe')) { partType = 'lobe'; displayName="Insula Lobe";}
                    else if (nameLower.includes('cerebellum')) { partType = 'lobe'; displayName="Cerebellum";}
                    else if (nameLower.includes('pons')) { partType = 'lobe'; displayName="Pons (Brainstem)";} // Combined name
                    else if (nameLower.includes('medulla')) { partType = 'lobe'; displayName="Medulla (Brainstem)";} // Combined name
                    else if (nameLower.includes('thalamus')) { partType = 'deep_structure'; displayName="Thalamus";}
                    else if (nameLower.includes('hypothalamus')) { partType = 'deep_structure'; displayName="Hypothalamus";}
                    else if (nameLower.includes('hippocampus')) { partType = 'deep_structure'; displayName="Hippocampus";}
                    else if (nameLower.includes('amygdala')) { partType = 'deep_structure'; displayName="Amygdala";}
                    else if (nameLower.includes('caudate')) { partType = 'deep_structure'; displayName="Caudate";}
                    else if (nameLower.includes('putamen')) { partType = 'deep_structure'; displayName="Putamen";}
                    else if (nameLower.includes('nucleus_accumbens')) { partType = 'deep_structure'; displayName="Nucleus Accumbens";}
                    else if (nameLower.includes('globus_pallidus')) { partType = 'deep_structure'; displayName="Globus Pallidus";}
                    else if (nameLower.includes('pituitary')) { partType = 'deep_structure'; displayName="Pituitary";}

                    if (partType) {
                        child.castShadow = false; child.receiveShadow = false; // Optimize

                        const originalMaterial = child.material;
                        const { highlight, selected } = createMaterialVariants(originalMaterial);

                        // Assign UserData
                        child.userData = {
                            name: displayName, // Use the cleaned-up display name
                            type: partType,
                            originalMaterial: originalMaterial,
                            highlightMaterial: highlight,
                            selectedMaterial: selected,
                            info: getBrainPartInfo(displayName) // Get info using helper
                        };

                        // Add to interactable list and categorized list
                        interactableObjects.push(child);
                        if (categorizedMeshes[partType]) {
                             categorizedMeshes[partType].push(child);
                        } else {
                             console.warn(`Mesh '${displayName}' has unexpected partType '${partType}'.`);
                             // Add to a default category or ignore for toggling?
                        }
                        // console.log(`  -> Identified '${displayName}' as type '${partType}'. Added.`); // Less verbose log
                    } else {
                        // console.log(`  -> Mesh '${child.name}' skipped.`); // Less verbose log
                        // Make skipped parts almost transparent? Helps focus on main parts.
                        if(child.material) {
                             child.material.transparent = true;
                             child.material.opacity = 0.05;
                        }
                    }
                }
            });

            // Center and Scale the Loaded Model
            try {
                const box = new THREE.Box3().setFromObject(loadedModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Check if size is valid before scaling
                if (size.x > 0 && size.y > 0 && size.z > 0) {
                    loadedModel.position.sub(center); // Center at origin
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const desiredSize = 18; // Adjust target size for the scene
                    const scale = desiredSize / maxDim;
                    loadedModel.scale.setScalar(scale);
                    console.log(`Model centered and scaled by ${scale.toFixed(2)}.`);
                } else {
                    console.warn("Model has zero size, skipping centering and scaling.");
                    // Position fallback if needed
                    loadedModel.position.set(0, -1, 0);
                }
            } catch(e) {
                 console.error("Error during model centering/scaling:", e);
                 loadedModel.position.set(0, -1, 0); // Basic position fallback
            }


            scene.add(loadedModel); // Add the processed model group
            console.log(`Model processing complete. ${interactableObjects.length} interactables found.`);

            // Call the callback function from main.js
            if (onLoadCallback && typeof onLoadCallback === 'function') {
                onLoadCallback(interactableObjects, categorizedMeshes); // Pass lists
            }
        },
        // Progress callback
        (xhr) => {
             const percentLoaded = (xhr.loaded / xhr.total * 100);
             // console.log(percentLoaded.toFixed(0) + '% loaded');
             // Optionally update loading instruction text here
        },
        // Error callback
        (error) => {
            console.error('An error happened during GLTF loading:', error);
            if (onLoadCallback && typeof onLoadCallback === 'function') {
                onLoadCallback([], {}); // Send empty data on error
            }
        }
    );
}

export { loadBrainModel };