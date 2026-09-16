const accountsService = require('./service');

const getInvoices = async (req, res, next) => {
  try {
    const { contactId, status, limit, offset } = req.query;
    const invoices = await accountsService.listInvoices(req.user.organizationId, {
      contactId,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(invoices);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await accountsService.getInvoiceById(req.user.organizationId, req.params.id);
    return res.status(200).json(invoice);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    };
    const invoice = await accountsService.createInvoice(req.user.organizationId, invoiceData);
    return res.status(201).json(invoice);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await accountsService.updateInvoice(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(invoice);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const result = await accountsService.deleteInvoice(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
