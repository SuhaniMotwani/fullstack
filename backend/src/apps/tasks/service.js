const tasksModel = require('./model');
const { publish } = require('../../platform-core/events/eventBus');

const listTasks = async (organizationId, filters) => {
  return await tasksModel.list(organizationId, filters);
};

const getTaskById = async (organizationId, id) => {
  const task = await tasksModel.getById(organizationId, id);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const createTask = async (organizationId, data) => {
  if (!data.title || !data.title.trim()) {
    const error = new Error('Task title is required');
    error.statusCode = 400;
    throw error;
  }
  return await tasksModel.create(organizationId, data);
};

const updateTask = async (organizationId, id, data) => {
  const updated = await tasksModel.update(organizationId, id, data);
  if (!updated) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const deleteTask = async (organizationId, id) => {
  const deleted = await tasksModel.deleteById(organizationId, id);
  if (!deleted) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Task deleted successfully', id };
};

const logExpense = async (organizationId, taskId, { amount, description = '', contactId = null }) => {
  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    const error = new Error('Valid positive expense amount is required');
    error.statusCode = 400;
    throw error;
  }

  const task = await getTaskById(organizationId, taskId);

  // Prepare expense object
  const expenseRecord = {
    id: `exp-${Date.now()}`,
    amount: Number(amount),
    description: description ? description.trim() : '',
    contactId: contactId || task.contact_id || null,
    loggedAt: new Date().toISOString(),
  };

  // Append to task metadata expenses
  const existingMetadata = typeof task.metadata === 'object' && task.metadata !== null ? task.metadata : {};
  const expenses = Array.isArray(existingMetadata.expenses) ? [...existingMetadata.expenses, expenseRecord] : [expenseRecord];
  const updatedMetadata = { ...existingMetadata, expenses };

  // Update task in database
  const updatedTask = await tasksModel.update(organizationId, taskId, {
    metadata: updatedMetadata,
  });

  const effectiveContactId = contactId || task.contact_id || null;

  // Publish cross-app EXPENSE_LOGGED event via eventBus
  await publish('EXPENSE_LOGGED', {
    taskId: task.id,
    projectId: task.project_id,
    contactId: effectiveContactId,
    amount: Number(amount),
    description: description ? description.trim() : '',
    organizationId,
  }, organizationId);

  return {
    success: true,
    task: updatedTask,
    expense: expenseRecord,
  };
};

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  logExpense,
};
