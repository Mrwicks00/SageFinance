// dropdown-menu.tsx
'use client'
import React, { useState, useRef, useEffect, createContext, useContext } from 'react'

interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownContext = createContext<DropdownContextType | null>(null)

interface DropdownMenuProps {
  children: React.ReactNode
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild = false, 
  className = '',
  ...props 
}) => {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')
  
  const { isOpen, setIsOpen } = context
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      className: `${children.props.className || ''} ${className}`.trim(),
      ...props
    })
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  className = '', 
  align = 'start', 
  sideOffset = 4 
}) => {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')
  
  const { isOpen, setIsOpen } = context
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-yellow-500/20 bg-black/95 backdrop-blur-xl p-1 text-white shadow-lg shadow-black/50 ${alignmentClasses[align]} ${className}`}
      style={{ 
        top: `calc(100% + ${sideOffset}px)`,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(234, 179, 8, 0.1)'
      }}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  ...props 
}) => {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu')
  
  const { setIsOpen } = context

  const handleClick = () => {
    if (!disabled) {
      onClick?.()
      setIsOpen(false)
    }
  }

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-yellow-500/10 hover:text-yellow-300 focus:bg-yellow-500/10 focus:text-yellow-300 ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

export {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
}