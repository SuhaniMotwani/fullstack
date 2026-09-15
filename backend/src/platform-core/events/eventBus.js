// backend/src/platform-core/events/eventBus.js
// In-process synchronous event bus & outbox pattern dispatcher

const listeners = new Map();

const subscribe = (eventName, handler) => {
  // TODO: Register synchronous listener for event
  if (!listeners.has(eventName)) {
    listeners.set(eventName, []);
  }
  listeners.get(eventName).push(handler);
};

const publish = async (eventName, payload, organizationId) => {
  // TODO: Persist event in outbox table and dispatch synchronously to registered handlers
};

module.exports = {
  subscribe,
  publish,
};
