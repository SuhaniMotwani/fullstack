// backend/src/apps/accounts/model.js
const db = require('../../config/database');

// Table prefix: acct_*
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const findAccountsByOrg = async (organizationId) => {
  // TODO: SELECT * FROM acct_accounts WHERE organization_id = $1
};

module.exports = {
  findAccountsByOrg,
};
