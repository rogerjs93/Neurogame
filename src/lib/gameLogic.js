// File: src/lib/gameLogic.js
// Simplified - No AP game states

import { displayInstruction, updateScore, showFeedback, showWinMessage, hideInfo, displayInfo } from './uiManager.js';

// Game State Enum - Simplified
const GameState = {
    LOBE_IDENTIFICATION: 'LOBE_IDENTIFICATION',
    STRUCTURE_FUNCTION_MATCH: 'STRUCTURE_FUNCTION_MATCH',
    NERVE_KNOWLEDGE_QUIZ: 'NERVE_KNOWLEDGE_QUIZ',
    FREE_EXPLORE: 'FREE_EXPLORE',
};

let currentScore = 0;
let currentGameState = GameState.FREE_EXPLORE; // Start in explore mode
let targetObjectData = null;
let itemsToFind = [];
let allObjectsData = [];

// --- Utility Functions ---
function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }

// --- Initialization ---
function storeAllObjectsData(allMeshes) {
     allObjectsData = allMeshes
        .filter(mesh => mesh.userData && mesh.userData.name) // Ensure mesh has userData and a name
        .map(mesh => ({
            name: mesh.userData.name, type: mesh.userData.type,
            function: mesh.userData.function, info: mesh.userData.info,
            nerveInfo: mesh.userData.nerveInfo || null
        }));
    console.log("All objects data stored:", allObjectsData.length, "items");
}

function startGame(allMeshes) {
    currentScore = 0;
    storeAllObjectsData(allMeshes);
    updateScore(currentScore);
    startFreeExplore();
    // setTimeout(startLobeIdentification, 5000); // Optional: Auto-start first game
}

// --- Game State Management ---
function startFreeExplore() {
    currentGameState = GameState.FREE_EXPLORE;
    displayInstruction("Explore the brain! Click parts or start a challenge.");
    targetObjectData = null; itemsToFind = [];
}
function startLobeIdentification() {
    if (currentGameState === GameState.LOBE_IDENTIFICATION) return;
    currentGameState = GameState.LOBE_IDENTIFICATION; currentScore = 0; updateScore(currentScore);
    const lobeNames = [...new Set(allObjectsData.filter(o => o.type === 'lobe').map(o => o.name))];
    if (!lobeNames || lobeNames.length === 0) { startFreeExplore(); return; }
    itemsToFind = [...lobeNames]; shuffleArray(itemsToFind); targetObjectData = null;
    getNextLobeTarget(); hideInfo();
    console.log("Starting Lobe Identification. Find:", itemsToFind);
}
function startStructureFunctionMatch() {
    if (currentGameState === GameState.STRUCTURE_FUNCTION_MATCH) return;
    currentGameState = GameState.STRUCTURE_FUNCTION_MATCH; updateScore(currentScore);
    const structures = allObjectsData.filter(o => o.type === 'deep_structure' && o.function);
    if (!structures || structures.length === 0) { startFreeExplore(); return; }
    itemsToFind = [...structures]; shuffleArray(itemsToFind); targetObjectData = null;
    getNextStructureTarget(); hideInfo();
    console.log("Starting Structure-Function Match. Tasks:", itemsToFind.map(i => i.name));
}
function startNerveQuiz() {
    if (currentGameState === GameState.NERVE_KNOWLEDGE_QUIZ) return;
    currentGameState = GameState.NERVE_KNOWLEDGE_QUIZ; updateScore(currentScore);
    const nerves = allObjectsData.filter(o => o.type === 'cranial_nerve' && o.nerveInfo);
    if (!nerves || nerves.length === 0) { startFreeExplore(); return; }
    itemsToFind = [...new Set(nerves.map(n => n.name))]; shuffleArray(itemsToFind);
    targetObjectData = null; getNextNerveTarget(); hideInfo();
    console.log("Starting Nerve Quiz. Find:", itemsToFind);
}

// --- Target Getters ---
function getNextLobeTarget() {
    if (itemsToFind.length > 0) { const targetName = itemsToFind[0]; targetObjectData = { name: targetName }; displayInstruction(`Lobe Quiz: Find the ${targetName}`); }
    else { showFeedback("Lobe Quiz Cleared!", true, 3000); setTimeout(startStructureFunctionMatch, 3500); }
}
function getNextStructureTarget() {
     if (itemsToFind.length > 0) {
        const targetData = itemsToFind[0];
        if (Math.random() > 0.5) { targetObjectData = { find: 'name', name: targetData.name, function: targetData.function }; displayInstruction(`Structure Match: Find the structure for: "${targetData.function}"`); }
        else { targetObjectData = { find: 'function', name: targetData.name, function: targetData.function }; displayInstruction(`Structure Match: Click the ${targetData.name}`); }
    } else { showFeedback("Structure Match Cleared!", true, 3000); setTimeout(startNerveQuiz, 3500); }
}
function getNextNerveTarget() {
    if (itemsToFind.length > 0) {
        const targetName = itemsToFind[0];
        const fullData = allObjectsData.find(o => o.name === targetName && o.type === 'cranial_nerve');
        if (fullData) { targetObjectData = { name: targetName, type: fullData.nerveInfo?.type, function: fullData.function }; displayInstruction(`Nerve Quiz: Find the ${targetName}`); }
        else { itemsToFind.shift(); getNextNerveTarget(); } // Skip if data not found
    } else { showFeedback("Nerve Quiz Cleared!", true, 4000); setTimeout(startFreeExplore, 4500); }
}

// --- Universal Selection Handler ---
function handleSelection(clickedObject) {
    if (!clickedObject || !clickedObject.userData) { return; }
    // Extract data safely
    const clickedData = { name: clickedObject.userData.name, type: clickedObject.userData.type, function: clickedObject.userData.function, info: clickedObject.userData.info, nerveInfo: clickedObject.userData.nerveInfo || null };
    if (currentGameState === GameState.FREE_EXPLORE || !targetObjectData) { return; } // Allow info display, but no game logic

    switch (currentGameState) {
        case GameState.LOBE_IDENTIFICATION: handleLobeIdentificationAttempt(clickedData); break;
        case GameState.STRUCTURE_FUNCTION_MATCH: handleStructureFunctionAttempt(clickedData); break;
        case GameState.NERVE_KNOWLEDGE_QUIZ: handleNerveQuizAttempt(clickedData); break;
    }
}

// --- Specific Game Attempt Handlers ---
function handleLobeIdentificationAttempt(clickedData) {
    if (clickedData.type !== 'lobe') { showFeedback("That's not a lobe.", false); return; }
    if (clickedData.name === targetObjectData.name) { currentScore += 10; updateScore(currentScore); showFeedback(`Correct! Found ${targetObjectData.name}.`, true); itemsToFind.shift(); targetObjectData = null; setTimeout(getNextLobeTarget, 500); }
    else { currentScore -= 2; if (currentScore < 0) currentScore = 0; updateScore(currentScore); showFeedback(`Incorrect. That was ${clickedData.name}.`, false); }
}
function handleStructureFunctionAttempt(clickedData) {
     if (clickedData.type !== 'deep_structure') { showFeedback("That's not a deep structure.", false); return; }
    let isCorrect = false, feedbackMsg = "";
    if (targetObjectData.find === 'name' && clickedData.name === targetObjectData.name) { isCorrect = true; feedbackMsg = `Correct! The ${targetObjectData.name} relates to: "${targetObjectData.function}"`; }
    else if (targetObjectData.find === 'function' && clickedData.name === targetObjectData.name) { isCorrect = true; feedbackMsg = `Correct! The ${targetObjectData.name}'s function: "${targetObjectData.function}"`; displayInfo(clickedData.name, clickedData.info); setTimeout(hideInfo, 2500); }
    else { feedbackMsg = `Incorrect. That's ${clickedData.name}. Looking for structure for "${targetObjectData.function || targetObjectData.name}".`; }

    if (isCorrect) { currentScore += 15; updateScore(currentScore); showFeedback(feedbackMsg, true, 3000); itemsToFind.shift(); targetObjectData = null; setTimeout(getNextStructureTarget, 1000); }
    else { currentScore -= 3; if (currentScore < 0) currentScore = 0; updateScore(currentScore); showFeedback(feedbackMsg, false, 3000); }
}
function handleNerveQuizAttempt(clickedData) {
    if (clickedData.type !== 'cranial_nerve') { showFeedback("That's not a cranial nerve.", false); return; }
    if (clickedData.name === targetObjectData.name) {
         currentScore += 12; updateScore(currentScore); const nerveType = targetObjectData.type ? `(${targetObjectData.type})` : '';
         showFeedback(`Correct! Found ${targetObjectData.name} ${nerveType}.`, true, 2500); displayInfo(clickedData.name, clickedData.info); setTimeout(hideInfo, 2500);
         itemsToFind.shift(); targetObjectData = null; setTimeout(getNextNerveTarget, 1000);
    } else { currentScore -= 2; if (currentScore < 0) currentScore = 0; updateScore(currentScore); showFeedback(`Incorrect. That was ${clickedData.name}.`, false); }
}

export { startGame, handleSelection };