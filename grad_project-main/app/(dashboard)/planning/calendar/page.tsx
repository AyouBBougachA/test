"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Wrench,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { planningApi } from "@/lib/api/planning"
import { equipmentApi } from "@/lib/api/equipment"
import type { MaintenancePlanResponse, EquipmentResponse } from "@/lib/api/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  eachDayOfInterval 
} from "date-fns"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function PlanningCalendarPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, language } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [plans, setPlans] = useState<MaintenancePlanResponse[]>([])
  const [equipmentList, setEquipmentList] = useState<EquipmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    equipmentId: "",
    frequencyType: "MONTHS",
    frequencyValue: 1,
    nextDueDate: format(new Date(), 'yyyy-MM-dd')
  })

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const [planData, eqData] = await Promise.all([
        planningApi.getAll(),
        equipmentApi.getAll()
      ])
      setPlans(planData)
      setEquipmentList(eqData)
    } catch (error) {
      console.error("Failed to load planning data", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, isAuthLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await planningApi.create({
        ...newPlan,
        equipmentId: parseInt(newPlan.equipmentId),
        frequencyValue: parseInt(String(newPlan.frequencyValue))
      })
      setIsDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Failed to create maintenance plan", error)
    }
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  })

  // Group plans by date
  const plansByDate = useMemo(() => {
    const map = new Map<string, MaintenancePlanResponse[]>()
    plans.forEach(plan => {
      if (!plan.nextDueDate) return
      const dateStr = format(new Date(plan.nextDueDate), 'yyyy-MM-dd')
      if (!map.has(dateStr)) map.set(dateStr, [])
      map.get(dateStr)?.push(plan)
    })
    return map
  }, [plans])

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Calendar</h1>
          <p className="text-muted-foreground">
            Visualize and manage your scheduled maintenance interventions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold text-lg min-w-[150px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border shadow-2xl text-foreground">
              <DialogHeader>
                <DialogTitle>Schedule Preventive Maintenance</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Define the frequency and start date for recurring equipment checkups.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Activity Title</label>
                  <Input 
                    required 
                    placeholder="e.g., Monthly Filter Replacement" 
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Equipment</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newPlan.equipmentId}
                    onChange={(e) => setNewPlan({...newPlan, equipmentId: e.target.value})}
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map(eq => (
                      <option key={eq.equipmentId} value={eq.equipmentId}>{eq.name} ({eq.serialNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Frequency Type</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newPlan.frequencyType}
                      onChange={(e) => setNewPlan({...newPlan, frequencyType: e.target.value})}
                    >
                      <option value="DAYS">Days</option>
                      <option value="WEEKS">Weeks</option>
                      <option value="MONTHS">Months</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Every (Value)</label>
                    <Input 
                      type="number"
                      required
                      min="1"
                      value={newPlan.frequencyValue}
                      onChange={(e) => setNewPlan({...newPlan, frequencyValue: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Initial Due Date</label>
                  <Input 
                    type="date"
                    required
                    value={newPlan.nextDueDate}
                    onChange={(e) => setNewPlan({...newPlan, nextDueDate: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Create Plan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border">
              {isLoading ? (
                <div className="col-span-7 bg-card py-40 flex items-center justify-center">
                   <div className="animate-pulse text-muted-foreground italic">Synchronizing with scheduler...</div>
                </div>
              ) : calendarDays.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayPlans = plansByDate.get(dateStr) || []
                const isCurrentMonth = isSameMonth(day, monthStart)
                
                return (
                  <div 
                    key={i} 
                    className={`min-h-[140px] bg-card p-2 transition-colors hover:bg-muted/10 ${
                      !isCurrentMonth ? 'bg-muted/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-sm font-medium p-1 w-7 h-7 flex items-center justify-center rounded-full ${
                         isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : 
                         !isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'
                       }`}>
                         {format(day, 'd')}
                       </span>
                    </div>
                    <div className="space-y-1">
                      {dayPlans.map((plan, idx) => (
                        <div 
                          key={idx}
                          className="text-[10px] p-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-medium truncate flex items-center gap-1.5"
                          title={plan.title}
                        >
                          <Wrench className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{plan.title}</span>
                        </div>
                      ))}
                      {dayPlans.length > 3 && (
                        <div className="text-[10px] text-center text-muted-foreground py-0.5">
                          + {dayPlans.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend & Summary */}
      <motion.div variants={fadeInUp} className="grid gap-6 md:grid-cols-2">
         <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Legend</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-blue-500" />
                     <span className="text-xs">Preventive</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-rose-500" />
                     <span className="text-xs">Missed / Late</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-emerald-500" />
                     <span className="text-xs">Completed</span>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex gap-6">
                  <div>
                    <div className="text-2xl font-bold">{plans.length}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Total Planned</div>
                  </div>
                  <div className="w-px bg-border h-10 self-center" />
                  <div>
                    <div className="text-2xl font-bold text-amber-500">
                      {plans.filter(p => p.isActive).length}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Active Plans</div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </motion.div>
    </motion.div>
  )
}
