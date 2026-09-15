const { ROLE_PERMISSIONS, hasPermission } = require('./permissions');
const db = require('../../config/database');

const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const userRole = req.user.role;
    let permissions = ROLE_PERMISSIONS[userRole] || [];

    // Also check database if custom role permissions were assigned
    try {
      if (req.user.organizationId) {
        const roleRes = await db.query(
          `SELECT permissions FROM roles WHERE organization_id = $1 AND name = $2 LIMIT 1`,
          [req.user.organizationId, userRole]
        );
        if (roleRes.rows.length > 0 && Array.isArray(roleRes.rows[0].permissions)) {
          permissions = roleRes.rows[0].permissions;
        }
      }
    } catch (err) {
      // Fall back to default role permissions
    }

    if (hasPermission(permissions, permission)) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Missing required permission '${permission}'`,
    });
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (allowedRoles.includes(req.user.role) || req.user.role === 'Admin') {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Requires one of roles: [${allowedRoles.join(', ')}]`,
    });
  };
};

module.exports = {
  requirePermission,
  requireRole,
};
