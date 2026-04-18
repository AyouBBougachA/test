"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { 
  ArrowLeft, Clock, Wrench, CheckCircle, AlertCircle, CheckSquare, Calendar, Users, XCircle, FileText, Plus, Trash2, ThumbsUp, ThumbsDown, Edit, CalendarDays, Eye, EyeOff, Square, History, Hammer, Package, Activity, DollarSign, TrendingDown, Search, Check, X, FastForward 
} from "lucide-react"
import { TaskExecutionHub } from "@/components/tasks/TaskExecutionHub"
import { WorkOrderLifecycleFlow } from "@/components/work-orders/WorkOrderLifecycleFlow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { workOrdersApi } from "@/lib/api/work-orders"
import { tasksApi } from "@/lib/api/tasks"
import { taskTemplatesApi } from "@/lib/api/task-templates"
import type { WorkOrderResponse, TaskResponse, UserResponse, ClaimPhotoResponse, TaskTemplateResponse } from "@/lib/api/types"
import { useAuth } from "@/lib/auth-context"
import { claimsApi } from "@/lib/api/claims"
import { useI18n } from "@/lib/i18n"
import { format } from "date-fns"
import { usersApi } from "@/lib/api/users"
import { inventoryApi } from "@/lib/api/inventory"
import { metersApi } from "@/lib/api/meters"
import { equipmentApi } from "@/lib/api/equipment"
import { motion } from "framer-motion"
import { ChecklistExecution } from "@/components/regulatory/ChecklistExecution"
import { cn } from "@/lib/utils"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
  // Icons already imported above

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    case "VALIDATED":
      return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
    case "CLOSED":
      return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
    case "IN_PROGRESS":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
    case "ON_HOLD":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
    case "ASSIGNED":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
    case "SCHEDULED":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
    case "CREATED":
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  }
}

export default function WorkOrderDetailPage() {
  const { language } = useI18n()
  const { user } = useAuth()
  const params = useParams<{ woId: string }>()
  const woId = Number(params?.woId)

  const [wo, setWo] = useState<WorkOrderResponse | null>(null)
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [technicians, setTechnicians] = useState<UserResponse[]>([])
  
  const [claimPhotos, setClaimPhotos] = useState<ClaimPhotoResponse[]>([])
  const photoUrlRef = useRef<Record<number, string>>({})
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modals state
  const [assignUserId, setAssignUserId] = useState("")
  const [secondaryAssignedUserIds, setSecondaryAssignedUserIds] = useState<string[]>([])
  const [completionNotes, setCompletionNotes] = useState("")
  const [validationNotes, setValidationNotes] = useState("")

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskEst, setNewTaskEst] = useState("")
  const [newTaskParentId, setNewTaskParentId] = useState<number | null>(null)
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("")
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  
  // Template States
  const [creationMode, setCreationMode] = useState<'CUSTOM' | 'TEMPLATE'>('CUSTOM')
  const [templates, setTemplates] = useState<TaskTemplateResponse[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplateResponse | null>(null)

  // Reschedule state
  const [plannedStart, setPlannedStart] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [estDuration, setEstDuration] = useState("")
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)

  // Follow-on WO state
  const [isFollowOnDialogOpen, setIsFollowOnDialogOpen] = useState(false)
  const [followOnTitle, setFollowOnTitle] = useState("")
  const [followOnDesc, setFollowOnDesc] = useState("")

  const [isFailureDialogOpen, setIsFailureDialogOpen] = useState(false)
  const [failingTaskId, setFailingTaskId] = useState<number | null>(null)
  const [failureNote, setFailureNote] = useState("")
  const [isCritical, setIsCritical] = useState(false)

  const [laborEntries, setLaborEntries] = useState<any[]>([])
  const [partUsages, setPartUsages] = useState<any[]>([])
  const [allInventory, setAllInventory] = useState<any[]>([])
  
  // Labor Logging State
  const [isLaborDialogOpen, setIsLaborDialogOpen] = useState(false)
  const [laborNotes, setLaborNotes] = useState("")
  const [laborDuration, setLaborDuration] = useState("60")

  // Parts Selection State
  const [isPartsDialogOpen, setIsPartsDialogOpen] = useState(false)
  const [partSearch, setPartSearch] = useState("")
  const [selectedPartId, setSelectedPartId] = useState("")
  const [partQty, setPartQty] = useState("1")
  const [selectedPartTaskId, setSelectedPartTaskId] = useState("")

  const { t } = useI18n()

  const loadData = async () => {
    if (!Number.isFinite(woId)) {
      setError("Invalid Work Order ID")
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const data = await workOrdersApi.getById(woId)
      setWo(data)
      setPlannedStart(data.plannedStart ? data.plannedStart.split('.')[0] : "")
      setDueDate(data.dueDate ? data.dueDate.split('.')[0] : "")
      setEstDuration(data.estimatedDuration?.toString() || "")
      
      if (data.claimId) {
        try {
          const photosInfo = await claimsApi.listPhotos(data.claimId)
          setClaimPhotos(photosInfo)
        } catch (e) {
          console.error("Failed loading claim photos", e)
        }
      }

      const [tasksData, laborData, invData, rawPartUsages] = await Promise.all([
        workOrdersApi.getTasks(woId),
        workOrdersApi.getLabor(woId),
        inventoryApi.list(),
        inventoryApi.getUsages(woId)
      ])
      
      setTasks(tasksData)
      setLaborEntries(laborData)
      setAllInventory(invData)
      setPartUsages(rawPartUsages)
      
      if (user?.roleName?.toUpperCase() !== 'TECHNICIAN') {
        const techs = await usersApi.getAll()
        setTechnicians(techs.filter(t => t.roleName === 'TECHNICIAN' || t.roleId === 3))
        
        // Load templates for managers
        const templatesData = await taskTemplatesApi.getAll()
        setTemplates(templatesData)
      }
    } catch (err) {
      setError("Failed to load work order details.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [woId, user])

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!wo?.claimId || claimPhotos.length === 0) return;
      
      const nextUrls: Record<number, string> = {}
      for (const photo of claimPhotos) {
        try {
          const blob = await claimsApi.getPhotoBlob(wo.claimId, photo.photoId)
          if (cancelled) return
          nextUrls[photo.photoId] = URL.createObjectURL(blob)
        } catch {}
      }
      if (cancelled) return
      Object.values(photoUrlRef.current).forEach(url => URL.revokeObjectURL(url))
      photoUrlRef.current = nextUrls
      setPhotoUrls(nextUrls)
    }
    load();
    return () => { cancelled = true; }
  }, [wo?.claimId, claimPhotos])
  
  useEffect(() => {
    return () => {
      Object.values(photoUrlRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const handleAction = async (action: string, payload?: any) => {
    setActionLoading(action)
    try {
      if (action === 'assign') {
        const secIds = secondaryAssignedUserIds.filter(id => id).map(id => parseInt(id))
        await workOrdersApi.assign(woId, { 
          assignedToUserId: parseInt(assignUserId),
          secondaryAssigneeIds: secIds.length > 0 ? secIds : undefined 
        })
      } else if (action === 'start') {
        await workOrdersApi.updateStatus(woId, { status: 'IN_PROGRESS' })
      } else if (action === 'complete') {
        await workOrdersApi.updateStatus(woId, { status: 'COMPLETED', note: completionNotes })
      } else if (action === 'validate') {
        await workOrdersApi.validate(woId, { validationNotes })
      } else if (action === 'close') {
        await workOrdersApi.close(woId)
      } else if (action === 'cancel') {
        await workOrdersApi.updateStatus(woId, { status: 'CANCELLED', forceClose: true })
      } else if (action === 'toggle-watch') {
        if (!wo || !user) return
        const isFollowing = wo.followers?.some(f => f.userId === user.id)
        if (isFollowing) {
          setWo(prev => prev ? { ...prev, followers: prev.followers?.filter(f => f.userId !== user.id) } : prev)
        } else {
          setWo(prev => prev ? { ...prev, followers: [...(prev.followers || []), { userId: user.id, name: user.name || 'Me' }] } : prev)
        }
        await workOrdersApi.toggleFollower(woId)
      }
      if (action !== 'toggle-watch') await loadData()

      // AUTOMATED METER RESET FOR PREVENTIVE MAINT
      if ((action === 'validate' || action === 'close') && wo?.woType === 'PREVENTIVE') {
        try {
          const meters = await metersApi.getAll()
          const equipMeters = meters.filter(m => m.equipmentId === wo.equipmentId)
          
          for (const m of equipMeters) {
            if (m.value > 0) {
              await metersApi.recordLog(m.meterId, {
                operation: 'SUBTRACT',
                amount: m.value
              })
            }
          }

          // Return equipment to OPERATIONAL status
          await equipmentApi.updateStatus(wo.equipmentId, 'OPERATIONAL')
        } catch (err) {
          console.error("Failed to reset meters on WO closure", err)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateFollowOn = async () => {
    if (!followOnTitle) return
    try {
      await workOrdersApi.create({
        title: followOnTitle,
        description: followOnDesc,
        equipmentId: wo!.equipmentId,
        claimId: wo!.claimId || undefined,
        parentWoId: woId,
        woType: "CORRECTIVE",
        priority: wo!.priority,
      })
      alert("Follow-on Work Order created successfully!")
      setIsFollowOnDialogOpen(false)
      setFollowOnTitle("")
      setFollowOnDesc("")
    } catch (e) {
      console.error("Follow-on WO creation failed", e)
      alert("Failed to create follow-on WO")
    }
  }

  const handleTaskToggle = async (taskId: number, newStatus: string) => {
    try {
      if (newStatus === 'FAIL') {
        setFailingTaskId(taskId)
        setFailureNote("")
        setIsCritical(false)
        setIsFailureDialogOpen(true)
        return
      }

      await tasksApi.updateStatus(taskId, newStatus)
      const tasksData = await workOrdersApi.getTasks(woId)
      setTasks(tasksData)
      if (newStatus === 'DONE' || newStatus === 'PASS') {
         // Optionally reload WO to see completion %
         loadData();
      }
    } catch (e) {
      console.error("Task update failed", e)
    }
  }

  const submitTaskFailure = async () => {
    if (!failingTaskId) return
    try {
      setActionLoading('failing-task')
      await tasksApi.updateStatus(failingTaskId, 'FAIL')
      // Update Task with notes/failure reason
      await tasksApi.update(failingTaskId, { notes: failureNote })
      
      if (isCritical) {
        // If critical, we should probably set WO to ON_HOLD via backend logic but we can also do it here
        // Actually the backend updateStatus handles setting hasCriticalFailure: true
      }
      
      setIsFailureDialogOpen(false)
      loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const refreshTasks = async () => {
    try {
      const tasksData = await workOrdersApi.getTasks(woId)
      setTasks(tasksData)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskDesc) return
    try {
      await tasksApi.create({
        woId,
        templateId: (creationMode === 'TEMPLATE' && selectedTemplateId) ? parseInt(selectedTemplateId) : undefined,
        title: newTaskTitle || newTaskDesc.split(' ').slice(0, 5).join(' '),
        description: newTaskDesc,
        estimatedDuration: newTaskEst ? parseFloat(newTaskEst) : null,
        parentTaskId: newTaskParentId,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || null,
        assignedToUserId: newTaskAssignedTo ? parseInt(newTaskAssignedTo) : undefined
      })
      setIsTaskDialogOpen(false)
      setCreationMode('CUSTOM')
      setSelectedTemplateId("")
      setSelectedTemplate(null)
      setNewTaskTitle("")
      setNewTaskDesc("")
      setNewTaskEst("")
      setNewTaskParentId(null)
      setNewTaskPriority("MEDIUM")
      setNewTaskDueDate("")
      setNewTaskAssignedTo("")
      const tasksData = await workOrdersApi.getTasks(woId)
      setTasks(tasksData)
    } catch (e) {
      console.error("Task creation failed", e)
      alert("Failed to create task. Check if all required fields are filled.")
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      setSelectedTemplate(template)
      setNewTaskDesc(template.name)
      if (template.estimatedHours) setNewTaskEst(template.estimatedHours.toString())
      if (template.defaultPriority) setNewTaskPriority(template.defaultPriority)
    } else {
      setSelectedTemplate(null)
    }
  }

  const handleReschedule = async () => {
    try {
      setActionLoading('reschedule')
      // datetime-local gives "YYYY-MM-DDTHH:mm" — backend needs seconds
      const toIso = (dt: string) => {
        if (!dt) return null
        return dt.length === 16 ? `${dt}:00` : dt
      }
      await workOrdersApi.reschedule(woId, {
        plannedStart: toIso(plannedStart),
        dueDate: toIso(dueDate),
        estimatedDuration: estDuration ? parseFloat(estDuration) : null
      })
      setIsRescheduleDialogOpen(false)
      await loadData()
    } catch (e) {
      console.error("Reschedule failed", e)
      alert("Failed to update schedule. Please check the dates and try again.")
    } finally {
      setActionLoading(null)
    }
  }

  // Handlers for tasks are now managed by TaskExecutionHub shared component

  const handleLogLabor = async () => {
    if (!user) return
    try {
      await workOrdersApi.logLabor(woId, {
        userId: user.id,
        durationMinutes: parseInt(laborDuration),
        hourlyRate: 50,
        notes: laborNotes
      })
      setIsLaborDialogOpen(false)
      setLaborNotes("")
      loadData()
    } catch (e) {
      alert("Failed to log labor")
    }
  }

  // Approval handled by TaskExecutionHub

  const handleAddPart = async () => {
    if (!selectedPartId || !partQty) return
    try {
      setActionLoading('add-part')
      await inventoryApi.usePart({
        woId,
        partId: parseInt(selectedPartId),
        quantity: parseInt(partQty),
        taskId: selectedPartTaskId ? parseInt(selectedPartTaskId) : null
      })
      setIsPartsDialogOpen(false)
      setSelectedPartId("")
      setPartQty("1")
      setSelectedPartTaskId("")
      loadData()
    } catch (e) {
      console.error(e)
      alert("Failed to add part. Check stock levels.")
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading work order...</div>
  }

  if (error || !wo) {
    return <div className="p-8 text-center text-rose-500">{error}</div>
  }

  const isManager = user?.roleName?.toUpperCase() === 'ADMIN' || user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER';
  const isAssignedTech = user?.roleName?.toUpperCase() === 'TECHNICIAN' && user?.id === wo.assignedToUserId;

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => ['DONE', 'PASS'].includes(t.status)).length / tasks.length) * 100) : 0;
  const totalLaborCost = laborEntries.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* MANAGER ALERT BANNER */}
      {wo.hasCriticalFailure && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-4 text-rose-800 shadow-sm"
        >
          <div className="bg-rose-500 p-2 rounded-full text-white">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Execution Failure Alert</h3>
            <p className="text-sm opacity-90 text-rose-700">One or more execution steps have failed. Manager review and corrective action required.</p>
          </div>
          {isManager && (
             <Button variant="outline" size="sm" className="border-rose-200 bg-white hover:bg-rose-50 text-rose-700">Review Failure</Button>
          )}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/work-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {wo.woCode}
              </h1>
              {wo.parentWoCode && (
                <Link href={`/work-orders/${wo.parentWoId}`}>
                  <Badge variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 cursor-pointer transition-colors shadow-sm text-xs py-0.5">
                    Follows {wo.parentWoCode}
                  </Badge>
                </Link>
              )}
            </div>
            <p className="text-muted-foreground">{wo.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {wo.claimId && (
            <Link href={`/claims/${wo.claimId}`}>
              <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-600">
                <AlertCircle className="h-4 w-4" />
                View Origin Claim
              </Button>
            </Link>
          )}


          {/* TECHNICIAN / MANAGER ACTIONS */}
          {(wo.status === 'ASSIGNED' || wo.status === 'SCHEDULED') && (isAssignedTech || isManager) && (
            <Button onClick={() => handleAction('start')} disabled={actionLoading === 'start'} className="bg-blue-600 hover:bg-blue-700">
              {actionLoading === 'start' ? 'Starting...' : 'Start Work'}
            </Button>
          )}

          {wo.status === 'IN_PROGRESS' && (isAssignedTech || isManager) && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Mark Completed</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Complete Intervention</DialogTitle></DialogHeader>
                <Textarea placeholder="Final completion notes..." value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} />
                <DialogFooter>
                  <Button onClick={() => handleAction('complete')} disabled={actionLoading === 'complete'}>Confirm Completion</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* MANAGER ONLY ACTIONS */}
          {isManager && (
            <>
              {(wo.status === 'CREATED' || wo.status === 'ASSIGNED' || wo.status === 'SCHEDULED') && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline"><Users className="h-4 w-4 mr-2" /> Assign</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Assign Technicians</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Primary Technician (Responsible)</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
                          <option value="">Select Technician...</option>
                          {technicians
                            .filter(t => !t.departmentId || t.departmentId === wo.departmentId)
                            .map(t => <option key={t.userId} value={t.userId}>{t.fullName} {t.departmentName ? `(${t.departmentName})` : ''}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Technicians (Followers / Assistants)</Label>
                        <select multiple className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={secondaryAssignedUserIds} onChange={e => {
                          const options = Array.from(e.target.selectedOptions) as HTMLOptionElement[];
                          setSecondaryAssignedUserIds(options.map(o => o.value));
                        }}>
                          {technicians
                            .filter(t => t.userId.toString() !== assignUserId && (!t.departmentId || t.departmentId === wo.departmentId))
                            .map(t => <option key={t.userId} value={t.userId}>{t.fullName} {t.departmentName ? `(${t.departmentName})` : ''}</option>)}
                        </select>
                        <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleAction('assign')} disabled={actionLoading === 'assign' || !assignUserId}>Confirm Assignment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {wo.status === 'COMPLETED' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700"><CheckCircle className="h-4 w-4 mr-2" /> Validate</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Validate Intervention</DialogTitle></DialogHeader>
                    <Textarea placeholder="Validation remarks..." value={validationNotes} onChange={e => setValidationNotes(e.target.value)} />
                    <DialogFooter>
                      <Button onClick={() => handleAction('validate')} disabled={actionLoading === 'validate'}>Validate & Accept</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {wo.status === 'VALIDATED' && (
                <Button onClick={() => handleAction('close')} disabled={actionLoading === 'close'} variant="outline" className="border-slate-500 text-slate-700 bg-white">
                  <XCircle className="h-4 w-4 mr-2" />
                  Archive & Close
                </Button>
              )}

              {/* FOLLOW ON WO CREATE */}
              <Dialog open={isFollowOnDialogOpen} onOpenChange={setIsFollowOnDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-indigo-500 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Follow-on
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Follow-on Work Order</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                       <Label>Follow-on Title</Label>
                       <Input value={followOnTitle} onChange={e => setFollowOnTitle(e.target.value)} placeholder="e.g. Parts replacement follow-up" required />
                    </div>
                    <div className="space-y-2">
                       <Label>Description</Label>
                       <Textarea value={followOnDesc} onChange={e => setFollowOnDesc(e.target.value)} placeholder="Reason for follow-on..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateFollowOn} disabled={!followOnTitle}>Create WO</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* LIFECYCLE FLOW TRACKER */}
      <WorkOrderLifecycleFlow status={wo.status} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border border-border inline-flex h-11 items-center justify-center rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="checklist" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Checklist & Tasks</TabsTrigger>
          <TabsTrigger value="costs" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Parts & Labor</TabsTrigger>
          {wo?.claimId && claimPhotos.length > 0 && (
             <TabsTrigger value="photos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Photos</TabsTrigger>
          )}
          <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-sm border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Intervention Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                    <Badge variant="outline" className={`${getStatusBadge(wo.status)} border-none shadow-sm`}>{wo.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Equipment</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      {wo.equipmentName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned To</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {wo.assignedToName || "Unassigned"}
                        {wo.assignedToName && <Badge variant="outline" className="text-[9px] h-4">PRIMARY</Badge>}
                      </div>
                      {wo.secondaryAssignees && wo.secondaryAssignees.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-5">
                          {wo.secondaryAssignees.map(sec => (
                            <Badge key={sec.userId} variant="secondary" className="text-[10px] bg-muted">{sec.name}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</p>
                    <p className="text-sm font-semibold">{wo.priority}</p>
                  </div>
                </div>

                {wo.followers && wo.followers.length > 0 && (
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Eye className="h-3 w-3" /> Watchers ({wo.followers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                       {wo.followers.map(f => (
                         <Badge key={f.userId} variant="outline" className="bg-amber-50/30 text-amber-700 border-amber-200/50 text-[10px]">
                           {f.name}
                         </Badge>
                       ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/40">
                    {wo.description || "No description provided."}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {wo.completionNotes && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 p-4 rounded-r-xl">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Completion Notes</p>
                      <p className="text-sm text-emerald-900/90 dark:text-emerald-100/90">{wo.completionNotes}</p>
                    </div>
                  )}
                  {wo.validationNotes && (
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase mb-1">Validation Output</p>
                      <p className="text-sm text-indigo-900/90 dark:text-indigo-100/90">{wo.validationNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-foreground">{completionRate}%</span>
                    <span className="text-xs text-muted-foreground">{tasks.filter(t => ['DONE', 'PASS'].includes(t.status)).length} / {tasks.length} Steps</span>
                  </div>
                  <Progress 
                    value={completionRate} 
                    className="h-2 bg-muted transition-all duration-500"
                    indicatorClassName={cn(
                      "transition-all duration-700",
                      completionRate < 30 ? "bg-rose-500" :
                      completionRate < 70 ? "bg-amber-500" :
                      completionRate < 100 ? "bg-indigo-500" :
                      "bg-emerald-500"
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Schedule</CardTitle>
                  {(isManager || isAssignedTech) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsRescheduleDialogOpen(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="bg-primary/10 p-2 rounded-lg text-primary"><Calendar className="h-4 w-4" /></div>
                     <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Due Date</p>
                        <p className="text-sm font-medium">{wo.dueDate ? format(new Date(wo.dueDate), 'PPP') : 'Not set'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="bg-primary/10 p-2 rounded-lg text-primary"><Clock className="h-4 w-4" /></div>
                     <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Target Start</p>
                        <p className="text-sm font-medium">{wo.plannedStart ? format(new Date(wo.plannedStart), 'PPP') : 'Not scheduled'}</p>
                     </div>
                  </div>
                  {wo.completedAt && (
                    <div className="flex items-center gap-3">
                       <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle className="h-4 w-4" /></div>
                       <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Completed At</p>
                          <p className="text-sm font-medium">{format(new Date(wo.completedAt), 'MMM d, HH:mm')}</p>
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="outline-none space-y-4">
          {wo.woType === 'REGULATORY' ? (
            <ChecklistExecution woId={woId} isEditable={wo.status !== 'VALIDATED' && wo.status !== 'CLOSED'} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Intervention Checklist
                </h3>
                {(isManager || isAssignedTech) && (
                  <Button size="sm" variant="outline" className="h-9 gap-2 shadow-sm" onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>
                )}
              </div>
              <TaskExecutionHub 
                tasks={tasks}
                onToggle={handleTaskToggle}
                onRefresh={refreshTasks}
                isEditable={isManager || isAssignedTech}
                isManager={isManager}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="costs" className="outline-none">
          <div className="grid gap-6 md:grid-cols-2">
             <Card className="shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-lg flex items-center gap-2">
                      <Hammer className="h-5 w-5 text-primary" />
                      Labor Logs
                   </CardTitle>
                   {(isManager || isAssignedTech) && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => setIsLaborDialogOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Log Work</Button>
                   )}
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-xl flex items-center justify-between border border-border/60">
                         <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Total Labor Cost</p>
                            <p className="text-2xl font-bold text-foreground">${totalLaborCost.toFixed(2)}</p>
                         </div>
                         <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <TrendingDown className="h-5 w-5" />
                         </div>
                      </div>
                      
                      <div className="space-y-3">
                         {laborEntries.length === 0 ? (
                           <p className="text-sm text-muted-foreground italic text-center py-4">No labor logs yet.</p>
                         ) : laborEntries.map(entry => (
                           <div key={entry.laborId} className="flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card hover:bg-muted/5 transition-colors">
                              <div>
                                 <p className="text-sm font-medium">{entry.userName}</p>
                                 <p className="text-xs text-muted-foreground">{entry.durationMinutes} mins @ $50/hr</p>
                              </div>
                              <p className="font-bold text-foreground">${entry.totalCost ? entry.totalCost.toFixed(2) : "0.00"}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="shadow-sm border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Parts Consumed
                   </CardTitle>
                   {(isManager || isAssignedTech) && (
                      <Button size="sm" variant="outline" className="h-8" onClick={() => setIsPartsDialogOpen(true)}><Plus className="h-3.5 w-3.5 mr-1" /> Add Part</Button>
                   )}
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {partUsages.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-10">Use the "Add Part" button to search inventory and link parts to this work order.</p>
                      ) : (
                        <div className="space-y-3">
                           {partUsages.map(usage => (
                             <div key={usage.usageId} className="flex items-center justify-between p-3 border border-border/40 rounded-xl bg-card hover:bg-muted/5 transition-colors">
                                <div>
                                   <p className="text-sm font-medium">{usage.partName || "Unknown Part"}</p>
                                   <p className="text-xs text-muted-foreground">Qty: {usage.quantityUsed} | Unit Cost: ${usage.unitCostAtUsage?.toFixed(2) || "0.00"}</p>
                                   {usage.taskId && (
                                     <Badge variant="outline" className="text-[9px] h-4 bg-muted/50 p-1 px-2 border-none mt-1">
                                       Linked to Task #{usage.taskId}
                                     </Badge>
                                   )}
                                </div>
                                <p className="font-bold text-foreground">
                                   ${((usage.quantityUsed || 0) * (usage.unitCostAtUsage || 0)).toFixed(2)}
                                </p>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="outline-none">
           <Card className="shadow-sm border-border/60">
              <CardHeader>
                 <CardTitle className="text-lg">Photos from Originating Claim</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {claimPhotos.map(photo => {
                       const src = photoUrls[photo.photoId]
                       return (
                          <div key={photo.photoId} className="rounded-xl border border-border overflow-hidden group">
                             <div className="aspect-video bg-muted relative">
                                {src ? (
                                   <img src={src} alt="Claim attachment" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                   <div className="flex h-full items-center justify-center text-xs text-muted-foreground animate-pulse">Loading preview...</div>
                                )}
                             </div>
                             <div className="p-3 bg-card border-t border-border">
                                <p className="text-sm font-medium truncate">{photo.originalName || "Attachment"}</p>
                             </div>
                          </div>
                       )
                    })}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="activity" className="outline-none">
           <Card className="shadow-sm border-border/60">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Intervention Timeline
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                    <div className="relative">
                       <div className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-primary border-4 border-background" />
                       <p className="text-xs font-bold text-primary mb-1">{wo.createdAt ? format(new Date(wo.createdAt), 'MMM d, HH:mm') : '—'}</p>
                       <p className="text-sm font-medium">Work Order Generated</p>
                       <p className="text-xs text-muted-foreground mt-0.5">Originating from {wo.claimCode || 'Manual Entry'}</p>
                    </div>

                    {tasks.filter(t => t.status !== 'TODO').map(task => (
                      <div key={task.taskId} className="relative">
                         <div className={`absolute -left-7 top-1 h-3 w-3 rounded-full border-4 border-background ${task.status === 'FAIL' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                         <p className="text-xs font-bold text-muted-foreground mb-1">{task.completedAt ? format(new Date(task.completedAt), 'MMM d, HH:mm') : '—'}</p>
                         <p className="text-sm font-medium">Task: {task.description}</p>
                         <p className={`text-xs mt-0.5 px-1.5 py-0.5 rounded w-fit ${task.status === 'FAIL' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>Outcome: {task.status}</p>
                      </div>
                    ))}
                    
                    {wo.status === 'COMPLETED' && (
                      <div className="relative">
                         <div className="absolute -left-7 top-1 h-3 w-3 rounded-full bg-emerald-500 border-4 border-background" />
                         <p className="text-xs font-bold text-muted-foreground mb-1">{wo.completedAt ? format(new Date(wo.completedAt), 'MMM d, HH:mm') : '—'}</p>
                         <p className="text-sm font-medium">Execution Completed</p>
                         <p className="text-xs text-muted-foreground mt-0.5">{wo.completionNotes || 'No notes provided.'}</p>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* FAILURE REASON DIALOG */}
      <Dialog open={isFailureDialogOpen} onOpenChange={setIsFailureDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ThumbsDown className="h-5 w-5" />
              Record Task Failure
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Failure Description / Notes</Label>
              <Textarea 
                id="reason" 
                placeholder="Explain why this step failed..." 
                value={failureNote}
                onChange={(e) => setFailureNote(e.target.value)}
                className="min-h-[100px] rounded-xl"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
              <div className="space-y-0.5">
                <Label className="text-rose-900 font-bold">Critical Blocker?</Label>
                <p className="text-xs text-rose-700 font-medium opaicty-80">This will flag the whole Work Order for manager review.</p>
              </div>
              <Switch 
                checked={isCritical}
                onCheckedChange={setIsCritical}
                className="data-[state=checked]:bg-rose-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFailureDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
              onClick={submitTaskFailure}
              disabled={actionLoading === 'failing-task' || !failureNote.trim()}
            >
              Confirm Failure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODALS */}
      <Dialog open={isLaborDialogOpen} onOpenChange={setIsLaborDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Labor Hours</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" value={laborDuration} onChange={e => setLaborDuration(e.target.value)} />
             </div>
             <div className="space-y-2">
                <Label>Work Notes</Label>
                <Textarea placeholder="What did you work on?" value={laborNotes} onChange={e => setLaborNotes(e.target.value)} />
             </div>
             <div className="bg-muted/50 p-4 rounded-xl flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">Estimated cost: <span className="text-primary">${((parseInt(laborDuration) || 0) * 50 / 60).toFixed(2)}</span> (@ $50/hr)</p>
             </div>
          </div>
          <DialogFooter>
             <Button onClick={handleLogLabor}>Record Hours</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPartsDialogOpen} onOpenChange={setIsPartsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Parts from Inventory</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Search Entire Inventory</Label>
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input 
                      placeholder="SKU or Part Name..." 
                      className="pl-9" 
                      value={partSearch} 
                      onChange={e => setPartSearch(e.target.value)}
                   />
                </div>
             </div>
             <div className="space-y-2">
                <Label>Matches</Label>
                <select 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   value={selectedPartId}
                   onChange={e => setSelectedPartId(e.target.value)}
                >
                   <option value="">Select a part...</option>
                   {allInventory
                     .filter(p => !partSearch || p.name.toLowerCase().includes(partSearch.toLowerCase()) || p.sku.toLowerCase().includes(partSearch.toLowerCase()))
                     .map(p => (
                      <option key={p.partId} value={p.partId}>{p.sku} - {p.name} ({p.quantityInStock} in stock)</option>
                   ))}
                </select>
             </div>
              <div className="space-y-2">
                 <Label>Quantity Used</Label>
                 <Input type="number" value={partQty} onChange={e => setPartQty(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label>Link to Execution Step (Optional)</Label>
                 <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedPartTaskId}
                    onChange={e => setSelectedPartTaskId(e.target.value)}
                 >
                    <option value="">General Work Order usage</option>
                    {tasks.map(t => (
                      <option key={t.taskId} value={t.taskId}>#{t.taskId} - {(t.description || "").substring(0, 40)}...</option>
                    ))}
                 </select>
              </div>
           </div>
           <DialogFooter>
              <Button onClick={handleAddPart} disabled={actionLoading === 'add-part'}>
                {actionLoading === 'add-part' ? "Linking..." : "Link Part to WO"}
              </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

      {/* ── ADD EXECUTION STEP DIALOG ─────────────────────────── */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckSquare className="h-5 w-5" />
              New Execution Step
            </DialogTitle>
            <DialogDescription>
              Define a specific task or sub-step for this work order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[70vh] overflow-auto px-1">
            {/* Mode Selector (Manager Only) */}
            {isManager && (
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('creationMode')}</Label>
                <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-lg">
                  <Button 
                    variant={creationMode === 'CUSTOM' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCreationMode('CUSTOM')}
                    className={cn("h-8 text-xs", creationMode === 'CUSTOM' && "bg-background text-foreground shadow-sm hover:bg-background")}
                  >
                    {t('customTask')}
                  </Button>
                  <Button 
                    variant={creationMode === 'TEMPLATE' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCreationMode('TEMPLATE')}
                    className={cn("h-8 text-xs", creationMode === 'TEMPLATE' && "bg-background text-foreground shadow-sm hover:bg-background")}
                  >
                    {t('useTemplate')}
                  </Button>
                </div>
              </div>
            )}

            {creationMode === 'TEMPLATE' && isManager && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 border-l-2 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-lg">
                <div className="grid gap-2">
                  <Label className="text-primary font-bold">{t('selectTemplate')}</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    <option value="">-- Choose a template --</option>
                    {templates.map(tmp => (
                      <option key={tmp.id} value={tmp.id}>{tmp.name}</option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-muted-foreground italic bg-background/50 p-2 rounded border border-border/40 text-center">
                      {selectedTemplate.description}
                    </div>
                    <div className="grid gap-1.5">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{t('generatedChecklist')}</Label>
                       <div className="space-y-1 max-h-[120px] overflow-auto pr-1">
                          {selectedTemplate.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs bg-background/40 p-1.5 rounded border border-border/30">
                               <div className="h-4 w-4 rounded-full border border-primary/40 flex items-center justify-center text-[8px] font-bold text-primary">{idx + 1}</div>
                               <span className="truncate">{item.label}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Step Title (Ref)</Label>
              <Input
                placeholder="e.g. Inspect hydraulic seals"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="bg-slate-50/50 border-slate-200"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Instructions / Description <span className="text-rose-500">*</span></Label>
              <Textarea
                placeholder="Detailed description of what must be done..."
                rows={3}
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                className="bg-slate-50/50 border-slate-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Priority</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                     <option value="LOW">LOW</option>
                     <option value="MEDIUM">MEDIUM</option>
                     <option value="HIGH">HIGH</option>
                     <option value="CRITICAL">CRITICAL</option>
                  </select>
               </div>
               <div className="grid gap-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Est. Duration (Hrs)</Label>
                  <Input 
                    type="number"
                    step="0.5"
                    placeholder="1.5"
                    value={newTaskEst}
                    onChange={(e) => setNewTaskEst(e.target.value)}
                    className="bg-slate-50/50 border-slate-200"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Due Date</Label>
                  <Input 
                    type="datetime-local"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="bg-slate-50/50 border-slate-200"
                  />
               </div>
               <div className="grid gap-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Parent Step (Optional)</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTaskParentId || ""}
                    onChange={(e) => setNewTaskParentId(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">No Parent</option>
                    {tasks.filter(t => !t.parentTaskId).map(t => (
                      <option key={t.taskId} value={t.taskId}>{t.title || t.description}</option>
                    ))}
                  </select>
               </div>
            </div>

            {isManager && (
               <div className="grid gap-2">
                 <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Assign To</Label>
                 <select 
                   className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                   value={newTaskAssignedTo}
                   onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                 >
                   <option value="">Select Technician...</option>
                   {technicians.map(t => (
                     <option key={t.userId} value={t.userId}>{t.fullName}</option>
                   ))}
                 </select>
               </div>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTaskDesc.trim()}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Create Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RESCHEDULE DIALOG ─────────────────────────────────── */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Schedule Work Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Planned Start</Label>
              <Input
                type="datetime-local"
                value={plannedStart}
                onChange={e => setPlannedStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date / Deadline</Label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Duration (hours)</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 4"
                value={estDuration}
                onChange={e => setEstDuration(e.target.value)}
              />
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 p-3 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
              Setting dates will move this WO to <strong>SCHEDULED</strong> status if currently CREATED or ASSIGNED.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReschedule}
              disabled={actionLoading === 'reschedule'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {actionLoading === 'reschedule' ? 'Saving...' : 'Save Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
