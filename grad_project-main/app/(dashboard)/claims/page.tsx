"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"
import { claimsApi } from "@/lib/api/claims"
import type { ClaimListItemResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"

export default function ClaimsPage() {
  const { language } = useI18n()
  const [claims, setClaims] = useState<ClaimListItemResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const title = language === "fr" ? "Réclamations" : "Claims"

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const data = await claimsApi.list()
        if (!cancelled) setClaims(data)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Button asChild>
          <Link href="/claims/new">
            <Plus className="mr-2 h-4 w-4" />
            {language === "fr" ? "Nouvelle" : "New"}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Liste" : "List"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "fr" ? "Code" : "Code"}</TableHead>
                  <TableHead>{language === "fr" ? "Titre" : "Title"}</TableHead>
                  <TableHead>{language === "fr" ? "Équipement" : "Equipment"}</TableHead>
                  <TableHead>{language === "fr" ? "Priorité" : "Priority"}</TableHead>
                  <TableHead>{language === "fr" ? "Statut" : "Status"}</TableHead>
                  <TableHead className="text-right">{language === "fr" ? "Photos" : "Photos"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      {language === "fr" ? "Chargement..." : "Loading..."}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground">
                      {language === "fr" ? "Aucune réclamation" : "No claims"}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => (
                    <TableRow key={c.claimId}>
                      <TableCell className="font-mono text-xs">{c.claimCode}</TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{c.equipmentName ?? `#${c.equipmentId}`}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.priorityLabel ?? c.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.statusLabel ?? c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{c.photoCount ?? 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
