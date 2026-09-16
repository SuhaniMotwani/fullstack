const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/database');
const { ROLES, seedRolesForOrg, ROLE_PERMISSIONS } = require('../rbac/permissions');
const { seedDefaultEntitlements, getEntitlements } = require('../entitlements/service');

const JWT_SECRET = process.env.JWT_SECRET || 'archscale-jwt-default-secret-key-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const issueToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const generateSlug = (name) => {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'org';
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
};

const register = async ({ orgName, email, password, firstName, lastName, appCodes }) => {

  if (!orgName || !email || !password) {
    const error = new Error('Organization name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  // Check if email already registered
  const existingUser = await db.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email.toLowerCase().trim()]);
  if (existingUser.rows.length > 0) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create organization
  const slug = generateSlug(orgName);
  const orgResult = await db.query(
    `INSERT INTO organizations (name, slug)
     VALUES ($1, $2)
     RETURNING id, name, slug, created_at`,
    [orgName.trim(), slug]
  );
  const organization = orgResult.rows[0];

  // Seed default roles for tenant
  await seedRolesForOrg(organization.id);

  // Seed default entitlements (defaults strictly to ['projects'] unless specified)
  await seedDefaultEntitlements(organization.id, appCodes || ['projects']);

  // Create Admin user
  const userResult = await db.query(
    `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organization_id, email, first_name, last_name, role, created_at`,
    [
      organization.id,
      email.toLowerCase().trim(),
      passwordHash,
      firstName ? firstName.trim() : null,
      lastName ? lastName.trim() : null,
      ROLES.ADMIN,
    ]
  );
  const user = userResult.rows[0];

  // Map to user_roles
  const roleResult = await db.query(
    `SELECT id FROM roles WHERE organization_id = $1 AND name = $2 LIMIT 1`,
    [organization.id, ROLES.ADMIN]
  );
  if (roleResult.rows.length > 0) {
    await db.query(
      `INSERT INTO user_roles (organization_id, user_id, role_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [organization.id, user.id, roleResult.rows[0].id]
    );
  }

  const token = issueToken({
    userId: user.id,
    organizationId: organization.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      organizationId: organization.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
    organization,
  };
};

const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const userResult = await db.query(
    `SELECT id, organization_id, email, password_hash, first_name, last_name, role
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email.toLowerCase().trim()]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = userResult.rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Fetch organization
  const orgResult = await db.query(
    `SELECT id, name, slug FROM organizations WHERE id = $1 LIMIT 1`,
    [user.organization_id]
  );
  const organization = orgResult.rows[0] || null;

  const token = issueToken({
    userId: user.id,
    organizationId: user.organization_id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      organizationId: user.organization_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
    organization,
  };
};

const getMe = async (userId, organizationId) => {
  // Tenant-isolated user query
  const userResult = await db.query(
    `SELECT id, organization_id, email, first_name, last_name, role, created_at
     FROM users
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, userId]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = userResult.rows[0];

  // Tenant-isolated organization query
  const orgResult = await db.query(
    `SELECT id, name, slug, created_at, updated_at
     FROM organizations
     WHERE id = $1
     LIMIT 1`,
    [organizationId]
  );
  const organization = orgResult.rows[0] || null;

  // Resolve permissions
  let permissions = ROLE_PERMISSIONS[user.role] || [];
  try {
    const roleResult = await db.query(
      `SELECT permissions FROM roles WHERE organization_id = $1 AND name = $2 LIMIT 1`,
      [organizationId, user.role]
    );
    if (roleResult.rows.length > 0 && Array.isArray(roleResult.rows[0].permissions)) {
      permissions = roleResult.rows[0].permissions;
    }
  } catch (err) {
    // Fall back to default role permissions
  }

  // Resolve tenant entitlements
  let entitlements = [];
  try {
    entitlements = await getEntitlements(organizationId);
  } catch (err) {
    console.error(`[Auth Service] Failed to retrieve entitlements for org ${organizationId}:`, err);
  }

  return {
    user: {
      id: user.id,
      organizationId: user.organization_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
    },
    organization,
    permissions,
    entitlements,
  };
};

module.exports = {
  issueToken,
  verifyToken,
  register,
  login,
  getMe,
};
