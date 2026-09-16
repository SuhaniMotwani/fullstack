// backend/src/platform-core/events/eventBus.js
// In-process synchronous event bus & outbox pattern dispatcher for serverless

const db = require('../../config/database');

const listeners = new Map();

/**
 * Register a synchronous or asynchronous event handler
 * @param {string} eventType
 * @param {Function} handler (payload, metadata) => void | Promise<void>
 */
const subscribe = (eventType, handler) => {
  if (!eventType || typeof handler !== 'function') {
    throw new Error('Valid eventType string and handler function are required');
  }

  if (!listeners.has(eventType)) {
    listeners.set(eventType, []);
  }

  listeners.get(eventType).push(handler);
};

/**
 * Unsubscribe a handler from an event
 * @param {string} eventType
 * @param {Function} handler
 */
const unsubscribe = (eventType, handler) => {
  if (!listeners.has(eventType)) return;
  const handlers = listeners.get(eventType);
  const index = handlers.indexOf(handler);
  if (index !== -1) {
    handlers.splice(index, 1);
  }
};

/**
 * Clear all registered event listeners (useful for testing)
 */
const clearListeners = () => {
  listeners.clear();
};

/**
 * Publish an event synchronously within the current serverless invocation:
 * 1. Inserts a row into outbox_events
 * 2. Immediately invokes any registered handlers
 * 3. Catches any handler errors, logs failure, and updates outbox row to 'failed'
 *
 * @param {string} eventType
 * @param {Object} payload
 * @param {string} [organizationId]
 */
const publish = async (eventType, payload = {}, organizationId = null) => {
  if (!eventType) {
    throw new Error('eventType is required');
  }

  const orgId = organizationId || payload.organizationId || payload.organization_id || null;

  let outboxId = null;

  // 1. Insert into outbox_events table
  try {
    const insertResult = await db.query(
      `INSERT INTO outbox_events (organization_id, event_name, payload, status, dispatched_at)
       VALUES ($1, $2, $3, 'dispatched', NOW())
       RETURNING id`,
      [orgId, eventType, JSON.stringify(payload)]
    );
    outboxId = insertResult.rows[0]?.id || null;
  } catch (dbErr) {
    console.error(`[EventBus] Failed to insert outbox event '${eventType}':`, dbErr);
  }

  // 2. Immediately invoke registered handlers in the same execution context
  const handlers = listeners.get(eventType) || [];
  let executionFailed = false;
  let firstErrorMessage = null;

  for (const handler of handlers) {
    try {
      await handler(payload, { eventType, organizationId: orgId, outboxId });
    } catch (handlerErr) {
      executionFailed = true;
      firstErrorMessage = handlerErr?.message || String(handlerErr);
      console.error(`[EventBus] Error in handler for event '${eventType}':`, handlerErr);
    }
  }

  // 3. If any handler failed, mark outbox row as 'failed' with error message
  if (executionFailed && outboxId) {
    try {
      await db.query(
        `UPDATE outbox_events
         SET status = 'failed',
             error_message = $1
         WHERE id = $2`,
        [firstErrorMessage, outboxId]
      );
    } catch (updateErr) {
      console.error(`[EventBus] Failed to update outbox status to failed:`, updateErr);
    }
  }

  return {
    outboxId,
    eventType,
    status: executionFailed ? 'failed' : 'dispatched',
    handlersInvoked: handlers.length,
    error: firstErrorMessage,
  };
};

module.exports = {
  subscribe,
  unsubscribe,
  clearListeners,
  publish,
};
