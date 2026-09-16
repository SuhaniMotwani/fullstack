const entitlementModel = require('./model');

const getEntitlements = async (organizationId) => {
  return await entitlementModel.findByOrg(organizationId);
};

const hasEntitlement = async (organizationId, appSlug) => {
  if (!organizationId || !appSlug) {
    return false;
  }

  const record = await entitlementModel.findByOrgAndApp(organizationId, appSlug);

  // Explicit check: must exist and be enabled. No implicit enabling.
  if (record && record.enabled === true) {
    return true;
  }

  return false;
};

const setEntitlement = async (organizationId, appSlug, { enabled = true, settings = {} } = {}) => {
  if (!appSlug || !appSlug.trim()) {
    const error = new Error('App slug/code is required');
    error.statusCode = 400;
    throw error;
  }

  return await entitlementModel.upsert(organizationId, appSlug.trim(), enabled, settings);
};

const seedDefaultEntitlements = async (organizationId, appCodes = ['projects']) => {
  const seeded = [];
  for (const appCode of appCodes) {
    const row = await entitlementModel.upsert(organizationId, appCode, true, {});
    seeded.push(row);
  }
  return seeded;
};

module.exports = {
  getEntitlements,
  hasEntitlement,
  setEntitlement,
  seedDefaultEntitlements,
};
