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
  /** All assigned roles for the user */
  roles: { roleId: number; roleName: string }[]
  /** @deprecated Use roles[0] instead. Kept for backwards compat. */
  roleName?: string | null
  /** @deprecated Use roles[0] instead. Kept for backwards compat. */
  roleId?: number | null
  departmentName: string | null
  departmentId: number | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
  phoneNumber?: string | null
  password: string
  roleIds: number[]
  departmentId?: number | null
  isActive?: boolean
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  phoneNumber?: string | null
  password?: string
  roleIds?: number[]
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
  ipAddress?: string
  accountName?: string
  createdAt: string
}

export type EquipmentCriticality = 'LOW' | 'MEDIUM' | 'CRITICAL'
export type EquipmentStatus = 'OPERATIONAL' | 'UNDER_REPAIR' | 'ARCHIVED'

export interface EquipmentResponse {
  equipmentId: number
  assetCode: string
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
  thresholds?: EquipmentThresholdDto[]
  purchaseDate?: string | null
  commissioningDate?: string | null
  supplierName?: string | null
  contractNumber?: string | null
  warrantyEndDate?: string | null
  lastMaintenanceDate?: string | null
  dueForMaintenance?: boolean
  createdAt: string
}

export interface EquipmentThresholdDto {
  value: number
  label: string
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
  thresholds?: EquipmentThresholdDto[]
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
  label?: string | null
  createdAt: string
}

export interface CreateMeterThresholdRequest {
  thresholdValue: number
  label: string
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
  | 'NEW'
  | 'QUALIFIED'
  | 'ASSIGNED'
  | 'CONVERTED_TO_WORK_ORDER'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'

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
  rejectionNotes?: string | null
  linkedWoId?: number | null
  linkedWoCode?: string | null
  resolvedAt?: string | null
  rejectedAt?: string | null
  photos?: ClaimPhotoResponse[]
}

export interface ClaimQualificationRequest {
  priority?: string | null
  qualificationNotes?: string | null
  assignedToUserId?: number | null
}

export interface ClaimAssignRequest {
  assignedToUserId: number
}

export interface ClaimStatusUpdateRequest {
  status: string
  note?: string | null
}

export interface RejectClaimRequest {
  rejectionNotes: string
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

export type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'REGULATORY'
export type WorkOrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type WorkOrderStatus = 'CREATED' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'VALIDATED' | 'CLOSED' | 'CANCELLED'

export interface WorkOrderResponse {
  woId: number
  woCode: string
  claimId?: number | null
  claimCode?: string | null
  parentWoId?: number | null
  parentWoCode?: string | null
  equipmentId: number
  equipmentName?: string | null
  departmentId?: number | null
  departmentName?: string | null
  woType: WorkOrderType | string
  priority: WorkOrderPriority | string
  status: WorkOrderStatus | string
  title: string
  description?: string | null
  assignedToUserId?: number | null
  assignedToName?: string | null
  secondaryAssignees?: { userId: number; name: string }[]
  followers?: { userId: number; name: string }[]
  estimatedTimeHours?: number | null
  actualTimeHours?: number | null
  estimatedDuration?: number | null
  actualDuration?: number | null
  estimatedCost?: number | null
  actualCost?: number | null
  plannedStart?: string | null
  plannedEnd?: string | null
  actualStart?: string | null
  actualEnd?: string | null
  createdAt: string
  updatedAt?: string | null
  dueDate?: string | null
  overdue?: boolean
  completedAt?: string | null
  completionNotes?: string | null
  validationNotes?: string | null
  validatedAt?: string | null
  validatedBy?: string | null
  closedAt?: string | null
  closedBy?: string | null
  cancellationNotes?: string | null
  totalTasks?: number
  completedTasks?: number
  hasPendingAdHocTasks?: boolean
  hasCriticalFailure?: boolean
}

export interface WorkOrderStatusHistoryResponse {
  id: number
  woId: number
  oldStatus?: string | null
  newStatus: string
  changedAt: string
  changedBy?: string | null
  note?: string | null
}

export interface WorkloadResponse {
  userId: number
  userName: string
  totalAssigned: number
  created: number
  assigned: number
  scheduled: number
  inProgress: number
  onHold: number
  completed: number
  overdue: number
}

export interface UpdateWorkOrderRequest {
  title: string
  description?: string | null
  priority: string
  estimatedTimeHours?: number | null
  estimatedDuration?: number | null
  estimatedCost?: number | null
  dueDate?: string | null
  plannedStart?: string | null
  plannedEnd?: string | null
  parentWoId?: number | null
  secondaryAssigneeIds?: number[]
}

export interface AssignWorkOrderRequest {
  assignedToUserId: number
  secondaryAssigneeIds?: number[]
  note?: string | null
}

export interface WorkOrderStatusUpdateRequest {
  status: string
  note?: string | null
  forceClose?: boolean
}

export interface ValidateWorkOrderRequest {
  validationNotes: string
}

export interface ScheduleWorkOrderRequest {
  plannedStart?: string | null
  plannedEnd?: string | null
  dueDate?: string | null
}

export interface CancelWorkOrderRequest {
  cancellationNotes: string
}

export interface CreateWorkOrderRequest {
  claimId?: number | null
  equipmentId: number
  woType: string
  priority: string
  title: string
  description?: string | null
  assignedToUserId?: number | null
  secondaryAssigneeIds?: number[]
  estimatedTimeHours?: number | null
  estimatedCost?: number | null
  dueDate?: string | null
  parentWoId?: number | null
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'SKIPPED'
export type TaskApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPLAN_REQUESTED'

export interface SubTaskResponse {
  id: number
  taskId: number
  description: string
  isCompleted: boolean
  orderIndex?: number | null
}

export interface TaskResponse {
  taskId: number
  woId: number
  templateId?: number | null
  title?: string | null
  description?: string | null
  notes?: string | null
  status: TaskStatus | string
  assignedToUserId?: number | null
  assignedToName?: string | null
  estimatedDuration?: number | null
  orderIndex: number
  startedAt?: string | null
  completedAt?: string | null
  completedBy?: string | null
  skippedAt?: string | null
  skippedBy?: string | null
  blockedReason?: string | null
  isAdHoc?: boolean | null
  createdByUserId?: number | null
  approvalStatus?: TaskApprovalStatus | string | null
  approvedByUserId?: number | null
  approvedAt?: string | null
  priority?: string | null
  followOnTaskId?: number | null
  departmentId?: number | null
  parentTaskId?: number | null
  actualDuration?: number | null
  dueDate?: string | null
  progress?: number | null
  totalTimerDuration?: number | null
  currentTimerStartedAt?: string | null
  subTasks?: SubTaskResponse[] | null
  childTasks?: TaskResponse[] | null
  auditLogs?: TaskAuditLogResponse[] | null
  photos?: TaskPhotoResponse[] | null
}

export interface TaskPhotoResponse {
  photoId: number
  photoUrl: string
  type: 'BEFORE' | 'AFTER'
  capturedAt: string
}

export interface TaskAuditLogResponse {
  id: number
  oldStatus?: string | null
  newStatus: string
  changedBy: string
  note?: string | null
  changedAt: string
}

export interface CreateTaskRequest {
  woId: number
  templateId?: number | null
  title?: string | null
  description: string
  parentTaskId?: number | null
  assignedToUserId?: number | null
  estimatedDuration?: number | null
  dueDate?: string | null
  priority?: string | null
  orderIndex?: number | null
}

export interface UpdateTaskRequest {
  title?: string | null
  description?: string | null
  notes?: string | null
  assignedToUserId?: number | null
  estimatedDuration?: number | null
  actualDuration?: number | null
  dueDate?: string | null
  priority?: string | null
  orderIndex?: number | null
  blockedReason?: string | null
}

export interface SparePartResponse {
  partId: number
  name: string
  sku: string
  category?: string | null
  quantityInStock: number
  minStockLevel: number
  unitCost?: number | null
  location?: string | null
  supplier?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface CreateSparePartRequest {
  name: string
  sku: string
  category?: string | null
  quantityInStock: number
  minStockLevel: number
  unitCost?: number | null
  location?: string | null
  supplier?: string | null
}
export interface PartUsageResponse {
  usageId: number
  woId: number
  taskId?: number | null
  partId: number
  partName?: string | null
  quantityUsed: number
  unitCostAtUsage?: number | null
  usedAt: string
}

export interface UsePartRequest {
  woId: number
  taskId?: number | null
  partId: number
  quantity: number
}

export interface MaintenancePlanResponse {
  planId: number
  equipmentId: number
  title: string
  description?: string | null
  frequencyType: 'DAYS' | 'WEEKS' | 'MONTHS' | 'METER' | string
  frequencyValue: number
  lastGenerationDate?: string | null
  nextDueDate?: string | null
  meterId?: number | null
  nextMeterReading?: number | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface RecentWorkOrderDetail {
  equipmentName: string
  woCode: string
  type: string
  status: string
  date: string
}

export interface EquipmentCostDetail {
  name: string
  category: string
  department: string
  totalCost: number
  percentageOfTotal: number
}

export interface NotificationResponse {
  id: number
  userId: number
  type: 'RECOMMENDATION' | 'WARNING' | 'INFO' | string
  message: string
  isRead: boolean
  referenceId?: number | null
  createdAt: string
  readAt?: string | null
}

export interface KpiResponse {
  totalWorkOrders: number
  activeWorkOrders: number
  pendingClaims: number
  lowStockParts: number
  totalMaintenanceCost: number
  mtbf: number
  mttr: number
  costTrend?: number
  mtbfTrend?: number
  mttrTrend?: number
  woByStatus: Record<string, number>
  woByType: Record<string, number>
  costByDepartment: Record<string, number>
  costByCategory: Record<string, number>
  availabilityRate: number
  correctivePreventiveRatio: number
  maintenanceCostPerEquipment: Record<string, number>
  maintenanceCostPerDepartment: Record<string, number>
  paretoData: Record<string, number>
  annualProjection: Record<string, number>
  monthlyCostTrends: Record<string, number>
  monthlyWorkOrderTrends: Record<string, Record<string, number>>
  complianceRate: number
  equipmentRoi: number
  ytdBudget: number
  costAvoidance: number
  expectedLifeSpanScore: number
  costlyEquipments?: EquipmentCostDetail[]
  recentWorkOrders?: RecentWorkOrderDetail[]
}

export interface PredictionResponse {
  equipmentId: number
  equipmentName: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string
  recommendation: string
  factors: string[]
}

export interface TaskTemplateItem {
  id: number
  label: string
  description?: string | null
  sortOrder: number
  isRequired: boolean
  estimatedMinutes?: number | null
}

export interface TaskTemplateResponse {
  id: number
  code: string
  name: string
  description?: string | null
  equipmentCategoryId?: number | null
  departmentId?: number | null
  defaultPriority: string
  estimatedHours?: number | null
  defaultAssigneeRole?: string | null
  requiresValidation: boolean
  requiresDocument: boolean
  isActive: boolean
  items: TaskTemplateItem[]
  createdAt: string
  updatedAt: string
}

export interface TaskTemplateItemRequest {
  label: string
  description?: string | null
  sortOrder: number
  isRequired: boolean
  estimatedMinutes?: number | null
}

export interface CreateTaskTemplateRequest {
  code: string
  name: string
  description?: string | null
  equipmentCategoryId?: number | null
  departmentId?: number | null
  defaultPriority: string
  estimatedHours?: number | null
  defaultAssigneeRole?: string | null
  requiresValidation: boolean
  requiresDocument: boolean
  isActive: boolean
  items: TaskTemplateItemRequest[]
}
