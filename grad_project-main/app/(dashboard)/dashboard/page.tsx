"use client"

import { useEffect, useMemo, useState } from "react"
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
  Cpu,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { AuditTrail, type AuditEntry } from "@/components/audit-trail"
import { equipmentApi } from "@/lib/api/equipment"
import { metersApi } from "@/lib/api/meters"
import { auditLogsApi } from "@/lib/api/audit-logs"
import { biApi } from "@/lib/api/bi"
import { mapAuditLogToAuditEntry, mapMeterResponseToUiCard } from "@/lib/adapters"
import type { KpiResponse } from "@/lib/api/types"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function DashboardPage() {
  const { t, language } = useI18n()
  const { user } = useAuth()

  const [kpis, setKpis] = useState<KpiResponse | null>(null)
  const [equipmentCount, setEquipmentCount] = useState<number | null>(null)
  const [meterAlerts, setMeterAlerts] = useState<{ warning: number; critical: number }>({ warning: 0, critical: 0 })
  const [recentMeters, setRecentMeters] = useState<Array<{ id: string; name: string; equipment: string; status: string }>>([])
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsFetching(true)

    const load = async () => {
      try {
        const [equipmentRes, metersRes, logsRes, kpiRes] = await Promise.all([
          equipmentApi.getAll(),
          metersApi.getAll(),
          auditLogsApi.getRecent(20),
          biApi.getKpis()
        ])
        if (cancelled) return

        setEquipmentCount(equipmentRes.length)
        setKpis(kpiRes)

        const uiMeters = metersRes.map(mapMeterResponseToUiCard)
        const warning = uiMeters.filter((m) => m.status === "warning").length
        const critical = uiMeters.filter((m) => m.status === "critical").length
        setMeterAlerts({ warning, critical })

        const topAlerts = uiMeters
          .filter((m) => m.status === "warning" || m.status === "critical")
          .sort((a, b) => (a.status === b.status ? 0 : a.status === "critical" ? -1 : 1))
          .slice(0, 4)
          .map((m) => ({
            id: m.displayId,
            name: m.name,
            equipment: m.equipmentLabel,
            status: m.status,
          }))
        setRecentMeters(topAlerts)

        setAuditEntries(logsRes.map(mapAuditLogToAuditEntry))
      } catch (err) {
        console.error("Dashboard data load error", err)
        if (cancelled) return
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const kpiCards = useMemo(() => {
    return [
      {
        title: t("totalEquipment"),
        value: equipmentCount ?? "—",
        icon: Database,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        title: t("activeWorkOrders"),
        value: kpis?.activeWorkOrders ?? "—",
        icon: Wrench,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        title: "Low Stock Parts",
        value: kpis?.lowStockParts ?? "—",
        icon: Package,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      },
      {
        title: "System Uptime",
        value: "99.8%",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
      },
    ]
  }, [equipmentCount, kpis, t])

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {language === "fr" ? "Tableau de Bord" : "Operational Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {language === "fr"
              ? "Surveillance en temps réel des actifs hospitaliers"
              : "Real-time monitoring of hospital assets and maintenance flow."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="gap-2 shadow-lg shadow-primary/20">
            <Link href="/claims/new">
              <Plus className="h-4 w-4" />
              {t("newClaim")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm">
            <Link href="/work-orders">
              <Activity className="h-4 w-4" />
              Monitor Flow
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.title} variants={fadeInUp}>
            <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border group hover:ring-primary/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
                    </div>
                  </div>
                  <div className={`rounded-2xl p-3 ${kpi.bgColor} group-hover:scale-110 transition-transform`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Dashboard Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Alerts & Status */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "fr" ? "Alertes Critiques" : "Critical Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-center">
                       <div className="text-xl font-bold text-rose-500">{meterAlerts.critical}</div>
                       <div className="text-[10px] uppercase font-bold text-rose-500/70">Meters</div>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
                       <div className="text-xl font-bold text-amber-500">{meterAlerts.warning}</div>
                       <div className="text-[10px] uppercase font-bold text-amber-500/70">Warnings</div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    {recentMeters.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 border border-border/50 group hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate uppercase">{m.equipment}</p>
                        </div>
                        <Badge variant={m.status === 'critical' ? 'destructive' : 'secondary'} className="h-5 px-2 text-[10px]">
                           {m.status}
                        </Badge>
                      </div>
                    ))}
                    {recentMeters.length === 0 && (
                      <p className="text-center py-4 text-xs text-muted-foreground italic">No sensor alerts detected.</p>
                    )}
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border">
              <CardHeader className="pb-2">
                 <CardTitle className="text-lg font-bold">Quick Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg"><TrendingUp className="h-4 w-4 text-blue-500" /></div>
                    <div className="flex-1">
                       <div className="text-sm font-medium">MTTR (Repair Time)</div>
                       <div className="text-xs text-muted-foreground">Average: 4.5 hours</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg"><ShieldCheck className="h-4 w-4 text-emerald-500" /></div>
                    <div className="flex-1">
                       <div className="text-sm font-medium">Compliant Equipment</div>
                       <div className="text-xs text-muted-foreground">92% meet safety standards</div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right Column: History & Trends */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border min-h-[400px]">
              <CardHeader className="pb-4">
                 <div className="flex items-center justify-between">
                    <div>
                       <CardTitle className="text-lg font-bold">Maintenance Activity</CardTitle>
                       <CardDescription>Live feed of system operations</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/5">
                       View All Logs
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <AuditTrail
                    entries={auditEntries}
                    title=""
                    description=""
                    hideTitle={true}
                 />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
