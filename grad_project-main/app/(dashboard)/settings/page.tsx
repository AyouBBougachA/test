"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

import Link from "next/link"
import { Palette, ChevronRight } from "lucide-react"

export default function SettingsPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{language === "fr" ? "Paramètres" : "Settings"}</h1>
        <p className="text-muted-foreground mt-1">{language === "fr" ? "Configuration globale du système." : "Global system configuration."}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/color-rules">
          <Card className="hover:shadow-md transition-all hover:border-primary cursor-pointer h-full group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Palette className="h-5 w-5" />
                  </div>
                  {language === "fr" ? "Règles de couleur" : "Color Rules"}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardTitle>
              <CardDescription className="pt-2">
                {language === "fr"
                  ? "Gérer les couleurs du système pour les statuts, les notifications et les indicateurs."
                  : "Manage global system colors for statuses, notifications, and indicators."}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
