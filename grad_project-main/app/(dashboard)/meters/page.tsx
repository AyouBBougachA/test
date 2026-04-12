"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  Gauge,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { metersApi } from "@/lib/api/meters"
import type { MeterLog, MeterLogRequest, MeterOperation, MeterResponse, MeterThreshold } from "@/lib/api/types"
import { mapMeterResponseToUiCard, type UiMeterCard } from "@/lib/adapters"
import { downloadCsv } from "@/lib/export"
import { ApiError } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function MetersPage() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  const showNotAvailable = (feature: string) => {
    toast({
      title: language === "fr" ? "Non disponible" : "Not available",
      description:
        language === "fr"
          ? `${feature} n’est pas supporté par le backend.`
          : `${feature} is not supported by the backend.`,
      variant: "destructive",
    })
  }

  const [meters, setMeters] = useState<MeterResponse[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [manageOpen, setManageOpen] = useState(false)
  const [manageMode, setManageMode] = useState<"manage" | "log" | "logs">("manage")
  const [selectedMeter, setSelectedMeter] = useState<UiMeterCard | null>(null)
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null)
  const [thresholds, setThresholds] = useState<MeterThreshold[]>([])
  const [logs, setLogs] = useState<MeterLog[]>([])
  const [isManageLoading, setIsManageLoading] = useState(false)
  const [isLogsLoading, setIsLogsLoading] = useState(false)

  const [logOperation, setLogOperation] = useState<MeterOperation>("ADD")
  const [logAmount, setLogAmount] = useState<string>("")
  const [thresholdValue, setThresholdValue] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  const getApiErrorMessage = (err: unknown): string => {
    if (err instanceof ApiError) {
      const payload = err.payload as unknown
      if (payload && typeof payload === "object") {
        const maybeError = (payload as Record<string, unknown>).error
        const maybeMessage = (payload as Record<string, unknown>).message
        if (typeof maybeError === "string" && maybeError.trim()) return maybeError
        if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
      }
      return `Request failed (${err.status})`
    }
    if (err instanceof Error && err.message) return err.message
    return "Request failed"
  }

  useEffect(() => {
    let cancelled = false
    setIsFetching(true)
    setError(null)
    const load = async () => {
      try {
        const res = await metersApi.getAll()
        if (!cancelled) setMeters(res)
      } catch {
        if (!cancelled) {
          setMeters([])
          setError(language === "fr" ? "Impossible de charger les compteurs" : "Failed to load meters")
        }
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [language])

  useEffect(() => {
    let cancelled = false
    if (!manageOpen || !selectedMeterId) return
    setIsManageLoading(true)
    setThresholds([])
    setLogs([])
    setIsLogsLoading(true)
    const load = async () => {
      try {
        const [th, lg] = await Promise.all([
          metersApi.getThresholds(selectedMeterId),
          metersApi.getLogs(selectedMeterId),
        ])
        if (cancelled) return
        setThresholds(th)
        setLogs(lg)
      } catch {
        if (cancelled) return
        setThresholds([])
        setLogs([])
      } finally {
        if (cancelled) return
        setIsManageLoading(false)
        setIsLogsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [manageOpen, selectedMeterId])

  const uiMeters: UiMeterCard[] = useMemo(() => meters.map(mapMeterResponseToUiCard), [meters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-amber-500"
      default:
        return "bg-emerald-500"
    }
  }

  const filteredMeters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return uiMeters
    return uiMeters.filter(
      (m) =>
        (m.name ?? "").toLowerCase().includes(q) ||
        (m.equipmentLabel ?? "").toLowerCase().includes(q)
    )
  }, [searchQuery, uiMeters])

  const stats = useMemo(() => {
    const total = uiMeters.length
    const normal = uiMeters.filter((m) => m.status === "normal").length
    const warning = uiMeters.filter((m) => m.status === "warning").length
    const critical = uiMeters.filter((m) => m.status === "critical").length
    return { total, normal, warning, critical }
  }, [uiMeters])

  const onExport = () => {
    downloadCsv(
      "meters.csv",
      ["id", "name", "equipment", "value", "unit", "threshold", "status", "lastReading"],
      filteredMeters.map((m) => [
        m.id,
        m.name,
        m.equipmentLabel,
        m.value,
        m.unit,
        m.primaryThreshold,
        m.status,
        m.lastReading,
      ])
    )
  }

  const onSyncAll = async () => {
    if (isFetching) return
    setIsFetching(true)
    setError(null)
    try {
      const res = await metersApi.getAll()
      setMeters(res)
      toast({ title: language === "fr" ? "Synchronisé" : "Synced" })
    } catch {
      setMeters([])
      toast({
        title: language === "fr" ? "Synchronisation impossible" : "Sync failed",
        variant: "destructive",
      })
      setError(language === "fr" ? "Impossible de charger les compteurs" : "Failed to load meters")
    } finally {
      setIsFetching(false)
    }
  }

  const openManage = (meter: UiMeterCard, mode: "manage" | "log" | "logs" = "manage") => {
    setSelectedMeter(meter)
    setSelectedMeterId(meter.id)
    setLogOperation("ADD")
    setLogAmount("")
    setThresholdValue("")
    setManageMode(mode)
    setManageOpen(true)
  }

  const onRecordLog = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedMeterId || isSaving) return
    const amount = Number(logAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: language === "fr" ? "Valeur invalide" : "Invalid amount",
        variant: "destructive",
      })
      return
    }
    setIsSaving(true)
    try {
      const payload: MeterLogRequest = { operation: logOperation, amount }
      await metersApi.recordLog(selectedMeterId, payload)
      toast({ title: language === "fr" ? "Lecture enregistrée" : "Reading recorded" })
      const [all, lg] = await Promise.all([
        metersApi.getAll(),
        metersApi.getLogs(selectedMeterId),
      ])
      setMeters(all)
      setLogs(lg)
      setLogAmount("")
    } catch (err) {
      toast({
        title: language === "fr" ? "Enregistrement impossible" : "Record failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onCreateThreshold = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedMeterId || isSaving) return
    const value = Number(thresholdValue)
    if (!Number.isFinite(value) || value <= 0) {
      toast({
        title: language === "fr" ? "Valeur invalide" : "Invalid threshold",
        variant: "destructive",
      })
      return
    }
    setIsSaving(true)
    try {
      await metersApi.createThreshold(selectedMeterId, value)
      toast({ title: language === "fr" ? "Seuil ajouté" : "Threshold added" })
      const [all, th] = await Promise.all([
        metersApi.getAll(),
        metersApi.getThresholds(selectedMeterId),
      ])
      setMeters(all)
      setThresholds(th)
      setThresholdValue("")
    } catch (err) {
      toast({
        title: language === "fr" ? "Ajout impossible" : "Add failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("meters")}</h1>
          <p className="text-muted-foreground">{language === "fr" ? "Suivi des compteurs" : "Equipment meter tracking"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSyncAll} disabled={isFetching}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
        </div>
      </motion.div>

      <Dialog
        open={manageOpen}
        onOpenChange={(open) => {
          setManageOpen(open)
          if (!open) setManageMode("manage")
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{language === "fr" ? "Gérer le compteur" : "Manage meter"}</DialogTitle>
            <DialogDescription>
              {selectedMeter
                ? `${selectedMeter.name} • ${selectedMeter.equipmentLabel}`
                : language === "fr" ? "Actions sur le compteur." : "Meter actions."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{language === "fr" ? "Valeur actuelle" : "Current value"}</div>
                  <div className="font-medium">{selectedMeter ? `${selectedMeter.value.toLocaleString()} ${selectedMeter.unit}` : "—"}</div>
                </div>
              </div>

              <form onSubmit={onRecordLog} className="space-y-3 rounded-lg border p-3">
                <div className="text-sm font-medium">{language === "fr" ? "Enregistrer une lecture" : "Record reading"}</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "fr" ? "Opération" : "Operation"}</Label>
                    <Select value={logOperation} onValueChange={(v) => setLogOperation(v as MeterOperation)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "fr" ? "Choisir" : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADD">{language === "fr" ? "Ajouter" : "Add"}</SelectItem>
                        <SelectItem value="SUBTRACT">{language === "fr" ? "Soustraire" : "Subtract"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "fr" ? "Valeur" : "Amount"}</Label>
                    <Input
                      type="number"
                      value={logAmount}
                      onChange={(e) => setLogAmount(e.target.value)}
                      min={0}
                      step="any"
                      autoFocus={manageMode === "log"}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSaving || !selectedMeterId}>
                    {language === "fr" ? "Enregistrer" : "Record"}
                  </Button>
                </DialogFooter>
              </form>

              <div className="space-y-2 rounded-lg border p-3">
                <div className="text-sm font-medium">{language === "fr" ? "Seuils" : "Thresholds"}</div>
                {isManageLoading ? (
                  <div className="text-sm text-muted-foreground">{language === "fr" ? "Chargement..." : "Loading..."}</div>
                ) : thresholds.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{language === "fr" ? "Aucun seuil" : "No thresholds"}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {thresholds
                      .slice()
                      .sort((a, b) => a.thresholdValue - b.thresholdValue)
                      .slice(0, 12)
                      .map((th, idx) => (
                        <Badge key={th.thresholdId} variant="outline">
                          {(language === "fr" ? `Seuil ${idx + 1}` : `Threshold ${idx + 1}`)} • {th.thresholdValue.toLocaleString()}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              <form onSubmit={onCreateThreshold} className="space-y-3 rounded-lg border p-3">
                <div className="text-sm font-medium">{language === "fr" ? "Ajouter un seuil" : "Add threshold"}</div>
                <div className="space-y-2">
                  <Label>{language === "fr" ? "Seuil" : "Threshold"}</Label>
                  <Input type="number" value={thresholdValue} onChange={(e) => setThresholdValue(e.target.value)} min={0} step="any" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSaving || !selectedMeterId}>
                    {language === "fr" ? "Ajouter" : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="text-sm font-medium">{language === "fr" ? "Lectures récentes" : "Recent readings"}</div>
                {isLogsLoading ? (
                  <div className="text-sm text-muted-foreground">{language === "fr" ? "Chargement..." : "Loading..."}</div>
                ) : logs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{language === "fr" ? "Aucune lecture" : "No readings"}</div>
                ) : (
                  <div className="space-y-2">
                    {logs
                      .slice()
                      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                      .slice(0, 12)
                      .map((l) => (
                        <div key={l.logId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <div className="min-w-0">
                            <div className="font-medium">{l.operation} {l.value}</div>
                            <div className="text-xs text-muted-foreground">{new Date(l.recordedAt).toLocaleString()}</div>
                          </div>
                          <div className="text-muted-foreground">→ {l.resultingValue}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Gauge className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Meters</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Normal</p>
              <p className="text-2xl font-bold">{stats.normal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warning</p>
              <p className="text-2xl font-bold">{stats.warning}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <TrendingUp className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => showNotAvailable(language === "fr" ? "Filtres" : "Filters")}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" onClick={onExport} disabled={filteredMeters.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </motion.div>

      {/* Meters Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isFetching ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-6 text-destructive">{error}</CardContent>
          </Card>
        ) : filteredMeters.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-muted-foreground">
              {language === "fr" ? "Aucun compteur" : "No meters"}
            </CardContent>
          </Card>
        ) : (
          filteredMeters.map((meter, index) => (
          <motion.div
            key={meter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{meter.displayId}</p>
                    <CardTitle className="text-base">{meter.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusColor(meter.status)}>
                    {meter.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{meter.equipmentLabel}</p>
                
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">{meter.value.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{meter.unit}</span>
                  </div>
                  {meter.thresholds.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {language === "fr" ? "Seuil non défini" : "Threshold not set"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {meter.thresholds
                        .slice()
                        .sort((a, b) => a - b)
                            .map((th, idx) => (
                              <div key={`${idx}-${th}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                    {language === "fr" ? `Seuil ${idx + 1}` : `Threshold ${idx + 1}`} • {th.toLocaleString()}
                              </span>
                              <span>
                                {th > 0
                                  ? `${Math.round((meter.value / th) * 100)}%`
                                  : "—"}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(meter.status)}`}
                                style={{
                                  width: th > 0 ? `${Math.min((meter.value / th) * 100, 100)}%` : "0%",
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => openManage(meter, "logs")}
                >
                  <Clock className="h-3 w-3" />
                  {language === "fr" ? "Dernière lecture" : "Last reading"}: {meter.lastReading ? new Date(meter.lastReading).toLocaleString() : "—"}
                </button>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openManage(meter, "log")}>
                    {language === "fr" ? "Journal" : "Log"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openManage(meter, "manage")}>
                    {language === "fr" ? "Gérer" : "Manage"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
