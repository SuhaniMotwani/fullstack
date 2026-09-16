// frontend/src/apps/projects/api.js
import apiClient from '../../core/api/apiClient';

export const listProjects = async (params = {}) => {
  const res = await apiClient.get('/apps/projects/projects', { params });
  return res.data;
};

export const getProject = async (id) => {
  const res = await apiClient.get(`/apps/projects/projects/${id}`);
  return res.data;
};

export const createProject = async (data) => {
  const res = await apiClient.post('/apps/projects/projects', data);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await apiClient.put(`/apps/projects/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await apiClient.delete(`/apps/projects/projects/${id}`);
  return res.data;
};

export default {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
