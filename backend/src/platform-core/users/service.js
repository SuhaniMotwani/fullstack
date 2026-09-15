const bcrypt = require('bcrypt');
const db = require('../../config/database');
const { ROLES } = require('../rbac/permissions');

const listUsers = async (organizationId) => {
  const result = await db.query(
    `SELECT id, organization_id, email, first_name, last_name, role, created_at, updated_at
     FROM users
     WHERE organization_id = $1
     ORDER BY created_at ASC`,
    [organizationId]
  );
  return result.rows;
};

const getUserById = async (organizationId, userId) => {
  const result = await db.query(
    `SELECT id, organization_id, email, first_name, last_name, role, created_at, updated_at
     FROM users
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const createUser = async (organizationId, { email, password, firstName, lastName, role }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const assignedRole = Object.values(ROLES).includes(role) ? role : ROLES.MEMBER;

  // Check email in organization
  const existing = await db.query(
    `SELECT id FROM users WHERE organization_id = $1 AND email = $2 LIMIT 1`,
    [organizationId, email.toLowerCase().trim()]
  );

  if (existing.rows.length > 0) {
    const error = new Error('User with this email already exists in the organization');
    error.statusCode = 409;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await db.query(
    `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organization_id, email, first_name, last_name, role, created_at`,
    [
      organizationId,
      email.toLowerCase().trim(),
      passwordHash,
      firstName ? firstName.trim() : null,
      lastName ? lastName.trim() : null,
      assignedRole,
    ]
  );

  const user = result.rows[0];

  // Map to user_roles
  const roleRes = await db.query(
    `SELECT id FROM roles WHERE organization_id = $1 AND name = $2 LIMIT 1`,
    [organizationId, assignedRole]
  );
  if (roleRes.rows.length > 0) {
    await db.query(
      `INSERT INTO user_roles (organization_id, user_id, role_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [organizationId, user.id, roleRes.rows[0].id]
    );
  }

  return user;
};

const updateUser = async (organizationId, userId, { firstName, lastName, role }) => {
  let roleUpdate = null;
  if (role && Object.values(ROLES).includes(role)) {
    roleUpdate = role;
  }

  const result = await db.query(
    `UPDATE users
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         role = COALESCE($3, role),
         updated_at = NOW()
     WHERE organization_id = $4 AND id = $5
     RETURNING id, organization_id, email, first_name, last_name, role, updated_at`,
    [
      firstName !== undefined ? firstName : null,
      lastName !== undefined ? lastName : null,
      roleUpdate,
      organizationId,
      userId,
    ]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = result.rows[0];

  if (roleUpdate) {
    const roleRes = await db.query(
      `SELECT id FROM roles WHERE organization_id = $1 AND name = $2 LIMIT 1`,
      [organizationId, roleUpdate]
    );
    if (roleRes.rows.length > 0) {
      await db.query(
        `DELETE FROM user_roles WHERE organization_id = $1 AND user_id = $2`,
        [organizationId, userId]
      );
      await db.query(
        `INSERT INTO user_roles (organization_id, user_id, role_id)
         VALUES ($1, $2, $3)`,
        [organizationId, userId, roleRes.rows[0].id]
      );
    }
  }

  return updated;
};

const deleteUser = async (organizationId, userId) => {
  const result = await db.query(
    `DELETE FROM users
     WHERE organization_id = $1 AND id = $2
     RETURNING id`,
    [organizationId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'User deleted successfully', id: result.rows[0].id };
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
