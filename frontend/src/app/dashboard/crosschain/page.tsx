"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ArrowLeft, AlertTriangle, Wallet, ArrowUpDown, ExternalLink, Coins } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { formatUnits, parseUnits } from "viem"
import { useWallet } from "@/contexts/WalletContext"
import { ChainSelector } from "@/components/crosschain/ChainSelector"
import { TransferForm } from "@/components/crosschain/TransferForm"
import { TransferSummary } from "@/components/crosschain/TransferSummary"
import { TransferStatus as TransferStatusComponent } from "@/components/crosschain/TransferStatus"
import { ChainSelectionModal } from "@/components/crosschain/ChainSelectorModal"
import {
  SUPPORTED_CHAINS_BY_ID,
  getTransferRoute,
  type TransferStatus as TransferStatusType,
  TRANSFER_STEPS,
  CCIP_EXPLORER_BASE_URL,
  USDC_CONTRACT_ADDRESSES_DATA,
  type Chain,
} from "@/data/crosschain"
import { useGetTransferFee, useTransferCrossChain } from "@/integrations/crosschain/hooks"
import { CROSS_CHAIN_MANAGER_ADDRESSES } from "@/integrations/crosschain/constants"
import { useErc20Balance, useErc20Allowance, useApproveErc20, useErc20Decimals } from "@/integrations/erc20/hooks"

export default function CrossChainPage() {
  // Helper function to safely extract error message
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object" && "message" in error) {
      const errorObj = error as ErrorWithMessage
      return errorObj.shortMessage || errorObj.message || "Unknown error"
    }
    return "Unknown error"
  }

  const router = useRouter()

  // Destructure relevant values from useWallet
  const {
    address: userAddress,
    isConnected,
    currentChainId,
    switchNetwork,
    isWrongNetwork,
    switchToSupportedNetwork,
    supportedNetworksList,
  } = useWallet()

  interface ErrorWithMessage {
    message?: string
    shortMessage?: string
  }

  // Initialize fromChain and toChain using the new SUPPORTED_CHAINS_BY_ID
  const [fromChain, setFromChain] = useState<Chain>(SUPPORTED_CHAINS_BY_ID[11155111] || supportedNetworksList[0])
  const [toChain, setToChain] = useState<Chain>(
    SUPPORTED_CHAINS_BY_ID[84532] || supportedNetworksList[1] || supportedNetworksList[0],
  )
  const [amount, setAmount] = useState("")

  // Updated transfer status state to match the new structure
  const [transferStatus, setTransferStatus] = useState<TransferStatusType>({
    status: "idle",
    step: 0,
    totalSteps: TRANSFER_STEPS.length,
  })

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [shouldContinueAfterApproval, setShouldContinueAfterApproval] = useState(false)

  // New states for controlling chain selection modals
  const [showFromChainModal, setShowFromChainModal] = useState(false)
  const [showToChainModal, setShowToChainModal] = useState(false)

  // Dynamically get USDC addresses and CrossChainManager address based on selected chains
  const fromChainUSDCAddress = fromChain ? USDC_CONTRACT_ADDRESSES_DATA[fromChain.chainId] : undefined
  const currentChainManagerAddress = fromChain ? CROSS_CHAIN_MANAGER_ADDRESSES[fromChain.chainId] : undefined

  // --- Real-time Data Fetching ---
  const {
    balance: userUSDCBalanceRaw,
    isLoading: isLoadingUSDCBalance,
    refetch: refetchUSDCBalance,
  } = useErc20Balance(fromChainUSDCAddress)
  const { decimals: usdcDecimals, isLoading: isLoadingUsdcDecimals } = useErc20Decimals(fromChainUSDCAddress)

  const userUSDCBalanceFormatted = useMemo(() => {
    if (userUSDCBalanceRaw === undefined || usdcDecimals === undefined) return "0.00"
    return Number(formatUnits(userUSDCBalanceRaw, usdcDecimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [userUSDCBalanceRaw, usdcDecimals])

  const {
    allowance: usdcAllowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useErc20Allowance(fromChainUSDCAddress, currentChainManagerAddress)

  const {
    fee: estimatedFeeFormatted,
    feeRaw: estimatedFeeRaw,
    isLoading: isLoadingFee,
    error: feeError,
    refetch: refetchFee,
  } = useGetTransferFee(amount, toChain?.chainId, fromChain.chainId, userAddress || "0x")

  // --- Contract Interactions ---
  const parsedAmount = useMemo(() => {
    if (!amount || Number.parseFloat(amount) <= 0 || usdcDecimals === undefined || isNaN(Number.parseFloat(amount)))
      return 0n
    try {
      return parseUnits(amount, usdcDecimals)
    } catch {
      return 0n
    }
  }, [amount, usdcDecimals])

  const {
    write: approveUSDC,
    isLoading: isApproving,
    isSuccess: isApproved,
    error: approveError,
    reset: resetApprove,
  } = useApproveErc20(fromChainUSDCAddress, currentChainManagerAddress, parsedAmount)

  const {
    write: transferCrossChain,
    data: transferTxHash,
    ccipMessageId,
    isLoading: isTransferring,
    isSuccess: isTransferConfirmed,
    isError: isTransferError,
    error: transferHookError,
  } = useTransferCrossChain(amount, toChain?.chainId, userAddress || "0x")

  // --- Derived States and Callbacks ---
  const isCorrectFromNetwork = useMemo(() => {
    return isConnected && currentChainId === fromChain.chainId
  }, [isConnected, currentChainId, fromChain])

  const currentRoute = getTransferRoute(fromChain.chainId, toChain.chainId)

  const isApprovalNeeded = useMemo(() => {
    if (!isConnected || !isCorrectFromNetwork || !currentRoute.isActive || parsedAmount === 0n) return false
    return usdcAllowance === undefined || usdcAllowance < parsedAmount
  }, [isConnected, isCorrectFromNetwork, currentRoute, parsedAmount, usdcAllowance])

  const canTransfer = useMemo(() => {
    const userBalanceNum = Number.parseFloat(userUSDCBalanceFormatted)
    const amountNum = Number.parseFloat(amount)
    return (
      isConnected &&
      isCorrectFromNetwork &&
      currentRoute.isActive &&
      amountNum > 0 &&
      amountNum <= userBalanceNum &&
      !isLoadingFee &&
      !feeError &&
      !!estimatedFeeRaw &&
      estimatedFeeRaw > 0n &&
      !isApprovalNeeded
    )
  }, [
    isConnected,
    isCorrectFromNetwork,
    currentRoute,
    amount,
    userUSDCBalanceFormatted,
    isLoadingFee,
    feeError,
    estimatedFeeRaw,
    isApprovalNeeded,
  ])

  const handleSwapChains = useCallback(() => {
    const tempFromChain = fromChain
    setFromChain(toChain)
    setToChain(tempFromChain)
    setAmount("")
  }, [fromChain, toChain])

  const performTransfer = useCallback(async () => {
    if (canTransfer) {
      setTransferStatus((prev) => ({
        ...prev,
        status: "pending",
        step: 1,
        message: "Initiating cross-chain transfer transaction...",
      }))
      console.log("Initiating cross-chain transfer for amount:", formatUnits(parsedAmount, usdcDecimals || 6))
      transferCrossChain?.()
    } else {
      let errorMessage = "Cannot proceed with transfer. Please ensure all conditions are met."
      if (!isConnected) errorMessage = "Wallet not connected."
      else if (!isCorrectFromNetwork) errorMessage = "Wallet on wrong network."
      else if (!currentRoute.isActive) errorMessage = "Selected bridge route is not active."
      else if (Number.parseFloat(amount) === 0) errorMessage = "Please enter an amount to transfer."
      else if (Number.parseFloat(amount) > Number.parseFloat(userUSDCBalanceFormatted))
        errorMessage = "Insufficient USDC balance for transfer."
      else if (isApprovalNeeded) errorMessage = "Allowance insufficient. Please approve USDC first."
      else if (isLoadingFee || feeError || !estimatedFeeRaw || estimatedFeeRaw === 0n) {
        errorMessage = "Failed to estimate bridge fee. Please ensure a valid amount is entered and try again."
      }
      toast.error(errorMessage)
      setTransferStatus((prev) => ({ ...prev, status: "failed", error: errorMessage }))
    }
  }, [
    canTransfer,
    parsedAmount,
    usdcDecimals,
    transferCrossChain,
    isConnected,
    isCorrectFromNetwork,
    currentRoute,
    amount,
    userUSDCBalanceFormatted,
    isApprovalNeeded,
    isLoadingFee,
    feeError,
    estimatedFeeRaw,
  ])

  const handleTransfer = useCallback(async () => {
    if (isApproving || isTransferring || showStatusModal) {
      console.warn("Transfer process already active or modal is showing. Aborting handleTransfer re-entry.")
      return
    }

    resetApprove?.()
    setShowStatusModal(true)
    setTransferStatus({
      status: "pending",
      step: 0,
      totalSteps: TRANSFER_STEPS.length,
    })

    try {
      if (!isCorrectFromNetwork) {
        setTransferStatus((prev) => ({
          ...prev,
          status: "confirming",
          step: -1,
          error: "Please switch to the correct network",
        }))
        try {
          await switchNetwork(fromChain.chainId)
          toast.success(`Switched to ${fromChain.name}. Please try the transfer again.`)
          setShowStatusModal(false)
          setTransferStatus({
            status: "idle",
            step: 0,
            totalSteps: TRANSFER_STEPS.length,
          })
          return
        } catch (switchError) {
          const errMsg = getErrorMessage(switchError) || "Failed to switch network."
          toast.error(`Switch network failed: ${errMsg}`)
          setTransferStatus((prev) => ({ ...prev, status: "failed", error: errMsg }))
          return
        }
      }

      if (isApprovalNeeded) {
        setTransferStatus((prev) => ({
          ...prev,
          status: "confirming",
          step: 0,
          message: "Awaiting USDC approval transaction...",
        }))
        console.log("Initiating USDC approval for amount:", formatUnits(parsedAmount, usdcDecimals || 6))
        setShouldContinueAfterApproval(true)
        approveUSDC?.()
        return
      }

      await performTransfer()
    } catch (error) {
      console.error("Critical error in handleTransfer:", error)
      const errorMsg = getErrorMessage(error)
      toast.error(`A critical error occurred during transfer: ${errorMsg}`)
      setTransferStatus((prev) => ({
        ...prev,
        status: "failed",
        error: errorMsg,
      }))
    }
  }, [
    isApproving,
    isTransferring,
    showStatusModal,
    isCorrectFromNetwork,
    fromChain,
    switchNetwork,
    isApprovalNeeded,
    approveUSDC,
    parsedAmount,
    usdcDecimals,
    performTransfer,
    resetApprove,
  ])

  // Handle approval success
  useEffect(() => {
    if (
      isApproved &&
      shouldContinueAfterApproval &&
      transferStatus.status === "confirming" &&
      transferStatus.step === 0
    ) {
      console.log("USDC Approved! Proceeding with transfer...")
      setShouldContinueAfterApproval(false)
      refetchAllowance()
      refetchUSDCBalance()
      refetchFee()
      setTimeout(async () => {
        await performTransfer()
      }, 1000)
    }
  }, [
    isApproved,
    shouldContinueAfterApproval,
    transferStatus.status,
    transferStatus.step,
    refetchAllowance,
    refetchUSDCBalance,
    refetchFee,
    performTransfer,
  ])

  // Handle approval error
  useEffect(() => {
    if (approveError && shouldContinueAfterApproval) {
      const errMsg = getErrorMessage(approveError)
      console.error("USDC Approval failed:", errMsg)
      toast.error(`USDC Approval failed: ${errMsg}`)
      setTransferStatus((prev) => ({ ...prev, status: "failed", error: errMsg }))
      setShouldContinueAfterApproval(false)
    }
  }, [approveError, shouldContinueAfterApproval])

  // Handle transfer transaction states
  useEffect(() => {
    if (
      isTransferring &&
      transferStatus.status !== "bridging" &&
      transferStatus.status !== "completed" &&
      transferStatus.status !== "pending"
    ) {
      setTransferStatus((prev) => ({
        ...prev,
        status: "pending",
        step: 1,
        message: "Sending transfer transaction...",
      }))
    }

    if (
      transferTxHash &&
      transferStatus.status !== "bridging" &&
      transferStatus.status !== "completed" &&
      transferStatus.status !== "confirming"
    ) {
      setTransferStatus((prev) => ({
        ...prev,
        status: "confirming",
        step: 1,
        txHash: transferTxHash,
        message: `Transaction submitted. Waiting for confirmation...`,
      }))
      console.log(`Transfer transaction submitted: ${transferTxHash}`)
    }

    if (
      isTransferConfirmed &&
      ccipMessageId &&
      transferStatus.status !== "completed" &&
      transferStatus.status !== "bridging"
    ) {
      setTransferStatus((prev) => ({
        ...prev,
        status: "bridging",
        step: 2,
        ccipMessageId: ccipMessageId,
        isTransactionConfirmed: true,
        message: "Source transaction confirmed. Cross-chain bridge in progress...",
      }))
      console.log(`CCIP Message ID: ${ccipMessageId}`)
      toast.success(
        <div>
          Transaction confirmed! Cross-chain bridge started.&nbsp;
          <a
            href={`${CCIP_EXPLORER_BASE_URL}${ccipMessageId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300"
          >
            Track on CCIP Explorer
          </a>
        </div>,
        { autoClose: 8000 },
      )
      refetchUSDCBalance()
      refetchAllowance()
      refetchFee()
    }

    if (isTransferError && transferHookError && transferStatus.status !== "failed") {
      let errorMessage = getErrorMessage(transferHookError)
      if (errorMessage.includes("ERC20: transfer amount exceeds allowance")) {
        errorMessage = "Transfer failed: Insufficient USDC allowance. Please try approving again."
        toast.error(errorMessage)
        setTransferStatus({
          status: "idle",
          step: 0,
          totalSteps: TRANSFER_STEPS.length,
        })
        setShowStatusModal(false)
        setShouldContinueAfterApproval(false)
        return
      }
      console.error("Transfer failed:", errorMessage)
      toast.error(`Transfer failed: ${errorMessage}`)
      setTransferStatus((prev) => ({
        ...prev,
        status: "failed",
        error: errorMessage,
      }))
    }
  }, [
    isTransferring,
    transferTxHash,
    isTransferConfirmed,
    ccipMessageId,
    isTransferError,
    transferHookError,
    refetchUSDCBalance,
    refetchAllowance,
    refetchFee,
  ])

  const handleCloseStatusModal = useCallback(() => {
    setShowStatusModal(false)
    setTransferStatus({
      status: "idle",
      step: 0,
      totalSteps: TRANSFER_STEPS.length,
    })
    setShouldContinueAfterApproval(false)
    if (transferStatus.status === "completed" || transferStatus.status === "failed") {
      setAmount("")
    }
  }, [transferStatus.status])

  const totalLoading =
    isLoadingUSDCBalance || isLoadingAllowance || isLoadingFee || isApproving || isTransferring || isLoadingUsdcDecimals

  const getButtonState = useMemo(() => {
    if (totalLoading) return { text: "Loading Data...", disabled: true }
    if (!isConnected) return { text: "Connect Wallet", disabled: false }
    if (isWrongNetwork) return { text: "Switch Network", disabled: false }
    if (!isCorrectFromNetwork) return { text: `Switch to ${fromChain.name}`, disabled: false }
    if (isApprovalNeeded) return { text: `Approve USDC`, disabled: false }
    if (Number.parseFloat(amount) === 0) return { text: "Enter Amount", disabled: true }
    if (Number.parseFloat(amount) > Number.parseFloat(userUSDCBalanceFormatted))
      return { text: "Insufficient USDC Balance", disabled: true }
    if (!currentRoute.isActive) return { text: "Route Not Available", disabled: true }
    return { text: "Transfer & Deposit", disabled: false }
  }, [
    totalLoading,
    isConnected,
    isWrongNetwork,
    isCorrectFromNetwork,
    fromChain,
    isApprovalNeeded,
    amount,
    userUSDCBalanceFormatted,
    currentRoute,
  ])

  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Header */}
      <div className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 sm:p-3 hover:bg-gray-800/50 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Cross-Chain Transfer</h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Bridge your USDC across networks with auto-yield deposit
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* USDC Faucet Banner */}
        <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                <Coins className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-blue-400 font-semibold text-base sm:text-lg mb-2">Need Testnet USDC?</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Get free testnet USDC for Sepolia, Base Sepolia, and Arbitrum Sepolia to test cross-chain transfers
                  and yield farming.
                </p>
              </div>
            </div>
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
            >
              <Coins className="w-4 h-4" />
              <span>Get USDC</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Alert Messages */}
        {!isConnected && (
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <Wallet className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-yellow-400 font-medium text-sm sm:text-base">Wallet Not Connected</div>
                <div className="text-sm text-gray-400">Please connect your wallet to continue</div>
              </div>
            </div>
          </div>
        )}

        {isConnected && isWrongNetwork && (
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-red-400 font-medium text-sm sm:text-base">Wrong Network</div>
                  <div className="text-sm text-gray-400">
                    Please switch to a supported network (Sepolia, Base Sepolia, Arbitrum Sepolia).
                  </div>
                </div>
              </div>
              <button
                onClick={switchToSupportedNetwork}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-500 hover:to-red-400 transition-all duration-200 hover:scale-105 text-sm font-medium"
              >
                Switch Network
              </button>
            </div>
          </div>
        )}

        {isConnected && !isWrongNetwork && !isCorrectFromNetwork && (
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-yellow-400 font-medium text-sm sm:text-base">Network Mismatch</div>
                  <div className="text-sm text-gray-400">
                    Your wallet is on {SUPPORTED_CHAINS_BY_ID[currentChainId!]?.name || "an unknown network"}, but you
                    selected {fromChain.name} as the source.
                  </div>
                </div>
              </div>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200 hover:scale-105 text-sm font-medium"
                disabled={isApproving || isTransferring}
              >
                Switch to {fromChain.name}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Transfer Form */}
          <div className="space-y-6">
            <div className="space-y-6">
              <ChainSelector
                chain={fromChain}
                label="From Network"
                onClick={() => setShowFromChainModal(true)}
                disabled={isApproving || isTransferring}
              />

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700/50"></div>
                </div>
                <div className="relative">
                  <button
                    onClick={handleSwapChains}
                    disabled={isApproving || isTransferring}
                    className={`
                      p-3 rounded-2xl border-2 transition-all duration-300 backdrop-blur-sm
                      ${
                        !(isApproving || isTransferring)
                          ? "bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50 hover:border-yellow-500/50 hover:bg-gray-800/60 hover:scale-110 hover:rotate-180"
                          : "bg-gray-800/50 border-gray-600/50 cursor-not-allowed opacity-50"
                      }
                    `}
                  >
                    <ArrowUpDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <ChainSelector
                chain={toChain}
                label="To Network"
                onClick={() => setShowToChainModal(true)}
                disabled={isApproving || isTransferring}
              />
            </div>

            <TransferForm
              fromChain={fromChain}
              toChain={toChain}
              amount={amount}
              setAmount={setAmount}
              balance={userUSDCBalanceFormatted}
              onMaxClick={() => setAmount(userUSDCBalanceFormatted)}
              onSwapChains={handleSwapChains}
              canSwapChains={!(isApproving || isTransferring)}
              isLoadingBalance={isLoadingUSDCBalance || isLoadingUsdcDecimals}
            />

            <button
              onClick={handleTransfer}
              disabled={getButtonState.disabled || isApproving || isTransferring}
              className={`
                w-full py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300
                ${
                  !getButtonState.disabled && !isApproving && !isTransferring
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-[1.02]"
                    : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {isApproving ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving USDC...</span>
                </span>
              ) : isTransferring ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Transfer...</span>
                </span>
              ) : (
                getButtonState.text
              )}
            </button>
          </div>

          {/* Right Column - Summary and Info */}
          <div className="space-y-6">
            <TransferSummary
              fromChain={fromChain}
              toChain={toChain}
              amount={amount || "0"}
              estimatedFee={estimatedFeeFormatted}
              estimatedTime={currentRoute.estimatedTime}
              isVisible={Number.parseFloat(amount) > 0 || isTransferring || isApproving}
            />

            {/* Route Status */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-4 text-base sm:text-lg">Route Status</h3>
              <div className="space-y-3">
                {Object.values(SUPPORTED_CHAINS_BY_ID).map((chainA) =>
                  Object.values(SUPPORTED_CHAINS_BY_ID).map((chainB) => {
                    if (chainA.chainId === chainB.chainId) return null
                    const route = getTransferRoute(chainA.chainId, chainB.chainId)
                    return (
                      <div
                        key={`${chainA.chainId}-${chainB.chainId}`}
                        className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-b-0"
                      >
                        <span className="text-gray-400 text-sm">
                          {chainA.name} → {chainB.name}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs rounded-lg font-medium ${
                            route.isActive
                              ? "bg-gradient-to-r from-green-600/80 to-green-500/80 text-white border border-green-500/30"
                              : "bg-gradient-to-r from-gray-600/80 to-gray-500/80 text-gray-300 border border-gray-500/30"
                          }`}
                        >
                          {route.isActive ? "Active" : "Coming Soon"}
                        </span>
                      </div>
                    )
                  }),
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50">
              <h3 className="text-white font-semibold mb-4 text-base sm:text-lg">How It Works</h3>
              <div className="space-y-3">
                {TRANSFER_STEPS.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-xs flex items-center justify-center font-bold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-300 leading-relaxed">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl max-w-md w-full border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="p-6">
              <TransferStatusComponent
                status={transferStatus.status}
                currentStep={transferStatus.step}
                totalSteps={transferStatus.totalSteps}
                fromChain={fromChain}
                toChain={toChain}
                amount={amount}
                txHash={transferStatus.txHash}
                ccipMessageId={transferStatus.ccipMessageId}
                error={transferStatus.error}
                isTransactionConfirmed={transferStatus.isTransactionConfirmed}
              />
            </div>
            <div className="border-t border-gray-700/50 p-4 bg-gray-800/30">
              <button
                onClick={handleCloseStatusModal}
                className={`w-full py-3 rounded-xl transition-all duration-200 text-white font-medium ${
                  transferStatus.status === "bridging"
                    ? "bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400"
                    : "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500"
                } hover:scale-[1.02]`}
              >
                {transferStatus.status === "completed"
                  ? "Done"
                  : transferStatus.status === "failed"
                    ? "Close"
                    : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chain Selection Modals */}
      <ChainSelectionModal
        isOpen={showFromChainModal}
        onClose={() => setShowFromChainModal(false)}
        chains={Object.values(SUPPORTED_CHAINS_BY_ID).filter((c) => c.isSupported)}
        onSelectChain={(chain) => {
          setFromChain(chain)
          setShowFromChainModal(false)
          setAmount("")
        }}
        currentChain={fromChain}
        title="Select Source Network"
        excludeChain={toChain}
      />

      <ChainSelectionModal
        isOpen={showToChainModal}
        onClose={() => setShowToChainModal(false)}
        chains={Object.values(SUPPORTED_CHAINS_BY_ID).filter((c) => c.isSupported)}
        onSelectChain={(chain) => {
          setToChain(chain)
          setShowToChainModal(false)
          setAmount("")
        }}
        currentChain={toChain}
        title="Select Destination Network"
        excludeChain={fromChain}
      />
    </div>
  )
}
