import * as React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = "", type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-12 w-full rounded-xl border border-gray-700/50 bg-black/50 backdrop-blur-sm px-4 py-2 text-base text-white placeholder:text-gray-400 focus:border-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-gray-600/50 ${className}`}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
