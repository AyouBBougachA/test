export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

export interface UserResponse {
  userId: number
  fullName: string
  email: string
  phoneNumber?: string | null
  roleName: string | null
  roleId: number | null
  departmentName: string | null
  departmentId: number | null
  isActive: boolean
  createdAt: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
  phoneNumber?: string | null
  password: string
  roleId: number
  departmentId?: number | null
  isActive?: boolean
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  phoneNumber?: string | null
  password?: string
  roleId?: number
  departmentId?: number | null
}

export interface UserStatusRequest {
  isActive: boolean
}

export interface RoleResponse {
  roleId: number
  roleName: string
}

export interface CreateRoleRequest {
  roleName: string
}

export interface DepartmentResponse {
  departmentId: number
  departmentName: string
}

export interface CreateDepartmentRequest {
  departmentName: string
}

export interface AuditLog {
  id: number
  userId: number | null
  actionType: string
  entityName: string | null
  entityId: number | null
  details: string
  createdAt: string
}

export type EquipmentCriticality = 'LOW' | 'MEDIUM' | 'CRITICAL'
export type EquipmentStatus = 'OPERATIONAL' | 'UNDER_REPAIR' | 'ARCHIVED'

export interface EquipmentResponse {
  equipmentId: number
  name: string
  serialNumber: string
  status: string
  location: string
  departmentId: number
  categoryId?: number | null
  modelId?: number | null
  manufacturer?: string | null
  modelReference?: string | null
  classification?: string | null
  criticality?: string | null
  meterUnit?: string | null
  startMeterValue?: number | null
  thresholds?: Array<number>
  purchaseDate?: string | null
  commissioningDate?: string | null
  supplierName?: string | null
  contractNumber?: string | null
  warrantyEndDate?: string | null
  createdAt: string
}

export interface EquipmentRequest {
  name: string
  serialNumber: string
  status: string
  location: string
  departmentId: number
  categoryId?: number | null
  modelId?: number | null
  manufacturer?: string | null
  modelReference?: string | null
  classification?: string | null
  criticality?: string | null
  meterUnit?: string | null
  startMeterValue?: number | null
  thresholds?: Array<number>
  purchaseDate?: string | null
  commissioningDate?: string | null
  supplierName?: string | null
  contractNumber?: string | null
  warrantyEndDate?: string | null
}

export interface EquipmentHistory {
  id: number
  equipmentId: number
  action: string
  performedBy: string
  createdAt: string
}

export interface MeterResponse {
  meterId: number
  equipmentId: number
  equipmentName?: string | null
  name: string
  value: number
  unit: string
  meterType: string
  lastReadingAt?: string | null
  thresholds?: Array<number>
}

export type MeterOperation = 'ADD' | 'SUBTRACT'

export interface MeterLogRequest {
  operation: MeterOperation
  amount: number
}

export interface MeterLogResponse {
  logId: number
  meterId: number
  value: number
  operation: MeterOperation
  resultingValue: number
  recordedAt: string
  alert?: string | null
}

export interface MeterLog {
  logId: number
  meterId: number
  operation: MeterOperation
  value: number
  resultingValue: number
  recordedAt: string
}

export interface MeterThreshold {
  thresholdId: number
  meterId: number
  thresholdValue: number
  createdAt: string
}

export interface EquipmentCategory {
  categoryId: number
  name: string
  createdAt?: string
}

export interface EquipmentModel {
  modelId: number
  name: string
  createdAt?: string
}

export interface EquipmentDocument {
  id: number
  equipmentId: number
  documentName: string
  filePath: string
  contentType?: string | null
  fileSize?: number | null
  uploadedAt?: string | null
  uploadedBy?: string | null
}

export type ClaimPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type ClaimStatus =
  | 'OPEN'
  | 'QUALIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'CLOSED'

export interface ClaimListItemResponse {
  claimId: number
  claimCode: string
  title: string
  description: string

  equipmentId: number
  equipmentName?: string | null

  priority: ClaimPriority | string
  priorityLabel?: string | null

  status: ClaimStatus | string
  statusLabel?: string | null

  requesterId?: number | null
  requesterName?: string | null

  assignedToUserId?: number | null
  assignedToName?: string | null

  departmentId?: number | null
  departmentName?: string | null

  createdAt: string
  updatedAt?: string | null
  closedAt?: string | null

  photoCount?: number | null
}

export interface ClaimPhotoResponse {
  photoId: number
  claimId: number
  originalName?: string | null
  filePath?: string | null
  contentType?: string | null
  fileSize?: number | null
  uploadedAt?: string | null
  uploadedBy?: string | null
  photoUrl?: string | null
}

export interface ClaimResponse extends ClaimListItemResponse {
  qualificationNotes?: string | null
  photos?: ClaimPhotoResponse[]
}

export interface ClaimStatsResponse {
  total: number
  pending: number
  inProgress: number
  closed: number
}

export interface CreateClaimRequest {
  title: string
  equipmentId: number
  departmentId?: number | null
  priority: ClaimPriority | string
  description: string
}

export interface UpdateClaimRequest {
  title: string
  priority: ClaimPriority | string
  description: string
  departmentId?: number | null
}
