import api from './axios';
import { AuditLog } from '../types';

export const auditLogApi = {
  getRecentLogs: (limit: number = 10) => 
    api.get<AuditLog[]>(`/audit-logs?limit=${limit}`).then(res => res.data),
    
  getSecurityLogs: (limit: number = 10) => 
    api.get<AuditLog[]>(`/audit-logs/security?limit=${limit}`).then(res => res.data),
};
