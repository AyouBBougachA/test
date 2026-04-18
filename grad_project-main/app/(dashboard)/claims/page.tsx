"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditTrail, type AuditEntry } from "@/components/audit-trail"
import { useI18n } from "@/lib/i18n"
import { claimsApi } from "@/lib/api/claims"
import { auditLogsApi } from "@/lib/api/audit-logs"
import type {
  AuditLog,
  ClaimListItemResponse,
  ClaimStatsResponse,
} from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"

function toTitleCase(value: string) {
  const cleaned = value
    .replaceAll("_", " ")
    .trim()
    .toLowerCase()
  return cleaned.replace(/\b\w/g, (m) => m.toUpperCase())
}

function normalizeLabel(value: string) {
  return value.replaceAll("_", " ").trim().toLowerCase()
}

function normalizeStatusLabel(value: string) {
  const normalized = normalizeLabel(value)
  if (normalized === "qualified") return "open"
  return normalized
}

function toDisplayStatusLabel(value: string) {
  const normalized = normalizeStatusLabel(value)
  return toTitleCase(normalized)
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function mapAuditLogToEntry(a: AuditLog): AuditEntry {
  const actionType = (a.actionType ?? "").toUpperCase()
  const action: AuditEntry["action"] = actionType.includes("CREATE")
    ? "create"
    : actionType.includes("DELETE")
      ? "delete"
      : actionType.includes("EXPORT")
        ? "export"
        : actionType.includes("STATUS")
          ? "status_change"
          : "update"

  return {
    id: `audit-${a.id}`,
    timestamp: formatTimestamp(a.createdAt),
    user: a.userId == null ? "SYSTEM" : `User #${a.userId}`,
    userRole: "",
    action,
    description: actionType.replaceAll("_", " ") || "Audit",
    resource: a.entityName ?? "Claims",
    details: a.details,
  }
}

export default function ClaimsPage() {
  const { t, language } = useI18n()
  const [claims, setClaims] = useState<ClaimListItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<ClaimStatsResponse | null>(null)

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [claimsRes, auditsRes, statsRes] = await Promise.all([
          claimsApi.list(),
          auditLogsApi.getRecent(50),
          claimsApi.getStats().catch(() => null),
        ])
        if (cancelled) return
        setClaims(claimsRes)
        setStats(statsRes)
        setAuditEntries(
          (auditsRes ?? [])
            .filter((a) => a.entityName === "Claim")
            .map(mapAuditLogToEntry),
        )
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          const payload = err.payload as unknown
          if (payload && typeof payload === "object") {
            const maybeMessage = (payload as Record<string, unknown>).message
            if (typeof maybeMessage === "string" && maybeMessage.trim()) {
              setError(maybeMessage)
              return
            }
          }
          setError(`Request failed (${err.status})`)
          return
        }
        setError(language === "fr" ? "Échec du chargement" : "Failed to load")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [language])

  const rows = useMemo(() => claims ?? [], [claims])

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    }
  }

  const getStatusColor = (status: string) => {
    switch (normalizeStatusLabel(status)) {
      case "open":
      case "new":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "qualified":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "assigned":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
      case "in progress":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
      case "converted to work order":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
      case "resolved":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "closed":
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
      case "rejected":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const filteredClaims = rows.filter((claim) => {
    const id = claim.claimCode
    const title = claim.title ?? ""
    const status = toDisplayStatusLabel(
      claim.statusLabel ?? toTitleCase(String(claim.status ?? "")),
    )
    const priority = claim.priorityLabel ?? toTitleCase(String(claim.priority ?? ""))
    const normalizedStatus = normalizeStatusLabel(status)
    const normalizedPriority = normalizeLabel(priority)

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || normalizeLabel(statusFilter) === normalizedStatus
    const matchesPriority =
      priorityFilter === "all" || normalizeLabel(priorityFilter) === normalizedPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClaims.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClaims, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)


  const derivedStats = {
    total: rows.length,
    pending: rows.filter((c) => {
      const s = normalizeStatusLabel(c.statusLabel ?? String(c.status ?? ""))
      return s === "open"
    }).length,
    inProgress: rows.filter((c) => {
      const s = normalizeStatusLabel(c.statusLabel ?? String(c.status ?? ""))
      return s === "in progress" || s === "assigned"
    }).length,
    closed: rows.filter((c) => normalizeStatusLabel(c.statusLabel ?? String(c.status ?? "")) === "closed")
      .length,
  }

  const kpi = stats
    ? {
        total: stats.total ?? derivedStats.total,
        pending: derivedStats.pending,
        inProgress: derivedStats.inProgress,
        closed: derivedStats.closed,
      }
    : derivedStats

  const statCards = [
    {
      label: language === "fr" ? "Total réclamations" : "Total Claims",
      value: kpi.total,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: language === "fr" ? "Nouveaux" : "New",
      value: kpi.pending,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: language === "fr" ? "En cours" : "In Progress",
      value: kpi.inProgress,
      icon: AlertTriangle,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: language === "fr" ? "Fermées" : "Closed",
      value: kpi.closed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("claimsList")}
          </h1>
          <p className="text-muted-foreground">
            {language === "fr"
              ? "Gérez les réclamations et les incidents"
              : "Manage claims and incidents"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" type="button">
            <Download className="h-4 w-4" />
            {t("export")}
          </Button>
          <Link href="/claims/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("newClaim")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            {language === "fr" ? "Liste" : "List"}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Clock className="h-4 w-4" />
            {language === "fr" ? "Audit" : "Audit"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={language === "fr" ? "Rechercher réclamations..." : "Search claims..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t("status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "fr" ? "Tous" : "All"}</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Converted To Work Order">In WO</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t("priority")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === "fr" ? "Toutes" : "All"}</SelectItem>
                      <SelectItem value="Critical">{t("critical")}</SelectItem>
                      <SelectItem value="High">{t("high")}</SelectItem>
                      <SelectItem value="Medium">{t("medium")}</SelectItem>
                      <SelectItem value="Low">{t("low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{language === "fr" ? "Titre" : "Title"}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("equipment")}</TableHead>
                      <TableHead>{t("priority")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t("createdBy")}</TableHead>
                      <TableHead className="hidden xl:table-cell">{t("assignedTo")}</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-sm text-muted-foreground">
                          {t("loading")}
                        </TableCell>
                      </TableRow>
                    ) : paginatedClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-sm text-muted-foreground">
                          {t("noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedClaims.map((claim) => {
                        const priority = claim.priorityLabel ?? toTitleCase(String(claim.priority ?? ""))
                        const status = toDisplayStatusLabel(
                          claim.statusLabel ?? toTitleCase(String(claim.status ?? "")),
                        )
                        return (
                          <TableRow key={claim.claimId} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-mono text-sm font-medium">{claim.claimCode}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{claim.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {claim.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {claim.equipmentName ?? `#${claim.equipmentId}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getPriorityColor(priority)}>
                                {priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(status)}>
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {claim.requesterName ?? "-"}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {claim.assignedToName ?? "-"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" type="button">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/claims/${claim.claimId}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      {t("view")}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/claims/${claim.claimId}/edit`}>
                                      {t("edit")}
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    {language === "fr" ? "Affichage" : "Showing"} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {language === "fr" ? "à" : "to"} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredClaims.length)}</span> {language === "fr" ? "sur" : "of"} <span className="font-medium">{filteredClaims.length}</span> {language === "fr" ? "résultats" : "results"}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      {language === "fr" ? "Précédent" : "Previous"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {language === "fr" ? "Suivant" : "Next"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail
            entries={auditEntries}
            title={language === "fr" ? "Historique des réclamations" : "Claims History"}
            description={language === "fr" ? "Suivi des modifications et actions" : "Track changes and actions"}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
