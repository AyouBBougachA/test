"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertTriangle, ArrowLeft, Camera, Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n"
import { claimsApi } from "@/lib/api/claims"
import { departmentsApi } from "@/lib/api/departments"
import type { ClaimResponse, DepartmentResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

export default function EditClaimPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const params = useParams<{ claimId: string }>()
  const claimId = Number(params?.claimId)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [departmentId, setDepartmentId] = useState("")
  const [photos, setPhotos] = useState<File[]>([])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(claimId)) {
      setError(language === "fr" ? "ID invalide" : "Invalid claim ID")
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [claimRes, deptRes] = await Promise.all([
          claimsApi.getById(claimId),
          departmentsApi.getAll(),
        ])
        if (cancelled) return
        setClaim(claimRes)
        setDepartments(deptRes)
        setTitle(claimRes.title ?? "")
        setDescription(claimRes.description ?? "")
        setPriority(String(claimRes.priority ?? "MEDIUM"))
        setDepartmentId(claimRes.departmentId ? String(claimRes.departmentId) : "")
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError) {
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
  }, [claimId, language])

  const departmentOptions = useMemo(() => departments ?? [], [departments])

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    setPhotos(Array.from(fileList))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !departmentId) {
      setError(language === "fr" ? "Veuillez remplir les champs requis." : "Please fill in required fields.")
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const updated = await claimsApi.update(claimId, {
        title: title.trim(),
        description: description.trim(),
        priority,
        departmentId: Number(departmentId),
      })

      if (photos.length > 0) {
        const results = await Promise.allSettled(
          photos.map((file) => claimsApi.uploadPhoto(claimId, file)),
        )
        const failed = results.filter((r) => r.status === "rejected")
        if (failed.length > 0) {
          toast({
            title: language === "fr" ? "Photos partiellement importées" : "Photos partially uploaded",
            description: language === "fr"
              ? "Certaines photos n'ont pas pu être importées."
              : "Some photos failed to upload.",
          })
        }
      }

      toast({
        title: language === "fr" ? "Réclamation mise à jour" : "Claim updated",
        description: updated.claimCode,
      })
      router.push(`/claims/${claimId}`)
    } catch (err) {
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
      setError(language === "fr" ? "Échec de mise à jour" : "Failed to update")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={claim ? `/claims/${claim.claimId}` : "/claims"}>
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {language === "fr" ? "Modifier la réclamation" : "Edit Claim"}
          </h1>
          <p className="text-muted-foreground">
            {claim?.claimCode ?? ""}
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {language === "fr" ? "Détails de la réclamation" : "Claim Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "fr" ? "Titre" : "Title"} *
                </label>
                <Input
                  placeholder={
                    language === "fr"
                      ? "Décrivez brièvement le problème..."
                      : "Briefly describe the issue..."
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("equipment")}</label>
                <Input value={claim?.equipmentName ?? ""} readOnly />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("department")} *</label>
                <Input value={claim?.departmentName ?? ""} readOnly />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("priority")} *</label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger>
                    <SelectValue placeholder={language === "fr" ? "Sélectionnez la priorité..." : "Select priority..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        {t("critical")}
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        {t("high")}
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        {t("medium")}
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        {t("low")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("description")} *</label>
                <Textarea
                  placeholder={
                    language === "fr"
                      ? "Décrivez le problème en détail: symptômes observés, circonstances, impact sur le service..."
                      : "Describe the issue in detail: observed symptoms, circumstances, impact on service..."
                  }
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "fr" ? "Photos (optionnel)" : "Photos (optional)"}
                </label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {language === "fr"
                        ? "Glissez des photos ou cliquez pour télécharger"
                        : "Drag photos or click to upload"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {language === "fr" ? "Télécharger" : "Upload"}
                    </Button>
                    {photos.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {language === "fr"
                          ? `${photos.length} photo(s) sélectionnée(s)`
                          : `${photos.length} file(s) selected`}
                      </p>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Link href={claim ? `/claims/${claim.claimId}` : "/claims"} className="flex-1">
                  <Button variant="outline" className="w-full" type="button">
                    {t("cancel")}
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
                >
                  <Save className="h-4 w-4" />
                  {isSaving
                    ? language === "fr" ? "Enregistrement..." : "Saving..."
                    : language === "fr" ? "Enregistrer" : "Save"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
