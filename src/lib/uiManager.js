// File: src/lib/uiManager.js
let instructionElement, scoreElement, feedbackElement;
let infoDisplayElement, infoNameElement, infoDetailsElement;
let toggleLobesCheckbox, toggleDeepCheckbox, toggleNervesCheckbox;
let clipEnableCheckbox, clipAxisSelect, clipSlider, clipValueSpan, clipNegateCheckbox;
let onLayerToggleCallback = null; let onClippingChangeCallback = null;

function initUI(layerToggleCb, clippingChangeCb) {
    instructionElement = document.getElementById('instructions'); scoreElement = document.getElementById('score'); feedbackElement = document.getElementById('feedback');
    infoDisplayElement = document.getElementById('info-display'); infoNameElement = document.getElementById('info-name'); infoDetailsElement = document.getElementById('info-details');
    toggleLobesCheckbox = document.getElementById('toggle-lobes'); toggleDeepCheckbox = document.getElementById('toggle-deep'); toggleNervesCheckbox = document.getElementById('toggle-nerves');
    clipEnableCheckbox = document.getElementById('clip-enable'); clipAxisSelect = document.getElementById('clip-axis'); clipSlider = document.getElementById('clip-slider'); clipValueSpan = document.getElementById('clip-value'); clipNegateCheckbox = document.getElementById('clip-negate');

    let allElementsFound = true; const elementIds = ['instructions', 'score', 'feedback', 'info-display', 'info-name', 'info-details', 'toggle-lobes', 'toggle-deep', 'toggle-nerves', 'clip-enable', 'clip-axis', 'clip-slider', 'clip-value', 'clip-negate'];
    elementIds.forEach(id => { if (!document.getElementById(id)) { console.error(`UI Element not found: #${id}`); allElementsFound = false; } });
    infoDisplayElement = document.getElementById('info-display'); infoNameElement = document.getElementById('info-name'); infoDetailsElement = document.getElementById('info-details'); // Re-assign after check
    if (!allElementsFound) { console.error("One or more required UI elements were not found!"); }

    onLayerToggleCallback = layerToggleCb; onClippingChangeCallback = clippingChangeCb;
    if (toggleLobesCheckbox) toggleLobesCheckbox.addEventListener('change', handleLayerToggle); if (toggleDeepCheckbox) toggleDeepCheckbox.addEventListener('change', handleLayerToggle); if (toggleNervesCheckbox) toggleNervesCheckbox.addEventListener('change', handleLayerToggle);
    if (clipEnableCheckbox) clipEnableCheckbox.addEventListener('change', handleClippingChange); if (clipAxisSelect) clipAxisSelect.addEventListener('change', handleClippingChange); if (clipSlider) clipSlider.addEventListener('input', handleClippingSlider); if (clipNegateCheckbox) clipNegateCheckbox.addEventListener('change', handleClippingChange);

    hideInfo(); updateClipValueDisplay(parseFloat(clipSlider?.value || '0'));
    // Don't call initial handlers here, let main.js call after loading model data
    // handleLayerToggle(); handleClippingChange();
    console.log("UI Initialized."); return true;
}
function handleLayerToggle() { if (onLayerToggleCallback && toggleLobesCheckbox && toggleDeepCheckbox && toggleNervesCheckbox) { const layersState = { lobes: toggleLobesCheckbox.checked, deep: toggleDeepCheckbox.checked, nerves: toggleNervesCheckbox.checked }; onLayerToggleCallback(layersState); } else { console.warn("Layer toggle callback or checkbox missing!"); } }
function handleClippingChange() { if (onClippingChangeCallback && clipEnableCheckbox && clipAxisSelect && clipSlider && clipNegateCheckbox) { const clippingState = { enabled: clipEnableCheckbox.checked, axis: clipAxisSelect.value, position: parseFloat(clipSlider.value), negate: clipNegateCheckbox.checked }; onClippingChangeCallback(clippingState); } else { console.warn("Clipping change callback or control missing!"); } }
function handleClippingSlider() { if (!clipSlider || !clipEnableCheckbox) return; const value = parseFloat(clipSlider.value); updateClipValueDisplay(value); if (clipEnableCheckbox.checked) { handleClippingChange(); } }
function updateClipValueDisplay(value) { if (clipValueSpan) { if (!isNaN(value)) { clipValueSpan.textContent = value.toFixed(1); } else { clipValueSpan.textContent = '---'; } } }
function displayInfo(name, details) { console.log(`displayInfo called: Name='${name}'`); if (infoDisplayElement && infoNameElement && infoDetailsElement) { infoNameElement.textContent = name || 'Unknown'; infoDetailsElement.textContent = details || 'No info.'; infoDisplayElement.style.display = 'block'; } else { console.error("Cannot display info: UI elements missing."); } }
function hideInfo() { /* console.log("hideInfo called."); */ if (infoDisplayElement) { infoDisplayElement.style.display = 'none'; if(infoNameElement) infoNameElement.textContent = ''; if(infoDetailsElement) infoDetailsElement.textContent = ''; } }
function updateScore(newScore) { if (scoreElement) scoreElement.textContent = `Score: ${newScore}`; }
function displayInstruction(text) { if (instructionElement) instructionElement.textContent = text; }
function showFeedback(message, isCorrect, duration = 2000) { if (feedbackElement) { feedbackElement.textContent = message; feedbackElement.className = isCorrect ? 'correct' : 'incorrect'; feedbackElement.style.opacity = 1; if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId); feedbackElement.timeoutId = setTimeout(() => { if(feedbackElement) feedbackElement.style.opacity = 0; feedbackElement.timeoutId = null; }, duration); } }
function showWinMessage(finalScore) { if (instructionElement) instructionElement.textContent = `Phase Complete! Score: ${finalScore}`; if (feedbackElement) { feedbackElement.textContent = `Great job!`; feedbackElement.className = 'correct'; feedbackElement.style.opacity = 1; if (feedbackElement.timeoutId) clearTimeout(feedbackElement.timeoutId); feedbackElement.timeoutId = null; } }
export { initUI, updateScore, displayInstruction, showFeedback, showWinMessage, displayInfo, hideInfo };