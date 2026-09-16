const db = require('../../config/database');

// Table: acct_invoices (also accessible via view: invoices)
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const list = async (organizationId, { contactId, status, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId];
  let query = `
    SELECT id, organization_id, contact_id, created_by, invoice_number, status,
           issue_date, due_date, currency, subtotal, tax_amount, total_amount,
           line_items, notes, metadata, created_at, updated_at
    FROM acct_invoices
    WHERE organization_id = $1
  `;

  if (contactId) {
    params.push(contactId);
    query += ` AND contact_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, contact_id, created_by, invoice_number, status,
            issue_date, due_date, currency, subtotal, tax_amount, total_amount,
            line_items, notes, metadata, created_at, updated_at
     FROM acct_invoices
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, {
  contactId = null,
  createdBy = null,
  invoiceNumber,
  status = 'draft',
  issueDate = new Date().toISOString().split('T')[0],
  dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency = 'USD',
  subtotal = 0.00,
  taxAmount = 0.00,
  totalAmount = 0.00,
  lineItems = [],
  notes = null,
  metadata = {},
}) => {
  const generatedInvoiceNumber = invoiceNumber || `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const result = await db.query(
    `INSERT INTO acct_invoices (
       organization_id, contact_id, created_by, invoice_number, status,
       issue_date, due_date, currency, subtotal, tax_amount, total_amount,
       line_items, notes, metadata
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id, organization_id, contact_id, created_by, invoice_number, status,
               issue_date, due_date, currency, subtotal, tax_amount, total_amount,
               line_items, notes, metadata, created_at, updated_at`,
    [
      organizationId,
      contactId,
      createdBy,
      generatedInvoiceNumber,
      status,
      issueDate,
      dueDate,
      currency,
      subtotal,
      taxAmount,
      totalAmount,
      JSON.stringify(lineItems),
      notes,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const update = async (organizationId, id, data) => {
  const {
    contactId,
    createdBy,
    invoiceNumber,
    status,
    issueDate,
    dueDate,
    currency,
    subtotal,
    taxAmount,
    totalAmount,
    lineItems,
    notes,
    metadata,
  } = data;

  const result = await db.query(
    `UPDATE acct_invoices
     SET contact_id = COALESCE($1, contact_id),
         created_by = COALESCE($2, created_by),
         invoice_number = COALESCE($3, invoice_number),
         status = COALESCE($4, status),
         issue_date = COALESCE($5, issue_date),
         due_date = COALESCE($6, due_date),
         currency = COALESCE($7, currency),
         subtotal = COALESCE($8, subtotal),
         tax_amount = COALESCE($9, tax_amount),
         total_amount = COALESCE($10, total_amount),
         line_items = COALESCE($11, line_items),
         notes = COALESCE($12, notes),
         metadata = COALESCE($13, metadata),
         updated_at = NOW()
     WHERE organization_id = $14 AND id = $15
     RETURNING id, organization_id, contact_id, created_by, invoice_number, status,
               issue_date, due_date, currency, subtotal, tax_amount, total_amount,
               line_items, notes, metadata, created_at, updated_at`,
    [
      contactId !== undefined ? contactId : null,
      createdBy !== undefined ? createdBy : null,
      invoiceNumber !== undefined ? invoiceNumber : null,
      status !== undefined ? status : null,
      issueDate !== undefined ? issueDate : null,
      dueDate !== undefined ? dueDate : null,
      currency !== undefined ? currency : null,
      subtotal !== undefined ? subtotal : null,
      taxAmount !== undefined ? taxAmount : null,
      totalAmount !== undefined ? totalAmount : null,
      lineItems !== undefined ? JSON.stringify(lineItems) : null,
      notes !== undefined ? notes : null,
      metadata !== undefined ? JSON.stringify(metadata) : null,
      organizationId,
      id,
    ]
  );
  return result.rows[0] || null;
};

const deleteById = async (organizationId, id) => {
  const result = await db.query(
    `DELETE FROM acct_invoices
     WHERE organization_id = $1 AND id = $2
     RETURNING id`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  list,
  getById,
  create,
  update,
  deleteById,
};
