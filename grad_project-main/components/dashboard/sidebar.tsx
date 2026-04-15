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
  children?: { label: string; href: string; icon?: typeof Home }[]
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
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
    },
    {
      label: t("workOrders"),
      icon: Wrench,
      href: "/work-orders",
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
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
        { label: t("workload"), href: "/planning/workload", icon: BarChart3 },
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
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "TECHNICIAN"],
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
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "DIRECTION_FINANCE"],
    },
    // Analytics
    {
      label: t("bi"),
      icon: BarChart3,
      children: [
        { label: t("executive"), href: "/bi/executive", icon: BarChart3 },
        { label: t("maintenance"), href: "/bi/maintenance", icon: Wrench },
        { label: t("biomedical"), href: "/bi/biomedical", icon: Heart },
        { label: t("financial"), href: "/bi/financial", icon: DollarSign },
      ],
      roles: ["ADMIN", "MAINTENANCE_MANAGER", "DIRECTION_FINANCE"],
    },
    // Administration
    {
      label: t("admin"),
      icon: Shield,
      children: [
        { label: t("users"), href: "/admin/users", icon: Users },
        { label: t("roles"), href: "/admin/roles", icon: Shield },
        { label: t("referenceData"), href: "/admin/reference-data", icon: Database },
        { label: t("rulesThresholds"), href: "/admin/rules-thresholds", icon: Settings },
        { label: t("auditLogs"), href: "/admin/audit-logs", icon: FileText },
      ],
      roles: ["ADMIN"],
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
    const userRole = (user.roleName ?? '').toUpperCase()
    return roles.map((r) => r.toUpperCase()).includes(userRole)
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
                        {item.children.map((child) => (
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
                        ))}
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href!)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
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
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </aside>
  )
}
