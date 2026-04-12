import api from './axios';
import { User, Role, Department } from '../types';

export const userApi = {
  getAll: () => api.get<User[]>('/users').then(res => res.data),
  getById: (id: number) => api.get<User>(`/users/${id}`).then(res => res.data),
  create: (data: any) => api.post<User>('/users', data).then(res => res.data),
  update: (id: number, data: any) => api.put<User>(`/users/${id}`, data).then(res => res.data),
  updateStatus: (id: number, isActive: boolean) => api.patch<User>(`/users/${id}/status`, { isActive }).then(res => res.data),
  delete: (id: number) => api.delete(`/users/${id}`).then(res => res.data),
};

export const roleApi = {
  getAll: () => api.get<Role[]>('/roles').then(res => res.data),
  create: (data: { roleName: string }) => api.post<Role>('/roles', data).then(res => res.data),
  delete: (id: number) => api.delete(`/roles/${id}`).then(res => res.data),
};

export const departmentApi = {
  getAll: () => api.get<Department[]>('/departments').then(res => res.data),
  create: (data: { departmentName: string }) => api.post<Department>('/departments', data).then(res => res.data),
  delete: (id: number) => api.delete(`/departments/${id}`).then(res => res.data),
};

export * from './authApi';
export * from './auditLogApi';
