"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Database, Plus, Edit, Trash2, Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useAuth } from "@/lib/auth-context"
import { departmentsApi } from "@/lib/api/departments"
import { referenceDataApi } from "@/lib/api/reference-data"
import { equipmentApi } from "@/lib/api/equipment"
import type { DepartmentResponse, EquipmentCategory, EquipmentModel, EquipmentResponse } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { useToast } from "@/components/ui/use-toast"

type AddKind = "department" | "category" | "model"

function getApiErrorMessage(err: unknown): string {
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function ReferenceDataPage() {
  const { t, language } = useI18n()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()

  const [tab, setTab] = useState("departments")

  const [addOpen, setAddOpen] = useState(false)
  const [addKind, setAddKind] = useState<AddKind>("department")
  const [addName, setAddName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [models, setModels] = useState<EquipmentModel[]>([])
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async (opts?: { keepLoadingState?: boolean }) => {
    const keepLoadingState = opts?.keepLoadingState ?? false
    if (!keepLoadingState) {
      setIsFetching(true)
      setError(null)
    }
    try {
      const [depsRes, catsRes, modelsRes, eqRes] = await Promise.all([
        departmentsApi.getAll(),
        referenceDataApi.getCategories(),
        referenceDataApi.getModels(),
        equipmentApi.getAll(),
      ])
      setDepartments(depsRes)
      setCategories(catsRes)
      setModels(modelsRes)
      setEquipment(eqRes)
    } catch {
      setDepartments([])
      setCategories([])
      setModels([])
      setEquipment([])
      setError(language === "fr" ? "Impossible de charger les données" : "Failed to load reference data")
    } finally {
      if (!keepLoadingState) setIsFetching(false)
    }
  }

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
        await loadAll({ keepLoadingState: true })
        if (cancelled) return
      } catch {
        if (cancelled) return
        setDepartments([])
        setCategories([])
        setModels([])
        setEquipment([])
        setError(language === "fr" ? "Impossible de charger les données" : "Failed to load reference data")
      } finally {
        if (!cancelled) setIsFetching(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [language])

  const openAdd = () => {
    if (tab === "categories") setAddKind("category")
    else if (tab === "models") setAddKind("model")
    else setAddKind("department")
    setAddName("")
    setAddOpen(true)
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    const name = addName.trim()
    if (!name) {
      toast({
        title: language === "fr" ? "Nom requis" : "Name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (addKind === "department") {
        await departmentsApi.create({ departmentName: name })
        toast({ title: language === "fr" ? "Département créé" : "Department created" })
      } else if (addKind === "category") {
        await referenceDataApi.createCategory(name)
        toast({ title: language === "fr" ? "Catégorie créée" : "Category created" })
      } else {
        await referenceDataApi.createModel(name)
        toast({ title: language === "fr" ? "Modèle créé" : "Model created" })
      }
      setAddOpen(false)
      await loadAll()
    } catch (err) {
      toast({
        title: language === "fr" ? "Échec de création" : "Create failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onDeleteDepartment = async (id: number) => {
    try {
      await departmentsApi.delete(id)
      toast({ title: language === "fr" ? "Département supprimé" : "Department deleted" })
      await loadAll()
    } catch (err) {
      toast({
        title: language === "fr" ? "Suppression impossible" : "Delete failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const onDeleteClassification = async (key: string) => {
    try {
      if (key.startsWith("cat-")) {
        const id = Number(key.replace("cat-", ""))
        await referenceDataApi.deleteCategory(id)
        toast({ title: language === "fr" ? "Catégorie supprimée" : "Category deleted" })
      } else if (key.startsWith("model-")) {
        const id = Number(key.replace("model-", ""))
        await referenceDataApi.deleteModel(id)
        toast({ title: language === "fr" ? "Modèle supprimé" : "Model deleted" })
      }
      await loadAll()
    } catch (err) {
      toast({
        title: language === "fr" ? "Suppression impossible" : "Delete failed",
        description: getApiErrorMessage(err),
        variant: "destructive",
      })
    }
  }

  const categoryCounts = useMemo(() => {
    const map = new Map<number, number>()
    for (const e of equipment) {
      if (e.categoryId == null) continue
      map.set(e.categoryId, (map.get(e.categoryId) ?? 0) + 1)
    }
    return map
  }, [equipment])

  const modelCounts = useMemo(() => {
    const map = new Map<number, number>()
    for (const e of equipment) {
      if (e.modelId == null) continue
      map.set(e.modelId, (map.get(e.modelId) ?? 0) + 1)
    }
    return map
  }, [equipment])

  const classificationRows = useMemo(() => {
    const rows: { key: string; name: string; category: string; count: number }[] = []
    for (const c of categories) {
      rows.push({
        key: `cat-${c.categoryId}`,
        name: c.name,
        category: language === "fr" ? "Catégorie" : "Category",
        count: categoryCounts.get(c.categoryId) ?? 0,
      })
    }
    for (const m of models) {
      rows.push({
        key: `model-${m.modelId}`,
        name: m.name,
        category: language === "fr" ? "Modèle" : "Model",
        count: modelCounts.get(m.modelId) ?? 0,
      })
    }
    return rows
  }, [categories, categoryCounts, language, modelCounts, models])

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="flex-1 space-y-6 overflow-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reference Data Management</h1>
          <p className="text-muted-foreground">Manage departments, categories, and models</p>
        </div>
        <Button onClick={openAdd} disabled={isFetching}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </motion.div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addKind === "department"
                ? (language === "fr" ? "Ajouter un département" : "Add Department")
                : addKind === "category"
                  ? (language === "fr" ? "Ajouter une catégorie" : "Add Category")
                  : (language === "fr" ? "Ajouter un modèle" : "Add Model")}
            </DialogTitle>
            <DialogDescription>
              {language === "fr"
                ? "Création selon les endpoints existants du backend."
                : "Creates items using the backend endpoints."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">{language === "fr" ? "Nom" : "Name"}</Label>
              <Input
                id="add-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder={language === "fr" ? "Nom" : "Name"}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-6 font-semibold text-foreground">Department</th>
                        <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isFetching ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={2}>
                            {language === "fr" ? "Chargement..." : "Loading..."}
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="py-6 px-6 text-destructive" colSpan={2}>
                            {error}
                          </td>
                        </tr>
                      ) : departments.length === 0 ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={2}>
                            {language === "fr" ? "Aucun département" : "No departments"}
                          </td>
                        </tr>
                      ) : (
                        departments.map((dept) => (
                          <tr key={dept.departmentId} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-6 text-foreground font-medium">{dept.departmentName}</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => onDeleteDepartment(dept.departmentId)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{language === "fr" ? "Catégories" : "Categories"}</CardTitle>
                <CardDescription>
                  {language === "fr" ? "Catégories d’équipement" : "Equipment categories"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Nom" : "Name"}</th>
                        <th className="text-right py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Équipements" : "Equipment Count"}</th>
                        <th className="text-right py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Actions" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isFetching ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={3}>
                            {language === "fr" ? "Chargement..." : "Loading..."}
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="py-6 px-6 text-destructive" colSpan={3}>
                            {error}
                          </td>
                        </tr>
                      ) : categories.length === 0 ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={3}>
                            {language === "fr" ? "Aucune catégorie" : "No categories"}
                          </td>
                        </tr>
                      ) : (
                        categories.map((cat) => (
                          <tr key={cat.categoryId} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-6 text-foreground font-medium">{cat.name}</td>
                            <td className="py-4 px-6 text-right text-muted-foreground">{categoryCounts.get(cat.categoryId) ?? 0}</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => onDeleteClassification(`cat-${cat.categoryId}`)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{language === "fr" ? "Modèles" : "Models"}</CardTitle>
                <CardDescription>
                  {language === "fr" ? "Modèles d’équipement" : "Equipment models"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Nom" : "Name"}</th>
                        <th className="text-right py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Équipements" : "Equipment Count"}</th>
                        <th className="text-right py-4 px-6 font-semibold text-foreground">{language === "fr" ? "Actions" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isFetching ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={3}>
                            {language === "fr" ? "Chargement..." : "Loading..."}
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td className="py-6 px-6 text-destructive" colSpan={3}>
                            {error}
                          </td>
                        </tr>
                      ) : models.length === 0 ? (
                        <tr>
                          <td className="py-6 px-6 text-muted-foreground" colSpan={3}>
                            {language === "fr" ? "Aucun modèle" : "No models"}
                          </td>
                        </tr>
                      ) : (
                        models.map((m) => (
                          <tr key={m.modelId} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-6 text-foreground font-medium">{m.name}</td>
                            <td className="py-4 px-6 text-right text-muted-foreground">{modelCounts.get(m.modelId) ?? 0}</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive"
                                  onClick={() => onDeleteClassification(`model-${m.modelId}`)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
