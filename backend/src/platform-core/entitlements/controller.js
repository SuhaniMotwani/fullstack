const entitlementService = require('./service');

const getEntitlements = async (req, res, next) => {
  try {
    const entitlements = await entitlementService.getEntitlements(req.user.organizationId);
    return res.status(200).json(entitlements);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateEntitlement = async (req, res, next) => {
  try {
    const { appCode } = req.params;
    const { enabled, settings } = req.body;
    const updated = await entitlementService.setEntitlement(req.user.organizationId, appCode, {
      enabled,
      settings,
    });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getEntitlements,
  updateEntitlement,
};
