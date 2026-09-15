# ArchScale — Project Identity

## What this project is
A modular multi-app SaaS ecosystem demo (CRM, Projects, Tasks, Accounts) sharing one
platform core (auth, orgs, RBAC, entitlements, contacts, events).

## Tech Stack
- Frontend: React 18 + Vite, deployed to Vercel as a static build
- Backend: Node.js + Express, deployed to Vercel as a single serverless function
  (api/index.js wraps the app; no persistent server process)
- Database: Supabase Postgres, accessed via the transaction pooler connection
  string (DATABASE_URL), raw SQL via `pg` — no ORM
- File storage: Supabase Storage (bucket "documents"), not local disk
- Events: outbox-table pattern, but dispatched synchronously in-process
  (no background worker — Vercel functions don't persist between requests)
- Auth: JWT issued by platform-core/auth, verified by shared middleware

## Structure
- /backend/src/platform-core/*  → shared services, never app-specific logic
- /backend/src/apps/*           → one folder per app, own routes/controller/service/model
- /backend/src/gateway/router.js → single mount point, applies auth + entitlement middleware
- /frontend/src/apps/*          → mirrors backend app folders

## Hard rules
- App modules NEVER import another app's service or model file directly.
- Cross-app communication only via platform-core/events/eventBus.js.
- Every app table is prefixed (crm_, proj_, task_, acct_) and carries organization_id.
- Every query must filter by organization_id — no exceptions.