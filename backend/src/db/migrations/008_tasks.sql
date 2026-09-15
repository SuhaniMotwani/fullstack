-- Migration 008: Tasks App
-- Description: Tasks table with tenant isolation, project reference, and contact foreign key

CREATE TABLE IF NOT EXISTS task_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES proj_projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Essential index for multi-tenant isolation (WHERE organization_id = $1)
CREATE INDEX IF NOT EXISTS idx_task_tasks_org_id ON task_tasks (organization_id);
CREATE INDEX IF NOT EXISTS idx_task_tasks_project_id ON task_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_task_tasks_contact_id ON task_tasks (contact_id);
CREATE INDEX IF NOT EXISTS idx_task_tasks_assignee_id ON task_tasks (assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_tasks_status ON task_tasks (organization_id, status);

-- Updatable view for non-prefixed access
CREATE OR REPLACE VIEW tasks AS SELECT * FROM task_tasks;

-- Auto-update trigger
DROP TRIGGER IF EXISTS set_task_tasks_updated_at ON task_tasks;
CREATE TRIGGER set_task_tasks_updated_at
BEFORE UPDATE ON task_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
