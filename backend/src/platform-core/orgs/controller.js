const orgService = require('./service');

const getCurrent = async (req, res, next) => {
  try {
    const org = await orgService.getOrganizationById(req.user.organizationId);
    return res.status(200).json(org);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateCurrent = async (req, res, next) => {
  try {
    const org = await orgService.updateOrganization(req.user.organizationId, req.body);
    return res.status(200).json(org);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getCurrent,
  updateCurrent,
};
