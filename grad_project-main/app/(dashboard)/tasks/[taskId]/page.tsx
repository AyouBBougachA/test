"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Clock, CheckSquare, History, MessageSquare, AlertTriangle, Save,
  Play, CheckCircle2, Lock, Camera, Image as ImageIcon, Timer, AlertCircle,
  Wrench, ChevronRight, Calendar, User, Briefcase, FileText, Activity,
  CheckCheck, XCircle, PauseCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { tasksApi } from "@/lib/api/tasks"
import { TaskResponse } from "@/lib/api/types"
import { format } from "date-fns"
import { TaskTimeline } from "@/components/tasks/TaskTimeline"
import { useAuth } from "@/lib/auth-context"
import { AuthenticatedImage } from "@/components/ui/authenticated-image"
import { cn } from "@/lib/utils"

type Tab = 'steps' | 'docs' | 'data' | 'history'

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams<{ taskId: string }>()
  const taskId = Number(params?.taskId)
  const { user } = useAuth()

  const [task, setTask] = useState<TaskResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('steps')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notes, setNotes] = useState("")
  const [actualDuration, setActualDuration] = useState("")
  const [blockedReason, setBlockedReason] = useState("")

  const loadTask = async () => {
    try {
      const data = await tasksApi.getById(taskId)
      setTask(data)
      setNotes(data.notes || "")
      setActualDuration(data.actualDuration?.toString() || "")
      setBlockedReason(data.blockedReason || "")
    } catch (e) {
      console.error("Failed to load task", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) loadTask()
  }, [taskId])

  // Live timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (task?.status === 'IN_PROGRESS' && task.currentTimerStartedAt) {
      const startTime = new Date(task.currentTimerStartedAt).getTime()
      const base = task.totalTimerDuration || 0
      const tick = () => setElapsedSeconds(base + Math.floor((Date.now() - startTime) / 1000))
      tick()
      interval = setInterval(tick, 1000)
    } else if (task) {
      setElapsedSeconds(task.totalTimerDuration || 0)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [task?.status, task?.currentTimerStartedAt, task?.totalTimerDuration])

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const handleStatus = async (status: string) => {
    if (!task) return
    try {
      await tasksApi.updateStatus(task.taskId, status)
      await loadTask()
    } catch (e) { console.error(e) }
  }

  const handleSave = async () => {
    if (!task) return
    try {
      setIsSaving(true)
      await tasksApi.update(task.taskId, { notes, actualDuration: actualDuration ? parseFloat(actualDuration) : null, blockedReason })
      await loadTask()
    } catch (e) { console.error(e) } finally { setIsSaving(false) }
  }

  const handleToggleSub = async (subId: number, completed: boolean) => {
    try {
      await tasksApi.toggleSubTask(subId, completed)
      await loadTask()
    } catch (e) { console.error(e) }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'AFTER') => {
    const file = e.target.files?.[0]
    if (!file || !task) return
    try {
      setIsUploading(true)
      await tasksApi.uploadPhoto(task.taskId, file, type)
      await loadTask()
    } catch (e) { console.error(e) } finally { setIsUploading(false) }
  }

  const handleApproval = async (status: 'APPROVED' | 'REJECTED') => {
    if (!task) return
    try {
      setIsSaving(true)
      await tasksApi.approve(task.taskId, status)
      await loadTask()
    } catch (e) { console.error(e) } finally { setIsSaving(false) }
  }

  const statusConfig = (s: string) => {
    switch (s?.toUpperCase()) {
      case 'DONE': case 'PASS': return { color: 'bg-emerald-600', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> }
      case 'IN_PROGRESS': return { color: 'bg-blue-600', label: 'Executing', icon: <Timer className="h-4 w-4" /> }
      case 'BLOCKED': return { color: 'bg-rose-600', label: 'Blocked', icon: <AlertTriangle className="h-4 w-4" /> }
      case 'FAIL': return { color: 'bg-rose-500', label: 'Failed', icon: <XCircle className="h-4 w-4" /> }
      default: return { color: 'bg-slate-500', label: 'Pending', icon: <Clock className="h-4 w-4" /> }
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Loading task details...</p>
      </div>
    </div>
  )

  if (!task) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-rose-500 font-semibold">Task not found.</p>
    </div>
  )

  const cfg = statusConfig(task.status)
  const isDone = task.status === 'DONE' || task.status === 'PASS'
  const isPendingApproval = task.approvalStatus === 'PENDING'
  const isInProgress = task.status === 'IN_PROGRESS'

  return (
    <div className="max-w-5xl mx-auto pb-32 space-y-6">

      {/* BREADCRUMBS */}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full border border-border/40 bg-card/50">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <nav className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold tracking-tight uppercase">
          <Link href="/tasks" className="hover:text-primary transition-colors">Task Center</Link>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <Link href={`/work-orders/${task.woId}`} className="hover:text-primary transition-colors">WO-#{task.woId}</Link>
          <ChevronRight className="h-3 w-3 opacity-30" />
          <span className="text-foreground font-black truncate max-w-[250px]">{task.title || task.description}</span>
        </nav>
      </div>

      {/* PREMIUM HEADER & KPI */}
      <div className="rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-card transition-all">
        <div className={cn("h-1.5 w-full", cfg.color)} />
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn(cfg.color, "text-white text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm border-none")}>
                  {cfg.icon}<span className="ml-1.5">{cfg.label}</span>
                </Badge>
                {isPendingApproval && (
                  <Badge className="bg-amber-500 text-white text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm border-none animate-pulse">
                    <Clock className="h-4 w-4 mr-1.5" /> Awaiting Manager Review
                  </Badge>
                )}
                <span className="text-[10px] font-black text-muted-foreground/80 tracking-tighter uppercase flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Asset Recovery Execution
                </span>
                {task.isAdHoc && <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-600 bg-indigo-500/5">AD-HOC</Badge>}
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground leading-tight">
                {task.title || task.description}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-wide">
                {task.assignedToName && (
                  <span className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md border border-border/40"><User className="h-3.5 w-3.5" />{task.assignedToName}</span>
                )}
                {task.dueDate && (
                  <span className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md border border-border/40"><Calendar className="h-3.5 w-3.5" />Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                )}
                <span className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md border border-border/40"><Wrench className="h-3.5 w-3.5" />{task.priority || 'NORMAL'}</span>
              </div>
            </div>

            {/* LIVE TIMER CARD */}
            <div className={cn(
              "p-5 rounded-2xl flex flex-col justify-between min-h-[110px] min-w-[200px] transition-all duration-300 w-full md:w-auto",
              isInProgress 
                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-none scale-105" 
                : "bg-muted border border-border/40"
            )}>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                <span>Active Timer</span>
                {isInProgress && <span className="flex h-1.5 w-1.5 bg-white rounded-full animate-ping" />}
              </div>
              <div className="font-black font-mono text-4xl tracking-tighter mt-2">{fmt(elapsedSeconds)}</div>
              <p className={cn("text-[9px] font-bold uppercase mt-1", isInProgress ? "text-white/60" : "text-muted-foreground")}>
                {isInProgress ? "Actively Tracking" : "Timer Paused"}
              </p>
            </div>
          </div>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Progress */}
            <Card className="bg-muted/30 border-border/40 p-3 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Task Progress</span>
                <span className="text-primary">{Math.round(task.progress || 0)}%</span>
              </div>
              <Progress value={task.progress || 0} className="h-1.5 bg-muted shadow-inner" />
            </Card>
            {/* Estimated */}
            <div className="bg-muted/30 border border-border/40 p-3 rounded-xl flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Est. Duration</p>
              <p className="text-xl font-black text-foreground">{task.estimatedDuration || '--'} <span className="text-[10px] font-bold text-muted-foreground">HRS</span></p>
            </div>
            {/* Subtasks */}
            <div className="bg-muted/30 border border-border/40 p-3 rounded-xl flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Checklist</p>
              <p className="text-xl font-black text-foreground">
                {task.subTasks?.filter(s => s.isCompleted).length ?? 0}
                <span className="text-xs font-bold text-muted-foreground"> / {task.subTasks?.length ?? 0}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN TAB NAVIGATION */}
      <div className="flex items-center gap-1 border-b border-border/40 overflow-x-auto pb-px">
        {([
          { key: 'steps', label: 'Checklist', icon: <CheckSquare className="h-3.5 w-3.5" /> },
          { key: 'docs', label: 'Proof', icon: <Camera className="h-3.5 w-3.5" /> },
          { key: 'data', label: 'Details', icon: <MessageSquare className="h-3.5 w-3.5" /> },
          { key: 'history', label: 'Audit', icon: <History className="h-3.5 w-3.5" /> }
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'steps' && (
          <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {task.description && (
              <div className="bg-card p-5 rounded-2xl border border-border/60">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 opacity-60">Task Instructions</p>
                <p className="text-sm text-foreground/90 leading-loose whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/40 flex items-center gap-2 bg-muted/30">
                <Wrench className="h-3.5 w-3.5 text-primary" />
                <h3 className="font-black text-xs text-foreground uppercase tracking-widest">Procedural Checklist</h3>
                <Badge variant="outline" className="ml-auto text-[10px] font-black">{task.subTasks?.filter(s => s.isCompleted).length ?? 0}/{task.subTasks?.length ?? 0}</Badge>
              </div>
              <div className="divide-y divide-border/40">
                {task.subTasks && task.subTasks.length > 0 ? task.subTasks.map(st => (
                  <div key={st.id} className={cn(
                    "flex items-center gap-4 p-5 transition-colors hover:bg-muted/30",
                    st.isCompleted ? "bg-emerald-500/5" : ""
                  )}>
                    <Checkbox
                      id={`st-${st.id}`}
                      checked={st.isCompleted}
                      onCheckedChange={(c) => handleToggleSub(st.id, !!c)}
                      className="h-5 w-5 rounded-md"
                    />
                    <label htmlFor={`st-${st.id}`} className={cn(
                      "flex-1 text-sm font-medium cursor-pointer transition-all",
                      st.isCompleted ? "text-muted-foreground/60 line-through" : "text-foreground"
                    )}>
                      {st.description}
                    </label>
                    {st.isCompleted && <CheckCheck className="h-4 w-4 text-emerald-500 shrink-0" />}
                  </div>
                )) : (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">No checklist defined.</div>
                )}
              </div>
            </div>

            {task.childTasks && task.childTasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Sub-tasks Dependency</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.childTasks.map(ct => (
                    <Link key={ct.taskId} href={`/tasks/${ct.taskId}`}>
                      <div className="bg-card p-4 rounded-xl border border-border/60 flex items-center justify-between shadow-sm hover:border-primary/40 transition-all group">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{ct.title || ct.description}</p>
                          <Badge variant="outline" className="w-fit text-[9px] font-black border-border/40">{ct.status}</Badge>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'docs' && (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-4">
              <div className="bg-primary h-10 w-10 min-w-[40px] rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground">Performance Verification</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Capture evidence of intervention before and after completion.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['BEFORE', 'AFTER'] as const).map(type => {
                const existing = task.photos?.find(p => p.type === type)
                const label = type === 'BEFORE' ? 'Pre-Intervention' : 'Post-Intervention'
                return (
                  <div key={type} className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">{label}</Label>
                    {existing ? (
                      <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-background shadow-xl bg-muted">
                        <AuthenticatedImage 
                          path={`/tasks/${task.taskId}/photos/${existing.photoId}/download`} 
                          alt={type} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Badge className="bg-background text-foreground font-black uppercase text-[10px]">Captured</Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl border-2 border-dashed border-border/60 bg-card flex flex-col items-center justify-center hover:border-primary/40 hover:bg-muted/30 transition-all group relative">
                        <input type="file" id={`photo-${type}-${task.taskId}`} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => handlePhotoUpload(e, type)} disabled={isUploading} accept="image/*" />
                        <div className="flex flex-col items-center pointer-events-none gap-2">
                          {type === 'BEFORE' ? <ImageIcon className="h-8 w-8 text-muted-foreground/40" /> : <Camera className="h-8 w-8 text-muted-foreground/40" />}
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Click to upload</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-foreground p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <Timer className="h-12 w-12 text-background" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Precision Timer</p>
                <p className="text-4xl font-black font-mono tracking-tighter text-background">{fmt(elapsedSeconds)}</p>
                <p className="text-[11px] text-background/60 font-medium italic">Validated background tracking</p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manual Override</Label>
                  {isPendingApproval && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] px-2 py-0">REVIEW PENDING</Badge>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={actualDuration} 
                    placeholder="2.5" 
                    onChange={e => setActualDuration(e.target.value)} 
                    className="h-16 bg-muted/30 border-border/40 rounded-2xl font-mono text-2xl font-black focus:ring-4 focus:ring-primary/10 transition-all pl-6" 
                  />
                  <span className="absolute right-6 top-5 text-sm text-primary font-black">HRS</span>
                </div>
              </div>
            </div>

            {/* MANAGER APPROVAL ACTIONS */}
            {isPendingApproval && (user?.roleName?.toUpperCase() === 'ADMIN' || user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER') && (
              <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col gap-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-xl text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight dark:text-amber-200">Manual Override Review</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium">Technician claims: <strong>{task.actualDuration} HRS</strong>. Please validate.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApproval('APPROVED')} disabled={isSaving} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => handleApproval('REJECTED')} disabled={isSaving} className="flex-1 h-12 border-rose-500/30 text-rose-500 bg-card hover:bg-rose-500/5 rounded-xl font-bold gap-2">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4 p-5 bg-card rounded-2xl border border-border/60">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Blocking Issue</Label>
                <Input value={blockedReason} onChange={e => setBlockedReason(e.target.value)} placeholder="None reported" className="bg-muted/30 border-border/40 rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Work Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter technical observations..." className="min-h-[150px] bg-muted/30 border-border/40 rounded-xl p-4 resize-none leading-relaxed text-sm" />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg gap-2">
                {isSaving ? <div className="h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                Save Execution Record
              </Button>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <div className="p-2 rounded-lg bg-muted flex items-center justify-center">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-xs uppercase tracking-widest">Audit Trail</h3>
                <p className="text-[10px] text-muted-foreground font-medium">Compliance-ready event logs</p>
              </div>
            </div>
            {task.auditLogs && task.auditLogs.length > 0 ? (
              <div className="bg-card p-6 rounded-2xl border border-border/60">
                <TaskTimeline logs={task.auditLogs} />
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 border border-dashed border-border/60 rounded-2xl text-muted-foreground italic text-sm">No activity recorded for this step.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STICKY FOOTER ACTIONS */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-t border-border/60 shadow-2xl">
          <div className="max-w-5xl mx-auto p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {!isInProgress && (
                <Button onClick={() => handleStatus('IN_PROGRESS')} className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 font-bold gap-2">
                  <Play className="h-4 w-4 fill-current" /> Start Timer
                </Button>
              )}
              {task.status !== 'BLOCKED' && (
                <Button variant="outline" onClick={() => handleStatus('BLOCKED')} className="h-11 px-4 border-border/60 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 rounded-xl font-bold gap-2">
                  <AlertCircle className="h-4 w-4" /> Block
                </Button>
              )}
            </div>
            <Button onClick={() => handleStatus('DONE')} className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-black uppercase tracking-[0.2em] text-[10px] gap-2">
              <CheckCircle2 className="h-4 w-4" /> Mark Complete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
