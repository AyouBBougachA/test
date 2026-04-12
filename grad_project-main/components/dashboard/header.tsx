"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, LogOut, Menu, Moon, Search, Settings, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"

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

export function DashboardHeader() {
  const { t, language } = useI18n()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const [selectedSite, setSelectedSite] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])

  const unreadNotifications = 0

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await departmentsApi.getAll()
        if (cancelled) return
        setDepartments(data.map((d) => ({ id: String(d.departmentId), name: d.departmentName })))
      } catch {
        if (!cancelled) setDepartments([])
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("search")} className="h-9 w-64 pl-9 lg:w-80" />
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
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              {t("notifications")}
              <Badge variant="secondary">{unreadNotifications} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-72">
              <DropdownMenuItem disabled className="p-3 text-sm text-muted-foreground">
                {language === "fr" ? "Notifications non disponibles" : "Notifications are not available"}
              </DropdownMenuItem>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-sm font-medium">{user?.name || "Guest User"}</span>
                <span className="text-xs text-muted-foreground">{user ? getRoleLabel(user.roleName, language) : "—"}</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || "Guest User"}</span>
                <span className="font-normal text-muted-foreground">{user?.email || "guest@demo.com"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                {t("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
