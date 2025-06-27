// src/app/dashboard/crosschain/page.tsx

"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowLeft, AlertTriangle, Wallet, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { formatUnits, parseUnits } from 'viem'

import { useWallet } from '@/contexts/WalletContext' // This hook provides all necessary wallet info
import { ChainSelector } from '@/components/crosschain/ChainSelector'
import { TransferForm } from '@/components/crosschain/TransferForm'
import { TransferSummary } from '@/components/crosschain/TransferSummary'
import { TransferStatus as TransferStatusComponent } from '@/components/crosschain/TransferStatus'
import { ChainSelectionModal } from '@/components/crosschain/ChainSelectorModal'; // Corrected import path for ChainSelectionModal


import {
  SUPPORTED_CHAINS_BY_ID, // Use the new unified chain data, keyed by ID
  getTransferRoute,
  TransferStatus as TransferStatusType,
  TRANSFER_STEPS,
  CCIP_EXPLORER_BASE_URL,
  USDC_CONTRACT_ADDRESSES_DATA,
  Chain // Import Chain interface
} from '@/data/crosschain'

import { useGetTransferFee, useTransferCrossChain } from '@/integrations/crosschain/hooks'
import { CROSS_CHAIN_MANAGER_ADDRESSES } from '@/integrations/crosschain/constants'

import { useErc20Balance, useErc20Allowance, useApproveErc20, useErc20Decimals } from '@/integrations/erc20/hooks'




export default function CrossChainPage() {

  // Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as ErrorWithMessage;
    return errorObj.shortMessage || errorObj.message || 'Unknown error';
  }
  return 'Unknown error';
};
  const router = useRouter()
  // Destructure relevant values from useWallet
  const {
    address: userAddress,
    isConnected,
    currentChainId,
    switchNetwork, // Now comes from WalletContext
    isWrongNetwork,
    switchToSupportedNetwork,
    supportedNetworksList // Access the list of supported networks from context
  } = useWallet()

  interface ErrorWithMessage {
    message?: string;
    shortMessage?: string;
  }


  // Initialize fromChain and toChain using the new SUPPORTED_CHAINS_BY_ID
  // Ensure they are valid defaults from your unified list
  const [fromChain, setFromChain] = useState<Chain>(SUPPORTED_CHAINS_BY_ID[11155111] || supportedNetworksList[0]) // Default to Sepolia or first available
  const [toChain, setToChain] = useState<Chain>(SUPPORTED_CHAINS_BY_ID[84532] || supportedNetworksList[1] || supportedNetworksList[0]) // Default to Base Sepolia or second/first available


  const [amount, setAmount] = useState('')
  
  // Updated transfer status state to match the new structure
  const [transferStatus, setTransferStatus] = useState<TransferStatusType>({ // Use the imported TransferStatusType
    status: 'idle',
    step: 0,
    totalSteps: TRANSFER_STEPS.length
  })
  
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [shouldContinueAfterApproval, setShouldContinueAfterApproval] = useState(false)

  // New states for controlling chain selection modals
  const [showFromChainModal, setShowFromChainModal] = useState(false);
  const [showToChainModal, setShowToChainModal] = useState(false);


  // Dynamically get USDC addresses and CrossChainManager address based on selected chains
  // USDC_CONTRACT_ADDRESSES_DATA is now keyed by number
  const fromChainUSDCAddress = fromChain ? USDC_CONTRACT_ADDRESSES_DATA[fromChain.chainId] : undefined
  // const toChainUSDCAddress = toChain ? USDC_CONTRACT_ADDRESSES_DATA[toChain.chainId] : undefined

  const currentChainManagerAddress = fromChain ? CROSS_CHAIN_MANAGER_ADDRESSES[fromChain.chainId] : undefined

  // --- Real-time Data Fetching ---
  const { balance: userUSDCBalanceRaw, isLoading: isLoadingUSDCBalance, refetch: refetchUSDCBalance } = useErc20Balance(fromChainUSDCAddress)
  const { decimals: usdcDecimals, isLoading: isLoadingUsdcDecimals } = useErc20Decimals(fromChainUSDCAddress)

  const userUSDCBalanceFormatted = useMemo(() => {
    if (userUSDCBalanceRaw === undefined || usdcDecimals === undefined) return '0.00';
    return Number(formatUnits(userUSDCBalanceRaw, usdcDecimals)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [userUSDCBalanceRaw, usdcDecimals]);

  const { allowance: usdcAllowance, isLoading: isLoadingAllowance, refetch: refetchAllowance } = useErc20Allowance(
    fromChainUSDCAddress,
    currentChainManagerAddress
  );

  const { fee: estimatedFeeFormatted, feeRaw: estimatedFeeRaw, isLoading: isLoadingFee, error: feeError, refetch: refetchFee } = useGetTransferFee(
    amount,
    toChain?.chainId,
    fromChain.chainId,
    userAddress || '0x',
  );

  // --- Contract Interactions ---
  const parsedAmount = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0 || usdcDecimals === undefined || isNaN(parseFloat(amount))) return 0n;
    try {
      return parseUnits(amount, usdcDecimals);
    } catch {
      return 0n;
    }
  }, [amount, usdcDecimals]);

  const {
    write: approveUSDC,
    isLoading: isApproving,
    isSuccess: isApproved,
    error: approveError,
    reset: resetApprove
  } = useApproveErc20(
    fromChainUSDCAddress,
    currentChainManagerAddress,
    parsedAmount
  );

  const {
    write: transferCrossChain,
    data: transferTxHash,
    ccipMessageId,
    isLoading: isTransferring,
    isSuccess: isTransferConfirmed,
    isError: isTransferError,
    error: transferHookError,
  } = useTransferCrossChain(
    amount,
    toChain?.chainId,
    userAddress || '0x'
  );


  // --- Derived States and Callbacks ---

  const isCorrectFromNetwork = useMemo(() => {
    return isConnected && currentChainId === fromChain.chainId;
  }, [isConnected, currentChainId, fromChain]);

  // getTransferRoute now expects numbers, not string IDs
  const currentRoute = getTransferRoute(fromChain.chainId, toChain.chainId);

  const isApprovalNeeded = useMemo(() => {
    if (!isConnected || !isCorrectFromNetwork || !currentRoute.isActive || parsedAmount === 0n) return false;
    return usdcAllowance === undefined || usdcAllowance < parsedAmount;
  }, [isConnected, isCorrectFromNetwork, currentRoute, parsedAmount, usdcAllowance]);

  const canTransfer = useMemo(() => {
    const userBalanceNum = parseFloat(userUSDCBalanceFormatted);
    const amountNum = parseFloat(amount);

    return (
      isConnected &&
      isCorrectFromNetwork &&
      currentRoute.isActive &&
      amountNum > 0 &&
      amountNum <= userBalanceNum &&
      !isLoadingFee &&
      !feeError &&
      !!estimatedFeeRaw && estimatedFeeRaw > 0n &&
      !isApprovalNeeded
    );
  }, [isConnected, isCorrectFromNetwork, currentRoute, amount, userUSDCBalanceFormatted, isLoadingFee, feeError, estimatedFeeRaw, isApprovalNeeded]);

  const handleSwapChains = useCallback(() => {
    const tempFromChain = fromChain;
    setFromChain(toChain);
    setToChain(tempFromChain);
    setAmount('');
  }, [fromChain, toChain]);

  const performTransfer = useCallback(async () => {
    if (canTransfer) {
      setTransferStatus(prev => ({ 
        ...prev, 
        status: 'pending', 
        step: 1, 
        message: 'Initiating cross-chain transfer transaction...' 
      }));
      console.log("Initiating cross-chain transfer for amount:", formatUnits(parsedAmount, usdcDecimals || 6));
      transferCrossChain?.();
    } else {
      let errorMessage = "Cannot proceed with transfer. Please ensure all conditions are met.";
      if (!isConnected) errorMessage = "Wallet not connected.";
      else if (!isCorrectFromNetwork) errorMessage = "Wallet on wrong network.";
      else if (!currentRoute.isActive) errorMessage = "Selected bridge route is not active.";
      else if (parseFloat(amount) === 0) errorMessage = "Please enter an amount to transfer.";
      else if (parseFloat(amount) > parseFloat(userUSDCBalanceFormatted)) errorMessage = "Insufficient USDC balance for transfer.";
      else if (isApprovalNeeded) errorMessage = "Allowance insufficient. Please approve USDC first.";
      else if (isLoadingFee || feeError || !estimatedFeeRaw || estimatedFeeRaw === 0n) {
          errorMessage = "Failed to estimate bridge fee. Please ensure a valid amount is entered and try again.";
      }

      toast.error(errorMessage);
      setTransferStatus(prev => ({ ...prev, status: 'failed', error: errorMessage }));
    }
  }, [canTransfer, parsedAmount, usdcDecimals, transferCrossChain, isConnected, isCorrectFromNetwork, currentRoute, amount, userUSDCBalanceFormatted, isApprovalNeeded, isLoadingFee, feeError, estimatedFeeRaw]);

  const handleTransfer = useCallback(async () => {
    if (isApproving || isTransferring || showStatusModal) {
        console.warn("Transfer process already active or modal is showing. Aborting handleTransfer re-entry.");
        return;
    }

    // Reset any previous hook states
    resetApprove?.();
    

    setShowStatusModal(true);
    setTransferStatus({
      status: 'pending',
      step: 0,
      totalSteps: TRANSFER_STEPS.length
    });

    try {
      if (!isCorrectFromNetwork) {
        setTransferStatus(prev => ({ 
          ...prev, 
          status: 'confirming', 
          step: -1, 
          error: 'Please switch to the correct network' 
        }));
        try {
          await switchNetwork(fromChain.chainId); // Use switchNetwork from WalletContext
          toast.success(`Switched to ${fromChain.name}. Please try the transfer again.`);
          setShowStatusModal(false);
          setTransferStatus({
            status: 'idle',
            step: 0,
            totalSteps: TRANSFER_STEPS.length
          });
          return;
        } catch (switchError: unknown) {
          const errMsg = getErrorMessage(switchError) || 'Failed to switch network.';
          toast.error(`Switch network failed: ${errMsg}`);
          setTransferStatus(prev => ({ ...prev, status: 'failed', error: errMsg }));
          return;
        }
      }

      if (isApprovalNeeded) {
        setTransferStatus(prev => ({ 
          ...prev, 
          status: 'confirming', 
          step: 0, 
          message: 'Awaiting USDC approval transaction...' 
        }));
        console.log("Initiating USDC approval for amount:", formatUnits(parsedAmount, usdcDecimals || 6));
        setShouldContinueAfterApproval(true);
        approveUSDC?.();
        return;
      }

      await performTransfer();

    } catch (error: unknown) {
      console.error("Critical error in handleTransfer:", error);
      const errorMsg = getErrorMessage(error);
      toast.error(`A critical error occurred during transfer: ${errorMsg}`);
      setTransferStatus(prev => ({
        ...prev,
        status: 'failed',
        error: errorMsg
      }));
    }
  }, [
    isApproving, isTransferring, showStatusModal,
    isCorrectFromNetwork, fromChain, switchNetwork,
    isApprovalNeeded, approveUSDC, parsedAmount, usdcDecimals,
    performTransfer, resetApprove, getErrorMessage
  ]);

  // Handle approval success
  useEffect(() => {
    if (isApproved && shouldContinueAfterApproval && transferStatus.status === 'confirming' && transferStatus.step === 0) {
      console.log("USDC Approved! Proceeding with transfer...");
      setShouldContinueAfterApproval(false);

      // Refetch data after approval
      refetchAllowance();
      refetchUSDCBalance();
      refetchFee();

      // Small delay to ensure state updates
      setTimeout(async () => {
        await performTransfer();
      }, 1000);
    }
  }, [isApproved, shouldContinueAfterApproval, transferStatus.status, transferStatus.step, refetchAllowance, refetchUSDCBalance, refetchFee, performTransfer]);

  // Handle approval error
  useEffect(() => {
    if (approveError && shouldContinueAfterApproval) {
      const errMsg = getErrorMessage(approveError);
      console.error("USDC Approval failed:", errMsg);
      toast.error(`USDC Approval failed: ${errMsg}`);
      setTransferStatus(prev => ({ ...prev, status: 'failed', error: errMsg }));
      setShouldContinueAfterApproval(false);
    }
  }, [approveError, shouldContinueAfterApproval, getErrorMessage]);

  // Handle transfer transaction states
  useEffect(() => {
    // Transaction is being processed
    if (isTransferring && transferStatus.status !== 'bridging' && transferStatus.status !== 'completed' && transferStatus.status !== 'pending') {
      setTransferStatus(prev => ({ 
        ...prev, 
        status: 'pending', 
        step: 1, 
        message: 'Sending transfer transaction...' 
      }));
    }
  
    // Transaction hash received (transaction submitted)
    if (transferTxHash && transferStatus.status !== 'bridging' && transferStatus.status !== 'completed' && transferStatus.status !== 'confirming') {
      setTransferStatus(prev => ({
        ...prev,
        status: 'confirming',
        step: 1,
        txHash: transferTxHash,
        message: `Transaction submitted. Waiting for confirmation...`
      }));
      
      console.log(`Transfer transaction submitted: ${transferTxHash}`);
    }
  
    // Transaction confirmed and CCIP message ID received
    if (isTransferConfirmed && ccipMessageId && transferStatus.status !== 'completed' && transferStatus.status !== 'bridging') {
      setTransferStatus(prev => ({
        ...prev,
        status: 'bridging',
        step: 2,
        ccipMessageId: ccipMessageId,
        isTransactionConfirmed: true,
        message: 'Source transaction confirmed. Cross-chain bridge in progress...'
      }));
      
      console.log(`CCIP Message ID: ${ccipMessageId}`);
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
        { autoClose: 8000 }
      );
  
      refetchUSDCBalance();
      refetchAllowance();
      refetchFee();
    }
  
    // Handle transfer errors
    if (isTransferError && transferHookError && transferStatus.status !== 'failed') {
      let errorMessage = getErrorMessage(transferHookError);
      
      if (errorMessage.includes("ERC20: transfer amount exceeds allowance")) {
        errorMessage = "Transfer failed: Insufficient USDC allowance. Please try approving again.";
        toast.error(errorMessage);
        setTransferStatus({
          status: 'idle',
          step: 0,
          totalSteps: TRANSFER_STEPS.length
        });
        setShowStatusModal(false);
        setShouldContinueAfterApproval(false);
        return;
      }
  
      console.error("Transfer failed:", errorMessage);
      toast.error(`Transfer failed: ${errorMessage}`);
      setTransferStatus(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage
      }));
    }
  }, [
    isTransferring, 
    transferTxHash, 
    isTransferConfirmed, 
    ccipMessageId, 
    isTransferError, 
    transferHookError,
    // Remove transferStatus.status from dependencies to prevent infinite loop
    refetchUSDCBalance,
    refetchAllowance,
    refetchFee,
    getErrorMessage
  ]);

  
  const handleCloseStatusModal = useCallback(() => {
    setShowStatusModal(false);
    setTransferStatus({
      status: 'idle',
      step: 0,
      totalSteps: TRANSFER_STEPS.length
    });
    setShouldContinueAfterApproval(false);
    
    // Only clear amount if transfer was completed or failed
    if (transferStatus.status === 'completed' || transferStatus.status === 'failed') {
      setAmount('');
    }
  }, [transferStatus.status]); // Dependency on transferStatus.status to react to its changes

  const totalLoading = isLoadingUSDCBalance || isLoadingAllowance || isLoadingFee || isApproving || isTransferring || isLoadingUsdcDecimals;

  const getButtonState = useMemo(() => {
    if (totalLoading) return { text: 'Loading Data...', disabled: true };
    if (!isConnected) return { text: 'Connect Wallet', disabled: false };
    if (isWrongNetwork) return { text: 'Switch Network', disabled: false };
    if (!isCorrectFromNetwork) return { text: `Switch to ${fromChain.name}`, disabled: false };
    if (isApprovalNeeded) return { text: `Approve USDC`, disabled: false };
    if (parseFloat(amount) === 0) return { text: 'Enter Amount', disabled: true };
    if (parseFloat(amount) > parseFloat(userUSDCBalanceFormatted)) return { text: 'Insufficient USDC Balance', disabled: true };
    if (!currentRoute.isActive) return { text: 'Route Not Available', disabled: true };
    return { text: 'Transfer & Deposit', disabled: false };
  }, [
    totalLoading, isConnected, isWrongNetwork, isCorrectFromNetwork, fromChain,
    isApprovalNeeded, amount, userUSDCBalanceFormatted, currentRoute
  ]);


  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Cross-Chain Transfer</h1>
              <p className="text-gray-400">Bridge your USDC across networks with auto-yield deposit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-xl">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-yellow-400 font-medium">Wallet Not Connected</div>
                <div className="text-sm text-gray-400">Please connect your wallet to continue</div>
              </div>
            </div>
          </div>
        )}

        {isConnected && isWrongNetwork && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-red-400 font-medium">Wrong Network</div>
                  <div className="text-sm text-gray-400">Please switch to a supported network (Sepolia, Base Sepolia, Arbitrum Sepolia).</div>
                </div>
              </div>
              <button
                onClick={switchToSupportedNetwork}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Switch Network
              </button>
            </div>
          </div>
        )}
        
        {isConnected && !isWrongNetwork && !isCorrectFromNetwork && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                            <div className="text-yellow-400 font-medium">Network Mismatch</div>
                            <div className="text-sm text-gray-400">
                                Your wallet is on {SUPPORTED_CHAINS_BY_ID[currentChainId!]?.name || 'an unknown network'}, but you selected {fromChain.name} as the source.
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleTransfer}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={isApproving || isTransferring}
                    >
                        Switch to {fromChain.name}
                    </button>
                </div>
            </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <ChainSelector
                chain={fromChain}
                label="From Network"
                onClick={() => setShowFromChainModal(true)}
                disabled={isApproving || isTransferring}
              />
              
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative">
                  <button
                    onClick={handleSwapChains}
                    disabled={isApproving || isTransferring}
                    className={`
                      p-2 rounded-xl border-2 transition-all duration-200
                      ${
                        !(isApproving || isTransferring)
                          ? "bg-gray-900 border-gray-700 hover:border-yellow-500 hover:bg-gray-800"
                          : "bg-gray-800 border-gray-600 cursor-not-allowed opacity-50"
                      }
                    `}
                  >
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
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
                w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
                ${!getButtonState.disabled && !isApproving && !isTransferring
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isApproving ? 'Approving USDC...' : 
               isTransferring ? 'Processing Transfer...' : 
               getButtonState.text}
            </button>
          </div>

          <div className="space-y-6">
            <TransferSummary
              fromChain={fromChain}
              toChain={toChain}
              amount={amount || '0'}
              estimatedFee={estimatedFeeFormatted}
              estimatedTime={currentRoute.estimatedTime}
              isVisible={parseFloat(amount) > 0 || isTransferring || isApproving}
            />

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Route Status</h3>
              <div className="space-y-2">
                {Object.values(SUPPORTED_CHAINS_BY_ID).map(chainA => (
                  Object.values(SUPPORTED_CHAINS_BY_ID).map(chainB => {
                    if (chainA.chainId === chainB.chainId) return null;
                    const route = getTransferRoute(chainA.chainId, chainB.chainId);
                    return (
                      <div key={`${chainA.chainId}-${chainB.chainId}`} className="flex items-center justify-between">
                        <span className="text-gray-400">{chainA.name} → {chainB.name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          route.isActive ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {route.isActive ? 'Active' : 'Coming Soon'}
                        </span>
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">How It Works</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {TRANSFER_STEPS.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 text-black text-xs flex items-center justify-center font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div>{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full border border-gray-700 overflow-hidden">
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
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <button
                onClick={handleCloseStatusModal}
                disabled={false} // Removed disabled condition, allowing close during bridging
                className={`w-full py-3 rounded-lg transition-colors text-white ${
                  transferStatus.status === 'bridging'
                    ? 'bg-gray-600 hover:bg-gray-500' // Still indicate it's active
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {transferStatus.status === 'completed'
                  ? 'Done'
                  : transferStatus.status === 'failed' ? 'Close' : 'Close' // Always 'Close' if not completed/failed
                }
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Chain Selection Modals */}
      <ChainSelectionModal
        isOpen={showFromChainModal}
        onClose={() => setShowFromChainModal(false)}
        chains={Object.values(SUPPORTED_CHAINS_BY_ID).filter(c => c.isSupported)} // Use new unified list
        onSelectChain={(chain) => { // Changed prop name to onSelectChain
          setFromChain(chain);
          setShowFromChainModal(false);
          setAmount(''); // Clear amount when changing chains
        }}
        currentChain={fromChain} // Passed current fromChain
        title="Select Source Network"
        excludeChain={toChain} // Exclude toChain from selection
      />

      <ChainSelectionModal
        isOpen={showToChainModal}
        onClose={() => setShowToChainModal(false)}
        chains={Object.values(SUPPORTED_CHAINS_BY_ID).filter(c => c.isSupported)} // Use new unified list
        onSelectChain={(chain) => { // Changed prop name to onSelectChain
          setToChain(chain);
          setShowToChainModal(false);
          setAmount(''); // Clear amount when changing chains
        }}
        currentChain={toChain} // Passed current toChain
        title="Select Destination Network"
        excludeChain={fromChain} // Exclude fromChain from selection
      />
    </div>
  )
}
