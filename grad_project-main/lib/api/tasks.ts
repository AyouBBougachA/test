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

  update: (taskId: number, data: any) =>
    requestJson<TaskResponse>(`/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStatus: (taskId: number, status: string) =>
    requestJson<TaskResponse>(withQuery(`/tasks/${taskId}/status`, { status }), {
      method: 'PATCH',
    }),

  complete: (taskId: number) =>
    requestJson<TaskResponse>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
    }),

  approve: (taskId: number, status: 'APPROVED' | 'REJECTED') =>
    requestJson<TaskResponse>(withQuery(`/tasks/${taskId}/approval`, { status }), {
      method: 'PATCH',
    }),

  delete: (taskId: number) =>
    requestJson<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  toggleSubTask: (subTaskId: number, completed: boolean) =>
    requestJson<void>(withQuery(`/tasks/sub-tasks/${subTaskId}`, { completed }), {
      method: 'PATCH',
    }),
}
