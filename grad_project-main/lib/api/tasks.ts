import { requestJson, withQuery } from './client'
import type { TaskResponse } from './types'

export const tasksApi = {
  getAll: (params?: { status?: string; woId?: number }) =>
    requestJson<TaskResponse[]>(withQuery('/tasks', params)),

  getByWorkOrder: (woId: number) =>
    requestJson<TaskResponse[]>(`/tasks/work-order/${woId}`),

  create: (data: Partial<TaskResponse>) =>
    requestJson<TaskResponse>('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  complete: (taskId: number) =>
    requestJson<TaskResponse>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
    }),

  delete: (taskId: number) =>
    requestJson<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),
}
