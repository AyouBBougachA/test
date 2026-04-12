import { requestBlob, requestJson, withQuery } from './client'
import type {
  ClaimListItemResponse,
  ClaimPhotoResponse,
  ClaimResponse,
  ClaimStatsResponse,
  CreateClaimRequest,
  UpdateClaimRequest,
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

  getStats: () => requestJson<ClaimStatsResponse>('/claims/stats'),

  create: (data: CreateClaimRequest) =>
    requestJson<ClaimResponse>('/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateClaimRequest) =>
    requestJson<ClaimResponse>(`/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  uploadPhoto: async (claimId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return requestJson<ClaimPhotoResponse>(`/claims/${claimId}/photos`, {
      method: 'POST',
      body: formData,
    })
  },

  listPhotos: (claimId: number) => requestJson<ClaimPhotoResponse[]>(`/claims/${claimId}/photos`),

  deletePhoto: (claimId: number, photoId: number) =>
    requestJson<void>(`/claims/${claimId}/photos/${photoId}`, {
      method: 'DELETE',
    }),

  getPhotoBlob: (claimId: number, photoId: number) =>
    requestBlob(`/claims/${claimId}/photos/${photoId}/file`),
}
