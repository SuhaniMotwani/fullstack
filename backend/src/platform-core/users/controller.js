const userService = require('./service');

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.user.organizationId);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.organizationId, req.params.id);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.user.organizationId, req.body);
    return res.status(201).json(user);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
