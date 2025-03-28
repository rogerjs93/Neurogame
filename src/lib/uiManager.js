// File: src/lib/uiManager.js
// Removed AP elements, callbacks, and functions

// UI Element Variables
let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement; // Check these carefully
let toggleLobesCheckbox, toggleDeepCheckbox, toggleNervesCheckbox;
let clipEnableCheckbox, clipAxisSelect, clipSlider, clipValueSpan, clipNegateCheckbox;

// Callbacks
let onLayerToggleCallback = null;
let onClippingChangeCallback = null;

function initUI(layerToggleCb, clippingChangeCb) {
    // Get elements by ID... Add specific checks
    instructionElement = document.getElementById('instructions');
    scoreElement = document.getElementById('score');
    feedbackElement = document.getElementById('feedback');
    infoDisplayElement = document.getElementById('info-display'); // Check if null
    infoNameElement = document.getElementById('info-name');       // Check if null
    infoDetailsElement = document.getElementById('info-details'); // Check if null
    toggleLobesCheckbox = document.getElementById('toggle-lobes');
    toggleDeepCheckbox = document.getElementById('toggle-deep');
    toggleNervesCheckbox = document.getElementById('toggle-nerves');
    clipEnableCheckbox = document.getElementById('clip-enable');
    clipAxisSelect = document.getElementById('clip-axis');
    clipSlider = document.getElementById('clip-slider');
    clipValueSpan = document.getElementById('clip-value');
    clipNegateCheckbox = document.getElementById('clip-negate');

    // More robust check and logging
    let allElementsFound = true;
    const elementIds = ['instructions', 'score', 'feedback', 'info-display', 'info-name', 'info-details', 'toggle-lobes', 'toggle-deep', 'toggle-nerves', 'clip-enable', 'clip-axis', 'clip-slider', 'clip-value', 'clip-negate'];
    elementIds.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`UI Element not found: #${id}`);
            allElementsFound = false;
        }
    });
    // Assign potentially null elements again after check
    infoDisplayElement = document.getElementById('info-display');
    infoNameElement = document.getElementById('info-name');
    infoDetailsElement = document.getElementById('info-details');
    // ... re-assign others if needed ...

    if (!allElementsFound) {
        console.error("One or more required UI elements were not found! Info display might fail.");
        // Decide whether to return false or continue with potential issues
        // return false;
    }

    // Store necessary callbacks
    onLayerToggleCallback = layerToggleCb;
    onClippingChangeCallback = clippingChangeCb;

    // Event Listeners
    if (toggleLobesCheckbox) toggleLobesCheckbox.addEventListener('change', handleLayerToggle);
    if (toggleDeepCheckbox) toggleDeepCheckbox.addEventListener('change', handleLayerToggle);
    if (toggleNervesCheckbox) toggleNervesCheckbox.addEventListener('change', handleLayerToggle);
    if (clipEnableCheckbox) clipEnableCheckbox.addEventListener('change', handleClippingChange);
    if (clipAxisSelect) clipAxisSelect.addEventListener('change', handleClippingChange);
    if (clipSlider) clipSlider.addEventListener('input', handleClippingSlider);
    if (clipNegateCheckbox) clipNegateCheckbox.addEventListener('change', handleClippingChange);

    // Initial State
    hideInfo();
    updateClipValueDisplay(parseFloat(clipSlider?.value || '0')); // Use optional chaining and default
    handleLayerToggle(); // Trigger initial layer state
    handleClippingChange(); // Trigger initial clipping state

    console.log("UI Initialized.");
    return true; // Return true even if some elements missing, relying on console errors
}

// --- Event Handlers ---
function handleLayerToggle() {
    // Add checks for checkbox existence before accessing .checked
    if (onLayerToggleCallback && toggleLobesCheckbox && toggleDeepCheckbox && toggleNervesCheckbox) {
        const layersState = { lobes: toggleLobesCheckbox.checked, deep: toggleDeepCheckbox.checked, nerves: toggleNervesCheckbox.checked };
        onLayerToggleCallback(layersState);
    } else { console.warn("Layer toggle callback or checkbox element missing!"); }
}

function handleClippingChange() {
     if (onClippingChangeCallback && clipEnableCheckbox && clipAxisSelect && clipSlider && clipNegateCheckbox) {
         const clippingState = { enabled: clipEnableCheckbox.checked, axis: clipAxisSelect.value, position: parseFloat(clipSlider.value), negate: clipNegateCheckbox.checked };
         onClippingChangeCallback(clippingState);
     } else { console.warn("Clipping change callback or control element missing!"); }
}

function handleClippingSlider() {
    if (!clipSlider || !clipEnableCheckbox) return;
    const value = parseFloat(clipSlider.value);
    updateClipValueDisplay(value);
    if (clipEnableCheckbox.checked) { handleClippingChange(); }
}

// --- UI Update Functions ---
function updateClipValueDisplay(value) {
     if (clipValueSpan) {
        if (!isNaN(value)) { clipValueSpan.textContent = value.toFixed(1); }
        else { clipValueSpan.textContent = '---'; }
    }
}

// --- displayInfo with Debugging ---
function displayInfo(name, details) {
    console.log(`displayInfo called: Name='${name}', Details='${details ? details.substring(0, 50) + '...' : 'N/A'}'`); // Log call
    if (infoDisplayElement && infoNameElement && infoDetailsElement) {
        infoNameElement.textContent = name || 'Unknown'; // Provide default
        infoDetailsElement.textContent = details || 'No information available.'; // Provide default
        infoDisplayElement.style.display = 'block'; // Make visible
        console.log("Info display element set to block.");
    } else {
        console.error("Cannot display info: UI elements missing.", { infoDisplayElement, infoNameElement, infoDetailsElement });
    }
}

// --- hideInfo with Debugging ---
function hideInfo() {
    console.log("hideInfo called."); // Log call
     if (infoDisplayElement) {
        infoDisplayElement.style.display = 'none'; // Hide it
        if(infoNameElement) infoNameElement.textContent = '';
        if(infoDetailsElement) infoDetailsElement.textContent = '';
     } else {
        console.warn("Cannot hide info: infoDisplayElement missing.");
     }
}

// Other standard UI functions
function updateScore(newScore) { if (scoreElement) scoreElement.textContent = `Score: ${newScore}`; }
function displayInstruction(text) { if (instructionElement) instructionElement.textContent = text; }
function showFeedback(message, isCorrect, duration = 2000) {
    if (feedbackElement) {
        feedbackElement.textContent = message; feedbackElement.className = isCorrect ? 'correct' : 'incorrect'; feedbackElement.style.opacity = 1;
        if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId);
        feedbackElement.timeoutId = setTimeout(() => { if(feedbackElement) feedbackElement.style.opacity = 0; feedbackElement.timeoutId = null; }, duration);
    }
}
function showWinMessage(finalScore) {
    if (instructionElement) instructionElement.textContent = `Phase Complete! Final Score: ${finalScore}`;
    if (feedbackElement) {
        feedbackElement.textContent = `Great job!`; feedbackElement.className = 'correct'; feedbackElement.style.opacity = 1;
        if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId); feedbackElement.timeoutId = null;
    }
}


// --- Export necessary functions ---
export { initUI, updateScore, displayInstruction, showFeedback, showWinMessage, displayInfo, hideInfo };