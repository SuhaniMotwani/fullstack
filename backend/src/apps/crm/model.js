// backend/src/apps/crm/model.js
const db = require('../../config/database');

// Table prefix: crm_*
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const findLeadsByOrg = async (organizationId) => {
  // TODO: SELECT * FROM crm_leads WHERE organization_id = $1
};

module.exports = {
  findLeadsByOrg,
};
