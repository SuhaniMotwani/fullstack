-- ==============================================================================
-- Seed: Org B (Multi-App Suite)
-- Description: Multi-app organization with one admin user, full entitlements
--              ('crm', 'projects', 'tasks', 'accounts'), one contact, and
--              one CRM lead ready to be marked won.
-- Usage: Paste directly into the Supabase SQL Editor.
-- Credentials: admin@orgb.com / Password123!
-- ==============================================================================

DO $$
DECLARE
  v_org_id UUID := 'b0000000-0000-0000-0000-000000000001';
  v_admin_user_id UUID := 'b0000000-0000-0000-0000-000000000002';
  v_contact_id UUID := 'b0000000-0000-0000-0000-000000000003';
  v_lead_id UUID := 'b0000000-0000-0000-0000-000000000004';
  v_admin_role_id UUID;
  -- bcrypt hash for 'Password123!' with 10 salt rounds
  v_password_hash TEXT := '$2b$10$rTmNmMFK132tobsLDL56Sul9ASYKs8MdVDFcKIHJN.FhOjOFD7TCy';
BEGIN
  -- 1. Create Organization B
  INSERT INTO organizations (id, name, slug)
  VALUES (v_org_id, 'Org B (Multi-App Suite)', 'org-b-multiapp')
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name
  RETURNING id INTO v_org_id;

  -- 2. Seed Standard Roles for Org B
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

  -- 3. Create Admin User for Org B
  INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, role)
  VALUES (
    v_admin_user_id,
    v_org_id,
    'admin@orgb.com',
    v_password_hash,
    'Bob',
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

  -- 5. Seed Entitlements: ALL 4 APPS ('crm', 'projects', 'tasks', 'accounts')
  INSERT INTO entitlements (organization_id, app_slug, enabled, settings)
  VALUES
    (v_org_id, 'crm', true, '{}'::jsonb),
    (v_org_id, 'projects', true, '{}'::jsonb),
    (v_org_id, 'tasks', true, '{}'::jsonb),
    (v_org_id, 'accounts', true, '{}'::jsonb)
  ON CONFLICT (organization_id, app_slug) DO UPDATE
    SET enabled = EXCLUDED.enabled,
        settings = EXCLUDED.settings;

  -- 6. Seed 1 Contact for Org B
  INSERT INTO contacts (
    id, organization_id, first_name, last_name, email,
    phone, company, job_title, address, metadata
  )
  VALUES (
    v_contact_id,
    v_org_id,
    'Sarah',
    'Connor',
    'sarah.connor@cyberdyne.io',
    '+1-555-0199',
    'Cyberdyne Systems',
    'Chief Technology Officer',
    '{"street": "18144 El Camino Real", "city": "Sunnyvale", "state": "CA", "zip": "94086", "country": "USA"}'::jsonb,
    '{"lead_source": "Enterprise Referral", "vip": true}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        job_title = EXCLUDED.job_title,
        address = EXCLUDED.address,
        metadata = EXCLUDED.metadata,
        deleted_at = NULL;

  -- 7. Seed 1 CRM Lead for Org B (ready to be marked won)
  INSERT INTO crm_leads (
    id, organization_id, contact_id, assigned_to,
    title, stage, status, source, deal_value, estimated_value, currency, notes, metadata
  )
  VALUES (
    v_lead_id,
    v_org_id,
    v_contact_id,
    v_admin_user_id,
    'Enterprise Cloud Platform Modernization',
    'proposal',
    'active',
    'Referral',
    45000.00,
    45000.00,
    'USD',
    'High-intent enterprise lead with qualified budget. Ready to mark won to trigger cross-app automation.',
    '{"priority": "high", "expected_close": "2026-09-30"}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE
    SET contact_id = EXCLUDED.contact_id,
        assigned_to = EXCLUDED.assigned_to,
        title = EXCLUDED.title,
        stage = EXCLUDED.stage,
        status = EXCLUDED.status,
        source = EXCLUDED.source,
        deal_value = EXCLUDED.deal_value,
        estimated_value = EXCLUDED.estimated_value,
        notes = EXCLUDED.notes,
        metadata = EXCLUDED.metadata;

  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Org B (Multi-App Suite) seeded successfully!';
  RAISE NOTICE 'Organization ID : %', v_org_id;
  RAISE NOTICE 'Admin User ID   : %', v_admin_user_id;
  RAISE NOTICE 'Login Email     : admin@orgb.com';
  RAISE NOTICE 'Login Password  : Password123!';
  RAISE NOTICE 'Contact ID      : % (Sarah Connor / Cyberdyne Systems)', v_contact_id;
  RAISE NOTICE 'CRM Lead ID     : % (Ready to be marked won)', v_lead_id;
  RAISE NOTICE 'Entitlements    : [''crm'', ''projects'', ''tasks'', ''accounts'']';
  RAISE NOTICE '=======================================================';
END $$;
