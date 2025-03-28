import { displayInstruction, updateScore, showFeedback, showWinMessage, hideInfo, displayInfo } from './uiManager.js';

// Game State Enum
const GameState = {
    LOBE_IDENTIFICATION: 'LOBE_IDENTIFICATION',
    STRUCTURE_FUNCTION_MATCH: 'STRUCTURE_FUNCTION_MATCH',
    NERVE_KNOWLEDGE_QUIZ: 'NERVE_KNOWLEDGE_QUIZ',
    FREE_EXPLORE: 'FREE_EXPLORE',
    GAME_OVER: 'GAME_OVER' // Potentially for future use
};

let currentScore = 0;
let currentGameState = GameState.FREE_EXPLORE; // Start in explore mode
let targetObjectData = null; // Store data about the item needed for the current challenge
let itemsToFind = []; // List of items (data objects) for the current challenge round
let allObjectsData = []; // Stores { name, type, function, info, nerveInfo } for all meshes

// --- Utility Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- Initialization ---
function storeAllObjectsData(allMeshes) {
    allObjectsData = allMeshes
        .filter(mesh => mesh.userData) // Ensure mesh has userData
        .map(mesh => ({
            name: mesh.userData.name,
            type: mesh.userData.type,
            function: mesh.userData.function,
            info: mesh.userData.info,
            nerveInfo: mesh.userData.nerveInfo || null
        }));
    console.log("All objects data stored:", allObjectsData.length, "items"); // Debug
}

function startGame(allMeshes) {
    currentScore = 0;
    storeAllObjectsData(allMeshes);
    updateScore(currentScore);
    // Instead of starting a game immediately, let's start in explore mode
    startFreeExplore();
    // Provide instructions on how to start games (e.g., via UI buttons eventually)
    // For now, we'll trigger the first game after a short delay or manually for testing
    displayInstruction("Explore the brain! Click parts to learn. (Game starting soon...)"); // Temp message
    // You could add buttons later to trigger these:
     setTimeout(startLobeIdentification, 5000); // Auto-start lobe game after 5s for now
}

// --- Game State Management ---
function startFreeExplore() {
    currentGameState = GameState.FREE_EXPLORE;
    displayInstruction("Explore the brain! Click on parts to learn more.");
    targetObjectData = null;
    itemsToFind = [];
    // hideInfo(); // Don't necessarily hide info when entering explore mode
}

function startLobeIdentification() {
    if (currentGameState === GameState.LOBE_IDENTIFICATION) return; // Don't restart if already running
    currentGameState = GameState.LOBE_IDENTIFICATION;
    currentScore = 0; // Reset score for this game mode
    updateScore(currentScore);

    const lobeNames = [...new Set(allObjectsData
        .filter(o => o.type === 'lobe')
        .map(o => o.name))];

    if (!lobeNames || lobeNames.length === 0) {
        console.error("No lobe data found to start identification game!");
        startFreeExplore(); return;
    }

    itemsToFind = [...lobeNames];
    shuffleArray(itemsToFind);
    targetObjectData = null;
    getNextLobeTarget();
    hideInfo(); // Hide general info panel during quiz
    console.log("Starting Lobe Identification. Find:", itemsToFind); // Debug
}

function startStructureFunctionMatch() {
    if (currentGameState === GameState.STRUCTURE_FUNCTION_MATCH) return;
    currentGameState = GameState.STRUCTURE_FUNCTION_MATCH;
    // currentScore = 0; // Or continue score from previous game? Decide later.
    updateScore(currentScore); // Update display

    const structures = allObjectsData.filter(o => o.type === 'deep_structure' && o.function);

    if (!structures || structures.length === 0) {
        console.error("No deep structure data found for matching game!");
        startFreeExplore(); return;
    }

    itemsToFind = [...structures]; // Store the full data objects
    shuffleArray(itemsToFind);
    targetObjectData = null;
    getNextStructureTarget();
    hideInfo();
    console.log("Starting Structure-Function Match. Tasks:", itemsToFind.map(i => i.name)); // Debug
}

function startNerveQuiz() {
    if (currentGameState === GameState.NERVE_KNOWLEDGE_QUIZ) return;
    currentGameState = GameState.NERVE_KNOWLEDGE_QUIZ;
    updateScore(currentScore);

    const nerves = allObjectsData.filter(o => o.type === 'cranial_nerve' && o.nerveInfo);
    if (!nerves || nerves.length === 0) {
         console.error("No nerve data found for quiz game!");
         startFreeExplore(); return;
    }
    // --- Basic Quiz Setup ---
    itemsToFind = [...new Set(nerves.map(n => n.name))]; // Get unique nerve names
    shuffleArray(itemsToFind);
    targetObjectData = null;
    getNextNerveTarget();
    hideInfo();
    console.log("Starting Nerve Quiz. Find:", itemsToFind); // Debug

    // More advanced quiz could involve matching function, number, type etc.
}


// --- Target Getters ---
function getNextLobeTarget() {
    if (itemsToFind.length > 0) {
        const targetName = itemsToFind[0];
        targetObjectData = { name: targetName }; // Store the target name
        displayInstruction(`Lobe Quiz: Find the ${targetName}`);
    } else {
        showFeedback("Lobe Quiz Cleared! Well done!", true, 3000);
        // Transition to the next game after a delay
        setTimeout(startStructureFunctionMatch, 3500);
    }
}

function getNextStructureTarget() {
     if (itemsToFind.length > 0) {
        const targetData = itemsToFind[0]; // Get the data object {name, function, ...}
        // Randomly ask to find by name or by function
        if (Math.random() > 0.5) {
            // Ask for name, given function
            targetObjectData = { find: 'name', name: targetData.name, function: targetData.function };
            displayInstruction(`Structure Match: Find the structure for: "${targetData.function}"`);
        } else {
            // Ask for function (by clicking name)
            targetObjectData = { find: 'function', name: targetData.name, function: targetData.function };
            // Rephrased instruction:
            displayInstruction(`Structure Match: Click the ${targetData.name}`);
            // Player needs to know the function pops up on click to verify
        }
    } else {
        showFeedback("Structure Match Cleared! Excellent!", true, 3000);
        setTimeout(startNerveQuiz, 3500); // Transition to nerve quiz
    }
}

function getNextNerveTarget() {
    if (itemsToFind.length > 0) {
        const targetName = itemsToFind[0]; // Using unique names from itemsToFind
        // Find the full data object corresponding to this name
        const fullData = allObjectsData.find(o => o.name === targetName && o.type === 'cranial_nerve');
        if (fullData) {
             targetObjectData = { name: targetName, type: fullData.nerveInfo?.type, function: fullData.function };
             displayInstruction(`Nerve Quiz: Find the ${targetName}`);
             // Future questions: Find nerve by function, type (S/M/B), or number
        } else {
            console.error("Could not find full data for nerve target:", targetName);
            itemsToFind.shift(); // Skip this one
            getNextNerveTarget(); // Try next
        }
    } else {
        showFeedback("Nerve Quiz Cleared! Master Explorer!", true, 4000);
        setTimeout(startFreeExplore, 4500); // Go back to free explore
    }
}

// --- Universal Selection Handler ---
function handleSelection(clickedObject) {
    if (!clickedObject || !clickedObject.userData) {
        console.warn("Selection handled with invalid object.");
        return; // Ignore clicks on non-game objects
    }

    // Use the userData from the clicked mesh
    const clickedData = {
        name: clickedObject.userData.name,
        type: clickedObject.userData.type,
        function: clickedObject.userData.function,
        info: clickedObject.userData.info,
        nerveInfo: clickedObject.userData.nerveInfo || null
    };

    // In free explore, clicking just shows info (handled by interaction.js)
    if (currentGameState === GameState.FREE_EXPLORE) {
        // Display info is already handled by interaction.js, nothing more needed here.
        return;
    }

    // If no target is set (between rounds or before game start), ignore game logic
    if (!targetObjectData) {
        // Still allow displaying info even if no target is set
        // displayInfo(clickedData.name, clickedData.info); // This is now done in interaction.js
        return;
    }


    // --- Route to appropriate game logic based on state ---
    switch (currentGameState) {
        case GameState.LOBE_IDENTIFICATION:
            handleLobeIdentificationAttempt(clickedData);
            break;
        case GameState.STRUCTURE_FUNCTION_MATCH:
             handleStructureFunctionAttempt(clickedData);
            break;
        case GameState.NERVE_KNOWLEDGE_QUIZ:
             handleNerveQuizAttempt(clickedData);
            break;
        default:
            console.warn("Selection handled in unexpected game state:", currentGameState);
    }
}


// --- Specific Game Attempt Handlers ---

function handleLobeIdentificationAttempt(clickedData) {
    if (clickedData.type !== 'lobe') {
        showFeedback("That's not a lobe. Keep looking!", false);
        return; // Only accept lobe clicks in this game
    }

    if (clickedData.name === targetObjectData.name) {
        currentScore += 10;
        updateScore(currentScore);
        showFeedback(`Correct! Found the ${targetObjectData.name}.`, true);
        itemsToFind.shift(); // Remove found item
        targetObjectData = null; // Clear target until next one is set
        setTimeout(getNextLobeTarget, 500); // Delay before showing next target
    } else {
        currentScore -= 2;
        if (currentScore < 0) currentScore = 0;
        updateScore(currentScore);
        showFeedback(`Incorrect. That was the ${clickedData.name}.`, false);
    }
}

function handleStructureFunctionAttempt(clickedData) {
     if (clickedData.type !== 'deep_structure') {
         showFeedback("That's not a deep structure. Try again!", false);
         return;
     }

    let isCorrect = false;
    let feedbackMsg = "";

    if (targetObjectData.find === 'name') { // We asked for name, given function
        if (clickedData.name === targetObjectData.name) {
            isCorrect = true;
            feedbackMsg = `Correct! The ${targetObjectData.name} is responsible for: "${targetObjectData.function}"`;
        } else {
             feedbackMsg = `Incorrect. That's the ${clickedData.name}. We're looking for the structure related to "${targetObjectData.function}".`;
        }
    } else { // We asked for function (by clicking name)
         if (clickedData.name === targetObjectData.name) {
             isCorrect = true;
             feedbackMsg = `Correct! The ${targetObjectData.name}'s function is: "${targetObjectData.function}"`;
             // Display the function info briefly as confirmation
             displayInfo(clickedData.name, clickedData.info);
             setTimeout(hideInfo, 2500); // Hide info after showing it
         } else {
              feedbackMsg = `Incorrect. That's the ${clickedData.name}. We're looking for the ${targetObjectData.name}.`;
         }
    }

    if (isCorrect) {
        currentScore += 15;
        updateScore(currentScore);
        showFeedback(feedbackMsg, true, 3000); // Longer duration for reading function
        itemsToFind.shift();
        targetObjectData = null;
        setTimeout(getNextStructureTarget, 1000); // Delay before next target
    } else {
        currentScore -= 3;
        if (currentScore < 0) currentScore = 0;
        updateScore(currentScore);
        showFeedback(feedbackMsg, false, 3000);
    }
}


function handleNerveQuizAttempt(clickedData) {
    if (clickedData.type !== 'cranial_nerve') {
         showFeedback("That's not a cranial nerve. Keep searching!", false);
         return;
     }

    // Basic check: Find by name
    if (clickedData.name === targetObjectData.name) {
         currentScore += 12;
         updateScore(currentScore);
         const nerveType = targetObjectData.type ? `(${targetObjectData.type})` : '';
         showFeedback(`Correct! Found ${targetObjectData.name} ${nerveType}.`, true, 2500);
         // Display function info briefly
         displayInfo(clickedData.name, clickedData.info);
         setTimeout(hideInfo, 2500); // Hide info after showing it

         itemsToFind.shift();
         targetObjectData = null;
         setTimeout(getNextNerveTarget, 1000);
    } else {
         currentScore -= 2;
         if (currentScore < 0) currentScore = 0;
         updateScore(currentScore);
         showFeedback(`Incorrect. That was the ${clickedData.name}.`, false);
    }
}


// Export the necessary functions
export { startGame, handleSelection };
