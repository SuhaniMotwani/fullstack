// backend/src/apps/tasks/tasks.events.js
// Event subscriber for cross-app PROJECT_CREATED events

const { subscribe } = require('../../platform-core/events/eventBus');
const entitlementService = require('../../platform-core/entitlements/service');
const tasksService = require('./service');

let isSubscribed = false;

const initTasksEvents = () => {
  if (isSubscribed) return;
  isSubscribed = true;

  subscribe('PROJECT_CREATED', async (payload, meta) => {
    const orgId = payload.organizationId || meta?.organizationId;
    if (!orgId) {
      console.warn('[Tasks Events] PROJECT_CREATED event received without organizationId; skipping.');
      return;
    }

    // Guard with entitlement check before acting
    const isEntitled = await entitlementService.hasEntitlement(orgId, 'tasks');
    if (!isEntitled) {
      console.log(`[Tasks Events] PROJECT_CREATED received for org '${orgId}' but ignored: organization lacks entitlement for 'tasks'.`);
      return;
    }

    const { projectId, contactId } = payload;
    if (!projectId) {
      console.warn('[Tasks Events] PROJECT_CREATED event missing projectId; skipping task generation.');
      return;
    }

    try {
      // Auto-generate 3 starter tasks for the project
      const starterTasks = [
        {
          title: 'Project kickoff and requirements review',
          description: 'Review project scope, objectives, and milestones with stakeholders.',
          priority: 'high',
          status: 'todo',
        },
        {
          title: 'Design and architecture specifications',
          description: 'Document architectural layout, technical designs, and deliverables.',
          priority: 'medium',
          status: 'todo',
        },
        {
          title: 'Implementation and initial milestone delivery',
          description: 'Core development work and initial prototype completion.',
          priority: 'medium',
          status: 'todo',
        },
      ];

      for (const t of starterTasks) {
        await tasksService.createTask(orgId, {
          projectId,
          contactId: contactId || null,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          metadata: {
            generatedBy: 'PROJECT_CREATED_EVENT',
          },
        });
      }

      console.log(`[Tasks Events] Auto-generated 3 starter tasks for project '${projectId}' in org '${orgId}'.`);
    } catch (err) {
      console.error(`[Tasks Events] Failed to auto-generate starter tasks for project '${projectId}':`, err);
      throw err; // Let eventBus catch and record failure in outbox
    }
  });
};

// Register subscription on module load (cold-start)
initTasksEvents();

module.exports = {
  initTasksEvents,
};
