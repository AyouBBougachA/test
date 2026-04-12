import { requestJson, withQuery } from './client'
import type {
  ClaimListItemResponse,
  ClaimResponse,
  CreateClaimRequest,
} from './types'

export const claimsApi = {
  list: (params?: {
    status?: string
    priority?: string
    departmentId?: number
    equipmentId?: number
    assignedToUserId?: number
    q?: string
  }) =>
    requestJson<
      | ClaimListItemResponse[]
      | {
          value: ClaimListItemResponse[]
        }
    >(withQuery('/claims', params)).then((data) => {
      if (Array.isArray(data)) return data
      return Array.isArray(data.value) ? data.value : []
    }),

  getById: (id: number) => requestJson<ClaimResponse>(`/claims/${id}`),

  create: (data: CreateClaimRequest) =>
    requestJson<ClaimResponse>('/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}
