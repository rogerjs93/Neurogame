// File: src/lib/eventBus.js

// Simple Event Emitter (Pub/Sub)
const events = {};

/**
 * Subscribe to an event.
 * @param {string} eventName - The name of the event.
 * @param {Function} listener - The callback function to execute.
 */
function on(eventName, listener) {
    if (!events[eventName]) {
        events[eventName] = [];
    }
    if (typeof listener === 'function') {
        events[eventName].push(listener);
    } else {
        console.warn(`Attempted to subscribe to ${eventName} with non-function:`, listener);
    }
}

/**
 * Unsubscribe from an event.
 * @param {string} eventName - The name of the event.
 * @param {Function} listenerToRemove - The specific listener function to remove.
 */
function off(eventName, listenerToRemove) {
    if (!events[eventName]) return;

    events[eventName] = events[eventName].filter(listener => listener !== listenerToRemove);
}

/**
 * Emit an event, calling all subscribed listeners.
 * @param {string} eventName - The name of the event to emit.
 * @param {*} data - Optional data to pass to the listeners.
 */
function emit(eventName, data) {
    if (!events[eventName]) return;

    // Iterate over a copy in case listeners modify the array during emit
    [...events[eventName]].forEach(listener => {
        try {
            listener(data);
        } catch (error) {
            console.error(`Error in event listener for ${eventName}:`, error);
        }
    });
}

// Export the public methods
export default { on, off, emit };