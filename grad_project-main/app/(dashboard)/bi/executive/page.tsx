"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Activity, 
  ShieldAlert,
  Calendar,
  Download
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie,
  Legend,
  ComposedChart,
  Bar,
  Line
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { biApi } from "@/lib/api/bi"
import type { KpiResponse } from "@/lib/api/types"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

function KpiCard({ title, value, description, icon, color, trend, inverseTrend = false }: any) {
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
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={cn("p-3 rounded-xl", color.replace('text-', 'bg-').replace('500', '500/10'))}>
             <div className={color}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExecutiveDashboard() {
  const { language } = useI18n()
  const [data, setData] = useState<KpiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    biApi.getKpis()
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  const costTrends = useMemo(() => {
    if (!data?.monthlyCostTrends) return []
    return Object.entries(data.monthlyCostTrends).map(([month, cost]) => ({ month, cost }))
  }, [data])

  const statusData = useMemo(() => {
    if (!data?.woByStatus) return []
    return Object.entries(data.woByStatus).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  }, [data])

  const paretoData = useMemo(() => {
    if (!data?.paretoData) return []
    const total = Object.values(data.paretoData).reduce((a, b) => a + Number(b), 0);
    let cumulative = 0;
    return Object.entries(data.paretoData)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([name, cost]) => {
        cumulative += Number(cost);
        return {
          name,
          cost: Number(cost),
          cumuPerc: (cumulative / total) * 100
        }
      })
  }, [data])

  const projectionData = useMemo(() => {
     if (!data?.annualProjection) return []
     return Object.entries(data.annualProjection).map(([name, value]) => ({ name, value }))
  }, [data])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading Executive Dashboard...</div>
  }

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Overview</h1>
          <p className="text-muted-foreground">High-level KPIs, strategic projections, and pareto analysis.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
             <Calendar className="h-4 w-4" /> Last 12 Months
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
           title="Equipment Availability" 
           value={`${data?.availabilityRate?.toFixed(1) || 98.5}%`} 
           trend={2.3} 
           icon={<Activity className="h-5 w-5" />}
           color="text-emerald-500"
        />
        <KpiCard 
           title="Total Maintenance Cost" 
           value={`$${(data?.totalMaintenanceCost || 0).toLocaleString()}`} 
           trend={-8.5} 
           inverseTrend={true}
           icon={<DollarSign className="h-5 w-5" />}
           color="text-blue-500"
        />
        <KpiCard 
           title="Active Work Orders" 
           value={data?.activeWorkOrders.toString() || "0"} 
           trend={15} 
           inverseTrend={true}
           icon={<ShieldAlert className="h-5 w-5" />}
           color="text-rose-500"
        />
        <KpiCard 
           title="Response Time (Avg)" 
           value={`${data?.mttr?.toFixed(1) || 2.4}h`} 
           trend={-12} 
           inverseTrend={true}
           icon={<Clock className="h-5 w-5" />}
           color="text-violet-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-lg">Cost Progression (Curbe d'évolution)</CardTitle>
            <CardDescription>Monthly maintenance cost trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costTrends} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`$${value}`, "Cost"]}
                />
                <Area type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-lg">Maintenance Cost Pareto Diagram</CardTitle>
            <CardDescription>80/20 cost breakdown by equipment</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(v) => `$${v/1000}k`}/>
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(v) => `${v}%`}/>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36}/>
                <Bar yAxisId="left" dataKey="cost" name="Cost ($)" fill="#06b6d4" barSize={30} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumuPerc" name="Cumulative %" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         {/* Annual Projection */}
         <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-lg">Annual Projection (Projection Annuelle)</CardTitle>
            <CardDescription>End of year budget forecast</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projectionData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                   <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(v) => `$${v/1000}k`} />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                   <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                   <Bar dataKey="value" name="Projected Cost ($)" fill="#8b5cf6" barSize={30} radius={[0, 4, 4, 0]} >
                     {projectionData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.name.includes("Limit") ? "#ef4444" : "#8b5cf6"} />
                     ))}
                   </Bar>
                </ComposedChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Existing Status Pie Chart */}
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-lg">Equipment Status Distribution</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </motion.div>
  )
}
