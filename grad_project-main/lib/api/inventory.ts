import { requestJson, withQuery } from './client'
import type {
  SparePartResponse,
  CreateSparePartRequest,
} from './types'

export const inventoryApi = {
  list: (params?: {
    category?: string
    q?: string
    lowStockOnly?: boolean
  }) =>
    requestJson<SparePartResponse[]>(withQuery('/inventory', params)),

  create: (data: CreateSparePartRequest) =>
    requestJson<SparePartResponse>('/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateStock: (id: number, quantity: number) =>
    requestJson<SparePartResponse>(`/inventory/${id}/stock?quantity=${quantity}`, {
      method: 'PATCH',
    }),
}
