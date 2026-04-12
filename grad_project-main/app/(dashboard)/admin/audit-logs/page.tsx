"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { auditLogsApi } from "@/lib/api/audit-logs"
import type { AuditLog } from "@/lib/api/types"
import { downloadCsv } from "@/lib/export"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function AuditLogsPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [items, setItems] = useState<AuditLog[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("7days")
  const [scope, setScope] = useState<"all" | "security">("all")

  useEffect(() => {
    if (isLoading) return
    if (user && (user.roleName ?? "").toUpperCase() !== "ADMIN") {
      router.replace("/dashboard")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    let cancelled = false
    setIsFetching(true)
    setError(null)
    const load = async () => {
      try {
        const res = scope === "security" ? await auditLogsApi.getSecurity(200) : await auditLogsApi.getRecent(200)
        if (cancelled) return
        setItems(res)
      } catch {
        if (cancelled) return
        setItems([])
        setError(language === "fr" ? "Impossible de charger les logs" : "Failed to load logs")
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [language, scope])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = Date.now()
    const cutoffMs =
      timeRange === "1day" ? 24 * 60 * 60 * 1000 :
      timeRange === "7days" ? 7 * 24 * 60 * 60 * 1000 :
      timeRange === "30days" ? 30 * 24 * 60 * 60 * 1000 :
      Infinity

    return items.filter((l) => {
      const createdAt = new Date(l.createdAt).getTime()
      if (Number.isNaN(createdAt)) return false
      if (cutoffMs !== Infinity && now - createdAt > cutoffMs) return false

      const action = (l.actionType ?? "").toLowerCase()
      if (actionFilter !== "all") {
        if (actionFilter === "create" && !action.includes("create")) return false
        if (actionFilter === "update" && !action.includes("update")) return false
        if (actionFilter === "delete" && !action.includes("delete")) return false
        if (actionFilter === "export" && !action.includes("export")) return false
      }

      if (!q) return true
      const haystack = [
        String(l.id),
        l.actionType,
        l.entityName,
        l.details,
        l.userId ? `user #${l.userId}` : "system",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [actionFilter, items, query, timeRange])

  const stats = useMemo(() => {
    const failed = filtered.filter((l) => {
      const action = (l.actionType ?? "").toUpperCase()
      return action.includes("FAILED") || action.includes("DENIED")
    }).length
    return {
      total: filtered.length,
      failed,
      success: Math.max(0, filtered.length - failed),
    }
  }, [filtered])

  const onExport = () => {
    downloadCsv(
      "audit-logs.csv",
      ["id", "timestamp", "userId", "actionType", "entityName", "entityId", "details"],
      filtered.map((l) => [
        l.id,
        l.createdAt,
        l.userId,
        l.actionType,
        l.entityName,
        l.entityId,
        l.details,
      ])
    )
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
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">Complete system activity and change tracking</p>
        </div>
        <Button onClick={onExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search logs..."
            className="h-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={scope} onValueChange={(v) => setScope(v as "all" | "security")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={language === "fr" ? "Périmètre" : "Scope"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "fr" ? "Tous" : "All logs"}</SelectItem>
            <SelectItem value="security">{language === "fr" ? "Sécurité" : "Security logs"}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1day">Last 24 Hours</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Logs Table */}
      <motion.div variants={fadeInUp}>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Timestamp</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">User</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Action</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Resource</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Details</th>
                    <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isFetching ? (
                    <tr>
                      <td className="py-6 px-6 text-muted-foreground" colSpan={6}>
                        {language === "fr" ? "Chargement..." : "Loading..."}
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="py-6 px-6 text-destructive" colSpan={6}>
                        {error}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="py-6 px-6 text-muted-foreground" colSpan={6}>
                        {language === "fr" ? "Aucun log" : "No logs"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log) => {
                      const action = (log.actionType ?? "").toUpperCase()
                      const failed = action.includes("FAILED") || action.includes("DENIED")
                      return (
                        <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6 text-muted-foreground text-xs">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-foreground font-medium">
                            {log.userId ? `User #${log.userId}` : "System"}
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">{log.actionType || "—"}</td>
                          <td className="py-4 px-6">
                            <Badge variant="outline">{log.entityName || "—"}</Badge>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-xs max-w-xs truncate">
                            {log.details || "—"}
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={
                                failed
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }
                            >
                              {failed ? (language === "fr" ? "Échec" : "Failed") : (language === "fr" ? "Succès" : "Success")}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.success}</p>
              <p className="text-sm text-muted-foreground">Successful Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed Actions</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
