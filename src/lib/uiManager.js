let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement; // New elements

function initUI() {
    instructionElement = document.getElementById('instructions');
    scoreElement = document.getElementById('score');
    feedbackElement = document.getElementById('feedback');
    // Get new elements
    infoDisplayElement = document.getElementById('info-display');
    infoNameElement = document.getElementById('info-name');
    infoDetailsElement = document.getElementById('info-details');


    if (!instructionElement || !scoreElement || !feedbackElement || !infoDisplayElement || !infoNameElement || !infoDetailsElement) {
        console.error("UI elements not found!");
        return false;
    }
    hideInfo(); // Start with info hidden
    return true;
}

function updateScore(newScore) {
    if (scoreElement) {
        scoreElement.textContent = `Score: ${newScore}`;
    }
}

function displayInstruction(text) {
    if (instructionElement) {
        instructionElement.textContent = text;
    }
}

function showFeedback(message, isCorrect, duration = 2000) {
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = isCorrect ? 'correct' : 'incorrect'; // Use classes for styling
        feedbackElement.style.opacity = 1; // Make visible

        // Fade out after duration
        // Clear previous timeout if exists
        if (feedbackElement.timeoutId) {
            clearTimeout(feedbackElement.timeoutId);
        }
        feedbackElement.timeoutId = setTimeout(() => {
             feedbackElement.style.opacity = 0;
             feedbackElement.timeoutId = null; // Clear the stored ID
        }, duration);
    }
}

function showWinMessage(finalScore) {
     if (instructionElement) {
        instructionElement.textContent = `Congratulations! You identified all lobes!`;
    }
     if (feedbackElement) {
        feedbackElement.textContent = `Final Score: ${finalScore}`;
        feedbackElement.className = 'correct';
        feedbackElement.style.opacity = 1;
        // Don't auto-hide win message
        if (feedbackElement.timeoutId) {
            clearTimeout(feedbackElement.timeoutId);
            feedbackElement.timeoutId = null;
        }
    }
}

// --- New Info Display Functions ---

function displayInfo(name, details) {
    if (infoDisplayElement && infoNameElement && infoDetailsElement) {
        infoNameElement.textContent = name || ''; // Handle potential undefined name
        infoDetailsElement.textContent = details || ''; // Handle potential undefined details
        infoDisplayElement.style.display = 'block'; // Make it visible
    }
}

function hideInfo() {
     if (infoDisplayElement) {
        infoDisplayElement.style.display = 'none'; // Hide it
        infoNameElement.textContent = '';
        infoDetailsElement.textContent = '';
     }
}


export {
    initUI,
    updateScore,
    displayInstruction,
    showFeedback,
    showWinMessage,
    displayInfo, // Export new function
    hideInfo     // Export new function
};
