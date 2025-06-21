"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { WalletModal } from "./WalletModal"
import { WalletInfo } from "./WalletInfo"
import { useWallet } from "@/contexts/WalletContext"
import { ChevronDown } from "lucide-react"

export function WalletButton() {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const { isConnected, address, isWrongNetwork } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <>
        <Button
          variant={isWrongNetwork ? "outline" : "secondary"}
          className={`${isWrongNetwork ? "border-red-500 text-red-500" : ""}`}
          onClick={() => setShowInfoModal(true)}
        >
          {isWrongNetwork ? "Wrong Network" : formatAddress(address)}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
        <WalletInfo isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
      </>
    )
  }

  return (
    <>
      <Button onClick={() => setShowConnectModal(true)}>Connect Wallet</Button>
      <WalletModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </>
  )
}
