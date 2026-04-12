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
  Truck
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
import { useI18n } from "@/lib/i18n"
import { inventoryApi } from "@/lib/api/inventory"
import type { SparePartResponse } from "@/lib/api/types"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function InventoryPage() {
  const { language } = useI18n()
  const [parts, setParts] = useState<SparePartResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await inventoryApi.list()
      setParts(data)
    } catch (error) {
      console.error("Failed to load inventory", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(search.toLowerCase()) || 
                           part.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || part.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [parts, search, categoryFilter])

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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'fr' ? 'Ajouter une Pièce' : 'Add Spare Part'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
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
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Categories</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'fr' ? "Rechercher par nom ou SKU..." : "Search by name or SKU..."} 
            className="pl-9 bg-card/50 backdrop-blur-sm border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card/50 border-border">
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
        <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl ring-1 ring-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="animate-pulse">Loading core database...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-4 px-6 font-semibold">Part Info</th>
                      <th className="py-4 px-6 font-semibold">SKU</th>
                      <th className="py-4 px-6 font-semibold">Stock Level</th>
                      <th className="py-4 px-6 font-semibold">Location</th>
                      <th className="py-4 px-6 font-semibold">Unit Cost</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.map((part) => (
                      <tr key={part.partId} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium">{part.name}</div>
                          <div className="text-xs text-muted-foreground">{part.category}</div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">{part.sku}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">{part.quantityInStock}</span>
                            {getStockBadge(part)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                            Min: {part.minStockLevel} units
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{part.location || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium">
                          ${part.unitCost?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4" />
                             </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
