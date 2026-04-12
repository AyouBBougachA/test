"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function RulesThresholdsPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Règles et seuils" : "Rules & Thresholds"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucune API de règles/alertes." 
              : "Module not available: no rules/alerts API."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {language === "fr"
            ? "Les seuils des compteurs sont gérés par compteur dans la page Compteurs."
            : "Meter thresholds are managed per meter in the Meters page."}
        </CardContent>
      </Card>
    </div>
  )
}
