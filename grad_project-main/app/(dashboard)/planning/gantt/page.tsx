"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function PlanningGanttPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Planification - Gantt" : "Planning - Gantt"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucune API de planification." 
              : "Module not available: no planning API."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
