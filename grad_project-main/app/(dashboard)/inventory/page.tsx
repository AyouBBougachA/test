"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export default function InventoryPage() {
  const { language } = useI18n()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{language === "fr" ? "Inventaire" : "Inventory"}</CardTitle>
          <CardDescription>
            {language === "fr"
              ? "Module non disponible : aucune API d’inventaire." 
              : "Module not available: no inventory API."}
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
