let instructionElement, scoreElement, feedbackElement;

function initUI() {
    instructionElement = document.getElementById('instructions');
    scoreElement = document.getElementById('score');
    feedbackElement = document.getElementById('feedback');

    if (!instructionElement || !scoreElement || !feedbackElement) {
        console.error("UI elements not found!");
        return false;
    }
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
        setTimeout(() => {
             feedbackElement.style.opacity = 0;
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
    }
}

export { initUI, updateScore, displayInstruction, showFeedback, showWinMessage };