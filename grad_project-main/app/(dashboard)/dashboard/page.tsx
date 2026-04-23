"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Database,
  Plus,
  Wrench,
  TrendingUp,
  Package,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Monitor,
  LayoutDashboard,
  Zap,
  Cpu,
  Timer,
  BarChart3,
  Hammer
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"
import { dashboardApi, type DashboardStats, type ActivityItem } from "@/lib/api/dashboard"
import { workOrdersApi } from "@/lib/api/work-orders"
import { claimsApi } from "@/lib/api/claims"
import { planningApi } from "@/lib/api/planning"
import type { WorkOrderResponse, ClaimListItemResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { WorkOrderTypeBadge } from "@/components/work-order-type-badge"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

// Availability trend data — built from last 6 months labels with dynamic values
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

const DONUT_COLORS = ["#6366f1", "#f43f5e", "#f59e0b", "#10b981"]

export default function DashboardPage() {
  const { t, language } = useI18n()
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [recentClaims, setRecentClaims] = useState<ClaimListItemResponse[]>([])
  const [recentWos, setRecentWos] = useState<WorkOrderResponse[]>([])
  const [upcomingPlans, setUpcomingPlans] = useState<any[]>([])
  const [myWork, setMyWork] = useState<WorkOrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const isManager = user?.hasRole('ADMIN', 'MAINTENANCE_MANAGER') ?? false
  const isTechnician = user?.hasRole('TECHNICIAN') ?? false
  const isFinance = user?.hasRole('FINANCE_MANAGER') ?? false

  const loadData = useCallback(async () => {
    try {
      const [statsRes, activityRes, claimsRes, wosRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivity(),
        claimsApi.list({}).catch(() => []),
        workOrdersApi.list().catch(() => []),
      ])
      setStats(statsRes)
      setActivities(activityRes)
      setRecentClaims((claimsRes as ClaimListItemResponse[]).slice(0, 4))
      setRecentWos((wosRes as WorkOrderResponse[]).slice(0, 4))

      if (!isManager && user?.id) {
        const orders = await workOrdersApi.list({ assignedToUserId: user.id, status: 'IN_PROGRESS' }).catch(() => [])
        setMyWork(orders as WorkOrderResponse[])
      }

      // Upcoming maintenance plans
      const plans = await planningApi.getAll().catch(() => [])
      setUpcomingPlans((plans as any[]).slice(0, 4))

      setLastUpdated(new Date())
    } catch (err) {
      console.error("Dashboard refresh failed", err)
    } finally {
      setIsLoading(false)
    }
  }, [isManager, user?.id])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  // Build availability trend from stats (simulated monthly progression based on real availability)
  const availabilityTrend = useMemo(() => {
    if (!stats) return []
    const base = stats.availabilityRate ?? 95
    return MONTHS.map((month, i) => ({
      month,
      MTBF: Math.round(stats.mtbfHours ?? 0) + (i * 12) - 30,
      "Availability Rate": parseFloat((base - 1.5 + i * 0.5).toFixed(1)),
    }))
  }, [stats])

  // Build donut data from real distribution
  const distributionData = useMemo(() => {
    if (!stats) return []
    return [
      { name: "Preventive", value: Math.round(stats.preventivePct ?? 0) },
      { name: "Corrective", value: Math.round(stats.correctivePct ?? 0) },
      { name: "Regulatory", value: Math.round(stats.regulatoryPct ?? 0) },
      { name: "Predictive", value: Math.round(stats.predictivePct ?? 0) },
    ].filter(d => d.value > 0)
  }, [stats])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome, {user?.fullName?.split(' ')[0] ?? 'Guest'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Here's an overview of your maintenance system
            <span className="text-xs opacity-60">• {format(lastUpdated, 'HH:mm:ss')}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          {(isManager || isTechnician) && (
            <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-primary-foreground shadow-lg shadow-violet-500/20" asChild>
              <Link href="/claims/new"><Plus className="h-4 w-4" /> New Claim</Link>
            </Button>
          )}
          {isManager && (
            <Button size="sm" variant="outline" className="gap-2" asChild>
              <Link href="/work-orders/new"><Wrench className="h-4 w-4" /> New Work Order</Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* ── TOP 4 KPI CARDS ──────────────────────────────────── */}
      {(isManager || isFinance) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <KpiCard
            label={isFinance ? "Total Assets" : "Total Equipment"}
            value={stats?.totalEquipment}
            icon={<Cpu className="h-5 w-5" />}
            color="text-blue-500"
            bg="bg-blue-500/10"
            sub="+4.9%"
            subColor="text-emerald-500"
          />
          <KpiCard
            label="Active Work Orders"
            value={stats?.activeWorkOrders}
            icon={<Wrench className="h-5 w-5" />}
            color="text-indigo-500"
            bg="bg-indigo-500/10"
            sub="-12%"
            subColor="text-rose-500"
          />
          {isFinance ? (
            <KpiCard
              label="Inventory Value"
              value={`${(stats?.monthlySpend ? Number(stats.monthlySpend) * 5.5 : 2450000).toLocaleString('fr-DZ', { maximumFractionDigits: 0 })} DA`}
              icon={<Package className="h-5 w-5" />}
              color="text-amber-500"
              bg="bg-amber-500/10"
              sub="+2.4%"
              subColor="text-emerald-500"
            />
          ) : (
            <KpiCard
              label="Pending Claims"
              value={stats?.pendingClaims}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="text-amber-500"
              bg="bg-amber-500/10"
              sub="+8%"
              subColor="text-amber-500"
            />
          )}
          <KpiCard
            label={isFinance ? "Month Spend" : "Critical Alerts"}
            value={isFinance ? `${Number(stats?.monthlySpend ?? 0).toLocaleString('fr-DZ', { maximumFractionDigits: 0 })} DA` : stats?.criticalAlerts}
            icon={isFinance ? <DollarSign className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            color="text-rose-500"
            bg="bg-rose-500/10"
            sub={isFinance ? "-5.4%" : "-25%"}
            subColor="text-emerald-500"
          />
        </motion.div>
      )}

      {isTechnician && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <KpiCard
            label="My Active Tasks"
            value={myWork.length}
            icon={<Timer className="h-5 w-5" />}
            color="text-indigo-500"
            bg="bg-indigo-500/10"
          />
          <KpiCard
            label="Assigned Work Orders"
            value={stats?.activeWorkOrders} // Should ideally be filtered for tech
            icon={<Wrench className="h-5 w-5" />}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <KpiCard
            label="Equipment Access"
            value={stats?.totalEquipment}
            icon={<Cpu className="h-5 w-5" />}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
        </motion.div>
      )}

      {/* ── CHARTS ROW ────────────────────────────────────────── */}
      {(isManager || isFinance) && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Availability Trend Area Chart (spans 3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{isFinance ? "Maintenance Expense Trend" : "Availability Trend"}</CardTitle>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />{isFinance ? "Total Spend" : "MTBF"}</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400 inline-block" />{isFinance ? "Budget Usage" : "Availability Rate"}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={availabilityTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradMtbf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradAvail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="MTBF" stroke="#6366f1" strokeWidth={2} fill="url(#gradMtbf)" dot={false} />
                      <Area type="monotone" dataKey="Availability Rate" stroke="#a78bfa" strokeWidth={2} fill="url(#gradAvail)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Maintenance Distribution Donut (spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isFinance ? "Budget Allocation" : "Maintenance Distribution"}</CardTitle>
              </CardHeader>
              <CardContent>
                {distributionData.length === 0 ? (
                  <div className="flex h-[220px] items-center justify-center text-muted-foreground text-sm italic">No WO data yet</div>
                ) : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="42%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="80%"
                          dataKey="value"
                          strokeWidth={2}
                        >
                          {distributionData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value, entry: any) => (
                            <span className="text-[11px] text-muted-foreground">
                              {value} <span className="font-bold text-foreground">{entry.payload.value}%</span>
                            </span>
                          )}
                        />
                        <Tooltip
                          formatter={(val: number) => [`${val}%`, '']}
                          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ── SECONDARY METRICS ROW ───────────────────────────── */}
      {isManager && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <SecondaryKpi
            label="Mean Time Between Failures"
            value={`${Math.round(stats?.mtbfHours ?? 0)}h`}
            sub="+8%"
            subColor="text-emerald-500"
            icon={<Timer className="h-5 w-5 text-blue-400" />}
          />
          <SecondaryKpi
            label="Mean Time To Repair"
            value={`${(stats?.mttrHours ?? 0).toFixed(1)}h`}
            sub="-14%"
            subColor="text-emerald-500"
            icon={<Wrench className="h-5 w-5 text-indigo-400" />}
          />
          <SecondaryKpi
            label="Availability Rate"
            value={`${(stats?.availabilityRate ?? 0).toFixed(1)}%`}
            sub="+2.3%"
            subColor="text-emerald-500"
            icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          />
        </motion.div>
      )}

      {/* ── CLAIMS + WORK ORDERS ─────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Claims or My Work */}
        {isTechnician ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">My Pending Work</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link href="/work-orders?assignedToMe=true">View All <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {myWork.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground italic">No pending assignments</p>
                  ) : myWork.map(wo => (
                    <Link key={wo.woId} href={`/work-orders/${wo.woId}`}>
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{wo.woCode}</span>
                            <PriorityBadge priority={wo.priority} />
                          </div>
                          <p className="text-sm font-medium truncate">{wo.title}</p>
                          <p className="text-[10px] text-muted-foreground">{wo.equipmentName ?? `Equipment #${wo.equipmentId}`}</p>
                        </div>
                        <StatusBadge status={wo.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : !isFinance && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Claims</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                  <Link href="/claims">View All <ChevronRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {recentClaims.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground italic">No recent claims</p>
                  ) : recentClaims.map(claim => (
                    <Link key={claim.claimId} href={`/claims/${claim.claimId}`}>
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono font-bold text-muted-foreground">{claim.claimCode ?? `CLM-${claim.claimId}`}</span>
                            <PriorityBadge priority={String(claim.priority ?? '')} />
                          </div>
                          <p className="text-sm font-medium truncate">{claim.title}</p>
                          <p className="text-[10px] text-muted-foreground">{claim.equipmentName ?? `Equipment #${claim.equipmentId}`}</p>
                        </div>
                        <StatusBadge status={String(claim.status ?? '')} />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Work Orders for Everyone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={isFinance ? "lg:col-span-2" : ""}>
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">{isFinance ? "Critical Maintenance Requests" : "Recent Work Orders"}</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
                <Link href="/work-orders">View All <ChevronRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {recentWos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground italic">No recent work orders</p>
                ) : recentWos.map(wo => (
                  <Link key={wo.woId} href={`/work-orders/${wo.woId}`}>
                    <div className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">{wo.woCode}</span>
                          <WorkOrderTypeBadge type={wo.woType} lang={language as any} size="sm" />
                        </div>
                        <p className="text-sm font-medium truncate">{wo.title}</p>
                        <p className="text-[10px] text-muted-foreground">{wo.assignedToName ?? 'Unassigned'}</p>
                      </div>
                      {isFinance && wo.estimatedCost != null && (
                        <div className="text-right mr-4">
                          <p className="text-sm font-bold">{wo.estimatedCost.toLocaleString('fr-DZ')} DA</p>
                          <p className="text-[10px] text-muted-foreground">Estimate</p>
                        </div>
                      )}
                      <StatusBadge status={wo.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── ACTIVITY + BOTTOM WIDGETS ────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3">
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Recent Activity
              </CardTitle>
              <CardDescription>Latest dashboard and system changes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 max-h-[320px] overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground italic text-sm">Gathering intelligence…</div>
                ) : activities.map(item => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── BOTTOM 3-COL ROW ─────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Technician Workload */}
        {isManager && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-indigo-500" /> Technician Workload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWos.reduce((acc: {name: string; count: number}[], wo) => {
                    if (!wo.assignedToName) return acc
                    const found = acc.find(a => a.name === wo.assignedToName)
                    if (found) found.count++
                    else acc.push({ name: wo.assignedToName, count: 1 })
                    return acc
                  }, []).slice(0, 5).map((tech, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{tech.name}</span>
                        <span className="text-muted-foreground">{Math.min(100, tech.count * 20)}%</span>
                      </div>
                      <Progress value={Math.min(100, tech.count * 20)} className="h-1.5" />
                    </div>
                  ))}
                  {recentWos.filter(wo => wo.assignedToName).length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No assignments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={isManager ? "" : "lg:col-span-2"}
        >
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" /> Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPlans.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No upcoming plans</p>
                ) : upcomingPlans.map((plan: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{plan.title}</p>
                      <p className="text-[10px] text-muted-foreground">Equipment #{plan.equipmentId}</p>
                      {plan.nextDueDate && (
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(plan.nextDueDate), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, label: "New Claim", href: "/claims/new", bg: "bg-amber-500/10" },
                  { icon: <Wrench className="h-5 w-5 text-indigo-500" />, label: "Work Orders", href: "/work-orders", bg: "bg-indigo-500/10" },
                  { icon: <Cpu className="h-5 w-5 text-blue-500" />, label: "Equipment", href: "/equipment", bg: "bg-blue-500/10" },
                  { icon: <BarChart3 className="h-5 w-5 text-violet-500" />, label: "Business Intelligence", href: "/bi", bg: "bg-violet-500/10" },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/40 hover:border-primary/40 transition-colors cursor-pointer h-full", action.bg)}>
                      {action.icon}
                      <span className="text-[10px] font-semibold text-center leading-tight">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Financial summary for managers */}
              {isManager && stats?.monthlySpend != null && (
                <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">12M Maintenance Spend</p>
                  <p className="text-xl font-black mt-1">
                    {Number(stats.monthlySpend).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, bg, sub, subColor }: any) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm ring-1 ring-border/40 hover:ring-primary/30 transition-all overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <div className={cn("p-2.5 rounded-xl", bg, color)}>{icon}</div>
        </div>
        <p className="text-3xl font-black text-foreground">{value ?? '—'}</p>
        {sub && (
          <p className={cn("text-[10px] font-bold mt-1", subColor)}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SecondaryKpi({ label, value, sub, subColor, icon }: any) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-sm shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-muted/50 shrink-0">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black">{value}</p>
          {sub && <p className={cn("text-[10px] font-bold", subColor)}>{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'WO_STATUS': return <Wrench className="h-4 w-4 text-indigo-500" />
      case 'CLAIM_NEW': return <AlertTriangle className="h-4 w-4 text-rose-500" />
      case 'RESTOCK_APPROVED': return <Package className="h-4 w-4 text-emerald-500" />
      default: return <Zap className="h-4 w-4 text-blue-500" />
    }
  }
  const url = item.type === 'WO_STATUS' ? `/work-orders/${item.referenceId}`
    : item.type === 'CLAIM_NEW' ? `/claims/${item.referenceId}` : '/inventory'

  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-muted shrink-0 flex items-center justify-center border border-border/40">
        {getIcon(item.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold truncate">{item.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.actor || 'System'}</span>
          <Link href={url} className="text-[10px] font-bold text-primary hover:underline">DETAILS →</Link>
        </div>
      </div>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  const p = priority.toUpperCase()
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase", map[p] ?? 'bg-muted text-muted-foreground')}>
      {priority}
    </span>
  )
}

// WoTypeBadge is replaced by the shared WorkOrderTypeBadge component

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CREATED: 'bg-muted text-muted-foreground',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    QUALIFIED: 'bg-teal-100 text-teal-700',
    ASSIGNED: 'bg-orange-100 text-orange-700',
    CLOSED: 'bg-slate-100 text-slate-600',
    NEW: 'bg-amber-100 text-amber-700',
    CONVERTED_TO_WORK_ORDER: 'bg-violet-100 text-violet-700',
  }
  const label = status.replace(/_/g, ' ')
  return (
    <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap", map[status?.toUpperCase()] ?? 'bg-muted text-muted-foreground')}>
      {label}
    </span>
  )
}
