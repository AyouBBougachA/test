"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function ReportsPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Rapports" : "Reports"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucune API de rapports."
              : "Module not available: no reports API."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
