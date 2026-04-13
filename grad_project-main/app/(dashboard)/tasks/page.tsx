"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Clock, 
  Wrench,
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { tasksApi } from "@/lib/api/tasks"
import type { TaskResponse } from "@/lib/api/types"
import { format } from "date-fns"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function TasksPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, language } = useAuth()
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const loadData = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const data = await tasksApi.getAll()
      setTasks(data)
    } catch (error) {
      console.error("Failed to load tasks", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, isAuthLoading])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.description.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || task.status.toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [tasks, search, filter])

  const toggleComplete = async (task: TaskResponse) => {
    if (task.status === 'COMPLETED') return
    try {
      await tasksApi.complete(task.taskId)
      loadData()
    } catch (error) {
      console.error("Failed to complete task", error)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <motion.div 
      initial="initial" 
      animate="animate" 
      className="flex-1 space-y-6 overflow-auto pb-10"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {language === 'fr' ? 'Mes Tâches' : 'Maintenance Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fr' 
              ? 'Suivez et validez les étapes individuelles de vos interventions.' 
              : 'Track and validate individual steps of your interventions.'}
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        {[
          { 
            title: language === 'fr' ? 'À faire' : 'To Do', 
            count: tasks.filter(t => t.status === 'PENDING').length, 
            icon: Clock, 
            color: "text-amber-500",
            bg: "bg-amber-500/10"
          },
          { 
            title: language === 'fr' ? 'Complétées' : 'Completed', 
            count: tasks.filter(t => t.status === 'COMPLETED').length, 
            icon: CheckCircle2, 
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
          },
          { 
            title: 'Total', 
            count: tasks.length, 
            icon: Wrench, 
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/40 backdrop-blur-md shadow-sm ring-1 ring-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={fadeInUp} className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={language === 'fr' ? "Rechercher une tâche..." : "Search tasks..."} 
            className="pl-9 bg-card/40 backdrop-blur-md border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card/40 border-border">
              <Filter className="h-4 w-4 mr-2" />
              {filter === 'all' ? 'All Status' : filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("all")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("PENDING")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("COMPLETED")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Tasks List */}
      <motion.div variants={fadeInUp}>
        <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl ring-1 ring-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Synchronizing tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-muted-foreground">Either you are all caught up or no tasks match your filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredTasks.sort((a,b) => a.orderIndex - b.orderIndex).map((task) => (
                  <div key={task.taskId} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors group">
                    <button 
                      onClick={() => toggleComplete(task)}
                      disabled={task.status === 'COMPLETED'}
                      className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'COMPLETED' 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium transition-all ${task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.description}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">WO-{task.woId}</Badge>
                        </div>
                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(task.completedAt), 'MMM d, HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
