// File: src/lib/uiManager.js

import eventBus from './eventBus.js'; // <-- Import event bus

// --- UI Element Variables ---
let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement;
let toggleLobesCheckbox, toggleDeepCheckbox, toggleNervesCheckbox;
let clipEnableCheckbox, clipAxisSelect, clipSlider, clipValueSpan, clipNegateCheckbox;
let brainUIContainer, apUIContainer; // Divs to toggle visibility
let toggleViewBtn;
let apPlayBtn, apPauseBtn, apStepBtn, apResetBtn;
let potentialIndicator, potentialValueSpan;

// --- Callbacks (Keep for non-event-driven interactions) ---
let onLayerToggleCallback = null;
let onClippingChangeCallback = null;
let onViewToggleCallback = null;
let onAPControlCallback = null;


// Accept callbacks during initialization
function initUI(layerToggleCb, clippingChangeCb, viewToggleCb, apControlCb) {
    // Get all elements by ID... (Same as previous version)
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
    brainUIContainer = document.getElementById('brain-ui');
    apUIContainer = document.getElementById('ap-ui');
    toggleViewBtn = document.getElementById('toggle-view-btn');
    apPlayBtn = document.getElementById('ap-play-btn');
    apPauseBtn = document.getElementById('ap-pause-btn');
    apStepBtn = document.getElementById('ap-step-btn');
    apResetBtn = document.getElementById('ap-reset-btn');
    potentialIndicator = document.getElementById('potential-indicator');
    potentialValueSpan = document.getElementById('potential-value');

    // Comprehensive check... (Same as previous version)
    const allElementsExist = instructionElement && scoreElement && feedbackElement && infoDisplayElement && infoNameElement && infoDetailsElement && toggleLobesCheckbox && toggleDeepCheckbox && toggleNervesCheckbox && clipEnableCheckbox && clipAxisSelect && clipSlider && clipValueSpan && clipNegateCheckbox && brainUIContainer && apUIContainer && toggleViewBtn && apPlayBtn && apPauseBtn && apStepBtn && apResetBtn && potentialIndicator && potentialValueSpan;
    if (!allElementsExist) {
        console.error("One or more UI elements were not found! Check HTML IDs.");
        return false;
    }

    // Store callbacks (for direct interactions like button clicks)
    onLayerToggleCallback = layerToggleCb;
    onClippingChangeCallback = clippingChangeCb;
    onViewToggleCallback = viewToggleCb;
    onAPControlCallback = apControlCb;

    // --- Add Event Listeners ---
    toggleLobesCheckbox.addEventListener('change', handleLayerToggle);
    toggleDeepCheckbox.addEventListener('change', handleLayerToggle);
    toggleNervesCheckbox.addEventListener('change', handleLayerToggle);
    clipEnableCheckbox.addEventListener('change', handleClippingChange);
    clipAxisSelect.addEventListener('change', handleClippingChange);
    clipSlider.addEventListener('input', handleClippingSlider);
    clipNegateCheckbox.addEventListener('change', handleClippingChange);
    toggleViewBtn.addEventListener('click', handleViewToggle);
    apPlayBtn.addEventListener('click', () => handleAPControl('play'));
    apPauseBtn.addEventListener('click', () => handleAPControl('pause'));
    apStepBtn.addEventListener('click', () => handleAPControl('step'));
    apResetBtn.addEventListener('click', () => handleAPControl('reset'));

    // --- Subscribe to Event Bus ---
    eventBus.on('potentialChanged', updatePotentialGraph); // Subscribe graph update function
    // --- ---------------------- ---

    // --- Initial State Setup ---
    hideInfo();
    updateClipValueDisplay(parseFloat(clipSlider.value));
    handleLayerToggle(); // Trigger initial layer state update via callback
    handleClippingChange(); // Trigger initial clipping state update via callback
    brainUIContainer.style.display = 'block'; // Ensure correct initial UI visibility
    apUIContainer.style.display = 'none';

    return true;
}

// --- Event Handlers (Callbacks triggered by user interaction) ---
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
    if (clipEnableCheckbox.checked) { handleClippingChange(); } // Trigger update if enabled
}

function handleViewToggle() {
    if (onViewToggleCallback) { onViewToggleCallback(); }
    else { console.warn("View toggle callback not set!"); }
}

function handleAPControl(action) {
    if (onAPControlCallback) { onAPControlCallback(action); }
    else { console.warn("AP control callback not set!"); }
}


// --- UI Update Functions ---
function updateClipValueDisplay(value) {
     if (clipValueSpan) {
        if (!isNaN(value)) { clipValueSpan.textContent = value.toFixed(1); }
        else { clipValueSpan.textContent = '---'; /* console.warn("updateClipValueDisplay received invalid (NaN) value:", value); */ } // Can silence warning if expected during init
    }
}

function setUIMode(mode) { // mode = 'brain' or 'ap'
    if (mode === 'brain') {
        if(brainUIContainer) brainUIContainer.style.display = 'block';
        if(apUIContainer) apUIContainer.style.display = 'none';
        if(toggleViewBtn) toggleViewBtn.textContent = 'View Action Potential';
    } else if (mode === 'ap') {
        if(brainUIContainer) brainUIContainer.style.display = 'none';
        if(apUIContainer) apUIContainer.style.display = 'block';
        if(toggleViewBtn) toggleViewBtn.textContent = 'View Brain Anatomy';
    }
}

// Function called by EVENT BUS when potential changes
function updatePotentialGraph(potential) {
    if (potentialIndicator && potentialValueSpan) {
        const minPotential = -90; const maxPotential = 40;
        // Ensure potential is treated as a number
        const numericPotential = Number(potential);
        if (!isNaN(numericPotential)) {
             const percent = Math.max(0, Math.min(100, ((numericPotential - minPotential) / (maxPotential - minPotential)) * 100));
             potentialIndicator.style.bottom = `${percent}%`;
             potentialValueSpan.textContent = `${numericPotential.toFixed(0)} mV`;
        } else {
            console.warn("updatePotentialGraph received non-numeric potential:", potential);
             potentialIndicator.style.bottom = `0%`; // Default to bottom if invalid
             potentialValueSpan.textContent = `--- mV`;
        }
    }
}

// Other standard UI functions
function updateScore(newScore) { /* ... no change ... */ if (scoreElement) scoreElement.textContent = `Score: ${newScore}`; }
function displayInstruction(text) { /* ... no change ... */ if (instructionElement) instructionElement.textContent = text; }
function showFeedback(message, isCorrect, duration = 2000) { /* ... no change ... */ if (feedbackElement) { /* ... */ } }
function showWinMessage(finalScore) { /* ... no change ... */ if (instructionElement) { /* ... */ } if (feedbackElement) { /* ... */ } }
function displayInfo(name, details) { /* ... no change ... */ if (infoDisplayElement && infoNameElement && infoDetailsElement) { /* ... */ } }
function hideInfo() { /* ... no change ... */ if (infoDisplayElement) { /* ... */ } }


// --- Export necessary functions ---
export {
    initUI,
    updateScore,
    displayInstruction,
    showFeedback,
    showWinMessage,
    displayInfo,
    hideInfo,
    setUIMode,
    // updatePotentialGraph // No longer needs to be exported if only called by event bus
};