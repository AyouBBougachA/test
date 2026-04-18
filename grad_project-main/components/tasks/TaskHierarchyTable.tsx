"use client"

import { useState } from "react"
import { 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Clock, 
  AlertCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight,
  Lock
} from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { TaskResponse } from "@/lib/api/types"
import { format, isPast } from "date-fns"

interface TaskHierarchyTableProps {
  tasks: TaskResponse[]
  onSelectTask: (task: TaskResponse) => void
  onUpdateStatus: (taskId: number, status: string) => void
  onDeleteTask: (taskId: number) => void
}

export function TaskHierarchyTable({ tasks, onSelectTask, onUpdateStatus, onDeleteTask }: TaskHierarchyTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  const paginatedTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(tasks.length / itemsPerPage)

  const toggleRow = (taskId: number) => {
    const next = new Set(expandedRows)
    if (next.has(taskId)) {
      next.delete(taskId)
    } else {
      next.add(taskId)
    }
    setExpandedRows(next)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DONE':
      case 'PASS':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'BLOCKED':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'FAIL':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'text-rose-600 bg-rose-500/10 border-rose-500/20'
      case 'HIGH': return 'text-orange-600 bg-orange-500/10 border-orange-500/20'
      case 'MEDIUM': return 'text-blue-600 bg-blue-500/10 border-blue-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const renderTaskRows = (task: TaskResponse, level: number = 0) => {
    const isExpanded = expandedRows.has(task.taskId)
    const hasChildren = task.childTasks && task.childTasks.length > 0
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE'

    return (
      <React.Fragment key={task.taskId}>
        <TableRow 
          key={task.taskId} 
          className={cn(
            "group hover:bg-muted/50 transition-colors cursor-pointer",
            level > 0 ? "bg-muted/20" : ""
          )}
          onClick={() => onSelectTask(task)}
        >
          <TableCell className="w-0 p-4">
            {hasChildren && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={(e) => {
                  e.stopPropagation()
                  toggleRow(task.taskId)
                }}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </TableCell>
          <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }}>
            <div className="flex flex-col gap-0.5 max-w-[300px]">
              <div className="flex items-center gap-2">
                 <span className={cn(
                   "font-bold text-sm truncate",
                   task.status === 'DONE' ? "text-muted-foreground/50 line-through" : "text-foreground"
                 )}>
                   {task.title || task.description}
                 </span>
                 {task.isAdHoc && (
                   <Badge variant="outline" className="text-[10px] scale-90 border-indigo-200 text-indigo-700 bg-indigo-50 px-1 py-0">AD HOC</Badge>
                 )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                 <span className="flex items-center gap-0.5 font-bold opacity-60 tracking-tighter uppercase"><Lock className="h-2.5 w-2.5" /> WO-{task.woId}</span>
                 {task.parentTaskId && <span className="flex items-center gap-0.5"><ArrowRight className="h-2.5 w-2.5" /> Derived Task</span>}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1 w-[120px]">
               <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                  <span>Progress</span>
                  <span className="text-primary">{Math.round(task.progress || 0)}%</span>
               </div>
               <Progress value={task.progress || 0} className="h-1.5 bg-muted" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2 min-w-[140px]">
               <User className="h-3.5 w-3.5 text-slate-400" />
               <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{task.assignedToName || 'Unassigned'}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Technician</span>
               </div>
            </div>
          </TableCell>
          <TableCell>
             <Badge variant="outline" className={`text-[10px] font-bold border ${getPriorityColor(task.priority || 'MEDIUM')}`}>
               {task.priority || 'MEDIUM'}
             </Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={`font-bold text-[10px] tracking-tight ${getStatusBadge(task.status)} uppercase`}>
              {task.status.replace('_', ' ')}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
               <div className={`p-1.5 rounded-lg ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-muted text-muted-foreground'}`}>
                  <Calendar className="h-4 w-4" />
               </div>
               <div className="flex flex-col">
                  <span className={`text-xs font-bold tracking-tight ${isOverdue ? 'text-rose-500' : 'text-foreground/90'}`}>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No Date'}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">Due Date</span>
               </div>
            </div>
          </TableCell>
          <TableCell className="text-right">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}>
                      <Wrench className="h-4 w-4 mr-2" /> View Details
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem className="text-emerald-600 dark:text-emerald-400" onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.taskId, 'DONE'); }}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
                   </DropdownMenuItem>
                   <DropdownMenuItem className="text-rose-600" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.taskId); }}>
                      <AlertCircle className="h-4 w-4 mr-2" /> Delete Task
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && task.childTasks!.map(child => renderTaskRows(child, level + 1))}
      </React.Fragment>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border/60 shadow-xl overflow-hidden shadow-primary/5">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[10px]"></TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Execution Task</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status & Progress</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Assigned To</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Priority</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Deadline</TableHead>
            <TableHead className="w-[10px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task) => renderTaskRows(task))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                No active tasks matching the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border p-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, tasks.length)}</span> of <span className="font-medium">{tasks.length}</span> results
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
