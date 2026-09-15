-- Migration 007: Projects App
-- Description: Projects table with tenant isolation and contact foreign key

CREATE TABLE IF NOT EXISTS proj_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  start_date DATE,
  due_date DATE,
  budget NUMERIC(12, 2) DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential index for multi-tenant isolation (WHERE organization_id = $1)
CREATE INDEX IF NOT EXISTS idx_proj_projects_org_id ON proj_projects (organization_id);
CREATE INDEX IF NOT EXISTS idx_proj_projects_contact_id ON proj_projects (contact_id);
CREATE INDEX IF NOT EXISTS idx_proj_projects_owner_id ON proj_projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_proj_projects_status ON proj_projects (organization_id, status);

-- Updatable view for non-prefixed access
CREATE OR REPLACE VIEW projects AS SELECT * FROM proj_projects;

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_proj_projects_updated_at ON proj_projects;
CREATE TRIGGER set_proj_projects_updated_at
BEFORE UPDATE ON proj_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
