import type React from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  glassmorphism?: boolean
}

export function Card({ children, className, glassmorphism = false }: CardProps) {
  const baseStyles = "rounded-xl border transition-all duration-200"
  const glassStyles = glassmorphism
    ? "bg-white/10 backdrop-blur-md border-white/20"
    : "bg-white border-gray-200 shadow-sm hover:shadow-md"

  return <div className={cn(baseStyles, glassStyles, className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>
}
