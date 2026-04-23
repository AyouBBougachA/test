"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import { AuditTrail, type AuditEntry } from "@/components/audit-trail"
import { equipmentApi } from "@/lib/api/equipment"
import { departmentsApi } from "@/lib/api/departments"
import { auditLogsApi } from "@/lib/api/audit-logs"
import { referenceDataApi } from "@/lib/api/reference-data"
import type {
  DepartmentResponse,
  EquipmentDocument,
  EquipmentHistory,
  EquipmentCategory,
  EquipmentModel,
  EquipmentRequest,
  EquipmentResponse,
} from "@/lib/api/types"
import { downloadCsv } from "@/lib/export"
import {
  mapAuditLogToAuditEntry,
  mapEquipmentResponseToUiListItem,
  type UiEquipmentListItem,
} from "@/lib/adapters"
import { ApiError } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

const NONE_SELECT_VALUE = "__none__"

type EquipmentFormState = {
  name: string
  serialNumber: string
  location: string
  departmentId: string
  status: string
  categoryId: string
  modelId: string
  manufacturer: string
  classification: string
  category: string
  model: string
  criticality: string
  meterUnit: string
  startMeterValue: string
  thresholds: { value: string; label: string }[]
}

const CLASSIFICATION_MAPPINGS: Record<string, string[]> = {
  BIOMEDICAL: [
    "IMAGING",
    "LABORATORY",
    "LIFE_SUPPORT",
    "MONITORING",
    "SURGICAL",
    "NEONATAL",
    "DENTAL",
    "OPHTHALMOLOGY",
    "ENT",
    "REHABILITATION",
  ],
  TECHNICAL: ["LABORATORY", "SURGICAL", "STERILIZATION", "REHABILITATION"],
  IT: ["INFORMATION_SYSTEM", "LOGISTICS"],
}

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes)) return "—"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`
}

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const payload = err.payload as unknown
    if (payload && typeof payload === "object") {
      const maybeError = (payload as Record<string, unknown>).error
      const maybeMessage = (payload as Record<string, unknown>).message
      if (typeof maybeError === "string" && maybeError.trim()) return maybeError
      if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
    }
    return `Request failed (${err.status})`
  }
  if (err instanceof Error && err.message) return err.message
  return "Request failed"
}

function createEmptyEquipmentForm(departmentId: number | null): EquipmentFormState {
  return {
    name: "",
    serialNumber: "",
    location: "",
    departmentId: departmentId ? String(departmentId) : "",
    status: "OPERATIONAL",
    categoryId: NONE_SELECT_VALUE,
    modelId: NONE_SELECT_VALUE,
    manufacturer: "",
    classification: "",
    category: NONE_SELECT_VALUE,
    model: "",
    criticality: "LOW",
    meterUnit: "",
    startMeterValue: "",
    thresholds: [],
  }
}

function mapEquipmentToForm(e: EquipmentResponse): EquipmentFormState {
  return {
    name: e.name ?? "",
    serialNumber: e.serialNumber ?? "",
    location: e.location ?? "",
    departmentId: e.departmentId != null ? String(e.departmentId) : "",
    status: (e.status ?? "OPERATIONAL").toUpperCase(),
    categoryId: e.categoryId != null ? String(e.categoryId) : NONE_SELECT_VALUE,
    modelId: e.modelId != null ? String(e.modelId) : NONE_SELECT_VALUE,
    manufacturer: e.manufacturer ?? "",
    classification: e.classification ?? "",
    category: e.category ?? NONE_SELECT_VALUE,
    model: e.model ?? "",
    criticality: e.criticality ? e.criticality.toUpperCase() : "LOW",
    meterUnit: e.meterUnit ?? "",
    startMeterValue:
      e.startMeterValue != null && Number.isFinite(e.startMeterValue) ? String(e.startMeterValue) : "",
    thresholds: (e.thresholds ?? []).map((t: any) => ({
      value: String(t.value),
      label: t.label || "",
    })),
  }
}

export default function EquipmentPage() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.roleName?.toUpperCase() === 'ADMIN'
  const isManager = user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER'
  const canManage = isAdmin || isManager
  const canAdmin = isAdmin

  const [searchQuery, setSearchQuery] = useState("")
  const [classificationFilter, setClassificationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, classificationFilter, statusFilter])

  const [equipment, setEquipment] = useState<EquipmentResponse[]>([])
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [models, setModels] = useState<EquipmentModel[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<EquipmentFormState>(() => createEmptyEquipmentForm(null))
  const [isSaving, setIsSaving] = useState(false)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewing, setViewing] = useState<EquipmentResponse | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const [documents, setDocuments] = useState<EquipmentDocument[]>([])
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false)
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null)
  const [documentInputKey, setDocumentInputKey] = useState(0)
  const [isDocumentSaving, setIsDocumentSaving] = useState(false)

  const [docsOpen, setDocsOpen] = useState(false)
  const [docsEquipment, setDocsEquipment] = useState<{ id: number; name: string } | null>(null)
  const [docsDocuments, setDocsDocuments] = useState<EquipmentDocument[]>([])
  const [isDocsLoading, setIsDocsLoading] = useState(false)
  const [docsSelectedFile, setDocsSelectedFile] = useState<File | null>(null)
  const [docsInputKey, setDocsInputKey] = useState(0)
  const [isDocsSaving, setIsDocsSaving] = useState(false)

  const [history, setHistory] = useState<EquipmentHistory[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  const [confirmDeleteDocumentOpen, setConfirmDeleteDocumentOpen] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState<EquipmentDocument | null>(null)
  const [deletingDocumentEquipmentId, setDeletingDocumentEquipmentId] = useState<number | null>(null)

  const refreshEquipment = async () => {
    const [eqRes, logsRes] = await Promise.all([
      equipmentApi.getAll(),
      auditLogsApi.getRecent(50),
    ])
    setEquipment(eqRes)
    const equipmentLogs = logsRes.filter((l) => {
      const entity = (l.entityName ?? "").toLowerCase()
      const action = (l.actionType ?? "").toLowerCase()
      return entity.includes("equipment") || action.includes("equipment")
    })
    setAuditEntries(equipmentLogs.map(mapAuditLogToAuditEntry))
  }

  useEffect(() => {
    let cancelled = false
    setIsFetching(true)
    setError(null)
    const load = async () => {
      try {
        const [eqRes, deptRes, catsRes, modelsRes, logsRes] = await Promise.all([
          equipmentApi.getAll(),
          departmentsApi.getAll(),
          referenceDataApi.getCategories(),
          referenceDataApi.getModels(),
          auditLogsApi.getRecent(50),
        ])
        if (cancelled) return
        setEquipment(eqRes)
        setDepartments(deptRes)
        setCategories(catsRes)
        setModels(modelsRes)

        const equipmentLogs = logsRes.filter((l) => {
          const entity = (l.entityName ?? "").toLowerCase()
          const action = (l.actionType ?? "").toLowerCase()
          return entity.includes("equipment") || action.includes("equipment")
        })
        setAuditEntries(equipmentLogs.map(mapAuditLogToAuditEntry))
      } catch {
        if (cancelled) return
        setEquipment([])
        setDepartments([])
        setCategories([])
        setModels([])
        setAuditEntries([])
        setError(t('failedToLoadEquipmen'))
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [language])

  const departmentNameById = useMemo(() => {
    const map: Record<number, string> = {}
    for (const d of departments) {
      map[d.departmentId] = d.departmentName
    }
    return map
  }, [departments])

  const categoryNameById = useMemo(() => {
    const map: Record<number, string> = {}
    for (const c of categories) {
      map[c.categoryId] = c.name
    }
    return map
  }, [categories])

  const modelNameById = useMemo(() => {
    const map: Record<number, string> = {}
    for (const m of models) {
      map[m.modelId] = m.name
    }
    return map
  }, [models])

  const uiItems: UiEquipmentListItem[] = useMemo(() => {
    return equipment.map((e) => mapEquipmentResponseToUiListItem(e, departmentNameById))
  }, [departmentNameById, equipment])

  const classificationOptions = useMemo(() => {
    const set = new Set<string>()
    for (const e of uiItems) {
      const v = (e.classification ?? "").trim()
      if (v && v !== "—") set.add(v)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [uiItems])

  const filteredEquipment = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return uiItems.filter((eq) => {
      const matchesSearch =
        !q ||
        eq.name.toLowerCase().includes(q) ||
        eq.serialNumber.toLowerCase().includes(q)
      const matchesClassification =
        classificationFilter === "all" || eq.classification === classificationFilter
      const matchesStatus = statusFilter === "all" || eq.status === statusFilter
      return matchesSearch && matchesClassification && matchesStatus
    })
  }, [classificationFilter, searchQuery, statusFilter, uiItems])

  const paginatedEquipment = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEquipment.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEquipment, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPERATIONAL":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "UNDER_REPAIR":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "ARCHIVED":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "LOW":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    }
  }

  const getStatusLabel = (status: string) => {
    const normalized = (status ?? "").toUpperCase()
    switch (normalized) {
      case "OPERATIONAL":
        return t("operational")
      case "UNDER_REPAIR":
        return t("underRepair")
      case "ARCHIVED":
        return t("archived")
      default:
        return normalized || "—"
    }
  }

  const getCriticalityLabel = (criticality: string) => {
    const normalized = (criticality ?? "").toUpperCase()
    switch (normalized) {
      case "CRITICAL":
        return t("critical")
      case "MEDIUM":
        return t("medium")
      case "LOW":
        return t("low")
      default:
        return normalized || "—"
    }
  }

  const stats = useMemo(() => {
    return [
      {
        label: t('totalEquipment'),
        value: uiItems.length,
        icon: Database,
        color: "text-violet-600",
        bgColor: "bg-violet-50 dark:bg-violet-900/20",
      },
      {
        label: t('outOfService'),
        value: uiItems.filter((e) => e.status === "UNDER_REPAIR" || e.status === "OUT_OF_SERVICE").length,
        icon: Activity,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
      },
       {
        label: t('critical'),
        value: uiItems.filter((e) => e.criticality === "CRITICAL").length,
        icon: AlertTriangle,
        color: "text-rose-600",
        bgColor: "bg-rose-50 dark:bg-rose-900/20",
      },
    ]
  }, [language, uiItems])

  const openCreate = () => {
    const defaultDept = departments.length > 0 ? departments[0].departmentId : null
    setFormMode("create")
    setEditingId(null)
    setForm(createEmptyEquipmentForm(defaultDept))
    setFormOpen(true)
  }

  const openEdit = (equipmentId: number) => {
    const found = equipment.find((e) => e.equipmentId === equipmentId)
    if (!found) {
      toast({
        title: t('equipmentNotFound'),
        variant: "destructive",
      })
      return
    }
    setFormMode("edit")
    setEditingId(equipmentId)
    setForm(mapEquipmentToForm(found))
    setFormOpen(true)
  }

  const openView = async (equipmentId: number) => {
    setViewOpen(true)
    setIsViewing(true)
    setViewing(null)
    setDocuments([])
    setHistory([])
    try {
      const details = await equipmentApi.getById(equipmentId)
      setViewing(details)
    } catch (err) {
      toast({
        title: t('failedToLoad'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
      setViewOpen(false)
    } finally {
      setIsViewing(false)
    }
  }

  const openDocuments = (equipmentId: number, name: string) => {
    setDocsEquipment({ id: equipmentId, name })
    setDocsDocuments([])
    setDocsSelectedFile(null)
    setDocsInputKey((k) => k + 1)
    setDocsOpen(true)
  }

  useEffect(() => {
    let cancelled = false
    const equipmentId = viewing?.equipmentId
    if (!viewOpen || !equipmentId) return

    setIsDocumentsLoading(true)
    setIsHistoryLoading(true)

    const load = async () => {
      try {
        const [docsRes, historyRes] = await Promise.all([
          equipmentApi.getDocuments(equipmentId),
          equipmentApi.getHistory(equipmentId),
        ])
        if (cancelled) return
        setDocuments(docsRes)
        setHistory(historyRes)
      } catch {
        if (cancelled) return
        setDocuments([])
        setHistory([])
      } finally {
        if (cancelled) return
        setIsDocumentsLoading(false)
        setIsHistoryLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [viewOpen, viewing?.equipmentId])

  useEffect(() => {
    let cancelled = false
    const equipmentId = docsEquipment?.id
    if (!docsOpen || !equipmentId) return

    setIsDocsLoading(true)

    const load = async () => {
      try {
        const docsRes = await equipmentApi.getDocuments(equipmentId)
        if (cancelled) return
        setDocsDocuments(docsRes)
      } catch {
        if (cancelled) return
        setDocsDocuments([])
      } finally {
        if (cancelled) return
        setIsDocsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [docsOpen, docsEquipment?.id])

  const refreshDocsDocuments = async (equipmentId: number) => {
    const docsRes = await equipmentApi.getDocuments(equipmentId)
    setDocsDocuments(docsRes)
  }

  const refreshViewingExtras = async () => {
    const equipmentId = viewing?.equipmentId
    if (!equipmentId) return
    const [docsRes, historyRes] = await Promise.all([
      equipmentApi.getDocuments(equipmentId),
      equipmentApi.getHistory(equipmentId),
    ])
    setDocuments(docsRes)
    setHistory(historyRes)
  }

  const onUploadDocument = async () => {
    const equipmentId = viewing?.equipmentId
    if (!equipmentId) return
    if (!selectedDocumentFile || isDocumentSaving) {
      toast({
        title: t('fileRequired'),
        variant: "destructive",
      })
      return
    }
    setIsDocumentSaving(true)
    try {
      await equipmentApi.uploadDocument(equipmentId, selectedDocumentFile)
      toast({ title: t('documentUploaded') })
      setSelectedDocumentFile(null)
      setDocumentInputKey((k) => k + 1)
      await refreshViewingExtras()
    } catch (err) {
      toast({
        title: t('uploadFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsDocumentSaving(false)
    }
  }

  const onDownloadDocument = async (doc: EquipmentDocument) => {
    try {
      const blob = await equipmentApi.downloadDocument(doc.id)
      const fileName = doc.documentName || `document-${doc.id}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 500)
    } catch (err) {
      toast({
        title: t('downloadFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const askDeleteDocument = (doc: EquipmentDocument, equipmentId: number | null) => {
    setDeletingDocument(doc)
    setDeletingDocumentEquipmentId(equipmentId)
    setConfirmDeleteDocumentOpen(true)
  }

  const onConfirmDeleteDocument = async () => {
    if (!deletingDocument) return
    try {
      await equipmentApi.deleteDocument(deletingDocument.id)
      toast({ title: t('documentDeleted') })
      setConfirmDeleteDocumentOpen(false)
      setDeletingDocument(null)
      const equipmentId = deletingDocumentEquipmentId
      setDeletingDocumentEquipmentId(null)

      if (equipmentId) {
        const docsRes = await equipmentApi.getDocuments(equipmentId)
        if (viewOpen && viewing?.equipmentId === equipmentId) {
          setDocuments(docsRes)
          try {
            const historyRes = await equipmentApi.getHistory(equipmentId)
            setHistory(historyRes)
          } catch {
            setHistory([])
          }
        }
        if (docsOpen && docsEquipment?.id === equipmentId) {
          setDocsDocuments(docsRes)
        }
      } else if (viewOpen && viewing?.equipmentId) {
        await refreshViewingExtras()
      }
    } catch (err) {
      toast({
        title: t('deleteFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const onUploadDocsDocument = async () => {
    const equipmentId = docsEquipment?.id
    if (!equipmentId) return
    if (!docsSelectedFile || isDocsSaving) {
      toast({
        title: t('fileRequired'),
        variant: "destructive",
      })
      return
    }
    setIsDocsSaving(true)
    try {
      await equipmentApi.uploadDocument(equipmentId, docsSelectedFile)
      toast({ title: t('documentUploaded') })
      setDocsSelectedFile(null)
      setDocsInputKey((k) => k + 1)
      await refreshDocsDocuments(equipmentId)
    } catch (err) {
      toast({
        title: t('uploadFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsDocsSaving(false)
    }
  }

  const onArchive = async (equipmentId: number) => {
    try {
      await equipmentApi.archive(equipmentId)
      toast({ title: t('equipmentArchived') })
      await refreshEquipment()
    } catch (err) {
      toast({
        title: t('archiveFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const onRestore = async (equipmentId: number) => {
    try {
      await equipmentApi.updateStatus(equipmentId, "OPERATIONAL")
      toast({ title: t('equipmentRestored') })
      await refreshEquipment()
    } catch (err) {
      toast({
        title: t('restoreFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault()
    if (isSaving) return

    const name = form.name.trim()
    const serialNumber = form.serialNumber.trim()
    const location = form.location.trim()
    const departmentId = Number(form.departmentId)
    const status = (form.status ?? "").toUpperCase()
    if (!name || !location || !Number.isFinite(departmentId) || departmentId <= 0 || !status) {
      toast({
        title: t('missingRequiredField'),
        description: t('nameLocationDepartme'),
        variant: "destructive",
      })
      return
    }

    const payload: EquipmentRequest = {
      name,
      serialNumber,
      location,
      departmentId,
      status,
      categoryId:
        form.categoryId && form.categoryId !== NONE_SELECT_VALUE ? Number(form.categoryId) : null,
      modelId:
        form.modelId && form.modelId !== NONE_SELECT_VALUE ? Number(form.modelId) : null,
      manufacturer: form.manufacturer.trim() ? form.manufacturer.trim() : null,
      classification: form.classification,
      category: form.category && form.category !== NONE_SELECT_VALUE ? form.category : null,
      model: form.model.trim() || null,
      criticality:
        form.criticality && form.criticality !== NONE_SELECT_VALUE
          ? form.criticality.toUpperCase()
          : "LOW",
      meterUnit: form.meterUnit.trim() ? form.meterUnit.trim() : null,
      startMeterValue: form.startMeterValue.trim()
        ? (Number.isFinite(Number(form.startMeterValue)) ? Number(form.startMeterValue) : null)
        : null,
      thresholds: form.thresholds
        .map((t) => ({
          value: Number(t.value),
          label: t.label.trim() || null,
        }))
        .filter((t) => Number.isFinite(t.value) && t.value > 0),
    }

    if (formMode === "edit" && editingId) {
      const existing = equipment.find((x) => x.equipmentId === editingId)
      if (existing) {
        payload.modelReference = existing.modelReference ?? null

        payload.purchaseDate = existing.purchaseDate ?? null
        payload.commissioningDate = existing.commissioningDate ?? null
        payload.supplierName = existing.supplierName ?? null
        payload.contractNumber = existing.contractNumber ?? null
        payload.warrantyEndDate = existing.warrantyEndDate ?? null
      }
    }

    setIsSaving(true)
    try {
      if (formMode === "create") {
        await equipmentApi.create(payload)
        toast({
          title: t('equipmentCreated'),
        })
      } else {
        if (!editingId) throw new Error("Missing equipment id")
        await equipmentApi.update(editingId, payload)
        toast({
          title: t('equipmentUpdated'),
        })
      }

      setFormOpen(false)
      await refreshEquipment()
    } catch (err) {
      toast({
        title: t('saveFailed'),
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onExport = () => {
    downloadCsv(
      "equipment.csv",
      ["id", "name", "serialNumber", "status", "criticality", "department", "location"],
      filteredEquipment.map((e) => [
        e.id,
        e.name,
        e.serialNumber,
        e.status,
        e.criticality,
        e.departmentName,
        e.location,
      ])
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("equipmentList")}
          </h1>
          <p className="text-muted-foreground">
            {t('manageAndMonitorAllY')
            }
          </p>
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          <Button variant="outline" className="gap-2" onClick={onExport} disabled={filteredEquipment.length === 0}>
            <Download className="h-4 w-4" />
            {t("export")}
          </Button>
          {canManage && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addEquipment")}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? (t('addEquipment'))
                : (t('editEquipment'))}
            </DialogTitle>
            <DialogDescription>
              {t('fieldsAndStatusesFol')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmitForm} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="eq-name">{t('name')}</Label>
                <Input
                  id="eq-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('eGVentilator')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eq-serial">{t("serialNumber")}</Label>
                <Input
                  id="eq-serial"
                  value={form.serialNumber}
                  onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))}
                  placeholder={t('serialNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eq-location">{t("location")}</Label>
                <Input
                  id="eq-location"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder={t('eGRoom12')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("department")}</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm((p) => ({ ...p, departmentId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.departmentId} value={String(d.departmentId)}>
                        {d.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPERATIONAL">{t("operational")}</SelectItem>
                    <SelectItem value="UNDER_REPAIR">{t("underRepair")}</SelectItem>
                    <SelectItem value="ARCHIVED">{t("archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("criticality")}</Label>
                <Select value={form.criticality} onValueChange={(v) => setForm((p) => ({ ...p, criticality: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("criticality")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_SELECT_VALUE}>{t('none')}</SelectItem>
                    <SelectItem value="LOW">{t("low")}</SelectItem>
                    <SelectItem value="MEDIUM">{t("medium")}</SelectItem>
                    <SelectItem value="CRITICAL">{t("critical")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('classification')}</Label>
                <Select 
                  value={form.classification} 
                  onValueChange={(v) => setForm((p) => ({ ...p, classification: v, category: NONE_SELECT_VALUE }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BIOMEDICAL">BIOMEDICAL</SelectItem>
                    <SelectItem value="TECHNICAL">TECHNICAL</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
    
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                  disabled={!form.classification}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_SELECT_VALUE}>{t('none')}</SelectItem>
                    {form.classification && CLASSIFICATION_MAPPINGS[form.classification]?.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
    
              <div className="space-y-2">
                <Label>{t('model')}</Label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  placeholder={t('eGMagnetom')}
                />
              </div>
    
              <div className="space-y-2">
                <Label>{t('manufacturer')}</Label>
                <Input
                  value={form.manufacturer}
                  onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))}
                  placeholder={t('eGSiemens')}
                />
              </div>
    
              <div className="space-y-2">
                <Label>{t('meterUnit')}</Label>
                <Input
                  value={form.meterUnit}
                  onChange={(e) => setForm((p) => ({ ...p, meterUnit: e.target.value }))}
                  placeholder={t('eGHours')}
                />
              </div>
    
              <div className="space-y-2">
                <Label>{t('startMeterValue')}</Label>
                <Input
                  type="number"
                  value={form.startMeterValue}
                  onChange={(e) => setForm((p) => ({ ...p, startMeterValue: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-3">
              <div className="flex items-center justify-between">
                <Label>{t('maintenanceThreshold')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm((p) => ({ ...p, thresholds: [...p.thresholds, { value: "", label: "" }] }))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('add')}
                </Button>
              </div>

              {form.thresholds.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">
                  {t('noThresholdsConfigur')}
                </div>
              ) : (
                <div className="space-y-3">
                  {form.thresholds.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Input
                        className="flex-1"
                        value={t.label}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            thresholds: p.thresholds.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                          }))
                        }
                        placeholder={t('labelEGOilChange')}
                      />
                      <Input
                        type="number"
                        className="w-32"
                        value={t.value}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            thresholds: p.thresholds.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)),
                          }))
                        }
                        placeholder="0"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive shrink-0"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            thresholds: p.thresholds.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDeleteDocumentOpen}
        onOpenChange={(open) => {
          setConfirmDeleteDocumentOpen(open)
          if (!open) {
            setDeletingDocument(null)
            setDeletingDocumentEquipmentId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDocument')}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === "fr"
                ? `Supprimer ${deletingDocument?.documentName ?? ""} ?`
                : `Delete ${deletingDocument?.documentName ?? ""}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteDocument}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={docsOpen}
        onOpenChange={(open) => {
          setDocsOpen(open)
          if (!open) {
            setDocsEquipment(null)
            setDocsDocuments([])
            setDocsSelectedFile(null)
            setDocsInputKey((k) => k + 1)
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('documents')}
              {docsEquipment ? ` — ${docsEquipment.name}` : ""}
            </DialogTitle>
            <DialogDescription>
              {t('downloadUploadOrDele')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('upload')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  key={docsInputKey}
                  type="file"
                  onChange={(e) => setDocsSelectedFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onUploadDocsDocument}
                  disabled={isDocsSaving || !docsSelectedFile}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('upload')}
                </Button>
              </div>
            </div>

            {isDocsLoading ? (
              <div className="text-sm text-muted-foreground">{t("loading")}</div>
            ) : docsDocuments.length === 0 ? (
              <div className="text-sm text-muted-foreground">{t('noDocuments')}</div>
            ) : (
              <div className="space-y-2">
                {docsDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{doc.documentName}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {(doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "—") +
                          " • " +
                          formatBytes(doc.fileSize)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => void onDownloadDocument(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          askDeleteDocument(doc, docsEquipment?.id ?? null)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDocsOpen(false)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('equipmentDetails')}</DialogTitle>
            <DialogDescription>
              {t('dataLoadedFromTheBac')}
            </DialogDescription>
          </DialogHeader>

          {isViewing ? (
            <div className="py-2 text-sm text-muted-foreground">{t("loading")}</div>
          ) : !viewing ? (
            <div className="py-2 text-sm text-muted-foreground">{t("noData")}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">{t('name')}</div>
                  <div className="font-medium text-foreground">{viewing.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("serialNumber")}</div>
                  <div className="font-mono text-foreground">{viewing.serialNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("location")}</div>
                  <div className="text-foreground">{viewing.location}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("department")}</div>
                  <div className="text-foreground">{departmentNameById[viewing.departmentId] ?? "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("status")}</div>
                  <Badge variant="outline" className={getStatusColor(viewing.status)}>
                    {getStatusLabel(viewing.status)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("criticality")}</div>
                  <Badge variant="outline" className={getCriticalityColor(viewing.criticality ?? "")}>
                    {getCriticalityLabel(viewing.criticality ?? "")}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('category')}</div>
                  <div className="text-foreground">
                    {viewing.categoryId ? (categoryNameById[viewing.categoryId] ?? `#${viewing.categoryId}`) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('model')}</div>
                  <div className="text-foreground">
                    {viewing.modelId ? (modelNameById[viewing.modelId] ?? `#${viewing.modelId}`) : "—"}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('documents')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>{t('upload')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          key={documentInputKey}
                          type="file"
                          onChange={(e) => setSelectedDocumentFile(e.target.files?.[0] ?? null)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onUploadDocument}
                          disabled={isDocumentSaving || !selectedDocumentFile}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {t('upload')}
                        </Button>
                      </div>
                    </div>

                    {isDocumentsLoading ? (
                      <div className="text-sm text-muted-foreground">{t("loading")}</div>
                    ) : documents.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{t('noDocuments')}</div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{doc.documentName}</div>
                              <div className="truncate text-xs text-muted-foreground">
                                {(doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "—") +
                                  " • " +
                                  formatBytes(doc.fileSize)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => void onDownloadDocument(doc)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => {
                                  askDeleteDocument(doc, viewing?.equipmentId ?? null)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('history')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {isHistoryLoading ? (
                      <div className="text-sm text-muted-foreground">{t("loading")}</div>
                    ) : history.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{t('noActivity')}</div>
                    ) : (
                      <div className="space-y-2">
                        {history
                          .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 6)
                          .map((h) => (
                            <div key={h.id} className="rounded-md border px-3 py-2">
                              <div className="text-sm font-medium">{h.action || "—"}</div>
                              <div className="text-xs text-muted-foreground">
                                {h.performedBy || "—"} • {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setViewOpen(false)}>
                  {t('close')}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Database className="h-4 w-4" />
            {t('list')}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Clock className="h-4 w-4" />
            {t('audit')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchEquipment')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2 min-w-0">
              <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("classification")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  {classificationOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all')}</SelectItem>
                  <SelectItem value="OPERATIONAL">{t("operational")}</SelectItem>
                  <SelectItem value="UNDER_REPAIR">{t("underRepair")}</SelectItem>
                  <SelectItem value="ARCHIVED">{t("archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('equipment')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("serialNumber")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("location")}</TableHead>
                  <TableHead className="hidden xl:table-cell">{t("department")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("classification")}</TableHead>
                  <TableHead>{t("criticality")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-muted-foreground">
                      {t('loading')}
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : paginatedEquipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-muted-foreground">
                      {t('noEquipment')}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEquipment.map((eq) => (
                    <TableRow key={eq.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <p className="font-medium">{eq.name}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {eq.serialNumber}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {eq.location}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">{eq.departmentName}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{eq.classification}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCriticalityColor(eq.criticality)}>
                          {getCriticalityLabel(eq.criticality)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(eq.status)}>
                          {getStatusLabel(eq.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/equipment/${eq.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                {t("view")}
                              </Link>
                            </DropdownMenuItem>
                            {canManage && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    openDocuments(eq.id, eq.name)
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  {t('documents')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault()
                                    openEdit(eq.id)
                                  }}
                                >
                                  {t("edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    if ((eq.status ?? "").toUpperCase() === "ARCHIVED") {
                                      void onRestore(eq.id)
                                    } else {
                                      void onArchive(eq.id)
                                    }
                                  }}
                                >
                                  {(eq.status ?? "").toUpperCase() === "ARCHIVED"
                                    ? t('restore')
                                    : t('archive')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                {t('showing')} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {t('to')} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredEquipment.length)}</span> {t('of')} <span className="font-medium">{filteredEquipment.length}</span> {t('results')}
              </p>
              <div className="flex flex-wrap gap-2 min-w-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('previous')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail
            entries={auditEntries}
            title={t('equipmentHistory')}
            description={t('trackChangesAndActio')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
