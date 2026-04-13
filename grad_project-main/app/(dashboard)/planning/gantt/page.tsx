"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  startOfMonth,
  endOfMonth,
  differenceInDays
} from "date-fns"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Wrench,
  Clock,
  Filter,
  LayoutGrid,
  Trello
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { planningApi } from "@/lib/api/planning"
import type { MaintenancePlanResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function PlanningGanttPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [plans, setPlans] = useState<MaintenancePlanResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly")
  const [currentDate, setCurrentDate] = useState(new Date())

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const data = await planningApi.getAll()
      setPlans(data)
    } catch (error) {
      console.error("Failed to load plans", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, isAuthLoading])

  const { timelineRange, days } = useMemo(() => {
    let start, end
    if (viewMode === "weekly") {
      start = startOfWeek(currentDate)
      end = endOfWeek(currentDate)
    } else {
      start = startOfMonth(currentDate)
      end = endOfMonth(currentDate)
    }
    
    return {
      timelineRange: { start, end },
      days: eachDayOfInterval({ start, end })
    }
  }, [currentDate, viewMode])

  const nextRange = () => {
    setCurrentDate(viewMode === "weekly" ? addDays(currentDate, 7) : addMonths(currentDate, 1))
  }

  const prevRange = () => {
    setCurrentDate(viewMode === "weekly" ? addDays(currentDate, -7) : addMonths(currentDate, -1))
  }

  // Calculate bar position
  const getPosition = (dateStr: string | null | undefined) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    if (date < timelineRange.start || date > timelineRange.end) return null
    
    const diff = differenceInDays(date, timelineRange.start)
    const totalDays = days.length
    return (diff / totalDays) * 100
  }

  if (isAuthLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Timeline</h1>
          <p className="text-muted-foreground mt-1">Gantt visualization of preventive maintenance schedules.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
             <Button 
               variant={viewMode === "weekly" ? "default" : "ghost"} 
               size="sm" 
               className="h-8 rounded-md px-3"
               onClick={() => setViewMode("weekly")}
             >
               Weekly
             </Button>
             <Button 
               variant={viewMode === "monthly" ? "default" : "ghost"} 
               size="sm" 
               className="h-8 rounded-md px-3"
               onClick={() => setViewMode("monthly")}
             >
               Monthly
             </Button>
          </div>
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevRange}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {viewMode === "weekly" 
                ? `${format(timelineRange.start, 'MMM d')} - ${format(timelineRange.end, 'MMM d')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextRange}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   <span>Preventive</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span>Complete</span>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] hidden sm:block">
                {plans.length} ACTIVE PLANS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px] relative">
              {/* Timeline Header */}
              <div className="flex border-b border-border sticky top-0 bg-card/80 backdrop-blur-md z-10">
                <div className="w-64 border-r border-border p-4 bg-muted/10 shrink-0 font-bold text-xs uppercase tracking-wider">
                  Maintenance Item
                </div>
                <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                  {days.map((day, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "py-3 text-[10px] text-center border-r border-border last:border-r-0 font-medium",
                        (isSameDay(day, new Date())) ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                      )}
                    >
                      <div className="mb-0.5">{format(day, 'EEE')}</div>
                      <div>{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans Rows */}
              <div className="divide-y divide-border">
                {plans.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground italic">
                    No maintenance activities scheduled for this period.
                  </div>
                ) : plans.map((plan) => {
                  const left = getPosition(plan.nextDueDate)
                  
                  return (
                    <div key={plan.planId} className="flex group hover:bg-muted/5 transition-colors relative">
                      <div className="w-64 border-r border-border p-4 shrink-0 flex flex-col gap-1">
                        <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {plan.title}
                        </span>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0">
                             {plan.frequencyType}
                           </Badge>
                           <span className="text-[10px] text-muted-foreground italic">
                             ID: {plan.planId}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 relative h-16">
                        {/* Day vertical grid lines */}
                        <div className="absolute inset-0 grid h-full" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                          {days.map((_, i) => (
                            <div key={i} className="border-r border-border/50 h-full last:border-r-0" />
                          ))}
                        </div>

                        {/* Current Day Indicator Line */}
                        {days.some(d => isSameDay(d, new Date())) && (
                          <div 
                            className="absolute top-0 bottom-0 w-px bg-primary z-10 shadow-[0_0_8px_rgba(var(--primary),0.8)]"
                            style={{ left: `${getPosition(new Date().toISOString())}%` }}
                          />
                        )}

                        {/* Task Bar */}
                        <AnimatePresence mode="wait">
                          {left !== null && (
                            <motion.div
                              key={`${plan.planId}-${viewMode}`}
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              className="absolute top-1/2 -translate-y-1/2 h-8 z-20"
                              style={{ 
                                left: `${left}%`, 
                                width: `calc(${100/days.length}% - 8px)`
                              }}
                            >
                              <div className="h-full w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center group/bar cursor-pointer relative">
                                 <Wrench className="h-3.5 w-3.5 text-white" />
                                 
                                 {/* Tooltip */}
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none z-30">
                                    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl whitespace-nowrap">
                                      <p className="text-xs font-bold text-popover-foreground">{plan.title}</p>
                                      <p className="text-[10px] text-muted-foreground">Due: {format(new Date(plan.nextDueDate!), 'PPP')}</p>
                                    </div>
                                    <div className="w-2 h-2 bg-popover border-b border-r border-border rotate-45 mx-auto -mt-1" />
                                 </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
