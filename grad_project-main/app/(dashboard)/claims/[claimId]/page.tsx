"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangle, ArrowLeft, Pencil, Wrench, CheckCircle, UserPlus, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { claimsApi } from "@/lib/api/claims"
import { usersApi } from "@/lib/api/users"
import type { ClaimPhotoResponse, ClaimResponse, UserResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

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
  const { user } = useAuth()
  const params = useParams<{ claimId: string }>()
  const claimId = Number(params?.claimId)

  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [photos, setPhotos] = useState<ClaimPhotoResponse[]>([])
  const [technicians, setTechnicians] = useState<UserResponse[]>([])
  const photoUrlRef = useRef<Record<number, string>>({})
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [photosError, setPhotosError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPhotosLoading, setIsPhotosLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  
  // Workflow states
  const [isConverting, setIsConverting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [qualifyNotes, setQualifyNotes] = useState("")
  const [assignUserId, setAssignUserId] = useState<string>("")

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
        
        const techs = await usersApi.getAll()
        if (!cancelled) setTechnicians(techs.filter(t => t.roleName === 'TECHNICIAN' || t.roleId === 3))
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
      const claimRes = await claimsApi.getById(claimId)
      setClaim(claimRes)
    } catch (err) {
      setError(language === "fr" ? "Échec de la conversion" : "Conversion failed")
    } finally {
      setIsConverting(false)
    }
  }

  const handleQualify = async () => {
    if (!claim) return
    setActionLoading("qualify")
    try {
      await claimsApi.qualify(claim.claimId, { qualificationNotes: qualifyNotes })
      const claimRes = await claimsApi.getById(claimId)
      setClaim(claimRes)
    } catch (err) {
      setError(language === "fr" ? "Échec de la qualification" : "Qualification failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleAssign = async () => {
    if (!claim || !assignUserId) return
    setActionLoading("assign")
    try {
      await claimsApi.assign(claim.claimId, { assignedToUserId: parseInt(assignUserId) })
      const claimRes = await claimsApi.getById(claimId)
      setClaim(claimRes)
    } catch (err) {
      setError(language === "fr" ? "Échec de l'assignation" : "Assignment failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = async () => {
    if (!claim) return
    setActionLoading("close")
    try {
      await claimsApi.updateStatus(claim.claimId, { status: "CLOSED", note: "Manually closed via ui." })
      const claimRes = await claimsApi.getById(claimId)
      setClaim(claimRes)
    } catch (err) {
      setError(language === "fr" ? "Échec de la fermeture" : "Closure failed")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <div className="flex flex-wrap items-center gap-2">
            
            {/* LINKED WO */}
            {claim.linkedWoId && (
              <Link href={`/work-orders/${claim.linkedWoId}`}>
                <Button variant="outline" className="gap-2 border-primary/50 text-primary">
                   <Wrench className="h-4 w-4" />
                   {language === "fr" ? "Voir le BM lié" : "View Linked WO"}
                </Button>
              </Link>
            )}

            {(user?.roleName === 'ADMIN' || user?.roleName === 'MAINTENANCE_MANAGER') && (
              <>
                {/* QUALIFY */}
                {claim.status === 'NEW' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 text-indigo-600 border-indigo-200">
                         <CheckCircle className="h-4 w-4" />
                         {language === "fr" ? "Qualifier" : "Qualify"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Qualify Claim</DialogTitle></DialogHeader>
                      <Textarea 
                        placeholder="Resolution or qualification notes..." 
                        value={qualifyNotes} 
                        onChange={e => setQualifyNotes(e.target.value)} 
                      />
                      <DialogFooter>
                         <Button onClick={handleQualify} disabled={actionLoading === "qualify"}>Confirm Qualification</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* ASSIGN */}
                {['QUALIFIED'].includes(claim.status ?? "") && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 text-violet-600 border-violet-200">
                         <UserPlus className="h-4 w-4" />
                         {language === "fr" ? "Assigner" : "Assign"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Assign Technician</DialogTitle></DialogHeader>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                        value={assignUserId} 
                        onChange={e => setAssignUserId(e.target.value)}
                      >
                        <option value="">Select Technician...</option>
                        {technicians.map(t => <option key={t.userId} value={t.userId}>{t.fullName}</option>)}
                      </select>
                      <DialogFooter>
                         <Button onClick={handleAssign} disabled={actionLoading === "assign"}>Confirm Assignment</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* CONVERT */}
                {['QUALIFIED', 'ASSIGNED'].includes(claim.status ?? "") && !claim.linkedWoId && (
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

                {/* CLOSE */}
                {!['CLOSED', 'REJECTED', 'RESOLVED'].includes(claim.status ?? "") && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 text-rose-600 border-rose-200">
                         <XCircle className="h-4 w-4" />
                         {language === "fr" ? "Fermer" : "Close"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Close Claim</DialogTitle></DialogHeader>
                      <p className="text-sm text-muted-foreground">Are you sure you want to forcibly close this claim?</p>
                      <DialogFooter>
                         <Button variant="destructive" onClick={handleClose} disabled={actionLoading === "close"}>
                           {actionLoading === "close" ? "Closing..." : "Close Claim"}
                         </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "fr" ? "Technicien assigné" : "Assigned Tech"}
                </p>
                <p className="font-medium text-foreground">{claim.assignedToName ?? "-"}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
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
             <CardTitle>{language === "fr" ? "Notes de traitement" : "Processing Notes"}</CardTitle>
           </CardHeader>
           <CardContent>
             {claim?.qualificationNotes || claim?.rejectionNotes ? (
               <div className="space-y-4">
                  {claim.qualificationNotes && (
                    <div>
                       <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Qualify Notes</span>
                       <p className="text-sm border-l-2 border-indigo-500 pl-3 py-1 bg-muted/30">{claim.qualificationNotes}</p>
                    </div>
                  )}
                  {claim.rejectionNotes && (
                    <div>
                       <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Reject Notes</span>
                       <p className="text-sm border-l-2 border-rose-500 pl-3 py-1 bg-muted/30">{claim.rejectionNotes}</p>
                    </div>
                  )}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground italic">No processing notes yet.</p>
             )}
           </CardContent>
         </Card>
      </div>

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
