"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function WorkOrdersPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Ordres de travail" : "Work Orders"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucun endpoint backend pour les ordres de travail."
              : "Module not available: no backend endpoints for work orders."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
