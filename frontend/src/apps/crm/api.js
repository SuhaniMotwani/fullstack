// frontend/src/apps/crm/api.js
import apiClient from '../../core/api/apiClient';

export const listLeads = async (params = {}) => {
  const res = await apiClient.get('/apps/crm/leads', { params });
  return res.data;
};

export const getLead = async (id) => {
  const res = await apiClient.get(`/apps/crm/leads/${id}`);
  return res.data;
};

export const createLead = async (data) => {
  const res = await apiClient.post('/apps/crm/leads', data);
  return res.data;
};

export const updateLead = async (id, data) => {
  const res = await apiClient.put(`/apps/crm/leads/${id}`, data);
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await apiClient.delete(`/apps/crm/leads/${id}`);
  return res.data;
};

export const markWon = async (id) => {
  const res = await apiClient.post(`/apps/crm/leads/${id}/won`);
  return res.data;
};

export default {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  markWon,
};
