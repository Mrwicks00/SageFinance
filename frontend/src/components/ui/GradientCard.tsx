"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  gradient?: "yellow" | "purple" | "blue" | "green" | "pink";
  hover?: boolean;
  glow?: boolean;
}

const gradients = {
  yellow: "from-yellow-400/10 via-yellow-500/5 to-transparent",
  purple: "from-purple-500/10 via-purple-600/5 to-transparent",
  blue: "from-blue-500/10 via-blue-600/5 to-transparent",
  green: "from-green-500/10 via-green-600/5 to-transparent",
  pink: "from-pink-500/10 via-pink-600/5 to-transparent",
};

const borders = {
  yellow: "border-yellow-400/20 hover:border-yellow-400/40",
  purple: "border-purple-500/20 hover:border-purple-500/40",
  blue: "border-blue-500/20 hover:border-blue-500/40",
  green: "border-green-500/20 hover:border-green-500/40",
  pink: "border-pink-500/20 hover:border-pink-500/40",
};

const glows = {
  yellow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]",
  purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
  blue: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  green: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  pink: "hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
};

export function GradientCard({
  children,
  className,
  gradient = "yellow",
  hover = true,
  glow = false,
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6",
        "transition-all duration-300",
        borders[gradient],
        hover && "hover:scale-[1.02] hover:-translate-y-1",
        glow && glows[gradient],
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-50",
          gradients[gradient]
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}