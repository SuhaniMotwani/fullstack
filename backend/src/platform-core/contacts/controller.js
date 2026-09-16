const contactService = require('./service');

const getContacts = async (req, res, next) => {
  try {
    const { search, limit, offset, includeDeleted } = req.query;
    const contacts = await contactService.listContacts(req.user.organizationId, {
      search,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      includeDeleted: includeDeleted === 'true',
    });
    return res.status(200).json(contacts);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getContact = async (req, res, next) => {
  try {
    const { includeDeleted } = req.query;
    const contact = await contactService.getContactById(
      req.user.organizationId,
      req.params.id,
      includeDeleted === 'true'
    );
    return res.status(200).json(contact);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContact(req.user.organizationId, req.body);
    return res.status(201).json(contact);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateContact = async (req, res, next) => {
  try {
    const contact = await contactService.updateContact(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(contact);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const result = await contactService.deleteContact(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
