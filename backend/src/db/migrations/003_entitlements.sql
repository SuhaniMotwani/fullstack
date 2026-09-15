-- Migration 003: Entitlements
-- Description: App entitlements per organization (enforces which apps an org can access)

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_entitlements_org_app UNIQUE (organization_id, app_slug)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_org_id ON entitlements (organization_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_app_slug ON entitlements (app_slug);

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_entitlements_updated_at ON entitlements;
CREATE TRIGGER set_entitlements_updated_at
BEFORE UPDATE ON entitlements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
