"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, Pencil, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { claimsApi } from "@/lib/api/claims"
import type { ClaimPhotoResponse, ClaimResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { useI18n } from "@/lib/i18n"

function getPriorityColor(priority: string) {
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

function getStatusColor(status: string) {
  switch (normalizeStatusLabel(status)) {
    case "open":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "assigned":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
    case "in progress":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
    case "closed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function normalizeLabel(value: string) {
  return value.replaceAll("_", " ").trim()
}

function normalizeStatusLabel(value: string) {
  const normalized = normalizeLabel(value).toLowerCase()
  if (normalized === "qualified") return "open"
  return normalized
}

function toDisplayStatusLabel(value: string) {
  const normalized = normalizeStatusLabel(value)
  return normalized.replace(/\b\w/g, (m) => m.toUpperCase())
}

export default function ClaimDetailsPage() {
  const { language } = useI18n()
  const params = useParams<{ claimId: string }>()
  const claimId = Number(params?.claimId)

  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [photos, setPhotos] = useState<ClaimPhotoResponse[]>([])
  const photoUrlRef = useRef<Record<number, string>>({})
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [photosError, setPhotosError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPhotosLoading, setIsPhotosLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(claimId)) {
      setError(language === "fr" ? "ID invalide" : "Invalid claim ID")
      setIsLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setIsPhotosLoading(true)
      setError(null)
      setPhotosError(null)
      try {
        const claimRes = await claimsApi.getById(claimId)
        if (!cancelled) setClaim(claimRes)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          setError(`Request failed (${err.status})`)
        } else {
          setError(language === "fr" ? "Échec du chargement" : "Failed to load")
        }
      }

      try {
        const photosRes = await claimsApi.listPhotos(claimId)
        if (!cancelled) setPhotos(photosRes)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
          setPhotosError(`Request failed (${err.status})`)
        } else {
          setPhotosError(language === "fr" ? "Échec du chargement" : "Failed to load")
        }
        setPhotos([])
      } finally {
        if (!cancelled) setIsLoading(false)
        if (!cancelled) setIsPhotosLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [claimId, language])

  const priorityLabel = useMemo(() => {
    if (!claim) return ""
    return claim.priorityLabel ?? normalizeLabel(String(claim.priority ?? ""))
  }, [claim])

  const statusLabel = useMemo(() => {
    if (!claim) return ""
    const raw = claim.statusLabel ?? normalizeLabel(String(claim.status ?? ""))
    return toDisplayStatusLabel(raw)
  }, [claim])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (photos.length === 0) {
        Object.values(photoUrlRef.current).forEach((url) => URL.revokeObjectURL(url))
        photoUrlRef.current = {}
        setPhotoUrls({})
        return
      }

      const nextUrls: Record<number, string> = {}
      for (const photo of photos) {
        try {
          const blob = await claimsApi.getPhotoBlob(claimId, photo.photoId)
          if (cancelled) return
          nextUrls[photo.photoId] = URL.createObjectURL(blob)
        } catch {
          // Skip preview if download fails.
        }
      }

      if (cancelled) return
      Object.values(photoUrlRef.current).forEach((url) => URL.revokeObjectURL(url))
      photoUrlRef.current = nextUrls
      setPhotoUrls(nextUrls)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [claimId, photos])

  useEffect(() => {
    return () => {
      Object.values(photoUrlRef.current).forEach((url) => URL.revokeObjectURL(url))
      photoUrlRef.current = {}
    }
  }, [])

  const handleDeletePhoto = async (photoId: number) => {
    if (!claim) return
    setIsDeleting(photoId)
    try {
      await claimsApi.deletePhoto(claim.claimId, photoId)
      setPhotos((prev) => prev.filter((p) => p.photoId !== photoId))
      const current = photoUrlRef.current
      if (current[photoId]) {
        URL.revokeObjectURL(current[photoId])
        const { [photoId]: _removed, ...rest } = current
        photoUrlRef.current = rest
        setPhotoUrls(rest)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Request failed (${err.status})`)
        return
      }
      setError(language === "fr" ? "Échec de suppression" : "Failed to delete")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleConvert = async () => {
    if (!claim) return
    setIsConverting(true)
    try {
      await claimsApi.convertToWorkOrder(claim.claimId)
      // Refresh claim to show new status (IN_PROGRESS)
      const claimRes = await claimsApi.getById(claimId)
      setClaim(claimRes)
    } catch (err) {
      setError(language === "fr" ? "Échec de la conversion" : "Conversion failed")
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/claims">
            <Button variant="ghost" size="icon" type="button">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {language === "fr" ? "Détails de la réclamation" : "Claim Details"}
            </h1>
            <p className="text-muted-foreground">
              {claim?.claimCode ?? ""}
            </p>
          </div>
        </div>
        {claim && (
          <div className="flex items-center gap-2">
            {['OPEN', 'QUALIFIED', 'ASSIGNED'].includes(claim.status ?? "") && (user?.roleName === 'ADMIN' || user?.roleName === 'MAINTENANCE_MANAGER') && (
              <Button 
                variant="outline" 
                className="gap-2 border-primary/50 text-primary hover:bg-primary/10" 
                onClick={handleConvert}
                disabled={isConverting}
              >
                <Wrench className={`h-4 w-4 ${isConverting ? 'animate-spin' : ''}`} />
                {language === "fr" ? "Convertir en BM" : "Convert to WO"}
              </Button>
            )}
            <Link href={`/claims/${claim.claimId}/edit`}>
              <Button className="gap-2" type="button">
                <Pencil className="h-4 w-4" />
                {language === "fr" ? "Modifier" : "Edit"}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {language === "fr" ? "Résumé" : "Summary"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </p>
          ) : claim ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Titre" : "Title"}
                </p>
                <p className="font-medium text-foreground">{claim.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Équipement" : "Equipment"}
                </p>
                <p className="font-medium text-foreground">
                  {claim.equipmentName ?? `#${claim.equipmentId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Priorité" : "Priority"}
                </p>
                <Badge variant="outline" className={getPriorityColor(priorityLabel)}>
                  {priorityLabel}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Statut" : "Status"}
                </p>
                <Badge variant="outline" className={getStatusColor(statusLabel)}>
                  {statusLabel}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Département" : "Department"}
                </p>
                <p className="font-medium text-foreground">{claim.departmentName ?? "-"}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Description" : "Description"}</CardTitle>
        </CardHeader>
        <CardContent>
          {claim ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{claim.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Photos" : "Photos"}</CardTitle>
        </CardHeader>
        <CardContent>
          {photosError && <p className="text-sm text-destructive">{photosError}</p>}
          {isPhotosLoading ? (
            <p className="text-sm text-muted-foreground">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </p>
          ) : photos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => {
                const src = photoUrls[photo.photoId]
                const label = photo.originalName ?? `Photo #${photo.photoId}`
                return (
                  <div key={photo.photoId} className="rounded-lg border border-border overflow-hidden">
                    <div className="aspect-video bg-muted">
                      {src ? (
                        <img
                          src={src}
                          alt={label}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          {language === "fr" ? "Aperçu indisponible" : "Preview unavailable"}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <p className="truncate text-xs text-muted-foreground">{label}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        disabled={isDeleting === photo.photoId}
                        onClick={() => handleDeletePhoto(photo.photoId)}
                      >
                        {language === "fr" ? "Supprimer" : "Delete"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {language === "fr" ? "Aucune photo" : "No photos"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
