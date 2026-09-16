const crmModel = require('./model');
const { publish } = require('../../platform-core/events/eventBus');

const listLeads = async (organizationId, filters) => {
  return await crmModel.list(organizationId, filters);
};

const getLeadById = async (organizationId, id) => {
  const lead = await crmModel.getById(organizationId, id);
  if (!lead) {
    const error = new Error('CRM lead not found');
    error.statusCode = 404;
    throw error;
  }
  return lead;
};

const createLead = async (organizationId, data) => {
  if (!data.title || !data.title.trim()) {
    const error = new Error('Lead title is required');
    error.statusCode = 400;
    throw error;
  }
  return await crmModel.create(organizationId, data);
};

const updateLead = async (organizationId, id, data) => {
  const updated = await crmModel.update(organizationId, id, data);
  if (!updated) {
    const error = new Error('CRM lead not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const deleteLead = async (organizationId, id) => {
  const deleted = await crmModel.deleteById(organizationId, id);
  if (!deleted) {
    const error = new Error('CRM lead not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'CRM lead deleted successfully', id };
};

const markLeadWon = async (organizationId, id) => {
  const lead = await crmModel.getById(organizationId, id);
  if (!lead) {
    const error = new Error('CRM lead not found');
    error.statusCode = 404;
    throw error;
  }

  // Update lead stage to 'won'
  const updatedLead = await crmModel.updateStage(organizationId, id, 'won');

  // Publish OPPORTUNITY_WON event across the ecosystem via platform-core eventBus
  await publish('OPPORTUNITY_WON', {
    leadId: updatedLead.id,
    contactId: updatedLead.contact_id,
    organizationId,
    dealValue: updatedLead.deal_value,
    title: updatedLead.title,
  }, organizationId);

  return updatedLead;
};

module.exports = {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  markLeadWon,
};
