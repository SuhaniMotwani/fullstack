// backend/src/apps/accounts/accounts.events.js
// Event subscriber for cross-app EXPENSE_LOGGED events

const { subscribe } = require('../../platform-core/events/eventBus');
const entitlementService = require('../../platform-core/entitlements/service');
const accountsService = require('./service');

let isSubscribed = false;

const initAccountsEvents = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  subscribe('EXPENSE_LOGGED', async (payload, meta) => {
    const orgId = payload.organizationId || meta?.organizationId;
    if (!orgId) {
      console.warn('[Accounts Events] EXPENSE_LOGGED event received without organizationId; skipping.');
      return;
    }

    // Check if tenant has entitlement for 'accounts'
    const isEntitled = await entitlementService.hasEntitlement(orgId, 'accounts');
    if (!isEntitled) {
      console.log(`[Accounts Events] EXPENSE_LOGGED received for org '${orgId}' but ignored: organization lacks entitlement for 'accounts'.`);
      return;
    }

    try {
      const invoice = await accountsService.createDraftFromExpense(orgId, {
        contactId: payload.contactId || null,
        amount: payload.amount,
        description: payload.description,
        taskId: payload.taskId,
        projectId: payload.projectId,
      });

      console.log(`[Accounts Events] Draft invoice '${invoice.invoice_number}' (${invoice.id}) created for org '${orgId}' from logged expense.`);
    } catch (err) {
      console.error(`[Accounts Events] Failed to auto-create draft invoice for org '${orgId}':`, err);
      throw err; // Allow eventBus to record outbox failure
    }
  });
};

// Register subscription on module load (cold-start)
initAccountsEvents();

module.exports = {
  initAccountsEvents,
};
