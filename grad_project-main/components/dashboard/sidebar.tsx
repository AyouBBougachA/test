"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Database,
  DollarSign,
  FileText,
  Gauge,
  GanttChart,
  Heart,
  Home,
  Kanban,
  Menu,
  Package,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useEffect } from "react"

interface NavItem {
  label: string
  icon: typeof Home
  href?: string
  children?: { label: string; href: string; icon?: typeof Home; roles?: string[] }[]
  roles?: string[]
}

export function DashboardSidebar() {
  const { t, language } = useI18n()
  const { user, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(["planning", "ai", "bi", "admin"])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [meterAlertCount, setMeterAlertCount] = useState(0)

  const isMaintenanceStaff = user?.hasRole('ADMIN', 'MAINTENANCE_MANAGER') ?? false

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isAuthenticated || !isMaintenanceStaff) return

    const checkMeters = async () => {
      try {
        const { metersApi } = await import("@/lib/api/meters")
        const { mapMeterResponseToUiCard } = await import("@/lib/adapters")
        const meters = await metersApi.getAll()
        const uiM = meters.map(mapMeterResponseToUiCard)
        const count = uiM.filter(m => m.status === 'warning' || m.status === 'critical').length
        setMeterAlertCount(count)
      } catch (e) {
        console.error("Sidebar meter check failed", e)
      }
    }

    checkMeters()
    const interval = setInterval(checkMeters, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated, isMaintenanceStaff])

  // Organized by recommended sidebar groups
  const navItems: NavItem[] = [
    // Overview
    {
      label: t("dashboard"),
      icon: Home,
      href: "/dashboard",
    },
    // Operations
    {
      label: t("equipment"),
      icon: Database,
      href: "/equipment",
    },
    {
      label: t("claims"),
      icon: AlertTriangle,
      href: "/claims",
      roles: ["ADMIN", "MAINTENANCE_MANAGER"],
    },
    {
      label: t("workOrders"),
      icon: Wrench,
      href: "/work-orders",
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN", "FINANCE_MANAGER"],
    },
    {
      label: t("tasks"),
      icon: Clipboard,
      href: "/tasks",
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
    },
    {
      label: t("planning"),
      icon: Calendar,
      children: [
        { label: t("kanban"), href: "/planning/kanban", icon: Kanban },
        { label: t("calendar"), href: "/planning/calendar", icon: Calendar },
        { label: t("regulatoryPlans"), href: "/planning/regulatory", icon: ShieldCheck },
        { label: t("gantt"), href: "/planning/gantt", icon: GanttChart },
      ],
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
    },
    {
      label: t("meters"),
      icon: Gauge,
      href: "/meters",
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
    },
    {
      label: t("inventory"),
      icon: Package,
      href: "/inventory",
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN", "FINANCE_MANAGER"],
    },
    // Intelligence
    {
      label: t("ai"),
      icon: Brain,
      children: [
        { label: t("prioritization"), href: "/ai/prioritization", icon: Sparkles },
        { label: t("predictive"), href: "/ai/predictive", icon: Activity },
        { label: t("failureAnalysis"), href: "/ai/failure-analysis", icon: AlertTriangle },
      ],
      roles: ["ADMIN", "MAINTENANCE_MANAGER"],
    },
    // Analytics
    {
      label: t("bi"),
      icon: BarChart3,
      children: [
        { label: t("executive"), href: "/bi/executive", icon: BarChart3 },
        { label: t("maintenance"), href: "/bi/maintenance", icon: Wrench },
      ],
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "FINANCE_MANAGER"],
    },
    // Administration
    {
      label: t("admin"),
      icon: Shield,
      children: [
        { label: t("users"), href: "/admin/users", icon: Users, roles: ["ADMIN"] },
        { label: t("roles"), href: "/admin/roles", icon: Shield, roles: ["ADMIN"] },
        { label: t("referenceData"), href: "/admin/reference-data", icon: Database, roles: ["ADMIN", "MAINTENANCE_MANAGER"] },
        { label: t("rulesThresholds"), href: "/admin/rules-thresholds", icon: Settings, roles: ["ADMIN"] },
        { label: t("auditLogs"), href: "/admin/audit-logs", icon: FileText, roles: ["ADMIN"] },
      ],
      roles: ["ADMIN", "MAINTENANCE_MANAGER"],
    },
  ]

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => pathname === href
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href)

  const canAccess = (roles?: string[]) => {
    if (!roles) return true
    if (isLoading) return true
    if (!isAuthenticated || !user) return false
    return user.hasRole(...roles)
  }

  // Sidebar content component
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
            <Heart className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-sidebar-foreground"
            >
              MedCare
            </motion.span>
          )}
        </Link>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!canAccess(item.roles)) return null

            if (item.children) {
              const isExpanded = expandedItems.includes(item.label)
              const parentActive = isParentActive(item.children)

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      parentActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1 space-y-1 overflow-hidden border-l border-border pl-4"
                      >
                        {item.children.map((child) => {
                          if (!canAccess(child.roles)) return null
                          
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive(child.href)
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                              )}
                            >
                              {child.icon && <child.icon className="h-4 w-4" />}
                              <span>{child.label}</span>
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href!)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {collapsed && item.href === '/meters' && meterAlertCount > 0 && (
                      <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-sidebar shadow-sm">
                        {meterAlertCount > 9 ? '9+' : meterAlertCount}
                      </div>
                    )}
                  </div>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.href === '/meters' && meterAlertCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm"
                    >
                      {meterAlertCount > 99 ? '99+' : meterAlertCount}
                    </motion.div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Settings Link */}
      <div className="border-t border-border p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive("/settings")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>
      </div>
    </>
  )

  // Mobile drawer version
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Dashboard navigation menu</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "sticky left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </aside>
  )
}
