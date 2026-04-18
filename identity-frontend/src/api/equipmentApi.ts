import axios from 'axios';
import {
  Equipment,
  EquipmentCategory,
  EquipmentHistory,
  EquipmentModel,
  Meter
} from '../types';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const equipmentApi = {
  // Equipment
  getAll: async (): Promise<Equipment[]> => {
    const response = await api.get('/equipment');
    return response.data;
  },
  search: async (
    departmentId?: number,
    status?: string,
    q?: string,
    classification?: string,
    criticality?: string
  ): Promise<Equipment[]> => {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId.toString());
    if (status) params.append('status', status);
    if (q) params.append('q', q);
    if (classification) params.append('classification', classification);
    if (criticality) params.append('criticality', criticality);
    const response = await api.get(`/equipment/search?${params.toString()}`);
    return response.data;
  },
  getById: async (id: number): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
  create: async (data: Partial<Equipment>): Promise<Equipment> => {
    const response = await api.post('/equipment', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await api.put(`/equipment/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, status: string): Promise<Equipment> => {
    const response = await api.patch(`/equipment/${id}/status`, null, { params: { status } });
    return response.data;
  },
  archive: async (id: number): Promise<Equipment> => {
    const response = await api.patch(`/equipment/${id}/archive`);
    return response.data;
  },
  getKpis: async (): Promise<any> => {
    const response = await api.get('/equipment/kpis');
    return response.data;
  },

  // History
  getHistory: async (id: number): Promise<EquipmentHistory[]> => {
    const response = await api.get(`/equipment/${id}/history`);
    return response.data;
  },

  // Documents
  uploadDocument: async (equipmentId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/equipment/${equipmentId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getDocuments: async (equipmentId: number): Promise<any[]> => {
    const response = await api.get(`/equipment/${equipmentId}/documents`);
    return response.data;
  },
  downloadDocument: async (documentId: number): Promise<Blob> => {
    const response = await api.get(`/equipment/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Meters
  getMeters: async (): Promise<Meter[]> => {
    const response = await api.get('/meters');
    return response.data;
  },
  recordMeterLog: async (meterId: number, operation: 'ADD' | 'SUBTRACT', amount: number): Promise<any> => {
    const response = await api.post(`/meters/${meterId}/logs`, { operation, amount });
    return response.data;
  },
  getMeterLogs: async (meterId: number): Promise<any[]> => {
    const response = await api.get(`/meters/${meterId}/logs`);
    return response.data;
  },
  // Categories
  getCategories: async (): Promise<EquipmentCategory[]> => {
    const response = await api.get('/equipment-categories');
    return response.data;
  },
  createCategory: async (name: string): Promise<EquipmentCategory> => {
    const response = await api.post('/equipment-categories', { name });
    return response.data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/equipment-categories/${id}`);
  },

  // Models
  getModels: async (): Promise<EquipmentModel[]> => {
    const response = await api.get('/equipment-models');
    return response.data;
  },
  createModel: async (name: string): Promise<EquipmentModel> => {
    const response = await api.post('/equipment-models', { name });
    return response.data;
  },
  deleteModel: async (id: number): Promise<void> => {
    await api.delete(`/equipment-models/${id}`);
  },
};
