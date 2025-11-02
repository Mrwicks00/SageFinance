"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave";
}

export function LoadingSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: LoadingSkeletonProps) {
  const baseClasses = "bg-gray-700/50 animate-pulse";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
  };

  const style = {
    width: width || (variant === "circular" ? height : "100%"),
    height: height || (variant === "text" ? "1rem" : "100%"),
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton width={120} height={24} />
        <LoadingSkeleton variant="circular" width={24} height={24} />
      </div>
      <LoadingSkeleton width="60%" height={32} />
      <LoadingSkeleton width="40%" height={20} />
      <div className="space-y-3 pt-4">
        <LoadingSkeleton height={60} />
        <LoadingSkeleton height={60} />
        <LoadingSkeleton height={60} />
      </div>
    </div>
  );
}