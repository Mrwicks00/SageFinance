"use client"

import { useEffect, useRef } from "react"
import { useState } from "react"

export type AnimationType =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "scale-down"
  | "rotate-in"
  | "flip-up"
  | "bounce-in"

export interface ScrollAnimationOptions {
  animation?: AnimationType
  duration?: number
  delay?: number
  threshold?: number
  triggerOnce?: boolean
  stagger?: number
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const { animation = "fade-in", duration = 600, delay = 0, threshold = 0.1, triggerOnce = true, stagger = 0 } = options

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay + stagger)

          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [delay, threshold, triggerOnce, stagger])

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-out`

    if (!isVisible) {
      switch (animation) {
        case "fade-in":
          return `${baseClasses} opacity-0`
        case "slide-up":
          return `${baseClasses} opacity-0 translate-y-8`
        case "slide-down":
          return `${baseClasses} opacity-0 -translate-y-8`
        case "slide-left":
          return `${baseClasses} opacity-0 translate-x-8`
        case "slide-right":
          return `${baseClasses} opacity-0 -translate-x-8`
        case "scale-up":
          return `${baseClasses} opacity-0 scale-95`
        case "scale-down":
          return `${baseClasses} opacity-0 scale-105`
        case "rotate-in":
          return `${baseClasses} opacity-0 rotate-3 scale-95`
        case "flip-up":
          return `${baseClasses} opacity-0 -rotate-x-90`
        case "bounce-in":
          return `${baseClasses} opacity-0 scale-50`
        default:
          return `${baseClasses} opacity-0`
      }
    }

    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100 rotate-0`
  }

  const getAnimationStyle = () => {
    if (animation === "bounce-in" && isVisible) {
      return {
        animation: `bounceIn ${duration}ms ease-out`,
      }
    }
    return {}
  }

  return {
    ref,
    isVisible,
    className: getAnimationClasses(),
    style: getAnimationStyle(),
  }
}

export function useStaggeredAnimation(count: number, options: ScrollAnimationOptions = {}) {
  const animations = Array.from({ length: count }, (_, index) =>
    useScrollAnimation({
      ...options,
      stagger: (options.stagger || 100) * index,
    }),
  )

  return animations
}
