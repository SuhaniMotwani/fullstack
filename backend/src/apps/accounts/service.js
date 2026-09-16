const accountsModel = require('./model');

const listInvoices = async (organizationId, filters) => {
  return await accountsModel.list(organizationId, filters);
};

const getInvoiceById = async (organizationId, id) => {
  const invoice = await accountsModel.getById(organizationId, id);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }
  return invoice;
};

const createInvoice = async (organizationId, data) => {
  const subtotal = data.subtotal !== undefined ? Number(data.subtotal) : (data.amount !== undefined ? Number(data.amount) : 0.00);
  const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : 0.00;
  const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : (subtotal + taxAmount);

  const invoiceData = {
    ...data,
    subtotal,
    taxAmount,
    totalAmount,
    status: data.status || 'draft',
  };

  return await accountsModel.create(organizationId, invoiceData);
};

const updateInvoice = async (organizationId, id, data) => {
  const updateData = { ...data };

  if (data.subtotal !== undefined) {
    updateData.subtotal = Number(data.subtotal);
  }
  if (data.taxAmount !== undefined) {
    updateData.taxAmount = Number(data.taxAmount);
  }
  if (data.totalAmount !== undefined) {
    updateData.totalAmount = Number(data.totalAmount);
  }

  const updated = await accountsModel.update(organizationId, id, updateData);
  if (!updated) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const deleteInvoice = async (organizationId, id) => {
  const deleted = await accountsModel.deleteById(organizationId, id);
  if (!deleted) {
    const error = new Error('Invoice not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Invoice deleted successfully', id };
};

const createDraftFromExpense = async (organizationId, {
  contactId = null,
  amount = 0.00,
  description = '',
  taskId = null,
  projectId = null,
  createdBy = null,
}) => {
  const numericAmount = Number(amount) || 0.00;
  const itemDescription = description ? description.trim() : 'Logged expense';

  const lineItems = [
    {
      description: itemDescription,
      amount: numericAmount,
      taskId: taskId || null,
      projectId: projectId || null,
    },
  ];

  const metadata = {
    originEvent: 'EXPENSE_LOGGED',
    taskId: taskId || null,
    projectId: projectId || null,
    loggedAmount: numericAmount,
  };

  const invoice = await createInvoice(organizationId, {
    contactId: contactId || null,
    createdBy: createdBy || null,
    status: 'draft',
    subtotal: numericAmount,
    taxAmount: 0.00,
    totalAmount: numericAmount,
    lineItems,
    notes: description ? `Auto-generated from expense: ${description}` : 'Auto-generated invoice from logged expense',
    metadata,
  });

  return invoice;
};

module.exports = {
  listInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  createDraftFromExpense,
};
