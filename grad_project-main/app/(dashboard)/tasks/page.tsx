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
  Plus,
  Calendar,
  AlertCircle
} from "lucide-react"
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
import type { TaskResponse, WorkOrderResponse } from "@/lib/api/types"
import { format } from "date-fns"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function TasksPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { language } = useI18n()
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [myWorkOrders, setMyWorkOrders] = useState<WorkOrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  // Add Task State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedWoId, setSelectedWoId] = useState<string>("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskDuration, setNewTaskDuration] = useState("")

  // Reschedule State
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [rescheduleWoId, setRescheduleWoId] = useState<number | null>(null)
  const [plannedStart, setPlannedStart] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [rescheduleDuration, setRescheduleDuration] = useState("")

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const [tasksData, woData] = await Promise.all([
        tasksApi.getAll(),
        workOrdersApi.list()
      ])
      setTasks(tasksData)
      // Only keep WOs where user is assigned
      setMyWorkOrders(woData.filter(wo => wo.assignedToUserId === user?.id))
    } catch (error) {
      console.error("Failed to load tasks", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdHocTask = async (woIdOverride?: number) => {
    const targetWoId = woIdOverride || parseInt(selectedWoId)
    if (!targetWoId || !newTaskDesc) return

    try {
      await tasksApi.create({
        woId: targetWoId,
        description: newTaskDesc,
        estimatedDuration: newTaskDuration ? parseFloat(newTaskDuration) : null,
        title: "Ad-hoc Tech Task"
      })
      setNewTaskDesc("")
      setNewTaskDuration("")
      setIsAddDialogOpen(false)
      loadData()
      alert("Task proposed successfully. Pending manager approval.")
    } catch (e) {
      console.error("Failed to add task", e)
      alert("Failed to add task")
    }
  }

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
    }
  }, [isAuthenticated, isAuthLoading])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = (task.description ?? task.title ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || task.status.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [tasks, search, filter])

  const toggleComplete = async (task: TaskResponse) => {
    if (task.status === 'DONE') return
    try {
      await tasksApi.complete(task.taskId)
      loadData()
    } catch (error) {
      console.error("Failed to complete task", error)
    }
  }

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
      className="flex-1 space-y-6 overflow-auto pb-10"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {language === 'fr' ? 'Mes Tâches' : 'Maintenance Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Suivez et validez les étapes individuelles de vos interventions.' 
              : 'Track and validate individual steps of your interventions.'}
          </p>
        </div>

        {/* Global Add Task */}
        {user?.roleName?.toUpperCase() === 'TECHNICIAN' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Nouvelle Tâche' : 'Add Task'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle>Propose Ad-hoc Task</DialogTitle>
                <DialogDescription>
                  Adding a task to one of your assigned work orders.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Work Order</Label>
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
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="What needs to be done?" 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Estimated Duration (hours)</Label>
                  <Input 
                    type="number" 
                    step="0.5"
                    placeholder="e.g. 1.5" 
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleAddAdHocTask()}>Propose Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        {[
          { 
            title: language === 'fr' ? 'À faire' : 'To Do', 
            count: tasks.filter(t => t.status === 'TODO').length, 
            icon: Clock, 
            color: "text-amber-500",
            bg: "bg-amber-500/10"
          },
          { 
            title: language === 'fr' ? 'Complétées' : 'Completed', 
            count: tasks.filter(t => t.status === 'DONE').length, 
            icon: CheckCircle2, 
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
          },
          { 
            title: 'Total', 
            count: tasks.length, 
            icon: Wrench, 
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'fr' ? "Rechercher une tâche..." : "Search tasks..."} 
            className="pl-9 bg-card/40 backdrop-blur-md border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card/40 border-border">
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'All Status' : filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("TODO")}>To Do</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("DONE")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Tasks List */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl ring-1 ring-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Synchronizing tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-muted-foreground">Either you are all caught up or no tasks match your filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredTasks.sort((a,b) => a.orderIndex - b.orderIndex).map((task) => (
                  <div key={task.taskId} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors group">
                    <button 
                      onClick={() => toggleComplete(task)}
                      disabled={task.status === 'DONE' || (task.isAdHoc && task.approvalStatus === 'PENDING')}
                      title={task.isAdHoc && task.approvalStatus === 'PENDING' ? 'Pending manager approval' : ''}
                      className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'DONE' 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-muted-foreground/30 hover:border-primary'
                      } ${task.isAdHoc && task.approvalStatus === 'PENDING' ? 'opacity-50 cursor-not-allowed border-amber-300' : ''}`}
                    >
                      {task.status === 'DONE' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {!task.status === 'DONE' && task.isAdHoc && task.approvalStatus === 'PENDING' && <Clock className="h-2.5 w-2.5 text-amber-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium transition-all ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.description}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-indigo-200 text-indigo-700 bg-indigo-50/50">WO-{task.woId}</Badge>
                          {user?.roleName?.toUpperCase() === 'TECHNICIAN' && !task.isAdHoc && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 ml-1 hover:bg-indigo-100 text-indigo-600"
                              onClick={() => {
                                setSelectedWoId(task.woId.toString());
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {task.isAdHoc && (
                          <>
                            <Badge variant="secondary" className="text-[8px] px-1 py-0 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold uppercase tracking-tighter">AD-HOC</Badge>
                            {task.approvalStatus === 'PENDING' && <Badge variant="outline" className="text-[8px] px-1 py-0 text-amber-600 border-amber-200 bg-amber-50/30">Pending Review</Badge>}
                            {task.approvalStatus === 'APPROVED' && <Badge variant="outline" className="text-[8px] px-1 py-0 text-emerald-600 border-emerald-200 bg-emerald-50/30">Approved</Badge>}
                            {task.approvalStatus === 'REJECTED' && <Badge variant="outline" className="text-[8px] px-1 py-0 text-rose-600 border-rose-200 bg-rose-50/30">Rejected</Badge>}
                          </>
                        )}

                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(task.completedAt), 'MMM d, HH:mm')}</span>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href=`/work-orders/${task.woId}`}>
                          View Work Order
                        </DropdownMenuItem>
                        {user?.roleName?.toUpperCase() === 'TECHNICIAN' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openRescheduleFor(task.woId)}>
                              Edit WO Schedule
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Shared Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Edit Work Order Schedule</DialogTitle>
            <DialogDescription>
              Adjusting timelines for WO-{rescheduleWoId}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Planned Start</Label>
              <Input 
                type="datetime-local" 
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input 
                type="datetime-local" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Estimated Duration (Hours)</Label>
              <Input 
                type="number" 
                step="0.5"
                value={rescheduleDuration}
                onChange={(e) => setRescheduleDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
