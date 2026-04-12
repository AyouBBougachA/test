import { requestJson, withQuery } from './client'
import type { AuditLog } from './types'

export const auditLogsApi = {
  getRecent: (limit: number = 10) => requestJson<AuditLog[]>(withQuery('/audit-logs', { limit })),
  getSecurity: (limit: number = 10) => requestJson<AuditLog[]>(withQuery('/audit-logs/security', { limit })),
}
