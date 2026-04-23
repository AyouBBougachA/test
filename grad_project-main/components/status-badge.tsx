"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  PauseCircle,
  PlayCircle,
  Timer,
  CheckSquare
} from "lucide-react"

export type StatusType = 
  | 'DONE' | 'PASS' 
  | 'IN_PROGRESS' | 'EXECUTING'
  | 'BLOCKED' | 'ON_HOLD'
  | 'FAIL' | 'REJECTED'
  | 'TODO' | 'PENDING' | 'CREATED' | 'ASSIGNED' | 'SCHEDULED'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const s = status.toUpperCase()

  const config: Record<string, { label: string; icon: any; classes: string }> = {
    DONE: { label: 'Completed', icon: CheckCircle2, classes: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
    PASS: { label: 'Passed', icon: CheckCircle2, classes: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
    IN_PROGRESS: { label: 'In Progress', icon: Timer, classes: 'bg-info/10 text-info border-info/20 hover:bg-info/20' },
    EXECUTING: { label: 'Executing', icon: Timer, classes: 'bg-info/10 text-info border-info/20 hover:bg-info/20' },
    BLOCKED: { label: 'Blocked', icon: AlertTriangle, classes: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20' },
    ON_HOLD: { label: 'On Hold', icon: PauseCircle, classes: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
    FAIL: { label: 'Failed', icon: XCircle, classes: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20' },
    REJECTED: { label: 'Rejected', icon: XCircle, classes: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20' },
    TODO: { label: 'To Do', icon: Square, classes: 'bg-muted text-muted-foreground border-border hover:bg-muted/80' },
    PENDING: { label: 'Pending', icon: Clock, classes: 'bg-muted text-muted-foreground border-border hover:bg-muted/80' },
    CREATED: { label: 'Created', icon: PlayCircle, classes: 'bg-muted text-muted-foreground border-border hover:bg-muted/80' },
    ASSIGNED: { label: 'Assigned', icon: User, classes: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
    SCHEDULED: { label: 'Scheduled', icon: Calendar, classes: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
  }

  // Fallback for custom or unknown statuses
  const item = config[s] || { label: status, icon: Clock, classes: 'bg-muted text-muted-foreground border-border' }
  const Icon = item.icon

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-bold text-[10px] uppercase tracking-tight py-0.5 px-2 rounded-full transition-all duration-300",
        item.classes,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {item.label}
    </Badge>
  )
}

function Square(props: any) {
  return <div className="h-2.5 w-2.5 border border-current rounded-sm mr-1" {...props} />
}

function User(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-3 w-3 mr-1" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

function Calendar(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar h-3 w-3 mr-1" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
}
