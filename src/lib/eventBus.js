// File: src/lib/eventBus.js
// Simple Event Emitter (Pub/Sub) - No longer needed for AP communication
// Keep if you might use it for other features, otherwise safe to delete.
const events = {};
function on(eventName, listener) {
    if (!events[eventName]) { events[eventName] = []; }
    if (typeof listener === 'function') { events[eventName].push(listener); }
    else { console.warn(`Attempted subscribe to ${eventName} with non-function:`, listener); }
}
function off(eventName, listenerToRemove) {
    if (!events[eventName]) return;
    events[eventName] = events[eventName].filter(listener => listener !== listenerToRemove);
}
function emit(eventName, data) {
    if (!events[eventName]) return;
    [...events[eventName]].forEach(listener => {
        try { listener(data); }
        catch (error) { console.error(`Error in event listener for ${eventName}:`, error); }
    });
}
export default { on, off, emit };