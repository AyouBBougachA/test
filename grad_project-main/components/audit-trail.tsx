"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, FileText, Edit, Trash2, Plus } from "lucide-react"

export interface AuditEntry {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: "create" | "update" | "delete" | "view" | "export" | "status_change"
  description: string
  resource: string
  details?: string
  changedFields?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

interface AuditTrailProps {
  entries: AuditEntry[]
  title?: string
  description?: string
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "create":
      return <Plus className="h-4 w-4" />
    case "update":
      return <Edit className="h-4 w-4" />
    case "delete":
      return <Trash2 className="h-4 w-4" />
    case "status_change":
      return <FileText className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case "create":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "update":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "delete":
      return "bg-red-50 text-red-700 border-red-200"
    case "status_change":
      return "bg-violet-50 text-violet-700 border-violet-200"
    case "view":
      return "bg-slate-50 text-slate-700 border-slate-200"
    case "export":
      return "bg-orange-50 text-orange-700 border-orange-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    view: "Viewed",
    export: "Exported",
    status_change: "Status Changed",
  }
  return labels[action] || action
}

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

export function AuditTrail({
  entries,
  title = "Audit Trail",
  description = "Complete activity log and change tracking",
}: AuditTrailProps) {
  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No audit entries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  variants={fadeInUp}
                  className="flex gap-4 pb-4 border-b border-border last:border-b-0 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-2`}>
                      {getActionIcon(entry.action)}
                    </div>
                    {index < entries.length - 1 && (
                      <div className="w-0.5 h-12 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{entry.description}</span>
                          <Badge variant="outline" className={getActionColor(entry.action)}>
                            {getActionLabel(entry.action)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{entry.user}</span>
                            <span className="text-xs">({entry.userRole})</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{entry.timestamp}</span>
                          </div>
                          <span>•</span>
                          <span className="text-xs font-medium">{entry.resource}</span>
                        </div>

                        {/* Details */}
                        {(entry.details || entry.changedFields?.length) && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                            {entry.details && (
                              <p className="text-sm text-muted-foreground">{entry.details}</p>
                            )}
                            {entry.changedFields && entry.changedFields.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-foreground">Changed Fields:</p>
                                {entry.changedFields.map((change, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground pl-2 border-l-2 border-border">
                                    <span className="font-medium">{change.field}:</span>
                                    <br />
                                    <span className="line-through text-red-600">
                                      {change.oldValue}
                                    </span>
                                    {" → "}
                                    <span className="text-emerald-600 font-medium">
                                      {change.newValue}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
