// backend/src/apps/projects/projects.events.js
// Event subscriber for cross-app OPPORTUNITY_WON events

const { subscribe, publish } = require('../../platform-core/events/eventBus');
const entitlementService = require('../../platform-core/entitlements/service');
const projectsService = require('./service');

let isSubscribed = false;

const initProjectsEvents = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  subscribe('OPPORTUNITY_WON', async (payload, meta) => {
    const orgId = payload.organizationId || meta?.organizationId;
    if (!orgId) {
      console.warn('[Projects Events] OPPORTUNITY_WON event received without organizationId; skipping.');
      return;
    }

    // Check if tenant has entitlement for 'projects'
    const isEntitled = await entitlementService.hasEntitlement(orgId, 'projects');
    if (!isEntitled) {
      console.log(`[Projects Events] OPPORTUNITY_WON received for org '${orgId}' but ignored: organization lacks entitlement for 'projects'.`);
      return;
    }

    try {
      const projectName = payload.title ? `Project: ${payload.title}` : 'New Won Opportunity Project';

      // Create project linked to the same contactId
      const project = await projectsService.createProject(orgId, {
        contactId: payload.contactId || null,
        name: projectName,
        description: `Automated project initiated from won opportunity (Lead ID: ${payload.leadId || 'N/A'})`,
        status: 'planning',
        budget: payload.dealValue || 0.00,
        metadata: {
          leadId: payload.leadId,
          originEvent: 'OPPORTUNITY_WON',
        },
      });

      console.log(`[Projects Events] Project '${project.name}' (${project.id}) created for org '${orgId}' from won opportunity.`);

      // Publish PROJECT_CREATED event
      await publish('PROJECT_CREATED', {
        projectId: project.id,
        contactId: project.contact_id,
        organizationId: orgId,
        name: project.name,
      }, orgId);
    } catch (err) {
      console.error(`[Projects Events] Failed to process OPPORTUNITY_WON for org '${orgId}':`, err);
      throw err; // Allow eventBus to mark the outbox row as failed
    }
  });
};

// Register subscription on module load (cold-start)
initProjectsEvents();

module.exports = {
  initProjectsEvents,
};
