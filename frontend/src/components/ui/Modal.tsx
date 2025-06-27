"use client"

import type React from "react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X, ArrowLeft } from "lucide-react"
import { cn } from "../../lib/utils"
import Image from 'next/image';


interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  showBackButton?: boolean
  onBack?: () => void
  size?: "sm" | "md" | "lg"
}

export function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  subtitle,
  className,
  showBackButton = false,
  onBack,
  size = "md"
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg"
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative bg-white rounded-3xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-100",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || showBackButton) && (
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            >
              <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Wallet Modal Component
interface WalletOption {
  id: string
  name: string
  icon: string
  description?: string
  installed?: boolean
  recent?: boolean
}

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletId: string) => void
  wallets: WalletOption[]
}

export function WalletModal({ isOpen, onClose, onSelectWallet, wallets }: WalletModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Wallet"
      subtitle="Choose how you want to connect"
      size="md"
    >
      <div className="p-6 space-y-3">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => onSelectWallet(wallet.id)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                <Image 
                  src={wallet.icon} 
                  alt={wallet.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{wallet.name}</span>
                  {wallet.recent && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Recent
                    </span>
                  )}
                </div>
                {wallet.description && (
                  <p className="text-sm text-gray-600 mt-1">{wallet.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!wallet.installed && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Install
                </span>
              )}
              <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
        
        {/* Footer */}
        <div className="pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              New to Ethereum wallets?
            </p>
            <button className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors">
              Learn more about wallets
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}