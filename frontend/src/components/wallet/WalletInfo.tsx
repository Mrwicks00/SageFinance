"use client"
import { useDisconnect } from "wagmi"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { useWallet } from "@/contexts/WalletContext"
import { NETWORK_CONFIGS } from "@/constants/networks"
import { Copy, ExternalLink, LogOut } from "lucide-react"

interface WalletInfoProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletInfo({ isOpen, onClose }: WalletInfoProps) {
  const { disconnect } = useDisconnect()
  const {
    address,
    chainId,
    balance,
    holdings,
    isWrongNetwork,
    switchToSupportedNetwork,
    disconnectWeb3Auth,
    isWeb3AuthConnected,
  } = useWallet()

  const handleDisconnect = () => {
    disconnect()
    if (isWeb3AuthConnected) {
      disconnectWeb3Auth()
    }
    onClose()
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Wallet Details" className="max-w-lg">
      <div className="space-y-6">
        {isWrongNetwork && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-800 font-medium">Wrong Network</p>
                  <p className="text-red-600 text-sm">Please switch to a supported network</p>
                </div>
                <Button size="sm" onClick={switchToSupportedNetwork}>
                  Switch Network
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Address</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{address && formatAddress(address)}</span>
              <button onClick={copyAddress} className="p-1 hover:bg-gray-100 rounded">
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {chainId && NETWORK_CONFIGS[chainId as keyof typeof NETWORK_CONFIGS] && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Network</span>
              <div className="flex items-center space-x-2">
              <span>{NETWORK_CONFIGS[chainId as keyof typeof NETWORK_CONFIGS].icon}</span>
              <span>{NETWORK_CONFIGS[chainId as keyof typeof NETWORK_CONFIGS].name}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Balance</span>
            <span className="font-medium">{balance ? `${Number.parseFloat(balance).toFixed(4)} ETH` : "0 ETH"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Token Holdings</h3>
          <div className="space-y-2">
            {holdings.map((holding) => (
              <div key={holding.symbol} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{holding.symbol}</span>
                <div className="text-right">
                  <div className="font-medium">{Number.parseFloat(holding.balance).toFixed(4)}</div>
                  <div className="text-sm text-gray-500">{holding.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-center border-red-200 text-red-600 hover:bg-red-50"
          onClick={handleDisconnect}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    </Modal>
  )
}
