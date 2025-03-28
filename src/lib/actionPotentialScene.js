// File: src/lib/actionPotentialScene.js

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import eventBus from './eventBus.js'; // <-- Import event bus

// --- REMOVED UI Manager import ---

// --- Constants ---
const MEMBRANE_WIDTH = 20;
const MEMBRANE_HEIGHT = 10;
const ION_COUNT = 50;
const CHANNEL_RADIUS = 0.3;
const CHANNEL_HEIGHT = 1.2;
const PUMP_SIZE = 0.8;

// Colors
const COLOR_NA = 0xffa500;
const COLOR_K = 0xadd8e6;
const COLOR_MEMBRANE_REST = 0x6495ED;
const COLOR_MEMBRANE_ACTIVE = 0xFF4500;
const COLOR_NA_CHANNEL = 0xff6347;
const COLOR_K_CHANNEL = 0x4682b4;
const COLOR_PUMP = 0x9acd32;

// States
const STATE_CLOSED = 'closed';
const STATE_OPEN = 'open';
const STATE_INACTIVE = 'inactive';


// --- Scene Variables ---
let apScene, apCamera, apRenderer, apControls;
let membraneMesh;
let naChannelMeshes = [], kChannelMeshes = [];
let pumpMesh;
let naIonsInstanced, kIonsInstanced;
let ionPositions = { na: [], k: [] };

// Animation state
let animationState = {
    time: 0,
    phase: 'resting',
    potential: -70,
    isPlaying: false,
};
let potentialTween = null;


// --- Initialization ---
function initActionPotentialScene(canvasElement, parentRenderer) {
    apRenderer = parentRenderer;

    apScene = new THREE.Scene();
    apScene.background = new THREE.Color(0x333344);

    const aspect = window.innerWidth / window.innerHeight;
    apCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    apCamera.position.set(0, 5, 18);
    apCamera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    apScene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    apScene.add(directionalLight);

    apControls = new OrbitControls(apCamera, apRenderer.domElement);
    apControls.enableDamping = true;
    apControls.dampingFactor = 0.1;
    apControls.target.set(0, 0, 0);
    apControls.minDistance = 5;
    apControls.maxDistance = 30;
    apControls.enabled = false;

    createMembrane();
    createChannels();
    createPump();
    createIons();

    resetSimulation();

    console.log("Action Potential Scene Initialized.");
    return { apScene, apCamera, apControls };
}

// --- Component Creation ---
function createMembrane() {
    const geometry = new THREE.PlaneGeometry(MEMBRANE_WIDTH, MEMBRANE_HEIGHT);
    const material = new THREE.MeshStandardMaterial({
        color: COLOR_MEMBRANE_REST,
        side: THREE.DoubleSide,
        roughness: 0.8,
        metalness: 0.1,
    });
    membraneMesh = new THREE.Mesh(geometry, material);
    membraneMesh.rotation.x = Math.PI / 2;
    apScene.add(membraneMesh);
}

function createChannels() {
    const naGeom = new THREE.CylinderGeometry(CHANNEL_RADIUS, CHANNEL_RADIUS, CHANNEL_HEIGHT, 16);
    const kGeom = new THREE.CylinderGeometry(CHANNEL_RADIUS * 0.9, CHANNEL_RADIUS * 0.9, CHANNEL_HEIGHT * 0.95, 16);
    const baseNaMat = new THREE.MeshStandardMaterial({ color: COLOR_NA_CHANNEL, roughness: 0.5 });
    const baseKMat = new THREE.MeshStandardMaterial({ color: COLOR_K_CHANNEL, roughness: 0.5 });

    naChannelMeshes = [];
    kChannelMeshes = [];

    for (let i = 0; i < 3; i++) {
        const material = baseNaMat.clone();
        const mesh = new THREE.Mesh(naGeom, material);
        const xPos = (i - 1) * (MEMBRANE_WIDTH / 4);
        mesh.position.set(xPos, 0, 0);
        mesh.userData = { type: 'na_channel', state: STATE_CLOSED, baseColor: COLOR_NA_CHANNEL };
        apScene.add(mesh);
        naChannelMeshes.push(mesh);
    }

    for (let i = 0; i < 3; i++) {
        const material = baseKMat.clone();
        const mesh = new THREE.Mesh(kGeom, material);
        const xPos = (i - 1) * (MEMBRANE_WIDTH / 4) + (MEMBRANE_WIDTH / 8);
        mesh.position.set(xPos, 0, (Math.random() - 0.5) * 2);
        mesh.userData = { type: 'k_channel', state: STATE_CLOSED, baseColor: COLOR_K_CHANNEL };
        apScene.add(mesh);
        kChannelMeshes.push(mesh);
    }
}

function createPump() {
    const mainGeom = new THREE.BoxGeometry(PUMP_SIZE, PUMP_SIZE / 2, PUMP_SIZE);
    const partGeom = new THREE.BoxGeometry(PUMP_SIZE / 3, PUMP_SIZE, PUMP_SIZE / 3);
    const pumpMaterial = new THREE.MeshStandardMaterial({ color: COLOR_PUMP, roughness: 0.6 });

    pumpMesh = new THREE.Group();
    const mainPart = new THREE.Mesh(mainGeom, pumpMaterial);
    const part1 = new THREE.Mesh(partGeom, pumpMaterial.clone());
    part1.position.x = PUMP_SIZE / 2;
    const part2 = new THREE.Mesh(partGeom, pumpMaterial.clone());
    part2.position.x = -PUMP_SIZE / 2;

    pumpMesh.add(mainPart); pumpMesh.add(part1); pumpMesh.add(part2);
    pumpMesh.position.set(0, 0, MEMBRANE_HEIGHT / 3);
    pumpMesh.userData = { type: 'pump', active: true };
    apScene.add(pumpMesh);
}

function createIons() {
    const ionGeometry = new THREE.SphereGeometry(0.15, 8, 8);

    const naMaterial = new THREE.MeshBasicMaterial({ color: COLOR_NA });
    naIonsInstanced = new THREE.InstancedMesh(ionGeometry, naMaterial, ION_COUNT);
    naIonsInstanced.userData.type = 'na_ions';
    apScene.add(naIonsInstanced);

    const kMaterial = new THREE.MeshBasicMaterial({ color: COLOR_K });
    kIonsInstanced = new THREE.InstancedMesh(ionGeometry, kMaterial, ION_COUNT);
    kIonsInstanced.userData.type = 'k_ions';
    apScene.add(kIonsInstanced);

    ionPositions.na = [];
    ionPositions.k = [];
    for (let i = 0; i < ION_COUNT; i++) {
        ionPositions.na.push({ x: 0, y: 0, z: 0, targetY: 0, isMoving: false });
        ionPositions.k.push({ x: 0, y: 0, z: 0, targetY: 0, isMoving: false });
    }
}

// --- Simulation Logic ---
function resetSimulation() {
    animationState.time = 0;
    animationState.phase = 'resting';
    animationState.potential = -70;

    TWEEN.removeAll();
    if (potentialTween) { potentialTween.stop(); potentialTween = null; }

    naChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
    kChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));

    const dummy = new THREE.Object3D();
    const halfW = MEMBRANE_WIDTH / 2 - 1;
    const halfH = MEMBRANE_HEIGHT / 2 - 1;

    for (let i = 0; i < ION_COUNT; i++) {
        const isOutsideNa = i < ION_COUNT * 0.8;
        const naY = isOutsideNa ? Math.random() * 2 + 0.5 : -Math.random() * 2 - 0.5;
        const naX = (Math.random() - 0.5) * halfW * 2;
        const naZ = (Math.random() - 0.5) * halfH * 2;
        ionPositions.na[i] = { x: naX, y: naY, z: naZ, targetY: naY, isMoving: false };
        dummy.position.set(naX, naY, naZ); dummy.updateMatrix();
        if(naIonsInstanced) naIonsInstanced.setMatrixAt(i, dummy.matrix);

        const isInsideK = i < ION_COUNT * 0.8;
        const kY = isInsideK ? -Math.random() * 2 - 0.5 : Math.random() * 2 + 0.5;
        const kX = (Math.random() - 0.5) * halfW * 2;
        const kZ = (Math.random() - 0.5) * halfH * 2;
        ionPositions.k[i] = { x: kX, y: kY, z: kZ, targetY: kY, isMoving: false };
        dummy.position.set(kX, kY, kZ); dummy.updateMatrix();
        if(kIonsInstanced) kIonsInstanced.setMatrixAt(i, dummy.matrix);
    }
    if(naIonsInstanced) naIonsInstanced.instanceMatrix.needsUpdate = true;
    if(kIonsInstanced) kIonsInstanced.instanceMatrix.needsUpdate = true;

    updatePotentialVisual(animationState.potential); // Update membrane color
    eventBus.emit('potentialChanged', animationState.potential); // Emit initial potential

    console.log("Simulation Reset");
}

function setChannelState(channelMesh, state) {
    if (!channelMesh || !channelMesh.userData || channelMesh.userData.state === state) return;

    channelMesh.userData.state = state;
    const baseColorHex = channelMesh.userData.baseColor;
    let targetColorHex = baseColorHex;
    let targetScaleY = 1.0;

    switch (state) {
        case STATE_OPEN:
             const openColor = new THREE.Color(baseColorHex); openColor.lerp(new THREE.Color(0xffffff), 0.4);
             targetColorHex = openColor.getHex();
            targetScaleY = 1.2;
            break;
        case STATE_INACTIVE:
             targetColorHex = new THREE.Color(baseColorHex).multiplyScalar(0.5).getHex();
            targetScaleY = 1.0;
            break;
        case STATE_CLOSED: default:
            targetColorHex = baseColorHex; targetScaleY = 1.0;
            break;
    }

    const duration = 150;
    // Stop previous tweens on the same object properties if they exist
    TWEEN.remove(channelMesh.material.color);
    TWEEN.remove(channelMesh.scale);

    new TWEEN.Tween(channelMesh.material.color)
        .to(new THREE.Color(targetColorHex), duration).easing(TWEEN.Easing.Quadratic.Out).start();
    new TWEEN.Tween(channelMesh.scale)
        .to({ y: targetScaleY }, duration).easing(TWEEN.Easing.Quadratic.Out).start();
}

// Only updates membrane color now
function updatePotentialVisual(potential) {
    const t = THREE.MathUtils.inverseLerp(-90, 40, potential);
    if (membraneMesh && membraneMesh.material && membraneMesh.material.color) {
        const restColor = new THREE.Color(COLOR_MEMBRANE_REST);
        const activeColor = new THREE.Color(COLOR_MEMBRANE_ACTIVE);
        membraneMesh.material.color.copy(restColor).lerp(activeColor, t);
    }
    // Event emission happens inside the tween's onUpdate
}


// --- Animation Loop ---
function updateActionPotential(deltaTime) {
    // Always update tweens
    TWEEN.update();

    if (!animationState.isPlaying) return; // Only advance simulation time if playing

    animationState.time += deltaTime;
    const time = animationState.time;
    let phaseChanged = false; // Track if phase changed this frame

    // Phase transitions based on time (simplified cycle)
    if (time > 0 && time <= 0.5 && animationState.phase === 'resting') {
        animationState.phase = 'depolarizing'; phaseChanged = true;
        naChannelMeshes.forEach(ch => setChannelState(ch, STATE_OPEN));
        animateIonMovement('na', 'in', 0.4);
    } else if (time > 0.5 && time <= 1.5 && animationState.phase === 'depolarizing') {
        animationState.phase = 'repolarizing'; phaseChanged = true;
        naChannelMeshes.forEach(ch => setChannelState(ch, STATE_INACTIVE));
        kChannelMeshes.forEach(ch => setChannelState(ch, STATE_OPEN));
        animateIonMovement('k', 'out', 0.8);
    } else if (time > 1.5 && time <= 2.5 && (animationState.phase === 'repolarizing' || animationState.phase === 'depolarizing')) {
        animationState.phase = 'hyperpolarizing'; phaseChanged = true;
        naChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
    } else if (time > 2.5 && time <= 3.5 && animationState.phase === 'hyperpolarizing') {
        animationState.phase = 'resting_recovery'; phaseChanged = true;
        kChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
        animatePump();
        naChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
    } else if (time > 3.5) { // End of cycle, loop simulation
        animationState.time = 0;
        animationState.phase = 'resting'; phaseChanged = true;
        naChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
        kChannelMeshes.forEach(ch => setChannelState(ch, STATE_CLOSED));
    }

    // Update Membrane Potential via Tween only on phase change
    if (phaseChanged) {
        if (potentialTween) potentialTween.stop(); // Stop previous potential tween

        let targetPotential = -70;
        let duration = 0.5; // Default duration
        switch (animationState.phase) {
            case 'depolarizing': targetPotential = 30; duration = 0.5; break;
            case 'repolarizing': targetPotential = -75; duration = 1.0; break;
            case 'hyperpolarizing': targetPotential = -85; duration = 1.0; break;
            case 'resting_recovery': targetPotential = -70; duration = 1.0; break;
            case 'resting': targetPotential = -70; duration = 0.1; break;
        }

        potentialTween = new TWEEN.Tween(animationState)
            .to({ potential: targetPotential }, duration * 1000) // TWEEN uses milliseconds
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                updatePotentialVisual(animationState.potential); // Update membrane color
                eventBus.emit('potentialChanged', animationState.potential); // EMIT potential value
            })
            .onComplete(() => potentialTween = null) // Clear reference when done
            .start();
    }

    // Request Instance Matrix updates if ions were moving
    let updateNaMatrix = ionPositions.na.some(ion => ion.isMoving);
    let updateKMatrix = ionPositions.k.some(ion => ion.isMoving);
    if (naIonsInstanced && updateNaMatrix) naIonsInstanced.instanceMatrix.needsUpdate = true;
    if (kIonsInstanced && updateKMatrix) kIonsInstanced.instanceMatrix.needsUpdate = true;
}


// --- Animation Helpers ---
function animateIonMovement(type, direction, duration) {
    const ionsData = (type === 'na') ? ionPositions.na : ionPositions.k;
    const instancedMesh = (type === 'na') ? naIonsInstanced : kIonsInstanced;
    if (!instancedMesh) return;

    const countToMove = Math.floor(ION_COUNT * 0.5);
    const movedIndices = new Set();

    for (let attempt = 0; attempt < ION_COUNT * 2 && movedIndices.size < countToMove; attempt++) {
        const ionIndex = Math.floor(Math.random() * ION_COUNT);
        if (movedIndices.has(ionIndex) || ionsData[ionIndex].isMoving) continue;

        const ion = ionsData[ionIndex];
        const startY = ion.y;
        let targetY = ion.targetY;
        let shouldStartMoving = false;

        if (direction === 'in' && startY > 0) {
            targetY = -Math.random() * 2 - 0.5; shouldStartMoving = true;
        } else if (direction === 'out' && startY < 0) {
            targetY = Math.random() * 2 + 0.5; shouldStartMoving = true;
        }

        if (shouldStartMoving) {
            ion.targetY = targetY; ion.isMoving = true;
            movedIndices.add(ionIndex);
            let currentPos = { y: startY };
            const matrix = new THREE.Matrix4();

            new TWEEN.Tween(currentPos)
                .to({ y: targetY }, duration * 1000 * (0.7 + Math.random() * 0.6))
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    if (!instancedMesh || !ion.isMoving) return;
                    instancedMesh.getMatrixAt(ionIndex, matrix);
                    const pos = new THREE.Vector3(), quat = new THREE.Quaternion(), scale = new THREE.Vector3();
                    matrix.decompose(pos, quat, scale);
                    pos.y = currentPos.y; ion.y = currentPos.y;
                    matrix.compose(pos, quat, scale);
                    instancedMesh.setMatrixAt(ionIndex, matrix);
                })
                .onComplete(() => { ion.y = targetY; ion.isMoving = false; })
                .onStop(() => { ion.isMoving = false; })
                .start();
        }
    }
}


function animatePump() {
    if (!pumpMesh) return;
    const duration = 200;
    new TWEEN.Tween(pumpMesh.scale)
        .to({ x: 1.15, y: 1.15, z: 1.15 }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut).yoyo(true).repeat(1).start();
}

// --- Control Functions ---
function playAnimation() {
    if (!animationState.isPlaying) {
        animationState.isPlaying = true;
        console.log("AP Animation Play");
        if (animationState.time > 3.5) { // Reset time if at end of cycle to loop cleanly
            animationState.time = 0;
            // Emit resting potential immediately if restarting
            eventBus.emit('potentialChanged', -70);
            updatePotentialVisual(-70); // Also update membrane color
        }
    }
}

function pauseAnimation() {
    if (animationState.isPlaying) {
        animationState.isPlaying = false;
        console.log("AP Animation Pause");
    }
}

function stepAnimation() {
     if (animationState.isPlaying) pauseAnimation();
     const stepDelta = 0.05;
     updateActionPotential(stepDelta); // Update simulation by small step
     console.log("AP Animation Step");
     // Force matrix updates after step
     if (naIonsInstanced) naIonsInstanced.instanceMatrix.needsUpdate = true;
     if (kIonsInstanced) kIonsInstanced.instanceMatrix.needsUpdate = true;
}

function publicResetSimulation() {
     pauseAnimation();
     resetSimulation();
}

// --- REMOVED getCurrentPotential function ---


// --- Exports ---
export {
    initActionPotentialScene,
    updateActionPotential,
    playAnimation,
    pauseAnimation,
    stepAnimation,
    publicResetSimulation as resetSimulation,
    // REMOVED getCurrentPotential export
};