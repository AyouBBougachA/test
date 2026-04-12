import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
    outline: "text-foreground",
  };

  return (
    <div className={cn(baseStyle, variants[variant], className)} {...props} />
  )
}

export { Badge }
