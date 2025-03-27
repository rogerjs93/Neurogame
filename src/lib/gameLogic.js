import { displayInstruction, updateScore, showFeedback, showWinMessage } from './uiManager.js';
import { lobeMeshes as allLobeMeshes } from './interaction.js'; // Import lobeMeshes from interaction

let currentScore = 0;
let targetLobeName = null;
let lobesToFind = [];
let allLobeNames = []; // To reset the game

// Function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame(lobeMeshes) {
    currentScore = 0;
    allLobeNames = [...new Set(lobeMeshes.map(mesh => mesh.userData.name))]; // Get unique names
    lobesToFind = [...allLobeNames]; // Copy all names
    shuffleArray(lobesToFind); // Randomize the order

    updateScore(currentScore);
    getNextTarget();

    console.log("Game Started! Find these lobes:", lobesToFind); // Debug
}

function getNextTarget() {
    if (lobesToFind.length > 0) {
        targetLobeName = lobesToFind[0]; // Get the next lobe from the shuffled list
        displayInstruction(`Find the: ${targetLobeName}`);
    } else {
        // Game Over - Player Wins Phase 1
        targetLobeName = null;
        showWinMessage(currentScore);
        console.log("Phase 1 Complete!");
        // Optional: Add a 'Restart' button or logic here
    }
}

function handleLobeSelection(clickedLobeName) {
    if (!targetLobeName) return; // Game is over or not started

    if (clickedLobeName === targetLobeName) {
        // Correct Selection
        currentScore += 10; // Award points
        updateScore(currentScore);
        showFeedback(`Correct! Found ${targetLobeName}.`, true);

        // Remove found lobe from the list
        const index = lobesToFind.indexOf(targetLobeName);
        if (index > -1) {
            lobesToFind.splice(index, 1);
        }

        // Get the next target
        getNextTarget();
    } else {
        // Incorrect Selection
        currentScore -= 2; // Penalize (optional)
        if (currentScore < 0) currentScore = 0; // Don't go below zero
        updateScore(currentScore);
        showFeedback(`Incorrect. That was the ${clickedLobeName}. Try again!`, false);
    }
}

export { startGame, handleLobeSelection, targetLobeName }; // Export targetLobeName if needed by interaction highlights