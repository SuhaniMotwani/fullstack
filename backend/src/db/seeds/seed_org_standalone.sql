-- ==============================================================================
-- Seed: Org A (Standalone Projects)
-- Description: Standalone organization with one admin user and 'projects' entitlement only.
-- Usage: Paste directly into the Supabase SQL Editor.
-- Credentials: admin@orga.com / Password123!
-- ==============================================================================

DO $$
DECLARE
  v_org_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_admin_user_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_admin_role_id UUID;
  -- bcrypt hash for 'Password123!' with 10 salt rounds
  v_password_hash TEXT := '$2b$10$rTmNmMFK132tobsLDL56Sul9ASYKs8MdVDFcKIHJN.FhOjOFD7TCy';
BEGIN
  -- 1. Create Organization A
  INSERT INTO organizations (id, name, slug)
  VALUES (v_org_id, 'Org A (Standalone Projects)', 'org-a-standalone')
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  -- 2. Seed Standard Roles for Org A
  INSERT INTO roles (organization_id, name, description, permissions)
  VALUES
    (v_org_id, 'Admin', 'Admin default seeded role', '["*"]'::jsonb),
    (v_org_id, 'Manager', 'Manager default seeded role', '["crm:*","projects:*","tasks:*","accounts:read","accounts:write","contacts:*","users:read","users:write"]'::jsonb),
    (v_org_id, 'Member', 'Member default seeded role', '["crm:read","crm:write","projects:read","projects:write","tasks:read","tasks:write","contacts:read","users:read"]'::jsonb)
  ON CONFLICT (organization_id, name) DO UPDATE
    SET permissions = EXCLUDED.permissions;

  SELECT id INTO v_admin_role_id
  FROM roles
  WHERE organization_id = v_org_id AND name = 'Admin'
  LIMIT 1;

  -- 3. Create Admin User for Org A
  INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role)
  VALUES (
    v_admin_user_id,
    v_org_id,
    'admin@orga.com',
    v_password_hash,
    'Alice',
    'Admin',
    'Admin'
  )
  ON CONFLICT (organization_id, email) DO UPDATE
    SET password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
  RETURNING id INTO v_admin_user_id;

  -- 4. Assign Admin Role to User
  INSERT INTO user_roles (organization_id, user_id, role_id)
  VALUES (v_org_id, v_admin_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- 5. Seed Entitlements: ONLY 'projects' (Explicit, no implicit enabling)
  -- Remove any non-projects entitlements to guarantee standalone isolation
  DELETE FROM entitlements
  WHERE organization_id = v_org_id AND app_slug <> 'projects';

  INSERT INTO entitlements (organization_id, app_slug, enabled, settings)
  VALUES (v_org_id, 'projects', true, '{}'::jsonb)
  ON CONFLICT (organization_id, app_slug) DO UPDATE
    SET enabled = true,
        settings = '{}'::jsonb;

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Org A (Standalone Projects) seeded successfully!';
  RAISE NOTICE 'Organization ID : %', v_org_id;
  RAISE NOTICE 'Admin User ID   : %', v_admin_user_id;
  RAISE NOTICE 'Login Email     : admin@orga.com';
  RAISE NOTICE 'Login Password  : Password123!';
  RAISE NOTICE 'Entitlements    : [''projects''] only';
  RAISE NOTICE '=======================================================';
END $$;
