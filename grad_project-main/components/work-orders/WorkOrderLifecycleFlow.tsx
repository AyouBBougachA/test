"use client"

import { motion } from "framer-motion"
import { 
  FileText, 
  Users, 
  Clock, 
  Play, 
  CheckSquare, 
  CheckCircle2, 
  Archive,
  AlertTriangle,
  XCircle,
  ChevronRight
} from "lucide-react"

interface Stage {
  key: string
  label: string
  shortLabel: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  ringColor: string
  description: string
}

const STAGES: Stage[] = [
  {
    key: "CREATED",
    label: "Created",
    shortLabel: "New",
    icon: <FileText className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-600",
    ringColor: "ring-blue-600/20",
    description: "WO has been raised from a claim or manually"
  },
  {
    key: "ASSIGNED",
    label: "Assigned",
    shortLabel: "Assigned",
    icon: <Users className="h-4 w-4" />,
    color: "text-violet-600",
    bgColor: "bg-violet-600",
    borderColor: "border-violet-600",
    ringColor: "ring-violet-600/20",
    description: "Technician has been assigned to the intervention"
  },
  {
    key: "SCHEDULED",
    label: "Scheduled",
    shortLabel: "Scheduled",
    icon: <Clock className="h-4 w-4" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-600",
    borderColor: "border-indigo-600",
    ringColor: "ring-indigo-600/20",
    description: "Planned start date and deadline set"
  },
  {
    key: "IN_PROGRESS",
    label: "In Progress",
    shortLabel: "Active",
    icon: <Play className="h-4 w-4" />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-600",
    borderColor: "border-cyan-600",
    ringColor: "ring-cyan-600/20",
    description: "Technician is actively executing tasks"
  },
  {
    key: "COMPLETED",
    label: "Completed",
    shortLabel: "Done",
    icon: <CheckSquare className="h-4 w-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-600",
    borderColor: "border-emerald-600",
    ringColor: "ring-emerald-600/20",
    description: "All tasks completed, awaiting manager validation"
  },
  {
    key: "VALIDATED",
    label: "Validated",
    shortLabel: "Validated",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-teal-600",
    bgColor: "bg-teal-600",
    borderColor: "border-teal-600",
    ringColor: "ring-teal-600/20",
    description: "Manager has approved and signed off the work"
  },
  {
    key: "CLOSED",
    label: "Closed",
    shortLabel: "Closed",
    icon: <Archive className="h-4 w-4" />,
    color: "text-slate-500",
    bgColor: "bg-slate-500",
    borderColor: "border-slate-500",
    ringColor: "ring-slate-500/20",
    description: "Archived & closed. Labor costs are finalized"
  },
]

const STATUS_ORDER = ["CREATED", "ASSIGNED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "VALIDATED", "CLOSED"]

interface WorkOrderLifecycleFlowProps {
  status: string
}

export function WorkOrderLifecycleFlow({ status }: WorkOrderLifecycleFlowProps) {
  if (!status) return null
  const upperStatus = status.toUpperCase()
  const isCancelled = upperStatus === "CANCELLED"
  const isOnHold = upperStatus === "ON_HOLD"
  const isSpecial = isCancelled || isOnHold

  const currentIndex = STATUS_ORDER.indexOf(upperStatus)

  const getStageState = (index: number) => {
    if (isSpecial) return index < currentIndex ? "done" : "upcoming"
    if (index < currentIndex) return "done"
    if (index === currentIndex) return "active"
    return "upcoming"
  }

  return (
    <div className="w-full space-y-4">
      {/* Special status banners */}
      {isOnHold && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          This work order is currently <strong>On Hold</strong> — execution is paused pending resolution.
        </motion.div>
      )}
      {isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
          This work order has been <strong>Cancelled</strong> and is no longer active.
        </motion.div>
      )}

      {/* Main flow track */}
      <div className="relative bg-card rounded-2xl border border-border/60 shadow-sm p-5 overflow-hidden">
        {/* Background shimmer stripe for active state */}
        {!isSpecial && (
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${Math.max(5, ((currentIndex + 0.5) / STAGES.length) * 100)}%` }}
          />
        )}

        <div className="overflow-x-auto pb-6 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="flex items-center justify-start md:justify-center gap-3 min-w-max mx-auto py-2">
            {STAGES.map((stage, index) => {
              const state = getStageState(index)
              const isLast = index === STAGES.length - 1

              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <StageNode stage={stage} state={state} />
                  {!isLast && (
                    <div className={`h-[3px] w-12 sm:w-16 md:w-24 rounded-full transition-all duration-500 ${
                      state === "done" ? "bg-emerald-400" : "bg-slate-100"
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current stage detail */}
        <div className="mt-5 pt-4 border-t border-border/50">
          {isSpecial ? (
            <p className="text-xs text-slate-500 italic">Flow paused at: <strong>{upperStatus.replace("_", " ")}</strong></p>
          ) : (
            (() => {
              const current = STAGES[currentIndex] ?? STAGES[0]
              return (
                <div className="flex items-center gap-3">
                  <div className={`${current.bgColor} p-3 rounded-2xl text-white shadow-lg shadow-${current.bgColor}/20 transition-transform duration-300 hover:scale-105`}>
                    {current.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current Stage</p>
                    <p className="text-base font-bold text-slate-900 leading-tight">{current.label}</p>
                    <p className="text-xs text-slate-500 font-medium">{current.description}</p>
                  </div>
                  {currentIndex < STAGES.length - 1 && (
                    <div className="ml-auto flex items-center gap-2 text-slate-300">
                      <ChevronRight className="h-4 w-4" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                        Next: {STAGES[currentIndex + 1]?.label}
                      </span>
                    </div>
                  )}
                </div>
              )
            })()
          )}
        </div>
      </div>
    </div>
  )
}

function StageNode({ stage, state }: { stage: Stage; state: "done" | "active" | "upcoming" }) {
  return (
    <div className="flex flex-col items-center gap-3 group" title={stage.description}>
      <div className="relative">
        {state === "active" && (
          <span className={`absolute inset-0 rounded-full animate-ping opacity-30 ${stage.bgColor}`} />
        )}
        <motion.div
          initial={false}
          animate={{
            scale: state === "active" ? 1.15 : 1,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`
            relative h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shadow-sm
            ${state === "done"
              ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200"
              : state === "active"
              ? `${stage.bgColor} ${stage.borderColor} text-white ring-4 ${stage.ringColor} shadow-lg`
              : "bg-muted/30 border-border text-muted-foreground"
            }
          `}
        >
          {state === "done" ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <div className="scale-125 md:scale-150">{stage.icon}</div>
          )}
        </motion.div>
      </div>
      <span className={`text-[11px] md:text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
        state === "done" ? "text-emerald-600" : 
        state === "active" ? stage.color : 
        "text-slate-400"
      }`}>
        {stage.shortLabel}
      </span>
    </div>
  )
}
