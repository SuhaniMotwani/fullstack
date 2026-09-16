const tasksService = require('./service');

const getTasks = async (req, res, next) => {
  try {
    const { projectId, contactId, status, priority, limit, offset } = req.query;
    const tasks = await tasksService.listTasks(req.user.organizationId, {
      projectId,
      contactId,
      status,
      priority,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await tasksService.getTaskById(req.user.organizationId, req.params.id);
    return res.status(200).json(task);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.user.organizationId, req.body);
    return res.status(201).json(task);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(task);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await tasksService.deleteTask(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const logExpense = async (req, res, next) => {
  try {
    const { amount, description, contactId } = req.body;
    const result = await tasksService.logExpense(req.user.organizationId, req.params.id, {
      amount,
      description,
      contactId,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  logExpense,
};
