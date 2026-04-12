"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { equipmentApi } from "@/lib/api/equipment"
import type { DepartmentResponse, EquipmentResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

export default function NewClaimPage() {
  const { language } = useI18n()
  const router = useRouter()
  const { toast } = useToast()

  const [equipment, setEquipment] = useState<EquipmentResponse[]>([])
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [isLoadingRefs, setIsLoadingRefs] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [equipmentId, setEquipmentId] = useState<string>("")
  const [departmentId, setDepartmentId] = useState<string>("__none__")

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoadingRefs(true)
    setError(null)

    const load = async () => {
      try {
        const [eqRes, deptRes] = await Promise.all([
          equipmentApi.getAll(),
          departmentsApi.getAll(),
        ])
        if (cancelled) return
        setEquipment(eqRes)
        setDepartments(deptRes)
      } catch {
        if (!cancelled) setError(language === "fr" ? "Échec du chargement" : "Failed to load")
      } finally {
        if (!cancelled) setIsLoadingRefs(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [language])

  const equipmentOptions = useMemo(() => equipment ?? [], [equipment])
  const departmentOptions = useMemo(() => departments ?? [], [departments])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !equipmentId) {
      setError(language === "fr" ? "Veuillez remplir les champs requis." : "Please fill in required fields.")
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      const created = await claimsApi.create({
        title: title.trim(),
        description: description.trim(),
        priority,
        equipmentId: Number(equipmentId),
        departmentId: departmentId === "__none__" ? null : Number(departmentId),
      })
      toast({
        title: language === "fr" ? "Réclamation créée" : "Claim created",
        description: created.claimCode,
      })
      router.push("/claims")
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
      setError(language === "fr" ? "Échec de création" : "Failed to create")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Nouvelle réclamation" : "New Claim"}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">{language === "fr" ? "Titre" : "Title"}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === "fr" ? "Ex: Panne d'ascenseur" : "e.g. Elevator failure"}
              />
            </div>

            <div className="grid gap-2">
              <Label>{language === "fr" ? "Priorité" : "Priority"}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{language === "fr" ? "Équipement" : "Equipment"}</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId} disabled={isLoadingRefs}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingRefs ? (language === "fr" ? "Chargement..." : "Loading...") : (language === "fr" ? "Sélectionner" : "Select")} />
                </SelectTrigger>
                <SelectContent>
                  {equipmentOptions.map((eq) => (
                    <SelectItem key={eq.equipmentId} value={String(eq.equipmentId)}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{language === "fr" ? "Département (optionnel)" : "Department (optional)"}</Label>
              <Select value={departmentId} onValueChange={setDepartmentId} disabled={isLoadingRefs}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{language === "fr" ? "Aucun" : "None"}</SelectItem>
                  {departmentOptions.map((d) => (
                    <SelectItem key={d.departmentId} value={String(d.departmentId)}>
                      {d.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{language === "fr" ? "Description" : "Description"}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === "fr" ? "Décrivez le problème..." : "Describe the issue..."}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/claims")}
                disabled={isSaving}
              >
                {language === "fr" ? "Annuler" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? language === "fr" ? "Création..." : "Creating..."
                  : language === "fr" ? "Créer" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
