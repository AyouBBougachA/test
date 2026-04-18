export interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  roleName: string | null;
  roleId: number | null;
  departmentName: string | null;
  departmentId: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface EquipmentCategory {
  categoryId: number;
  name: string;
  createdAt?: string;
}

export interface EquipmentModel {
  modelId: number;
  name: string;
  createdAt?: string;
}

export interface AuditLog {
  id: number;
  userId: number | null;
  actionType: string;
  entityName: string;
  entityId: number | null;
  details: string;
  createdAt: string;
}

export interface Equipment {
  equipmentId: number;
  assetCode?: string | null;
  name: string;
  serialNumber: string;
  status: 'OPERATIONAL' | 'OUT_OF_SERVICE' | 'REFORMED' | 'UNDER_REPAIR' | 'ARCHIVED';
  location: string;
  departmentId: number;
  departmentName?: string | null;
  categoryId?: number | null;
  modelId?: number | null;
  classification?: 'BIOMEDICAL' | 'TECHNICAL' | 'IT' | null;
  criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  meterUnit?: string | null;
  startMeterValue?: number | null;
  thresholds?: number[];
  manufacturer?: string | null;
  modelReference?: string | null;
  createdAt: string;
}

export interface EquipmentHistory {
  id: number;
  equipmentId: number;
  action: string;
  performedBy: string;
  createdAt: string;
}

export interface Meter {
  meterId: number;
  id?: number;
  equipmentId: number;
  equipmentName?: string;
  name: string;
  value: number;
  lastValue?: number; // Alias for value if needed
  unit: string;
  meterType: string;
  lastReadingAt?: string;
  thresholds?: number[];
}
