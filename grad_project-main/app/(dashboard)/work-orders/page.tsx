"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  Wrench
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
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { workOrdersApi } from "@/lib/api/work-orders"
import { equipmentApi } from "@/lib/api/equipment"
import type { WorkOrderResponse, EquipmentResponse } from "@/lib/api/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function WorkOrdersPage() {
  const { t, language } = useI18n()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  const [equipmentList, setEquipmentList] = useState<EquipmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const [newWO, setNewWO] = useState({
    title: "",
    description: "",
    equipmentId: "",
    woType: "CORRECTIVE",
    priority: "MEDIUM",
    dueDate: ""
  })

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const [woData, eqData] = await Promise.all([
        workOrdersApi.list(),
        equipmentApi.getAll()
      ])
      setWorkOrders(woData)
      setEquipmentList(eqData)
    } catch (error) {
      console.error("Failed to load work orders", error)
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
      await workOrdersApi.create({
        ...newWO,
        equipmentId: parseInt(newWO.equipmentId)
      })
      setIsDialogOpen(false)
      setNewWO({
        title: "",
        description: "",
        equipmentId: "",
        woType: "CORRECTIVE",
        priority: "MEDIUM",
        dueDate: ""
      })
      loadData()
    } catch (error) {
      console.error("Failed to create work order", error)
    }
  }

  const filteredOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.title.toLowerCase().includes(search.toLowerCase()) || 
                           wo.woCode.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || wo.status.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [workOrders, search, filter])

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">Completed</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">In Progress</Badge>
      case "ON_HOLD":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">On Hold</Badge>
      case "CANCELLED":
        return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20">Cancelled</Badge>
      default:
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20">Open</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500 hover:bg-orange-600 border-none text-white">High</Badge>
      case "MEDIUM":
        return <Badge className="bg-amber-500 hover:bg-amber-600 border-none text-white">Medium</Badge>
      default:
        return <Badge className="bg-blue-500 hover:bg-blue-600 border-none text-white">Low</Badge>
    }
  }

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="flex-1 space-y-6 overflow-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {language === 'fr' ? 'Ordres de Travail' : 'Work Orders'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Gérez vos interventions de maintenance et suivez leur progression.' 
              : 'Manage your maintenance interventions and track their progress.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Nouvel Ordre' : 'New Work Order'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border shadow-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Intervention</DialogTitle>
                <DialogDescription>
                  Fill in the details to generate a new work order.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    required 
                    placeholder="e.g., Annual MRI Inspection" 
                    value={newWO.title}
                    onChange={(e) => setNewWO({...newWO, title: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Equipment</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newWO.equipmentId}
                    onChange={(e) => setNewWO({...newWO, equipmentId: e.target.value})}
                  >
                    <option value="">Select Equipment...</option>
                    {equipmentList.map(eq => (
                      <option key={eq.equipmentId} value={eq.equipmentId}>{eq.name} ({eq.serialNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Type</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newWO.woType}
                      onChange={(e) => setNewWO({...newWO, woType: e.target.value})}
                    >
                      <option value="CORRECTIVE">Corrective</option>
                      <option value="PREVENTIVE">Preventive</option>
                      <option value="PREDICTIVE">Predictive</option>
                      <option value="REGULATORY">Regulatory</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newWO.priority}
                      onChange={(e) => setNewWO({...newWO, priority: e.target.value})}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter technical details..."
                    value={newWO.description}
                    onChange={(e) => setNewWO({...newWO, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Create Work Order</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: language === 'fr' ? 'En Cours' : 'In Progress', 
            count: workOrders.filter(wo => wo.status === 'IN_PROGRESS').length, 
            icon: Clock, 
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
          { 
            title: language === 'fr' ? 'Ouverts' : 'Open', 
            count: workOrders.filter(wo => wo.status === 'OPEN').length, 
            icon: AlertCircle, 
            color: "text-purple-500",
            bg: "bg-purple-500/10"
          },
          { 
            title: language === 'fr' ? 'Terminés' : 'Completed', 
            count: workOrders.filter(wo => wo.status === 'COMPLETED').length, 
            icon: CheckCircle2, 
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
          },
          { 
            title: language === 'fr' ? 'Urgents' : 'Urgent', 
            count: workOrders.filter(wo => wo.priority === 'CRITICAL').length, 
            icon: AlertCircle, 
            color: "text-rose-500",
            bg: "bg-rose-500/10"
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
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
            placeholder={language === 'fr' ? "Rechercher un ordre..." : "Search work orders..."} 
            className="pl-9 bg-card/50 backdrop-blur-sm border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card/50 border-border">
                <Filter className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Filtrer' : 'Filter'}: {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("open")}>Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("in_progress")}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Work Orders List */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl">Active Interventions</CardTitle>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {filteredOrders.length} {language === 'fr' ? 'résultats' : 'results'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading work orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No work orders found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Code</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Title</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Equipment</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Priority</th>
                      <th className="text-left py-4 px-6 font-semibold text-foreground">Due Date</th>
                      <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((wo) => (
                      <tr key={wo.woId} className="border-b border-border hover:bg-muted/30 transition-colors group">
                        <td className="py-4 px-6 font-mono text-xs text-primary font-bold">
                          {wo.woCode}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-medium text-foreground truncate">{wo.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{wo.description}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{wo.equipmentName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(wo.status)}
                        </td>
                        <td className="py-4 px-6">
                          {getPriorityBadge(wo.priority)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {wo.dueDate 
                                ? format(new Date(wo.dueDate), 'MMM d, yyyy') 
                                : 'No date'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
