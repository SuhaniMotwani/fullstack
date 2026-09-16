// frontend/src/apps/tasks/api.js
import apiClient from '../../core/api/apiClient';

export const listTasks = async (params = {}) => {
  const res = await apiClient.get('/apps/tasks/tasks', { params });
  return res.data;
};

export const getTask = async (id) => {
  const res = await apiClient.get(`/apps/tasks/tasks/${id}`);
  return res.data;
};

export const createTask = async (data) => {
  const res = await apiClient.post('/apps/tasks/tasks', data);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await apiClient.put(`/apps/tasks/tasks/${id}`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await apiClient.delete(`/apps/tasks/tasks/${id}`);
  return res.data;
};

export const logExpense = async (id, { amount, description, contactId }) => {
  const res = await apiClient.post(`/apps/tasks/tasks/${id}/expense`, {
    amount,
    description,
    contactId,
  });
  return res.data;
};

export default {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  logExpense,
};
