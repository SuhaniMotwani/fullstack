const { hasEntitlement } = require('./service');

const requireApp = (appCode) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    try {
      const isEntitled = await hasEntitlement(req.user.organizationId, appCode);

      if (!isEntitled) {
        return res.status(403).json({
          error: `Forbidden: Organization lacks entitlement for app '${appCode}'`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: 'Internal error checking app entitlement' });
    }
  };
};

module.exports = {
  requireApp,
};
