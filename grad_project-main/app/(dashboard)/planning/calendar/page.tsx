"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function PlanningCalendarPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Planification - Calendrier" : "Planning - Calendar"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucune API de planification/calendrier." 
              : "Module not available: no planning/calendar API."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
