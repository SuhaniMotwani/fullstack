---
description: Enforce multi-tenant data isolation on every database query
---
Every SQL query touching an app table or contacts table MUST include a
WHERE organization_id = $1 clause bound to the authenticated user's org from
the JWT. Never trust an organization_id passed in the request body.