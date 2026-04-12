import api from './axios';
import { LoginResponse, User } from '../types';

export const authApi = {
  login: (data: any) => api.post<LoginResponse>('/auth/login', data).then(res => res.data),
  getMe: () => api.get<User>('/auth/me').then(res => res.data),
};
