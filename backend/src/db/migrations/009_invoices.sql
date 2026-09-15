-- Migration 009: Invoices (Accounts App)
-- Description: Invoices table with tenant isolation, contact foreign key, and line items

CREATE TABLE IF NOT EXISTS acct_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_acct_invoices_org_number UNIQUE (organization_id, invoice_number)
);

-- Essential index for multi-tenant isolation (WHERE organization_id = $1)
CREATE INDEX IF NOT EXISTS idx_acct_invoices_org_id ON acct_invoices (organization_id);
CREATE INDEX IF NOT EXISTS idx_acct_invoices_contact_id ON acct_invoices (contact_id);
CREATE INDEX IF NOT EXISTS idx_acct_invoices_created_by ON acct_invoices (created_by);
CREATE INDEX IF NOT EXISTS idx_acct_invoices_status ON acct_invoices (organization_id, status);

-- Updatable view for non-prefixed access
CREATE OR REPLACE VIEW invoices AS SELECT * FROM acct_invoices;

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_acct_invoices_updated_at ON acct_invoices;
CREATE TRIGGER set_acct_invoices_updated_at
BEFORE UPDATE ON acct_invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
