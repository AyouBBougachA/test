import { requestJson, withQuery } from './client'
import type {
  WorkOrderResponse,
  CreateWorkOrderRequest,
  TaskResponse,
} from './types'

export const workOrdersApi = {
  list: (params?: {
    status?: string
    type?: string
    equipmentId?: number
    assignedToUserId?: number
  }) =>
    requestJson<WorkOrderResponse[]>(withQuery('/work-orders', params)),

  getById: (id: number) => requestJson<WorkOrderResponse>(`/work-orders/${id}`),

  create: (data: CreateWorkOrderRequest) =>
    requestJson<WorkOrderResponse>('/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  getTasks: (woId: number) => requestJson<TaskResponse[]>(`/tasks/work-order/${woId}`),

  completeTask: (taskId: number) =>
    requestJson<TaskResponse>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
    }),
}
