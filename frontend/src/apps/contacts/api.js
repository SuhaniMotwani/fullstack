// frontend/src/apps/contacts/api.js
import apiClient from '../../core/api/apiClient';

export const listContacts = async (params = {}) => {
  const res = await apiClient.get('/contacts', { params });
  return res.data;
};

export const getContact = async (id) => {
  const res = await apiClient.get(`/contacts/${id}`);
  return res.data;
};

export const createContact = async (data) => {
  const res = await apiClient.post('/contacts', data);
  return res.data;
};

export const updateContact = async (id, data) => {
  const res = await apiClient.put(`/contacts/${id}`, data);
  return res.data;
};

export const deleteContact = async (id) => {
  const res = await apiClient.delete(`/contacts/${id}`);
  return res.data;
};

export default {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
};
