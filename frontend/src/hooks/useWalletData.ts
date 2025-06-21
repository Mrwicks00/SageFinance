// hooks/useWalletData.ts
import { useState, useEffect, useCallback } from 'react'
import { walletDataService, WalletData } from '@/services/walletDataService'

export function useWalletData(address?: string, chainId?: number) {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWalletData = useCallback(async () => {
    if (!address || !chainId) return

    setLoading(true)
    setError(null)

    try {
      const data = await walletDataService.getWalletData(address, chainId)
      setWalletData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet data')
    } finally {
      setLoading(false)
    }
  }, [address, chainId])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  return {
    walletData,
    loading,
    error,
    refetch: fetchWalletData,
  }
}