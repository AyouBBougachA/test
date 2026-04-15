"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Clock,
  FileText,
  Settings,
  Shield,
  Wrench,
  Download,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  EyeOff
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useI18n } from "@/lib/i18n"

import { equipmentApi } from "@/lib/api/equipment"
import { workOrdersApi } from "@/lib/api/work-orders"
import { departmentsApi } from "@/lib/api/departments"
import { referenceDataApi } from "@/lib/api/reference-data"
import type { 
  EquipmentResponse, 
  EquipmentDocument, 
  EquipmentHistory, 
  WorkOrderResponse,
  DepartmentResponse,
  EquipmentCategory,
  EquipmentModel
} from "@/lib/api/types"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, language } = useI18n()
  const { toast } = useToast()
  const equipmentId = Number(params.id)

  const [equipment, setEquipment] = useState<EquipmentResponse | null>(null)
  const [documents, setDocuments] = useState<EquipmentDocument[]>([])
  const [history, setHistory] = useState<EquipmentHistory[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrderResponse[]>([])
  
  const [departments, setDepartments] = useState<DepartmentResponse[]>([])
  const [categories, setCategories] = useState<EquipmentCategory[]>([])
  const [models, setModels] = useState<EquipmentModel[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Document Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [eq, docs, hist, wos, depts, cats, mods] = await Promise.all([
          equipmentApi.getById(equipmentId),
          equipmentApi.getDocuments(equipmentId),
          equipmentApi.getHistory(equipmentId),
          workOrdersApi.list({ equipmentId }),
          departmentsApi.getAll(),
          referenceDataApi.getCategories(),
          referenceDataApi.getModels()
        ])
        setEquipment(eq)
        setDocuments(docs)
        setHistory(hist)
        setWorkOrders(wos)
        setDepartments(depts)
        setCategories(cats)
        setModels(mods)
      } catch (err) {
        toast({
          title: language === "fr" ? "Erreur" : "Error",
          description: language === "fr" ? "Impossible de charger l'équipement." : "Failed to load equipment.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    if (equipmentId) fetchData()
  }, [equipmentId, language, toast])

  if (isLoading) {
    return <div className="p-8 text-center">{t("loading")}</div>
  }

  if (!equipment) {
    return <div className="p-8 text-center text-destructive">{t("noData")}</div>
  }

  const deptName = departments.find(d => d.departmentId === equipment.departmentId)?.departmentName || "—"
  const catName = categories.find(c => c.categoryId === equipment.categoryId)?.name || "—"
  const modName = models.find(m => m.modelId === equipment.modelId)?.name || "—"

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "OPERATIONAL": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">{t("operational")}</Badge>
      case "UNDER_REPAIR": return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">{t("underRepair")}</Badge>
      case "ARCHIVED": return <Badge variant="secondary">{t("archived")}</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const toggleOutOfService = async () => {
    if (isUpdatingStatus) return
    setIsUpdatingStatus(true)
    const newStatus = equipment.status === "OPERATIONAL" ? "UNDER_REPAIR" : "OPERATIONAL"
    try {
      await equipmentApi.updateStatus(equipmentId, newStatus)
      setEquipment({ ...equipment, status: newStatus })
      toast({ title: newStatus === "UNDER_REPAIR" ? "Marqué hors service" : "Remis en service" })
      // Refresh history
      const hist = await equipmentApi.getHistory(equipmentId)
      setHistory(hist)
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDocumentUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      await equipmentApi.uploadDocument(equipmentId, selectedFile)
      toast({ title: "Document ajouté" })
      setSelectedFile(null)
      const docs = await equipmentApi.getDocuments(equipmentId)
      setDocuments(docs)
    } catch {
      toast({ title: "Erreur d'envoi", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  // Generate URL for QR (assume frontend domain + path)
  const qrUrl = typeof window !== "undefined" ? window.location.href : `https://cmms.local/equipment/${equipmentId}`

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{equipment.serialNumber} • {deptName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(equipment.status)}
          
          <Button 
            variant={equipment.status === "OPERATIONAL" ? "destructive" : "default"}
            onClick={toggleOutOfService}
            disabled={isUpdatingStatus || equipment.status === "ARCHIVED"}
          >
            {equipment.status === "OPERATIONAL" ? (
              <><EyeOff className="mr-2 h-4 w-4"/> Hors service</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4"/> En service</>
            )}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Settings className="mr-2 h-4 w-4"/> Imprimer QR</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-center">
              <DialogHeader>
                <DialogTitle>Code QR de l'équipement</DialogTitle>
                <DialogDescription>Scannez pour accéder rapidement à cette page.</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCodeSVG value={qrUrl} size={250} level="H" includeMargin />
              </div>
              <p className="font-mono text-sm">{equipment.serialNumber}</p>
              <div className="flex justify-center mt-4">
                 <Button onClick={() => window.print()}>Imprimer</Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar Info */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Emplacement</span>
                <span className="font-medium">{equipment.location || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Catégorie</span>
                <span className="font-medium">{catName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Modèle</span>
                <span className="font-medium">{modName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Criticité</span>
                <span className="font-medium">{equipment.criticality || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Achat</span>
                <span className="font-medium">{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Garantie</span>
                <span className="font-medium">{equipment.warrantyEndDate ? new Date(equipment.warrantyEndDate).toLocaleDateString() : "—"}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compteur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {equipment.startMeterValue || 0} <span className="text-sm text-muted-foreground">{equipment.meterUnit || "unités"}</span>
              </div>
              {equipment.thresholds && equipment.thresholds.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Seuil d'alerte: {equipment.thresholds.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <div className="md:col-span-3">
          <Tabs defaultValue="wos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wos">Interventions ({workOrders.length})</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="docs">Documents ({documents.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bons de travail ouverts</CardTitle>
                  <CardDescription>Interventions liées à cet équipement.</CardDescription>
                </CardHeader>
                <CardContent>
                  {workOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucune intervention.</div>
                  ) : (
                    <div className="space-y-4">
                      {workOrders.map(wo => (
                        <div key={wo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                          <div>
                            <Link href={`/work-orders/${wo.id}`} className="font-medium hover:underline flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-blue-500" />
                              {wo.title}
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{wo.description}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="outline">{wo.status}</Badge>
                            <Badge variant="secondary">{wo.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journal d'activité</CardTitle>
                  <CardDescription>Traçabilité des changements de statuts et alertes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                    {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground ml-6">Aucun historique récent.</p>
                    ) : history.map((h, i) => (
                      <div key={i} className="mb-6 ml-6">
                        <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border ring-4 ring-background">
                          <Activity className="h-3 w-3" />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{h.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.createdAt).toLocaleString()} • Par {h.performedBy}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documentation technique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                    <Button onClick={handleDocumentUpload} disabled={!selectedFile || isUploading}>
                      <Upload className="h-4 w-4 mr-2" /> Uploader
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.documentName}</p>
                            <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => window.open(`/api/equipment/documents/${doc.id}/download`)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
