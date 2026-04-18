"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Clock, 
  Wrench,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
  History,
  Briefcase,
  LayoutDashboard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Timer,
  PauseCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskExecutionHub } from "@/components/tasks/TaskExecutionHub"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { tasksApi } from "@/lib/api/tasks"
import { workOrdersApi } from "@/lib/api/work-orders"
import { taskTemplatesApi } from "@/lib/api/task-templates"
import type { TaskResponse, WorkOrderResponse, TaskTemplateResponse } from "@/lib/api/types"
import { format, isPast } from "date-fns"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function TasksPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { language, t } = useI18n()
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [myWorkOrders, setMyWorkOrders] = useState<WorkOrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  // Detailed Task View
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)

  // Reschedule State
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [rescheduleWoId, setRescheduleWoId] = useState<number | null>(null)
  const [plannedStart, setPlannedStart] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [rescheduleDuration, setRescheduleDuration] = useState("")

  // New Task State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedWoId, setSelectedWoId] = useState<string>("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskDuration, setNewTaskDuration] = useState("")
  const [newTaskParentId, setNewTaskParentId] = useState<number | null>(null)
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("")
  
  // Template States
  const [creationMode, setCreationMode] = useState<'CUSTOM' | 'TEMPLATE'>('CUSTOM')
  const [templates, setTemplates] = useState<TaskTemplateResponse[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplateResponse | null>(null)

  const isManager = user?.roleName?.toUpperCase() === 'ADMIN' || user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER'

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const isManager = user?.roleName?.toUpperCase() === 'ADMIN' || user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER'
      const [tasksData, woData] = await Promise.all([
        tasksApi.getAll(),
        workOrdersApi.list()
      ])
      setTasks(tasksData)
      // Managers see all WOs; technicians only see their assigned WOs
      if (isManager) {
        setMyWorkOrders(woData)
      } else {
        setMyWorkOrders(woData.filter(wo => wo.assignedToUserId === user?.id))
      }

      if (isManager) {
        try {
          const { usersApi } = await import("@/lib/api/users")
          const techs = await usersApi.getAll()
          setTechnicians(techs.filter(t => t.roleName === 'TECHNICIAN' || t.roleId === 3))
        } catch { }
      } else {
        setNewTaskAssignedTo(user!.id.toString())
      }
    } catch (error) {
      console.error("Failed to load tasks", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdHocTask = async () => {
    const targetWoId = parseInt(selectedWoId)
    if (!targetWoId || !newTaskDesc) return

    try {
      await tasksApi.create({
        woId: targetWoId,
        templateId: (creationMode === 'TEMPLATE' && selectedTemplateId) ? parseInt(selectedTemplateId) : undefined,
        description: newTaskDesc,
        estimatedDuration: newTaskDuration ? parseFloat(newTaskDuration) : null,
        title: newTaskDesc.split(' ').slice(0, 5).join(' '),
        parentTaskId: newTaskParentId,
        priority: newTaskPriority,
        dueDate: newTaskDueDate || null,
        assignedToUserId: newTaskAssignedTo ? parseInt(newTaskAssignedTo) : undefined
      })
      setNewTaskDesc("")
      setNewTaskDuration("")
      setNewTaskParentId(null)
      setNewTaskPriority("MEDIUM")
      setNewTaskDueDate("")
      setNewTaskAssignedTo("")
      setCreationMode('CUSTOM')
      setSelectedTemplateId("")
      setSelectedTemplate(null)
      setIsAddDialogOpen(false)
      loadData()
    } catch (e) {
      console.error("Failed to add task", e)
    }
  }

  const [technicians, setTechnicians] = useState<any[]>([])

  const openRescheduleFor = (woId: number) => {
    const wo = myWorkOrders.find(w => w.woId === woId)
    if (!wo) return
    setRescheduleWoId(woId)
    setPlannedStart(wo.plannedStart ? format(new Date(wo.plannedStart), "yyyy-MM-dd'T'HH:mm") : "")
    setDueDate(wo.dueDate ? format(new Date(wo.dueDate), "yyyy-MM-dd'T'HH:mm") : "")
    setRescheduleDuration(wo.estimatedDuration?.toString() || "")
    setIsRescheduleDialogOpen(true)
  }

  const handleReschedule = async () => {
    if (!rescheduleWoId) return
    try {
      const formatDateTime = (dt: string) => dt && !dt.includes(':00') ? `${dt}:00` : dt;
      await workOrdersApi.reschedule(rescheduleWoId, {
        plannedStart: formatDateTime(plannedStart) || null,
        dueDate: formatDateTime(dueDate) || null,
        estimatedDuration: rescheduleDuration ? parseFloat(rescheduleDuration) : null
      })
      setIsRescheduleDialogOpen(false)
      loadData()
      alert("Schedule updated successfully")
    } catch (e) {
      console.error("Reschedule failed", e)
      alert("Failed to update schedule")
    }
  }

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadData()
      taskTemplatesApi.getAll().then(setTemplates).catch(console.error)
    }
  }, [isAuthenticated, isAuthLoading])

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === parseInt(templateId))
    if (template) {
      setSelectedTemplate(template)
      setNewTaskDesc(template.name)
      if (template.estimatedHours) setNewTaskDuration(template.estimatedHours.toString())
      if (template.defaultPriority) setNewTaskPriority(template.defaultPriority)
    } else {
      setSelectedTemplate(null)
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = (task.description ?? task.title ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || task.status.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [tasks, search, filter])

  const kpis = useMemo(() => {
    return {
      total: tasks.length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      blocked: tasks.filter(t => t.status === 'BLOCKED').length,
      completed: tasks.filter(t => t.status === 'DONE' || t.status === 'PASS').length,
      overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'DONE').length,
      hours: tasks.reduce((acc, t) => acc + (t.actualDuration || 0), 0)
    }
  }, [tasks])

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="flex-1 space-y-6 overflow-auto pb-10 pr-2"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl shadow-inner border border-primary/20">
             <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {language === 'fr' ? 'Gestion des Tâches' : 'Execution Task Center'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Hospital Maintenance Operations & Clinical Compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">
                <Plus className="h-4 w-4 mr-2" />
                New Major Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Execution Task</DialogTitle>
                <DialogDescription>
                  Define a new task or sub-task for maintenance.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-auto px-1">
                {/* Section 1 - Creation Mode (Manager Only) */}
                {isManager && (
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('creationMode')}</Label>
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

                <div className="grid gap-2">
                  <Label>{t('workOrders')}</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedWoId}
                    onChange={(e) => setSelectedWoId(e.target.value)}
                  >
                    <option value="">Select Work Order...</option>
                    {myWorkOrders.map(wo => (
                      <option key={wo.woId} value={wo.woId}>{wo.woCode} - {wo.title}</option>
                    ))}
                  </select>
                </div>

                {creationMode === 'TEMPLATE' && (
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
                        <div className="text-[11px] text-muted-foreground italic bg-background/50 p-2 rounded border border-border/40">
                          {selectedTemplate.description}
                        </div>
                        <div className="grid gap-1.5">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{t('generatedChecklist')}</Label>
                           <div className="space-y-1 max-h-[120px] overflow-auto pr-1">
                              {selectedTemplate.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs bg-background/40 p-1.5 rounded border border-border/30">
                                   <div className="h-4 w-4 rounded-full border border-primary/40 flex items-center justify-center text-[8px] font-bold text-primary">{idx + 1}</div>
                                   <span className="truncate">{item.label}</span>
                                   {item.isRequired && <span className="text-[8px] text-rose-500 font-bold ml-auto">REQ</span>}
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="grid gap-2">
                  <Label>{t('description')}</Label>
                  <Input 
                    placeholder="e.g. Sterilize surgical unit components" 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="grid gap-2">
                      <Label>{t('priority')}</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                      >
                         <option value="LOW">{t('low')}</option>
                         <option value="MEDIUM">{t('medium')}</option>
                         <option value="HIGH">{t('high')}</option>
                         <option value="CRITICAL">{t('critical')}</option>
                      </select>
                   </div>
                   <div className="grid gap-2">
                      <Label>{t('estimatedTime')} (H)</Label>
                      <Input 
                        type="number"
                        step="0.5"
                        placeholder="1.5"
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(e.target.value)}
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Parent Task (Optional)</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newTaskParentId || ""}
                      onChange={(e) => setNewTaskParentId(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Root Task</option>
                      {tasks.filter(t => !t.parentTaskId).map(t => (
                        <option key={t.taskId} value={t.taskId}>{t.title || t.description}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                     <Label>Due Date</Label>
                     <Input 
                       type="datetime-local"
                       value={newTaskDueDate}
                       onChange={(e) => setNewTaskDueDate(e.target.value)}
                     />
                  </div>
                </div>

                {isManager && (
                   <div className="grid gap-2">
                     <Label>{t('assignedTo')}</Label>
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
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleAddAdHocTask()}>Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: kpis.total, icon: Briefcase, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-200/50" },
          { label: 'In Progress', value: kpis.inProgress, icon: Timer, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200/50" },
          { label: 'Blocked', value: kpis.blocked, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200/50" },
          { label: 'Completed', value: kpis.completed, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200/50" },
          { label: 'Overdue', value: kpis.overdue, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-200/50" },
          { label: 'Logged', value: `${kpis.hours}h`, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-200/50" },
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "border border-border/50 bg-card/50 backdrop-blur-sm shadow-none transition-all duration-300 hover:scale-[1.02] hover:bg-card",
            "p-3 flex flex-col justify-between min-h-[90px]"
          )}>
            <div className="flex items-center justify-between gap-2">
               <div className={cn("p-1.5 rounded-lg shrink-0", stat.bg, stat.color)}>
                  <stat.icon className="h-3.5 w-3.5" />
               </div>
               <span className="text-xl font-bold tracking-tight text-foreground truncate">{stat.value}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-2">{stat.label}</p>
          </Card>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks by instruction or ID..." 
            className="pl-9 bg-card border-border/60 h-11 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 border-border/60 bg-card shadow-sm">
               <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 border-border/60 bg-card shadow-sm font-medium">
                  Status: {filter === 'all' ? 'All' : filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>All Status</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("TODO")}>To Do</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("IN_PROGRESS")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("DONE")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("BLOCKED")}>Blocked</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </motion.div>

      {/* Tasks Table */}
      <motion.div variants={fadeInUp}>
        {isLoading ? (
          <div className="bg-card rounded-xl border border-border/50 p-20 flex flex-col items-center justify-center gap-4">
             <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Loading task hierarchy...</p>
          </div>
        ) : (
          <TaskExecutionHub 
            tasks={filteredTasks}
            onUpdate={loadData}
          />
        )}
      </motion.div>

      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Execution Deadline</DialogTitle>
            <DialogDescription>
              Adjusting timelines for technical intervention WO-{rescheduleWoId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Planned Start</Label>
              <Input type="datetime-local" value={plannedStart} onChange={(e) => setPlannedStart(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Estimated Duration (Hours)</Label>
              <Input type="number" step="0.5" value={rescheduleDuration} onChange={(e) => setRescheduleDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} className="bg-indigo-600 hover:bg-indigo-700">Sync Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
