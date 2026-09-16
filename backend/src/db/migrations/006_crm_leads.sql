-- Migration 006: CRM Leads
-- Description: CRM app leads table with tenant isolation, contact foreign key, stage, source, and deal_value

CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead',
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  deal_value NUMERIC(12, 2) DEFAULT 0.00,
  estimated_value NUMERIC(12, 2) DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential indexes for multi-tenant isolation and queries
CREATE INDEX IF NOT EXISTS idx_crm_leads_org_id ON crm_leads (organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_contact_id ON crm_leads (contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON crm_leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads (organization_id, stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads (organization_id, status);

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER set_crm_leads_updated_at
BEFORE UPDATE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
