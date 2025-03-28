// File: src/lib/uiManager.js
// Removed AP elements, callbacks, and functions

// UI Element Variables
let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement;
let toggleLobesCheckbox, toggleDeepCheckbox, toggleNervesCheckbox;
let clipEnableCheckbox, clipAxisSelect, clipSlider, clipValueSpan, clipNegateCheckbox;

// Callbacks
let onLayerToggleCallback = null;
let onClippingChangeCallback = null;

function initUI(layerToggleCb, clippingChangeCb) {
    instructionElement = document.getElementById('instructions');
    scoreElement = document.getElementById('score');
    feedbackElement = document.getElementById('feedback');
    infoDisplayElement = document.getElementById('info-display');
    infoNameElement = document.getElementById('info-name');
    infoDetailsElement = document.getElementById('info-details');
    toggleLobesCheckbox = document.getElementById('toggle-lobes');
    toggleDeepCheckbox = document.getElementById('toggle-deep');
    toggleNervesCheckbox = document.getElementById('toggle-nerves');
    clipEnableCheckbox = document.getElementById('clip-enable');
    clipAxisSelect = document.getElementById('clip-axis');
    clipSlider = document.getElementById('clip-slider');
    clipValueSpan = document.getElementById('clip-value');
    clipNegateCheckbox = document.getElementById('clip-negate');

    const allElementsExist = instructionElement && scoreElement && feedbackElement && infoDisplayElement && infoNameElement && infoDetailsElement && toggleLobesCheckbox && toggleDeepCheckbox && toggleNervesCheckbox && clipEnableCheckbox && clipAxisSelect && clipSlider && clipValueSpan && clipNegateCheckbox;
    if (!allElementsExist) { console.error("One or more UI elements were not found!"); return false; }

    onLayerToggleCallback = layerToggleCb;
    onClippingChangeCallback = clippingChangeCb;

    // Event Listeners
    toggleLobesCheckbox.addEventListener('change', handleLayerToggle);
    toggleDeepCheckbox.addEventListener('change', handleLayerToggle);
    toggleNervesCheckbox.addEventListener('change', handleLayerToggle);
    clipEnableCheckbox.addEventListener('change', handleClippingChange);
    clipAxisSelect.addEventListener('change', handleClippingChange);
    clipSlider.addEventListener('input', handleClippingSlider);
    clipNegateCheckbox.addEventListener('change', handleClippingChange);

    // Initial State
    hideInfo();
    updateClipValueDisplay(parseFloat(clipSlider.value));
    handleLayerToggle();
    handleClippingChange();

    console.log("UI Initialized."); // Add log
    return true;
}

// Event Handlers
function handleLayerToggle() {
    if (onLayerToggleCallback) {
        const layersState = { lobes: toggleLobesCheckbox.checked, deep: toggleDeepCheckbox.checked, nerves: toggleNervesCheckbox.checked };
        onLayerToggleCallback(layersState);
    } else { console.warn("Layer toggle callback not set!"); }
}

function handleClippingChange() {
     if (onClippingChangeCallback) {
         const clippingState = { enabled: clipEnableCheckbox.checked, axis: clipAxisSelect.value, position: parseFloat(clipSlider.value), negate: clipNegateCheckbox.checked };
         onClippingChangeCallback(clippingState);
     } else { console.warn("Clipping change callback not set!"); }
}

function handleClippingSlider() {
    const value = parseFloat(clipSlider.value);
    updateClipValueDisplay(value);
    if (clipEnableCheckbox.checked) { handleClippingChange(); }
}

// UI Update Functions
function updateClipValueDisplay(value) {
     if (clipValueSpan) {
        if (!isNaN(value)) { clipValueSpan.textContent = value.toFixed(1); }
        else { clipValueSpan.textContent = '---'; }
    }
}

// Other standard UI functions
function updateScore(newScore) { if (scoreElement) scoreElement.textContent = `Score: ${newScore}`; }
function displayInstruction(text) { if (instructionElement) instructionElement.textContent = text; }
function showFeedback(message, isCorrect, duration = 2000) { if (feedbackElement) { /* ... includes timeout logic ... */ } }
function showWinMessage(finalScore) { if (instructionElement) { /* ... */ } if (feedbackElement) { /* ... includes timeout logic ... */ } }
function displayInfo(name, details) { if (infoDisplayElement && infoNameElement && infoDetailsElement) { /* ... set text & display block ... */ } }
function hideInfo() { if (infoDisplayElement) { /* ... set display none & clear text ... */ } }

// Export necessary functions
export { initUI, updateScore, displayInstruction, showFeedback, showWinMessage, displayInfo, hideInfo };