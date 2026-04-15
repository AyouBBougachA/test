"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { usersApi } from "@/lib/api/users"
import { workOrdersApi } from "@/lib/api/work-orders"
import type { UserResponse, WorkOrderResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

export default function WorkloadPage() {
  const [techs, setTechs] = useState<UserResponse[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [uData, woData] = await Promise.all([
          usersApi.getAll(),
          workOrdersApi.list()
        ])
        // Filter only technicians (Role ID 3 or name contains Tech)
        setTechs(uData.filter(u => u.roleId === 3 || u.roleName === 'TECHNICIAN'))
        setWorkOrders(woData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const workloadData = useMemo(() => {
    return techs.map(tech => {
      const assignedWos = workOrders.filter(wo => 
        (wo.assignedToUserId === tech.id || 
         (wo.secondaryAssignees && wo.secondaryAssignees.some(s => s.userId === tech.id))) &&
        wo.status !== 'COMPLETED' && wo.status !== 'CLOSED' && wo.status !== 'CANCELLED'
      )

      const highPriority = assignedWos.filter(wo => wo.priority === 'CRITICAL' || wo.priority === 'HIGH').length
      
      return {
        name: tech.fullName,
        count: assignedWos.length,
        highPriority,
        techId: tech.id,
        initials: tech.fullName.split(' ').map(n => n[0]).join('')
      }
    }).sort((a, b) => b.count - a.count)
  }, [techs, workOrders])

  const filteredData = workloadData.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">Analyzing team capacity...</div>
  }

  const avgLoad = workloadData.length > 0 
    ? workloadData.reduce((acc, curr) => acc + curr.count, 0) / workloadData.length 
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
         <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-600">
                  <Users className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Technicians</p>
                  <p className="text-2xl font-bold">{techs.length}</p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-600">
                  <Clock className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Load / Tech</p>
                  <p className="text-2xl font-bold">{avgLoad.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">WO</span></p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/20 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="bg-rose-500/20 p-3 rounded-2xl text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
               </div>
               <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Path</p>
                  <p className="text-2xl font-bold">{workOrders.filter(wo => wo.priority === 'CRITICAL' && wo.status !== 'COMPLETED').length}</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* CHART SECTION */}
        <Card className="lg:col-span-2 shadow-sm border-border/60 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60">
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle>Resource Allocation</CardTitle>
                  <CardDescription>Active work orders per technician</CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12, fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         const data = payload[0].payload
                         return (
                           <div className="bg-white p-3 rounded-xl shadow-xl border border-border/60">
                             <p className="font-bold text-sm text-foreground">{data.name}</p>
                             <div className="mt-2 space-y-1">
                               <p className="text-xs text-muted-foreground flex items-center justify-between gap-4">
                                  <span>Active WOs:</span>
                                  <span className="font-bold text-foreground">{data.count}</span>
                               </p>
                               <p className="text-xs text-muted-foreground flex items-center justify-between gap-4">
                                  <span>High Priority:</span>
                                  <span className="font-bold text-rose-600">{data.highPriority}</span>
                               </p>
                             </div>
                           </div>
                         )
                       }
                       return null
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                    {filteredData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.count > 5 ? '#f43f5e' : entry.count > 3 ? '#f59e0b' : '#6366f1'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* DETAILS SECTION */}
        <div className="space-y-6">
           <Card className="shadow-sm border-border/60 rounded-3xl">
              <CardHeader className="pb-2">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Capacity Details</CardTitle>
                    <div className="relative w-32">
                       <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                       <Input 
                        placeholder="Search..." 
                        className="pl-7 h-7 text-[10px] rounded-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                       />
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="px-0">
                 <div className="max-h-[500px] overflow-y-auto px-6 space-y-4">
                    {filteredData.map(data => (
                      <div key={data.techId} className="space-y-2">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                  {data.initials}
                               </div>
                               <span className="text-sm font-medium">{data.name}</span>
                            </div>
                            <Badge variant={data.count > 5 ? 'destructive' : data.count > 3 ? 'secondary' : 'outline'} className="text-[10px] h-5">
                               {data.count} Tasks
                            </Badge>
                         </div>
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                               <span>Saturation</span>
                               <span>{Math.min(100, Math.round(data.count / 8 * 100))}%</span>
                            </div>
                            <Progress value={(data.count / 8) * 100} className="h-1.5 bg-muted" />
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-sm border-border/60 rounded-3xl border-dashed bg-muted/5">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center py-10 opacity-60">
                 <div className="bg-muted p-3 rounded-full mb-3">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <p className="text-xs font-medium text-foreground">Advanced Planning</p>
                 <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">Integration with GANTT chart and automated shift scheduling coming soon.</p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
