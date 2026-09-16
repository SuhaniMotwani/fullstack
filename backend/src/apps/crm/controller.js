const crmService = require('./service');

const getLeads = async (req, res, next) => {
  try {
    const { stage, contactId, limit, offset } = req.query;
    const leads = await crmService.listLeads(req.user.organizationId, {
      stage,
      contactId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(leads);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getLead = async (req, res, next) => {
  try {
    const lead = await crmService.getLeadById(req.user.organizationId, req.params.id);
    return res.status(200).json(lead);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await crmService.createLead(req.user.organizationId, req.body);
    return res.status(201).json(lead);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await crmService.updateLead(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(lead);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const result = await crmService.deleteLead(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const markWon = async (req, res, next) => {
  try {
    const lead = await crmService.markLeadWon(req.user.organizationId, req.params.id);
    return res.status(200).json(lead);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  markWon,
};
