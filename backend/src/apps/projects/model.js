// backend/src/apps/projects/model.js
const db = require('../../config/database');

// Table prefix: proj_*
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const findProjectsByOrg = async (organizationId) => {
  // TODO: SELECT * FROM proj_projects WHERE organization_id = $1
};

module.exports = {
  findProjectsByOrg,
};
