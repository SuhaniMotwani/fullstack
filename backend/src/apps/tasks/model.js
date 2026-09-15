// backend/src/apps/tasks/model.js
const db = require('../../config/database');

// Table prefix: task_*
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const findTasksByOrg = async (organizationId) => {
  // TODO: SELECT * FROM task_tasks WHERE organization_id = $1
};

module.exports = {
  findTasksByOrg,
};
