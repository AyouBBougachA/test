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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { AuditTrail, type AuditEntry } from "@/components/audit-trail"
import { equipmentApi } from "@/lib/api/equipment"
import { metersApi } from "@/lib/api/meters"
import { auditLogsApi } from "@/lib/api/audit-logs"
import { mapAuditLogToAuditEntry, mapMeterResponseToUiCard } from "@/lib/adapters"

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

function NotAvailableCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { t, language } = useI18n()
  const { user } = useAuth()

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
        const [equipmentRes, metersRes, logsRes] = await Promise.all([
          equipmentApi.getAll(),
          metersApi.getAll(),
          auditLogsApi.getRecent(20),
        ])
        if (cancelled) return

        setEquipmentCount(equipmentRes.length)

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
      } catch {
        if (cancelled) return
        setEquipmentCount(null)
        setMeterAlerts({ warning: 0, critical: 0 })
        setRecentMeters([])
        setAuditEntries([])
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
    const totalEquipmentValue = equipmentCount == null ? "—" : String(equipmentCount)
    const criticalAlertsValue = isFetching ? "—" : String(meterAlerts.critical)

    return [
      {
        title: t("totalEquipment"),
        value: totalEquipmentValue,
        icon: Database,
        color: "text-violet-600",
        bgColor: "bg-violet-50 dark:bg-violet-900/20",
      },
      {
        title: t("activeWorkOrders"),
        value: "—",
        icon: Wrench,
        color: "text-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      {
        title: t("pendingClaims"),
        value: "—",
        icon: AlertTriangle,
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
      },
      {
        title: t("criticalAlerts"),
        value: criticalAlertsValue,
        icon: Activity,
        color: "text-rose-600",
        bgColor: "bg-rose-50 dark:bg-rose-900/20",
      },
    ]
  }, [equipmentCount, isFetching, meterAlerts.critical, t])

  const meterBadgeVariant = (status: string) => {
    if (status === "critical") return "destructive"
    if (status === "warning") return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {language === "fr" ? "Bonjour" : "Welcome"}, {user?.name?.split(" ")[0] || "Guest"}
          </h1>
          <p className="text-muted-foreground">
            {language === "fr"
              ? "Voici un aperçu de votre système de maintenance"
              : "Here's an overview of your maintenance system"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700">
            <Link href="/claims/new">
              <Plus className="h-4 w-4" />
              {t("newClaim")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/work-orders">
              <Wrench className="h-4 w-4" />
              {t("newWorkOrder")}
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {kpiCards.map((kpi) => (
          <motion.div key={kpi.title} variants={fadeInUp}>
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
                    </div>
                    {(kpi.title === t("activeWorkOrders") || kpi.title === t("pendingClaims")) && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {language === "fr" ? "Non disponible" : "Not available"}
                      </p>
                    )}
                  </div>
                  <div className={`rounded-xl p-3 ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Middle Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <NotAvailableCard
            title={language === "fr" ? "Tendance de disponibilité" : "Availability Trend"}
            description={language === "fr" ? "Analytique non disponible (pas d’API)." : "Analytics not available (no API)."}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                {language === "fr" ? "Alertes compteurs" : "Meter Alerts"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === "fr" ? "Critiques" : "Critical"}</span>
                <span className="font-medium">{isFetching ? "—" : meterAlerts.critical}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language === "fr" ? "Avertissements" : "Warnings"}</span>
                <span className="font-medium">{isFetching ? "—" : meterAlerts.warning}</span>
              </div>

              <div className="pt-2">
                {recentMeters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {language === "fr" ? "Aucune alerte" : "No alerts"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentMeters.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.equipment}</p>
                        </div>
                        <Badge variant={meterBadgeVariant(m.status)} className="ml-2">{m.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lower Row placeholders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NotAvailableCard
          title={language === "fr" ? "Réclamations" : "Claims"}
          description={language === "fr" ? "Module non disponible (pas d’API)." : "Module not available (no API)."}
        />
        <NotAvailableCard
          title={language === "fr" ? "Ordres de travail" : "Work Orders"}
          description={language === "fr" ? "Module non disponible (pas d’API)." : "Module not available (no API)."}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NotAvailableCard
          title={language === "fr" ? "Techniciens" : "Technicians"}
          description={language === "fr" ? "Non disponible (pas d’API)." : "Not available (no API)."}
        />
        <NotAvailableCard
          title={language === "fr" ? "Calendrier" : "Calendar"}
          description={language === "fr" ? "Non disponible (pas d’API)." : "Not available (no API)."}
        />
      </div>

      {/* Activity */}
      <AuditTrail
        entries={auditEntries}
        title={language === "fr" ? "Activité récente" : "Recent Activity"}
        description={language === "fr" ? "Journal d’audit du système" : "System audit log"}
      />
    </div>
  )
}
