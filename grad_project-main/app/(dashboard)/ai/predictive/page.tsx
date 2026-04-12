"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function AiPredictivePage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "IA - Prédictif" : "AI - Predictive"}</CardTitle>
          <CardDescription>
            {language === "fr" ? "Module non disponible : aucune API IA." : "Module not available: no AI API."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
