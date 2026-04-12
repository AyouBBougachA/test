import { requestJson } from './client'
import type { PredictionResponse } from './types'

export const aiApi = {
  getPredictions: () => requestJson<PredictionResponse[]>('/ai/predictions'),
}
