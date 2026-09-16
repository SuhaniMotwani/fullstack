const contactModel = require('./model');

const listContacts = async (organizationId, filters) => {
  return await contactModel.list(organizationId, filters);
};

const getContactById = async (organizationId, id, includeDeleted = false) => {
  const contact = await contactModel.getById(organizationId, id, includeDeleted);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }
  return contact;
};

const createContact = async (organizationId, data) => {
  if (!data.firstName || !data.firstName.trim()) {
    const error = new Error('First name is required');
    error.statusCode = 400;
    throw error;
  }
  return await contactModel.create(organizationId, data);
};

const updateContact = async (organizationId, id, data) => {
  const updated = await contactModel.update(organizationId, id, data);
  if (!updated) {
    const error = new Error('Contact not found or already deleted');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const deleteContact = async (organizationId, id) => {
  const deleted = await contactModel.softDelete(organizationId, id);
  if (!deleted) {
    const error = new Error('Contact not found or already deleted');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Contact soft-deleted successfully', id: deleted.id, deletedAt: deleted.deleted_at };
};

module.exports = {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
