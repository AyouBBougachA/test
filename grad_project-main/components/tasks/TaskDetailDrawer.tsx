"use client"

import { useState, useEffect } from "react"
import { 
  X, 
  Clock, 
  CheckSquare, 
  History, 
  MessageSquare, 
  AlertTriangle,
  Save,
  Play,
  CheckCircle2,
  Lock,
  Camera,
  Image as ImageIcon,
  Trash2,
  Timer,
  AlertCircle,
  Wrench,
  ChevronRight,
  Info,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskResponse } from "@/lib/api/types"
import { tasksApi } from "@/lib/api/tasks"
import { TaskTimeline } from "./TaskTimeline"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface TaskDetailDrawerProps {
  task: TaskResponse | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function TaskDetailDrawer({ task, isOpen, onClose, onUpdate }: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'steps' | 'docs' | 'execution' | 'history'>('steps')
  const [actualDuration, setActualDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [blockedReason, setBlockedReason] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Sync state with task prop
  useEffect(() => {
    if (task) {
      setActualDuration(task.actualDuration?.toString() || "")
      setNotes(task.notes || "")
      setBlockedReason(task.blockedReason || "")
    }
  }, [task])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (task?.status === 'IN_PROGRESS' && task.currentTimerStartedAt) {
      const startTime = new Date(task.currentTimerStartedAt).getTime();
      const baseSeconds = task.totalTimerDuration || 0;

      const updateTimer = () => {
        const now = new Date().getTime();
        const sessionSeconds = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(baseSeconds + sessionSeconds);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else if (task) {
      setElapsedSeconds(task.totalTimerDuration || 0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task?.status, task?.currentTimerStartedAt, task?.totalTimerDuration]);

  if (!task) return null

  const formatElapsedTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveDetails = async () => {
    try {
      setIsSaving(true)
      await tasksApi.update(task.taskId, {
        actualDuration: actualDuration ? parseFloat(actualDuration) : null,
        notes: notes,
        blockedReason: blockedReason
      })
      onUpdate()
    } catch (error) {
      console.error("Failed to save task details", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleSubTask = async (subTaskId: number, completed: boolean) => {
    try {
      await tasksApi.toggleSubTask(subTaskId, completed)
      onUpdate()
    } catch (error) {
      console.error("Failed to toggle subtask", error)
    }
  }

  const handleUpdateStatus = async (status: string) => {
    try {
      if (status === 'BLOCKED' && !blockedReason) {
        setActiveTab('execution')
        alert("Please provide a blocking reason in the Execution Notes.")
        return
      }
      await tasksApi.updateStatus(task.taskId, status)
      onUpdate()
    } catch (error) {
      console.error("Failed to update status", error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'BEFORE' | 'AFTER') => {
    const file = e.target.files?.[0]
    if (!file) return;
    try {
      setIsUploading(true);
      await tasksApi.uploadPhoto(task.taskId, file, type);
      onUpdate();
    } catch (error) {
      console.error("Photo upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DONE':
      case 'PASS':
        return { color: 'bg-emerald-500', text: 'Completed', icon: <CheckCircle2 className="h-4 w-4" /> }
      case 'IN_PROGRESS':
        return { color: 'bg-blue-600', text: 'Executing...', icon: <Timer className="h-4 w-4 animate-spin-slow" /> }
      case 'BLOCKED':
        return { color: 'bg-rose-600', text: 'Blocked', icon: <AlertTriangle className="h-4 w-4" /> }
      case 'FAIL':
        return { color: 'bg-rose-500', text: 'Failed', icon: <X className="h-4 w-4" /> }
      default:
        return { color: 'bg-slate-500', text: 'Pending', icon: <Clock className="h-4 w-4" /> }
    }
  }

  const config = getStatusConfig(task.status)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-hidden p-0 border-l border-border/40 shadow-2xl">
        <SheetHeader className="sr-only">
          <SheetTitle>Task Execution Details</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-slate-50/50">
          
          {/* PREMIUM HEADER SECTION */}
          <div className="relative overflow-hidden bg-white border-b shadow-sm z-10">
            <div className={`h-1.5 w-full ${config.color}`} />
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`${config.color} text-white hover:${config.color} uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-sm border-none shadow-sm`}>
                      {config.icon}
                      <span className="ml-1.5">{config.text}</span>
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase flex items-center gap-1">
                      <Lock className="h-3 w-3" /> WO-#{task.woId}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none py-1">
                     {task.title || task.description}
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                     <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No deadline'}</span>
                     <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> {task.priority || 'NORMAL'} PRIORITY</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 h-10 w-10">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* DASHBOARD KPIS */}
              <div className="grid grid-cols-2 gap-4">
                 {/* PROGRESS MODULE */}
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between h-20">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>Execution Progress</span>
                       <span className="text-indigo-600 font-black">{Math.round(task.progress || 0)}%</span>
                    </div>
                    <Progress value={task.progress || 0} className="h-2 bg-white shadow-inner" />
                 </div>

                 {/* TIMER MODULE */}
                 <div className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${task.status === 'IN_PROGRESS' ? 'bg-blue-600 border-blue-700 shadow-lg shadow-blue-100' : 'bg-slate-900 border-slate-950 text-white'}`}>
                    <div className="flex justify-between items-center text-[10px] font-bold opacity-70 uppercase tracking-widest">
                       <span>Total Duration</span>
                       {task.status === 'IN_PROGRESS' && <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                    </div>
                    <div className="flex items-end gap-2 leading-none">
                       <span className="text-2xl font-black font-mono tracking-tighter">
                          {formatElapsedTime(elapsedSeconds)}
                       </span>
                       <span className="text-[10px] font-bold pb-1 opacity-60">HH:MM:SS</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* SOP NAVIGATION */}
          <div className="flex items-center gap-4 px-6 py-3 bg-white border-b">
            <TabButton active={activeTab === 'steps'} label="Steps" onClick={() => setActiveTab('steps')} icon={<CheckSquare />} />
            <TabButton active={activeTab === 'docs'} label="Proof" onClick={() => setActiveTab('docs')} icon={<Camera />} />
            <TabButton active={activeTab === 'execution'} label="Data" onClick={() => setActiveTab('execution')} icon={<MessageSquare />} />
            <TabButton active={activeTab === 'history'} label="Logs" onClick={() => setActiveTab('history')} icon={<History />} />
          </div>

          {/* MAIN EXECUTION AREA */}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <AnimatePresence mode="wait">
              {activeTab === 'steps' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Wrench className="h-4 w-4 text-indigo-600" />
                       Step-By-Step Instructions
                    </h3>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                      {task.subTasks && task.subTasks.length > 0 ? (
                        task.subTasks.map(st => (
                          <div key={st.id} className={`flex items-center gap-4 p-5 transition-colors hover:bg-slate-50/50 ${st.isCompleted ? 'bg-slate-50/30' : ''}`}>
                             <div className="flex items-center justify-center">
                               <Checkbox 
                                 id={`st-${st.id}`} 
                                 checked={st.isCompleted} 
                                 onCheckedChange={(checked) => handleToggleSubTask(st.id, !!checked)}
                                 className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                               />
                             </div>
                             <label htmlFor={`st-${st.id}`} className={`text-sm font-medium leading-relaxed transition-all cursor-pointer ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {st.description}
                             </label>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center text-slate-400 italic text-sm">No checklist subtasks defined for this step.</div>
                      )}
                    </div>
                  </div>

                  {task.childTasks && task.childTasks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Derived Secondary Tasks</h3>
                      <div className="space-y-2">
                        {task.childTasks.map(ct => (
                          <div key={ct.taskId} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm group hover:ring-2 hover:ring-indigo-600/10 transition-all">
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-800">{ct.title || ct.description}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ct.status}</span>
                             </div>
                             <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'docs' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
                     <div className="bg-indigo-600 h-10 w-10 min-w-[40px] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <Camera className="h-5 w-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-sm font-black text-indigo-900 leading-none">Proof of Performance</h4>
                        <p className="text-[11px] text-indigo-700/80 leading-relaxed">Before and after visual documentation is required for specialized equipment maintenance auditing.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Before Photo Slot */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Initial State (Before)</Label>
                      {task.photos?.find(p => p.type === 'BEFORE') ? (
                        <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                          <img 
                            src={tasksApi.getPhotoUrl(task.taskId, task.photos.find(p => p.type === 'BEFORE')!.photoId)} 
                            alt="Before" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20">View Large</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white hover:border-indigo-400 hover:bg-slate-50 transition-all group relative">
                           <input 
                             type="file" 
                             id={`photo-before-${task.taskId}`} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                             onChange={(e) => handlePhotoUpload(e, 'BEFORE')}
                             disabled={isUploading}
                           />
                           <div className="flex flex-col items-center pointer-events-none">
                             <div className="p-4 bg-slate-50 rounded-full mb-3 group-hover:bg-indigo-50 transition-colors">
                                <ImageIcon className="h-8 w-8 text-slate-300 group-hover:text-indigo-400" />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 tracking-widest uppercase">Select Photo</span>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* After Photo Slot */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Resulting State (After)</Label>
                      {task.photos?.find(p => p.type === 'AFTER') ? (
                        <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-xl">
                          <img 
                            src={tasksApi.getPhotoUrl(task.taskId, task.photos.find(p => p.type === 'AFTER')!.photoId)} 
                            alt="After" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20">View Large</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white hover:border-emerald-400 hover:bg-slate-50 transition-all group relative">
                           <input 
                             type="file" 
                             id={`photo-after-${task.taskId}`} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                             onChange={(e) => handlePhotoUpload(e, 'AFTER')}
                             disabled={isUploading}
                           />
                           <div className="flex flex-col items-center pointer-events-none">
                             <div className="p-4 bg-slate-50 rounded-full mb-3 group-hover:bg-emerald-50 transition-colors">
                                <Camera className="h-8 w-8 text-slate-300 group-hover:text-emerald-400" />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-600 tracking-widest uppercase">Capture Result</span>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'execution' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pb-20"
                >
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Scheduled Hours</Label>
                         <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono font-bold text-slate-700 shadow-sm flex items-center justify-between">
                            {task.estimatedDuration || '--'}
                            <span className="text-[10px] text-slate-400">HRS</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Manual Labor Adjust.</Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.1" 
                            value={actualDuration} 
                            placeholder="e.g. 1.5"
                            onChange={(e) => setActualDuration(e.target.value)}
                            className="h-14 bg-white border-slate-200 rounded-2xl font-mono text-lg font-bold shadow-sm focus:ring-indigo-600/20"
                          />
                          <span className="absolute right-4 top-4.5 text-xs text-indigo-400 font-bold">HRS</span>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Blocking Issues (If any)</Label>
                      <Input 
                        placeholder="Ex: Missing specific gasket, Waiting for power shutdown..."
                        value={blockedReason}
                        onChange={(e) => setBlockedReason(e.target.value)}
                        className="h-12 bg-white border-slate-200 rounded-xl shadow-sm focus:ring-rose-500/20"
                      />
                   </div>

                   <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Technical Findings & Action Notes</Label>
                      <Textarea 
                        placeholder="Detail the work performed, observations, and recommendations..."
                        className="min-h-[200px] bg-white border-slate-200 rounded-2xl p-4 shadow-sm resize-none focus:ring-indigo-600/20 text-slate-700 leading-relaxed"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                   </div>

                   <Button 
                     className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all" 
                     onClick={handleSaveDetails}
                     disabled={isSaving}
                   >
                     {isSaving ? (
                       <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                       <Save className="h-5 w-5" />
                     )}
                     <span className="font-black uppercase tracking-widest text-xs">Save Execution Record</span>
                   </Button>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                     <History className="h-5 w-5 text-slate-400" />
                     <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Detailed Audit Trail</h3>
                  </div>
                  <TaskTimeline logs={task.auditLogs || []} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DYNAMIC FOOTER ACTIONS */}
          <div className="p-6 bg-white border-t flex items-center justify-between gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10">
             <div className="flex items-center gap-2">
                {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                  <Button 
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 font-bold flex items-center gap-2" 
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Start Timer
                  </Button>
                )}
                {task.status !== 'BLOCKED' && task.status !== 'DONE' && (
                  <Button 
                    variant="outline" 
                    className="h-12 px-4 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold flex items-center gap-2" 
                    onClick={() => handleUpdateStatus('BLOCKED')}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Block
                  </Button>
                )}
             </div>

             {task.status !== 'DONE' && (
               <Button 
                 className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-100 flex-1 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2" 
                 onClick={() => handleUpdateStatus('DONE')}
               >
                 <CheckCircle2 className="h-5 w-5" />
                 Complete Step
               </Button>
             )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105' 
          : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      <span className={`transition-colors ${active ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600'}`}>
        {icon}
      </span>
      <span className="uppercase tracking-widest">{label}</span>
    </button>
  )
}
