const authService = require('./service');

const register = async (req, res, next) => {
  try {
    const { orgName, email, password, firstName, lastName, appCodes } = req.body;
    const result = await authService.register({ orgName, email, password, firstName, lastName, appCodes });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id, req.user.organizationId);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
