"use client"

import { useState, useEffect } from "react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from "date-fns"
import { ChevronLeft, ChevronRight, Info, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { workOrdersApi } from "@/lib/api/work-orders"
import type { WorkOrderResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await workOrdersApi.list()
        setWorkOrders(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getDayWos = (day: Date) => {
    return workOrders.filter(wo => {
      if (!wo.plannedStart && !wo.dueDate) return false
      const date = wo.plannedStart ? new Date(wo.plannedStart) : new Date(wo.dueDate!)
      return isSameDay(date, day)
    })
  }

  if (loading) {
     return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">Initializing calendar...</div>
  }

  return (
    <Card className="shadow-xl border-border/40 overflow-hidden rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/60 py-4">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <div className="flex gap-4 mt-1">
             <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-indigo-500" /> Planned
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" /> Due Date
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 rounded-lg">Today</Button>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-white"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-white"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
    </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[140px]">
          {calendarDays.map((day, idx) => {
            const dayWos = getDayWos(day)
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isTodayDay = isToday(day)

            return (
              <div 
                key={idx} 
                className={cn(
                  "border-r border-b border-border/40 p-1 flex flex-col gap-1 transition-colors hover:bg-muted/5",
                  !isCurrentMonth && "bg-muted/10 opacity-40"
                )}
              >
                <div className="flex justify-start p-1.5">
                  <span className={cn(
                    "text-xs font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                    isTodayDay && "bg-primary text-white shadow-md shadow-primary/30",
                    !isTodayDay && isCurrentMonth && "text-foreground",
                    !isTodayDay && !isCurrentMonth && "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-1 space-y-1">
                  {dayWos.map(wo => (
                    <Link key={wo.woId} href={`/work-orders/${wo.woId}`}>
                      <div className={cn(
                         "text-[10px] p-1.5 rounded-lg border flex flex-col gap-0.5 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]",
                         wo.status === 'COMPLETED' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                         wo.status === 'IN_PROGRESS' ? "bg-amber-50 border-amber-100 text-amber-800" :
                         wo.plannedStart ? "bg-indigo-50 border-indigo-100 text-indigo-800" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                      )}>
                        <div className="flex items-center justify-between">
                           <span className="font-bold tracking-tight">{wo.woCode}</span>
                           {wo.priority === 'CRITICAL' && <AlertCircle className="h-2 w-2 text-rose-500" />}
                        </div>
                        <span className="truncate opacity-90 leading-tight">{wo.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
