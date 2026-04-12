"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"
import { aiApi } from "@/lib/api/ai"
import type { PredictionResponse } from "@/lib/api/types"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function AiPredictivePage() {
  const { language } = useI18n()
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await aiApi.getPredictions()
      setPredictions(data)
    } catch (error) {
      console.error("Failed to load AI predictions", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPredictions = predictions.filter(p => 
    p.equipmentName.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.riskScore - a.riskScore)

  const getRiskColor = (score: number) => {
    if (score > 80) return "text-rose-500"
    if (score > 60) return "text-orange-500"
    if (score > 40) return "text-amber-500"
    return "text-emerald-500"
  }

  const getRiskBg = (score: number) => {
    if (score > 80) return "bg-rose-500/10"
    if (score > 60) return "bg-orange-500/10"
    if (score > 40) return "bg-amber-500/10"
    return "bg-emerald-500/10"
  }

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="flex-1 space-y-6 overflow-auto pb-10"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
           <div className="bg-primary/10 p-3 rounded-2xl shadow-inner">
             <BrainCircuit className="h-8 w-8 text-primary" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">
               Predictive Analytics
             </h1>
             <p className="text-muted-foreground italic">
               AI-driven failure risk assessment based on equipment age, usage, and history.
             </p>
           </div>
        </div>
        <Button onClick={loadData} variant="outline" className="gap-2">
           <Zap className="h-4 w-4" />
           Run Analysis
        </Button>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-4">
        {[
          { label: "High Risk Units", value: predictions.filter(p => p.riskScore > 60).length, color: "text-rose-500" },
          { label: "Avg Risk Score", value: Math.round(predictions.reduce((acc, p) => acc + p.riskScore, 0) / (predictions.length || 1)), color: "text-primary" },
          { label: "Analyzed Devices", value: predictions.length, color: "text-emerald-500" },
          { label: "Predicted WO", value: Math.round(predictions.filter(p => p.riskScore > 50).length * 0.8), color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-sm ring-1 ring-border">
            <CardContent className="pt-6">
               <div className="text-2xl font-bold tracking-tight mb-1">{stat.value}</div>
               <div className={`text-xs font-medium uppercase tracking-widest ${stat.color}`}>{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeInUp} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter equipment by name..." 
          className="pl-9 bg-card/50 backdrop-blur-sm border-border"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div variants={fadeInUp} className="grid gap-6">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
             <Activity className="h-10 w-10 text-primary animate-pulse mx-auto" />
             <p className="text-muted-foreground">Neural engine is calculating risk vectors...</p>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
             <p className="text-muted-foreground">No analysis results found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPredictions.map((pred) => (
              <Card key={pred.equipmentId} className="border-none bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border group hover:ring-primary/50 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{pred.equipmentName}</CardTitle>
                      <CardDescription>ID: EQ-{pred.equipmentId}</CardDescription>
                    </div>
                    <Badge className={`${getRiskBg(pred.riskScore)} ${getRiskColor(pred.riskScore)} border-none px-3 py-1 font-bold`}>
                      {pred.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground uppercase tracking-widest">Failure Risk Score</span>
                      <span className={getRiskColor(pred.riskScore)}>{Math.round(pred.riskScore)}%</span>
                    </div>
                    <Progress value={pred.riskScore} className="h-1.5" indicatorClassName={getRiskColor(pred.riskScore).replace('text-', 'bg-')} />
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border/50">
                    <div className="flex items-start gap-2 text-sm">
                       <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                       <span className="font-medium">{pred.recommendation}</span>
                    </div>
                    {pred.factors.length > 0 && (
                      <div className="pl-6 space-y-1">
                        {pred.factors.map((factor, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                            {factor}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" className="w-full justify-between text-xs h-8 hover:bg-primary/5 hover:text-primary transition-colors">
                     Open Detailed Failure Analysis
                     <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
