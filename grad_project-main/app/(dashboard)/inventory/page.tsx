"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  Filter,
  Layers,
  MapPin,
  Truck,
  History,
  CheckCircle,
  XCircle,
  TrendingDown,
  DollarSign,
  CalendarDays,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { inventoryApi } from "@/lib/api/inventory"
import type { SparePartResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function InventoryPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { language } = useI18n()
  const [parts, setParts] = useState<SparePartResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  useEffect(() => {
    setCurrentPage(1)
  }, [search, categoryFilter])

  const [valuation, setValuation] = useState(0)
  const [pendingRestocks, setPendingRestocks] = useState<any[]>([])
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [selectedPartForRestock, setSelectedPartForRestock] = useState<number | null>(null)
  const [restockQty, setRestockQty] = useState(10)

  const [newPart, setNewPart] = useState({
    name: "",
    sku: "",
    category: "",
    quantityInStock: 0,
    minStockLevel: 5,
    unitCost: 0,
    location: "",
    supplier: ""
  })

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const [partsData, valuationData, pendingData] = await Promise.all([
        inventoryApi.list(),
        inventoryApi.getValuation(),
        inventoryApi.getPendingRestocks()
      ])
      setParts(partsData)
      setValuation(valuationData)
      setPendingRestocks(pendingData)
    } catch (error) {
      console.error("Failed to load inventory data", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRestock = async () => {
    if (!selectedPartForRestock || !user?.id) return
    try {
      await inventoryApi.requestRestock(selectedPartForRestock, restockQty, user.id)
      setIsRestockDialogOpen(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleApproveRestock = async (id: number) => {
    if (!user?.id) return
    try {
      await inventoryApi.approveRestock(id, user.id)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, isAuthLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inventoryApi.create(newPart)
      setIsDialogOpen(false)
      setNewPart({
        name: "",
        sku: "",
        category: "",
        quantityInStock: 0,
        minStockLevel: 5,
        unitCost: 0,
        location: "",
        supplier: ""
      })
      loadData()
    } catch (error) {
      console.error("Failed to add spare part", error)
    }
  }

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesSearch = (part.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
                           (part.sku?.toLowerCase() || "").includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || part.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [parts, search, categoryFilter])

  const paginatedParts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredParts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredParts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage)


  const categories = useMemo(() => {
    const cats = new Set(parts.map(p => p.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [parts])

  const getStockBadge = (part: SparePartResponse) => {
    const isLow = part.quantityInStock <= part.minStockLevel
    if (part.quantityInStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (isLow) {
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Low Stock</Badge>
    }
    return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">In Stock</Badge>
  }

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="flex-1 space-y-6 overflow-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {language === 'fr' ? 'Inventaire des Pièces' : 'Spare Parts Inventory'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Gérez votre stock de pièces de rechange et les niveaux de réapprovisionnement.' 
              : 'Manage your spare parts stock and replenishment levels.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'Ajouter une Pièce' : 'Add Spare Part'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border shadow-2xl text-foreground">
              <DialogHeader>
                <DialogTitle>Register Spare Part</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Enroll a new item in the clinical inventory system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Part Name</label>
                    <Input 
                      required 
                      placeholder="e.g. MRI Cooling Fan" 
                      value={newPart.name}
                      onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">SKU / Reference</label>
                    <Input 
                      required 
                      placeholder="REF-123456" 
                      value={newPart.sku}
                      onChange={(e) => setNewPart({...newPart, sku: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input 
                      placeholder="e.g. Mechanical" 
                      value={newPart.category}
                      onChange={(e) => setNewPart({...newPart, category: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Unit Cost ($)</label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={newPart.unitCost}
                      onChange={(e) => setNewPart({...newPart, unitCost: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Initial Stock</label>
                    <Input 
                      type="number"
                      required
                      value={newPart.quantityInStock}
                      onChange={(e) => setNewPart({...newPart, quantityInStock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Alert Level (Min)</label>
                    <Input 
                      type="number"
                      required
                      value={newPart.minStockLevel}
                      onChange={(e) => setNewPart({...newPart, minStockLevel: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Storage Location</label>
                  <Input 
                    placeholder="Shelf B-12" 
                    value={newPart.location}
                    onChange={(e) => setNewPart({...newPart, location: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Save Part</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Valuation</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${valuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Asset value in stock</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-rose-500">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {parts.filter(p => p.quantityInStock <= p.minStockLevel).length}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Restocks</CardTitle>
            <Truck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRestocks.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Integrity</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Manager Review Section */}
      {(user?.roleName === 'ADMIN' || user?.roleName === 'MAINTENANCE_MANAGER') && pendingRestocks.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">Pending Manager Review</CardTitle>
              <CardDescription>Verify and approve stock replenishment requests from technicians.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRestocks.map(req => {
                  const part = parts.find(p => p.partId === req.partId)
                  return (
                    <div key={req.requestId} className="flex items-center justify-between p-3 rounded-lg border border-amber-500/10 bg-background/50">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-sm">{part?.name || 'Unknown Part'} (x{req.quantity})</p>
                          <p className="text-xs text-muted-foreground">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 shadow-sm">Details</Button>
                        <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20" onClick={() => handleApproveRestock(req.requestId)}>Approve Arrival</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'fr' ? "Rechercher par nom ou SKU..." : "Search by name or SKU..."} 
            className="pl-9 bg-card border-border shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card border-border shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
                Category: {categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setCategoryFilter("all")}>All Categories</DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>{cat}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Inventory List */}
      <motion.div variants={fadeInUp}>
        <Card className="border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="animate-pulse">Loading core database...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Info</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedParts.map((part) => (
                      <TableRow key={part.partId} className="cursor-pointer hover:bg-muted/30 group">
                        <TableCell>
                          <div className="font-medium text-base">{part.name}</div>
                          <div className="text-xs text-muted-foreground">{part.category}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{part.sku}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">{part.quantityInStock}</span>
                            {getStockBadge(part)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                            Min: {part.minStockLevel} units
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{part.location || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          ${part.unitCost?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 gap-1 px-2 border border-transparent hover:border-amber-500/20 hover:text-amber-500 transition-all"
                              onClick={() => {
                                setSelectedPartForRestock(part.partId)
                                setIsRestockDialogOpen(true)
                              }}
                             >
                              <History className="h-4 w-4" />
                              Restock
                             </Button>
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                               <Edit2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-4">
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Affichage" : "Showing"} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {language === "fr" ? "à" : "to"} <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredParts.length)}</span> {language === "fr" ? "sur" : "of"} <span className="font-medium">{filteredParts.length}</span> {language === "fr" ? "résultats" : "results"}
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
        </Card>
      </motion.div>

      {/* Restock Request Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Stock Replenishment</DialogTitle>
            <DialogDescription>
              Create a formal request for new inventory. High priority items will notify the manager.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Quantity to Order</label>
              <Input 
                type="number" 
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleCreateRestock} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">Submit Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
