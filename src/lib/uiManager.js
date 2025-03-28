// --- Existing Variables ---
let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement;

// --- New UI Element Variables ---
let toggleLobesCheckbox, toggleDeepCheckbox, toggleNervesCheckbox;
let clipEnableCheckbox, clipAxisSelect, clipSlider, clipValueSpan, clipNegateCheckbox;

// --- Callbacks for UI Interaction ---
let onLayerToggleCallback = null;
let onClippingChangeCallback = null;

// Accept callbacks during initialization
function initUI(layerToggleCb, clippingChangeCb) {
    instructionElement = document.getElementById('instructions');
    scoreElement = document.getElementById('score');
    feedbackElement = document.getElementById('feedback');
    infoDisplayElement = document.getElementById('info-display');
    infoNameElement = document.getElementById('info-name');
    infoDetailsElement = document.getElementById('info-details');

    // Get Layer Toggle elements
    toggleLobesCheckbox = document.getElementById('toggle-lobes');
    toggleDeepCheckbox = document.getElementById('toggle-deep');
    toggleNervesCheckbox = document.getElementById('toggle-nerves');

    // Get Clipping elements
    clipEnableCheckbox = document.getElementById('clip-enable');
    clipAxisSelect = document.getElementById('clip-axis');
    clipSlider = document.getElementById('clip-slider');
    clipValueSpan = document.getElementById('clip-value');
    clipNegateCheckbox = document.getElementById('clip-negate');

    // Comprehensive check for all elements
    if (!instructionElement || !scoreElement || !feedbackElement || !infoDisplayElement || !infoNameElement || !infoDetailsElement || !toggleLobesCheckbox || !toggleDeepCheckbox || !toggleNervesCheckbox || !clipEnableCheckbox || !clipAxisSelect || !clipSlider || !clipValueSpan || !clipNegateCheckbox) {
        console.error("One or more UI elements were not found!");
        // Attempt to identify missing elements
        const ids = ['instructions', 'score', 'feedback', 'info-display', 'info-name', 'info-details', 'toggle-lobes', 'toggle-deep', 'toggle-nerves', 'clip-enable', 'clip-axis', 'clip-slider', 'clip-value', 'clip-negate'];
        ids.forEach(id => {
            if (!document.getElementById(id)) {
                console.error(`Missing UI element: #${id}`);
            }
        });
        return false; // Indicate failure
    }

    // Store callbacks
    onLayerToggleCallback = layerToggleCb;
    onClippingChangeCallback = clippingChangeCb;

    // --- Add Event Listeners ---
    toggleLobesCheckbox.addEventListener('change', handleLayerToggle);
    toggleDeepCheckbox.addEventListener('change', handleLayerToggle);
    toggleNervesCheckbox.addEventListener('change', handleLayerToggle);

    clipEnableCheckbox.addEventListener('change', handleClippingChange);
    clipAxisSelect.addEventListener('change', handleClippingChange);
    clipSlider.addEventListener('input', handleClippingSlider); // 'input' for live updates
    clipNegateCheckbox.addEventListener('change', handleClippingChange);

    // --- Initial State Setup ---
    hideInfo();
    updateClipValueDisplay(clipSlider.value);
    // Trigger initial updates based on default UI state
    handleLayerToggle();
    handleClippingChange();

    return true; // Indicate successful initialization
}

// --- Event Handlers ---
function handleLayerToggle() {
    if (onLayerToggleCallback) {
        const layersState = {
            lobes: toggleLobesCheckbox.checked,
            deep: toggleDeepCheckbox.checked,
            nerves: toggleNervesCheckbox.checked,
        };
        onLayerToggleCallback(layersState);
    } else {
        console.warn("Layer toggle callback not set!");
    }
}

function handleClippingChange() {
     if (onClippingChangeCallback) {
         const clippingState = {
             enabled: clipEnableCheckbox.checked,
             axis: clipAxisSelect.value, // 'X', 'Y', or 'Z'
             position: parseFloat(clipSlider.value),
             negate: clipNegateCheckbox.checked
         };
         onClippingChangeCallback(clippingState);
     } else {
         console.warn("Clipping change callback not set!");
     }
}

function handleClippingSlider() {
    const value = parseFloat(clipSlider.value);
    updateClipValueDisplay(value);
    // Only trigger the full update if clipping is currently enabled
    if (clipEnableCheckbox.checked) {
         handleClippingChange(); // Re-trigger update with new position
    }
}


function updateClipValueDisplay(value) {
    if (clipValueSpan) {
        // *** ADD CHECK HERE ***
        // Ensure 'value' is a finite number before calling toFixed()
        if (typeof value === 'number' && isFinite(value)) {
            clipValueSpan.textContent = value.toFixed(1);
        } else {
            // Handle cases where value is NaN or not a number (e.g., initial state or error)
            clipValueSpan.textContent = '---'; // Or '0.0' or some default
            console.warn("updateClipValueDisplay received invalid value:", value); // Log warning
        }
        // *********************
    }
}

// --- Existing UI Functions ---
function updateScore(newScore) {
    if (scoreElement) scoreElement.textContent = `Score: ${newScore}`;
}

function displayInstruction(text) {
    if (instructionElement) instructionElement.textContent = text;
}

function showFeedback(message, isCorrect, duration = 2000) {
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = isCorrect ? 'correct' : 'incorrect';
        feedbackElement.style.opacity = 1;
        if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId);
        feedbackElement.timeoutId = setTimeout(() => {
             feedbackElement.style.opacity = 0;
             feedbackElement.timeoutId = null;
        }, duration);
    }
}

function showWinMessage(finalScore) {
     if (instructionElement) instructionElement.textContent = `Phase Complete! Final Score: ${finalScore}`;
     if (feedbackElement) {
        feedbackElement.textContent = `Great job!`;
        feedbackElement.className = 'correct';
        feedbackElement.style.opacity = 1;
        if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId);
        feedbackElement.timeoutId = null; // Don't auto-hide win message
    }
}

function displayInfo(name, details) {
    if (infoDisplayElement && infoNameElement && infoDetailsElement) {
        infoNameElement.textContent = name || '';
        infoDetailsElement.textContent = details || '';
        infoDisplayElement.style.display = 'block';
    }
}

function hideInfo() {
     if (infoDisplayElement) {
        infoDisplayElement.style.display = 'none';
        infoNameElement.textContent = '';
        infoDetailsElement.textContent = '';
     }
}

// --- Export necessary functions ---
export {
    initUI,
    updateScore,
    displayInstruction,
    showFeedback,
    showWinMessage,
    displayInfo,
    hideInfo
};