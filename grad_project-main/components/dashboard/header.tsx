"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
  Wrench,
  Database,
  ArrowRight,
  ShieldAlert
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { useAuth, getRoleLabel } from "@/lib/auth-context"
import { departmentsApi } from "@/lib/api/departments"
import { useI18n, LanguageSwitcher } from "@/lib/i18n"
import { notificationsApi } from "@/lib/api/notifications"
import { workOrdersApi } from "@/lib/api/work-orders"
import { equipmentApi } from "@/lib/api/equipment"
import { claimsApi } from "@/lib/api/claims"
import type { NotificationResponse } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { WorkOrderTypeIcon } from "@/components/work-order-type-badge"

export function DashboardHeader() {
  const { t, language } = useI18n()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [selectedSite, setSelectedSite] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    equipment: any[]
    wos: any[]
    claims: any[]
  }>({ equipment: [], wos: [], claims: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const loadNotifications = async () => {
    if (!user?.id) return
    try {
      const data = await notificationsApi.getUnread(user.id)
      setNotifications(data)
      setUnreadCount(data.length)
    } catch (e) {
      console.error("Failed to load notifications", e)
    }
  }

  const markRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return
    try {
      await notificationsApi.markAllAsRead(user.id)
      setNotifications([])
      setUnreadCount(0)
    } catch (e) {
      console.error(e)
    }
  }

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults({ equipment: [], wos: [], claims: [] })
      return
    }
    setIsSearching(true)
    try {
      const [eq, wos, claims] = await Promise.all([
        equipmentApi.search({ q }),
        workOrdersApi.list().then(list => list.filter(w =>
          w.title.toLowerCase().includes(q.toLowerCase()) ||
          w.woCode.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3)),
        claimsApi.list({ q }).then(list => Array.isArray(list) ? list.slice(0, 3) : [])
      ])
      setSearchResults({ equipment: eq.slice(0, 3), wos, claims })
    } catch (err) {
      console.error("Search failed", err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) performSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await departmentsApi.getAll()
        if (cancelled) return
        setDepartments(data.map((d) => ({ id: String(d.departmentId), name: d.departmentName })))

        await loadNotifications()
      } catch {
        if (!cancelled) setDepartments([])
      }
    }

    load()
    const interval = setInterval(loadNotifications, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user?.id])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-[24px] sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Dashboard navigation menu</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <div className="relative hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("search")}
              className="h-10 w-64 pl-9 lg:w-96 bg-muted/20 border-border/40 focus:bg-background transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
            />
          </div>

          <AnimatePresence>
            {showResults && searchQuery.length >= 2 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute top-12 left-0 w-[500px] z-50 bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl overflow-hidden p-2"
                >
                  <ScrollArea className="max-h-[500px]">
                    <div className="p-2 space-y-4">
                      {/* EQUIPMENT RESULTS */}
                      {searchResults.equipment.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Inventory & Equipment</p>
                          <div className="mt-1 space-y-1">
                            {searchResults.equipment.map(eq => (
                              <SearchPreviewCard
                                key={eq.id}
                                icon={<Database className="h-4 w-4" />}
                                title={eq.label}
                                sub={eq.departmentName}
                                href={`/equipment/${eq.id}`}
                                status={eq.status}
                                onClick={() => setShowResults(false)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* WORK ORDER RESULTS */}
                      {searchResults.wos.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Work Orders</p>
                          <div className="mt-1 space-y-1">
                            {searchResults.wos.map(wo => (
                              <SearchPreviewCard
                                key={wo.woId}
                                icon={<Wrench className="h-4 w-4 text-indigo-500" />}
                                title={wo.title}
                                sub={wo.woCode}
                                href={`/work-orders/${wo.woId}`}
                                status={wo.status}
                                variant="indigo"
                                onClick={() => setShowResults(false)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CLAIM RESULTS */}
                      {searchResults.claims.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-[100px] font-bold text-muted-foreground uppercase tracking-widest">Fault Reports</p>
                          <div className="mt-1 space-y-1">
                            {searchResults.claims.map(claim => (
                              <SearchPreviewCard
                                key={claim.claimId}
                                icon={<AlertCircle className="h-4 w-4 text-rose-500" />}
                                title={claim.title}
                                sub={`#${claim.claimId}`}
                                href={`/claims/${claim.claimId}`}
                                status={claim.statusLabel || claim.status}
                                variant="rose"
                                onClick={() => setShowResults(false)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.values(searchResults).every(arr => arr.length === 0) && !isSearching && (
                        <div className="py-10 text-center text-muted-foreground italic text-xs">No matches found for "{searchQuery}"</div>
                      )}

                      {isSearching && (
                        <div className="py-10 text-center animate-pulse text-primary text-xs font-bold uppercase tracking-widest">Scanning Network...</div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-3 bg-muted/20 border-t border-border/40 text-[10px] text-muted-foreground italic">
                    Press ESC to close • Global Intelligence Search
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden items-center gap-3 xl:flex">
        <Select value={selectedSite} onValueChange={setSelectedSite} disabled>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder={t("selectSite")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allSites")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder={t("selectDepartment")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allDepartments")}</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs border-2 border-background"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="font-bold">{t("notifications")}</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="destructive" className="animate-pulse">{unreadCount} new</Badge>}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg"
                    onClick={markAllAsRead}
                  >
                    {language === 'fr' ? 'Tout marquer lu' : 'Mark all read'}
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              <div className="flex flex-col">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground italic">
                    {language === "fr" ? "Auncune nouvelle notification" : "All caught up!"}
                  </div>
                ) : (
                  notifications.map(note => (
                    <div
                      key={note.id}
                      className="flex gap-3 p-4 border-b border-border/40 hover:bg-muted/30 transition-colors group relative cursor-pointer"
                      onClick={() => markRead(note.id)}
                    >
                      <div className={cn(
                        "mt-1 h-8 w-8 shrink-0 rounded-xl flex items-center justify-center border border-border/40",
                        note.type === 'WARNING' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                          note.type === 'RECOMMENDATION' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30" : "bg-primary/10 text-primary"
                      )}>
                        {/* Show WO type icon if the message references a known module */}
                        {note.message?.toUpperCase().includes('CORRECTIVE') ? <WorkOrderTypeIcon type="CORRECTIVE" size="sm" /> :
                          note.message?.toUpperCase().includes('PREVENTIVE') ? <WorkOrderTypeIcon type="PREVENTIVE" size="sm" /> :
                            note.message?.toUpperCase().includes('REGULATORY') ? <WorkOrderTypeIcon type="REGULATORY" size="sm" /> :
                              note.message?.toUpperCase().includes('PREDICTIVE') ? <WorkOrderTypeIcon type="PREDICTIVE" size="sm" /> :
                                note.type === 'WARNING' ? <AlertCircle className="h-4 w-4" /> :
                                  note.type === 'RECOMMENDATION' ? <Clock className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-1 pr-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                          {note.type}
                        </p>
                        <p className="text-xs leading-relaxed text-foreground font-medium">
                          {note.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-2 top-4 transition-opacity">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer justify-center text-primary font-bold text-xs py-3 hover:bg-primary/5">
              <Link href="/notifications">{language === 'fr' ? 'Toutes les notifications' : 'View Full Alert Hub'}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/40">
              <Avatar className="h-8 w-8 rounded-xl ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-bold tracking-tight">{user?.name || "Guest User"}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  {user ? getRoleLabel(user.roleName, language as 'en' | 'fr' | 'ar') : "—"}
                </span>
              </div>
              <ChevronDown className="hidden h-3 w-3 text-muted-foreground md:block opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl">
            <DropdownMenuLabel className="pb-4 pt-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-black"> {user?.name?.[0]} </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold">{user?.name || "Guest User"}</span>
                  <span className="text-[11px] font-normal text-muted-foreground truncate max-w-[140px]">{user?.email || "guest@demo.com"}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-xl mx-1 mb-1 focus:bg-primary/5">
              <Link href="/profile">
                <User className="mr-2 h-4 w-4 text-primary" />
                {t("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl mx-1 mb-1 focus:bg-primary/5">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4 text-primary" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl mx-1 text-destructive focus:bg-destructive/5 font-bold">
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function SearchPreviewCard({ icon, title, sub, href, status, variant = "primary", onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className="block group">
      <div className="p-3 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-border/40 shadow-sm transition-transform group-hover:scale-105",
            variant === 'indigo' ? "bg-indigo-500/10" : variant === 'rose' ? "bg-rose-500/10" : "bg-primary/10"
          )}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{sub}</p>
              {status && (
                <>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <Badge variant="outline" className="h-4 px-1 text-[8px] font-black uppercase border-muted-foreground/20"> {status} </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
      </div>
    </Link>
  )
}
