"use client"
import { useConnect } from "wagmi"
import { Connector } from "wagmi"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { useWallet } from "@/contexts/WalletContext"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connectors, connect } = useConnect()
  const { connectWeb3Auth } = useWallet()

  const handleConnect = (connector: Connector) => {
    connect({ connector })
    onClose()
  }

  const handleWeb3AuthConnect = async () => {
    await connectWeb3Auth()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Wallet">
      <div className="space-y-4">
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleConnect(connector)}
            >
              <span className="mr-3 text-lg">
                {connector.name === "MetaMask" && "🦊"}
                {connector.name === "Coinbase Wallet" && "🔵"}
                {connector.name === "WalletConnect" && "🔗"}
                {!["MetaMask", "Coinbase Wallet", "WalletConnect"].includes(connector.name) && "💼"}
              </span>
              <span className="font-medium">{connector.name}</span>
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleWeb3AuthConnect}
        >
          <span className="mr-3 text-lg">🔐</span>
          <span className="font-medium">Sign in with Google</span>
        </Button>
      </div>
    </Modal>
  )
}