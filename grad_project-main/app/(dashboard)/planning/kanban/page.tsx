"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { workOrdersApi } from "@/lib/api/work-orders"
import type { WorkOrderResponse } from "@/lib/api/types"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { id: 'CREATED', label: 'Backlog', color: 'bg-zinc-100 text-zinc-700' },
  { id: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-50 text-blue-700' },
  { id: 'SCHEDULED', label: 'Scheduled', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-50 text-amber-700' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-rose-50 text-rose-700' },
  { id: 'COMPLETED', label: 'Done', color: 'bg-emerald-50 text-emerald-700' },
]

export default function KanbanPage() {
  const { user } = useAuth()
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const isManager = user?.roleName?.toUpperCase() === 'ADMIN' || user?.roleName?.toUpperCase() === 'MAINTENANCE_MANAGER'

  const loadData = async () => {
    try {
      const data = await workOrdersApi.list()
      setWorkOrders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDragStart = (e: React.DragEvent, woId: number) => {
    if (!isManager) return
    setDraggingId(woId)
    e.dataTransfer.setData("woId", woId.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const idStr = e.dataTransfer.getData("woId")
    if (!idStr) return
    const id = parseInt(idStr)
    
    setDraggingId(null)
    
    // Optimistic Update
    setWorkOrders(prev => prev.map(wo => wo.woId === id ? { ...wo, status } : wo))
    
    try {
      await workOrdersApi.updateStatus(id, { status })
    } catch (e) {
      console.error(e)
      loadData() // Rollback
    }
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">Loading board...</div>
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-8 min-h-[70vh]">
      {COLUMNS.map(column => {
        const columnWos = workOrders.filter(wo => wo.status === column.id)
        
        return (
          <div 
            key={column.id}
            className="flex-shrink-0 w-80 flex flex-col gap-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", column.color.split(' ')[0])} />
                <h3 className="font-bold text-sm text-foreground/80">{column.label}</h3>
                <Badge variant="outline" className="text-[10px] h-5 bg-muted/30 border-none font-medium">
                  {columnWos.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className={cn(
              "flex-1 bg-muted/20 rounded-2xl p-2 space-y-3 min-h-[500px] border border-transparent transition-colors",
              draggingId && "border-primary/20 bg-primary/5"
            )}>
              <AnimatePresence mode="popLayout">
                {columnWos.map(wo => (
                  <motion.div
                    key={wo.woId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable={isManager}
                    onDragStart={(e) => handleDragStart(e, wo.woId)}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      "bg-white p-4 rounded-xl shadow-sm border border-border/60 group cursor-grab active:cursor-grabbing",
                      !isManager && "cursor-default drag-none"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-bold text-muted-foreground tracking-widest">{wo.woCode}</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-4 border-none",
                          wo.priority === 'CRITICAL' ? "bg-rose-100 text-rose-700" :
                          wo.priority === 'HIGH' ? "bg-amber-100 text-amber-700" :
                          "bg-zinc-100 text-zinc-700"
                        )}
                      >
                        {wo.priority}
                      </Badge>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                      {wo.title}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {wo.equipmentName && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span className="truncate">{wo.equipmentName}</span>
                        </div>
                      )}
                      {wo.plannedStart && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(wo.plannedStart).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                          {wo.assignedToName?.[0] || '?'}
                        </div>
                        <span className="text-[10px] font-medium text-foreground/70 truncate w-24">
                          {wo.assignedToName || 'Unassigned'}
                        </span>
                      </div>
                      <Link href={`/work-orders/${wo.woId}`}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
