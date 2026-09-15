const db = require('../../config/database');

const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.MANAGER]: [
    'crm:*',
    'projects:*',
    'tasks:*',
    'accounts:read',
    'accounts:write',
    'contacts:*',
    'users:read',
    'users:write',
  ],
  [ROLES.MEMBER]: [
    'crm:read',
    'crm:write',
    'projects:read',
    'projects:write',
    'tasks:read',
    'tasks:write',
    'contacts:read',
    'users:read',
  ],
};

const hasPermission = (userPermissions = [], requiredPermission) => {
  if (userPermissions.includes('*')) {
    return true;
  }
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  const [reqDomain, reqAction] = requiredPermission.split(':');
  if (reqDomain && reqAction) {
    if (userPermissions.includes(`${reqDomain}:*`)) {
      return true;
    }
  }

  return false;
};

const seedRolesForOrg = async (organizationId) => {
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    await db.query(
      `INSERT INTO roles (organization_id, name, description, permissions)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, name)
       DO UPDATE SET permissions = EXCLUDED.permissions`,
      [organizationId, roleName, `${roleName} default seeded role`, JSON.stringify(permissions)]
    );
  }
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  seedRolesForOrg,
};
