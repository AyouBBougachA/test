"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Calendar
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { biApi } from "@/lib/api/bi"
import type { KpiResponse } from "@/lib/api/types"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

function KpiCard({ title, value, icon, color, trend, inverseTrend = false }: any) {
  const isPositiveTrend = trend > 0;
  const isGood = inverseTrend ? !isPositiveTrend : isPositiveTrend;
  
  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tracking-tight">{value}</span>
              {trend !== undefined && (
                <span className={cn(
                  "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                  isGood ? "text-emerald-700 bg-emerald-500/10" : "text-rose-700 bg-rose-500/10"
                )}>
                  {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          <div className={cn("p-3 rounded-xl", color.replace('text-', 'bg-').replace('500', '500/10'))}>
             <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MaintenanceDashboard() {
  const { language } = useI18n()
  const [data, setData] = useState<KpiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    biApi.getKpis()
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  const woTrends = useMemo(() => {
    if (!data?.monthlyWorkOrderTrends) return []
    return Object.entries(data.monthlyWorkOrderTrends).map(([month, stats]) => ({
      month,
      Completed: stats['Completed'] || 0,
      Planned: stats['Planned'] || 0,
      Emergency: stats['Emergency'] || 0
    }))
  }, [data])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading Maintenance Analytics...</div>
  }

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Operations</h1>
          <p className="text-muted-foreground">Work order throughput and team efficiency.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
           title="Work Orders Completed" 
           value={data?.totalWorkOrders.toString() || "0"} 
           trend={12} 
           icon={<CheckCircle2 className="h-5 w-5" />}
           color="text-violet-500"
        />
        <KpiCard 
           title="Avg Response Time" 
           value={`${data?.mttr?.toFixed(1) || 2.1}h`} 
           trend={-8} 
           inverseTrend={true}
           icon={<Clock className="h-5 w-5" />}
           color="text-indigo-500"
        />
        <KpiCard 
           title="Preventive vs Corrective" 
           value={`${(100 - (data?.correctivePreventiveRatio || 35)).toFixed(0)}% / ${data?.correctivePreventiveRatio?.toFixed(0) || 35}%`} 
           trend={5} 
           icon={<TrendingUp className="h-5 w-5" />}
           color="text-blue-500"
        />
        <KpiCard 
           title="Equipment Downtime" 
           value={`${(100 - (data?.availabilityRate || 98.8)).toFixed(1)}%`} 
           trend={-3} 
           inverseTrend={true}
           icon={<AlertTriangle className="h-5 w-5" />}
           color="text-fuchsia-500"
        />
      </div>

      <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
        <CardHeader>
          <CardTitle className="text-lg">Work Order Trends</CardTitle>
          <CardDescription>Completed, planned, and emergency orders over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={woTrends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
                <Bar dataKey="Completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Planned" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Emergency" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
             </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Work Orders</CardTitle>
          <CardDescription>Latest maintenance activities</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
                 <div>
                    <h3 className="font-semibold text-foreground">MRI Scanner</h3>
                    <p className="text-sm text-muted-foreground">WO-2024-001 • Preventive</p>
                 </div>
                 <Badge className="bg-violet-500 text-white border-none">Completed</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
                 <div>
                    <h3 className="font-semibold text-foreground">CT Scanner</h3>
                    <p className="text-sm text-muted-foreground">WO-2024-002 • Corrective</p>
                 </div>
                 <Badge className="bg-muted text-foreground border-border">In Progress</Badge>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
                 <div>
                    <h3 className="font-semibold text-foreground">Ventilator</h3>
                    <p className="text-sm text-muted-foreground">WO-2024-003 • Preventive</p>
                 </div>
                 <Badge className="bg-violet-500 text-white border-none">Completed</Badge>
              </div>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
