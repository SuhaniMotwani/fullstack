// frontend/src/apps/accounts/api.js
import apiClient from '../../core/api/apiClient';

export const listInvoices = async (params = {}) => {
  const res = await apiClient.get('/apps/accounts/invoices', { params });
  return res.data;
};

export const getInvoice = async (id) => {
  const res = await apiClient.get(`/apps/accounts/invoices/${id}`);
  return res.data;
};

export const createInvoice = async (data) => {
  const res = await apiClient.post('/apps/accounts/invoices', data);
  return res.data;
};

export const updateInvoice = async (id, data) => {
  const res = await apiClient.put(`/apps/accounts/invoices/${id}`, data);
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await apiClient.delete(`/apps/accounts/invoices/${id}`);
  return res.data;
};

export default {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
