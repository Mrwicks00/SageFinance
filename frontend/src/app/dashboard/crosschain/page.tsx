// src/app/dashboard/crosschain/page.tsx

"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { ArrowLeft, AlertTriangle, Wallet, ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { formatUnits, parseUnits } from 'viem'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'

import { useWallet } from '@/contexts/WalletContext'
import { ChainSelector } from '@/components/crosschain/ChainSelector'
import { TransferForm } from '@/components/crosschain/TransferForm'
import { TransferSummary } from '@/components/crosschain/TransferSummary'
import { TransferStatus as TransferStatusComponent } from '@/components/crosschain/TransferStatus'
import { ConfirmationDialog } from '@/components/common/confirmationDialog'; // Import the new ConfirmationDialog


import {
  SUPPORTED_CHAINS,
  getTransferRoute,
  TransferStatus as TransferStatusType,
  TRANSFER_STEPS,
  CCIP_EXPLORER_BASE_URL,
  USDC_CONTRACT_ADDRESSES_DATA
} from '@/data/crosschain'

import { useGetTransferFee, useTransferCrossChain } from '@/integrations/crosschain/hooks'
import { CROSS_CHAIN_MANAGER_ADDRESSES } from '@/integrations/crosschain/constants'

import { useErc20Balance, useErc20Allowance, useApproveErc20, useErc20Decimals } from '@/integrations/erc20/hooks'

const UNLIMITED_ALLOWANCE_THRESHOLD = BigInt('1' + '0'.repeat(30)); // Represents a very large number, e.g., 10^30


export default function CrossChainPage() {
  const router = useRouter()
  const { address: userAddress, isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const { isWrongNetwork, switchToSupportedNetwork } = useWallet()

  const [fromChain, setFromChain] = useState<typeof SUPPORTED_CHAINS['sepolia']>(SUPPORTED_CHAINS.sepolia)
  const [toChain, setToChain] = useState<typeof SUPPORTED_CHAINS['baseSepolia']>(SUPPORTED_CHAINS.baseSepolia)

  const [amount, setAmount] = useState('')
  const [transferStatus, setTransferStatus] = useState<TransferStatusType>({
    status: 'idle',
    step: 0,
    totalSteps: TRANSFER_STEPS.length
  })
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [shouldContinueAfterApproval, setShouldContinueAfterApproval] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false); // New state for confirmation dialog


  // Dynamically get USDC addresses and CrossChainManager address based on selected chains
  const fromChainUSDCAddress = fromChain ? USDC_CONTRACT_ADDRESSES_DATA[fromChain.id] : undefined
  const toChainUSDCAddress = toChain ? USDC_CONTRACT_ADDRESSES_DATA[toChain.id] : undefined // Not directly used in current transfer logic.

  const currentChainManagerAddress = fromChain ? CROSS_CHAIN_MANAGER_ADDRESSES[fromChain.chainId] : undefined

  // --- Real-time Data Fetching ---
  const { balance: userUSDCBalanceRaw, isLoading: isLoadingUSDCBalance, refetch: refetchUSDCBalance } = useErc20Balance(fromChainUSDCAddress)
  const { decimals: usdcDecimals, isLoading: isLoadingUsdcDecimals } = useErc20Decimals(fromChainUSDCAddress)

  const userUSDCBalanceFormatted = useMemo(() => {
    if (userUSDCBalanceRaw === undefined || usdcDecimals === undefined) return '0.00';
    return formatUnits(userUSDCBalanceRaw, usdcDecimals).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [userUSDCBalanceRaw, usdcDecimals]);

  const { allowance: usdcAllowance, isLoading: isLoadingAllowance, refetch: refetchAllowance } = useErc20Allowance(
    fromChainUSDCAddress,
    currentChainManagerAddress
  );

  const { fee: estimatedFeeFormatted, feeRaw: estimatedFeeRaw, isLoading: isLoadingFee, error: feeError, refetch: refetchFee } = useGetTransferFee(
    amount,
    toChain?.chainId,
    fromChain.chainId, // Correct: Pass fromChain.chainId as the sourceChainId
    userAddress || '0x', // Correct: Pass userAddress as the receiverAddress
  );

  // --- Contract Interactions ---
  // Parse the amount for contract calls, using the detected USDC decimals
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
    isSuccess: isApproved, // isSuccess becomes true when approval TX is confirmed
    error: approveError,
  } = useApproveErc20(
    fromChainUSDCAddress,
    currentChainManagerAddress,
    parsedAmount // Pass the specific amount for approval
  );

  const {
    write: transferCrossChain,
    data: transferTxHash,
    ccipMessageId,
    isLoading: isTransferring, // True while transfer TX is pending
    isSuccess: isTransferConfirmed, // True when transfer TX is confirmed & messageId extracted
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

  const currentRoute = getTransferRoute(fromChain.id, toChain.id);

  // Approval is needed if current allowance is less than the amount user wants to transfer
  const isApprovalNeeded = useMemo(() => {
    // Only check if connected, on correct network, route active, and amount > 0
    if (!isConnected || !isCorrectFromNetwork || !currentRoute.isActive || parsedAmount === 0n) return false;
    // Approval is needed if the allowance is less than the parsed amount
    return usdcAllowance === undefined || usdcAllowance < parsedAmount;
  }, [isConnected, isCorrectFromNetwork, currentRoute, parsedAmount, usdcAllowance]);

  // Can transfer only if all conditions met AND approval is NOT needed
  const canTransfer = useMemo(() => {
    const userBalanceNum = parseFloat(userUSDCBalanceFormatted);
    const amountNum = parseFloat(amount);

    return (
      isConnected &&
      isCorrectFromNetwork &&
      currentRoute.isActive &&
      amountNum > 0 &&
      amountNum <= userBalanceNum &&
      !isLoadingFee && // Fee must be loaded
      !feeError && // No error fetching fee
      !!estimatedFeeRaw && estimatedFeeRaw > 0n && // Fee must be valid and non-zero
      !isApprovalNeeded // Crucial: can only transfer if approval is not needed
    );
  }, [isConnected, isCorrectFromNetwork, currentRoute, amount, userUSDCBalanceFormatted, isLoadingFee, feeError, estimatedFeeRaw, isApprovalNeeded]);

  // Callback to swap the 'From' and 'To' chains
  const handleSwapChains = useCallback(() => {
    const tempFromChain = fromChain;
    setFromChain(toChain);
    setToChain(tempFromChain);
    setAmount(''); // Reset amount when chains are swapped
  }, [fromChain, toChain]);

  // Helper function to perform the cross-chain transfer
  const performTransfer = useCallback(async () => {
    if (canTransfer) {
      setTransferStatus(prev => ({ ...prev, status: 'pending', step: 1, message: 'Initiating cross-chain transfer transaction...' }));
      console.log("Initiating cross-chain transfer for amount:", formatUnits(parsedAmount, usdcDecimals || 6));
      transferCrossChain?.(); // Trigger the cross-chain transfer transaction
    } else {
      // Fallback for unexpected states where transfer conditions are not met
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

  // Main orchestrator for the entire cross-chain flow
  const handleTransfer = useCallback(async () => {
    // Prevent re-entry if an operation is already in progress
    if (isApproving || isTransferring || showStatusModal) {
        console.warn("Transfer process already active or modal is showing. Aborting handleTransfer re-entry.");
        return;
    }

    // Show the status modal immediately
    setShowStatusModal(true);
    setTransferStatus({
      status: 'pending',
      step: 0, // Initial step (Network Check / Approval)
      totalSteps: TRANSFER_STEPS.length
    });

    try {
      // Step 0: Network Check & Switch
      if (!isCorrectFromNetwork) {
        setTransferStatus(prev => ({ ...prev, status: 'confirming', step: -1, error: 'Please switch to the correct network' }));
        try {
          await switchChainAsync({ chainId: fromChain.chainId });
          toast.success(`Switched to ${fromChain.name}. Preparing for next step...`);
          // After a successful network switch, close modal and let user retry
          setShowStatusModal(false);
          setTransferStatus({
            status: 'idle',
            step: 0,
            totalSteps: TRANSFER_STEPS.length
          });
          return; // Exit this call, user will re-click the button
        } catch (switchError: any) {
          const errMsg = switchError.message || 'Failed to switch network.';
          toast.error(`Switch network failed: ${errMsg}`);
          setTransferStatus(prev => ({ ...prev, status: 'failed', error: errMsg }));
          return;
        }
      }

      // Step 1: Handle USDC Approval (if needed)
      if (isApprovalNeeded) {
        setTransferStatus(prev => ({ ...prev, status: 'confirming', step: 0, message: 'Awaiting USDC approval transaction...' }));
        console.log("Initiating USDC approval for amount:", formatUnits(parsedAmount, usdcDecimals || 6));
        setShouldContinueAfterApproval(true); // Set flag to continue after approval
        approveUSDC?.(); // Trigger the approval transaction
        return; // Exit this function, useEffect will pick up from here
      }

      // Step 2: Initiate Cross-Chain Transfer (only if approval is not needed)
      await performTransfer();

    } catch (error: any) {
      console.error("Critical error in handleTransfer:", error);
      toast.error(`A critical error occurred during transfer: ${error.shortMessage || error.message || 'Unknown error'}`);
      setTransferStatus(prev => ({
        ...prev,
        status: 'failed',
        error: error.shortMessage || error.message || 'Critical transfer error.'
      }));
    }
  }, [
    isApproving, isTransferring, showStatusModal, // Prevent re-entry
    isCorrectFromNetwork, fromChain, switchChainAsync, // Network switch logic
    isApprovalNeeded, approveUSDC, parsedAmount, usdcDecimals, // Approval logic
    performTransfer // Transfer logic (new dependency)
  ]);

  // Use a ref to store the latest `handleTransfer` function.
  // This helps avoid stale closures when calling recursively from useEffect
  const handleTransferRef = useRef(null as (() => Promise<void>) | null); // Initialize with null
  useEffect(() => {
    // Assign the actual handleTransfer function after it's defined.
    // This useEffect will run *after* `handleTransfer` is defined.
    handleTransferRef.current = handleTransfer;
  }, [handleTransfer]); // Dependency on handleTransfer to keep ref updated


  // useEffect to react to successful approval confirmation (isApproved becomes true)
  useEffect(() => {
    // Only proceed if approval was successful AND we were waiting for it and the flag is set
    if (isApproved && shouldContinueAfterApproval && transferStatus.status === 'confirming' && transferStatus.step === 0) {
      toast.success("USDC Approved! Proceeding with transfer...");
      setShouldContinueAfterApproval(false); // Reset the flag immediately

      // Immediately refetch allowance to get the updated on-chain value
      refetchAllowance();
      // Also refetch balance and fee, as state changes might affect them
      refetchUSDCBalance();
      refetchFee();

      // Small delay to allow state updates, then proceed with transfer
      setTimeout(async () => {
        // Now that allowance is confirmed, re-evaluate and trigger the transfer
        await performTransfer();
      }, 500);
    }
    // Handle approval transaction error
    if (approveError) {
      const errMsg = approveError.shortMessage || approveError.message;
      toast.error(`USDC Approval failed: ${errMsg}`);
      setTransferStatus(prev => ({ ...prev, status: 'failed', error: errMsg }));
      setShouldContinueAfterApproval(false); // Reset the flag on error too
      setShowStatusModal(false); // Close modal on error
    }
  }, [isApproved, approveError, shouldContinueAfterApproval, transferStatus.status, transferStatus.step, refetchAllowance, refetchUSDCBalance, refetchFee, performTransfer]);


  // useEffect to react to the cross-chain transfer transaction states
  useEffect(() => {
    // Update status when transfer transaction is being prepared/sent
    if (isTransferring && transferStatus.status !== 'bridging' && transferStatus.status !== 'completed' && transferStatus.step < 1) {
      setTransferStatus(prev => ({ ...prev, status: 'pending', step: 1, message: 'Sending transfer transaction...' }));
    }
    // Update status when transaction hash is received (transaction is sent to network)
    if (transferTxHash && transferStatus.status !== 'bridging' && transferStatus.status !== 'completed') {
      setTransferStatus(prev => ({
        ...prev,
        status: 'bridging', // Transaction sent, now waiting for CCIP bridging
        step: 2, // Corresponds to 'Cross-Chain Bridge'
        txHash: transferTxHash,
        message: `Transaction sent: ${transferTxHash.slice(0, 6)}...${transferTxHash.slice(-4)}. Waiting for CCIP confirmation...`
      }));
      toast.info(`Transfer transaction sent: ${transferTxHash.slice(0, 6)}...${transferTxHash.slice(-4)}. Waiting for confirmation...`);
    }
    // Update status when transfer is confirmed on source chain and CCIP message ID is extracted
    if (isTransferConfirmed && ccipMessageId) {
      setTransferStatus(prev => ({
        ...prev,
        status: 'completed',
        step: 3, // Corresponds to 'Auto-Deposit to Yield' (final step)
        ccipMessageId: ccipMessageId, // Actual CCIP message ID from logs
        message: 'Transfer complete! Your funds are being deposited into yield.'
      }));
      toast.success(
        <div>
          Transfer Complete!&nbsp;
          <a
            href={`${CCIP_EXPLORER_BASE_URL}${ccipMessageId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300"
          >
            View on CCIP Explorer
          </a>
        </div>,
        { autoClose: 15000 } // Keep toast visible longer for user to click link
      );
      // Refetch all relevant data after successful transfer
      refetchUSDCBalance();
      refetchAllowance();
      refetchFee();
    }
    // Handle cross-chain transfer transaction error
    if (isTransferError) {
      let errorMessage = transferHookError?.shortMessage || transferHookError?.message || 'Unknown transfer error.';
      // Specific handling for "ERC20: transfer amount exceeds allowance" if it comes up
      if (errorMessage.includes("ERC20: transfer amount exceeds allowance")) {
        errorMessage = "Transfer failed: Insufficient USDC allowance. Please approve the correct amount.";
        toast.error(errorMessage);
        // Reset status to idle and close modal, allowing re-approval or re-attempt
        setTransferStatus(prev => ({ ...prev, status: 'idle', step: 0, error: undefined }));
        setShowStatusModal(false);
        setShouldContinueAfterApproval(false); // Reset flag on transfer error too
        return; // Important to return here to prevent further status updates
      }
      toast.error(`Transfer failed: ${errorMessage}`);
      setTransferStatus(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
        message: errorMessage
      }));
    }
  }, [
    isTransferring, transferTxHash, ccipMessageId, isTransferConfirmed, isTransferError, transferHookError,
    refetchUSDCBalance, refetchAllowance, refetchFee,
    transferStatus.status, transferStatus.step
  ]);


  // Callback to close the transfer status modal and reset component state
  const handleCloseStatusModal = useCallback(() => {
    setShowStatusModal(false);
    setTransferStatus({
      status: 'idle',
      step: 0,
      totalSteps: TRANSFER_STEPS.length
    });
    setShouldContinueAfterApproval(false); // Reset the flag
    setAmount(''); // Clear the amount input after a complete/cancelled transfer
  }, []);

  // Aggregate overall loading state for the UI
  const totalLoading = isLoadingUSDCBalance || isLoadingAllowance || isLoadingFee || isApproving || isTransferring || isLoadingUsdcDecimals;

  // Determine the button text and disabled state based on the current application state
  const getButtonState = useMemo(() => {
    if (totalLoading) return { text: 'Loading Data...', disabled: true };
    if (!isConnected) return { text: 'Connect Wallet', disabled: false };
    if (isWrongNetwork) return { text: 'Switch Network', disabled: false };
    if (!isCorrectFromNetwork) return { text: `Switch to ${fromChain.name}`, disabled: false };
    if (isApprovalNeeded) return { text: `Approve USDC`, disabled: false }; // Specific button for approval action
    if (parseFloat(amount) === 0) return { text: 'Enter Amount', disabled: true };
    if (parseFloat(amount) > parseFloat(userUSDCBalanceFormatted)) return { text: 'Insufficient USDC Balance', disabled: true };
    if (!currentRoute.isActive) return { text: 'Route Not Available', disabled: true };
    // If all conditions met, show the main transfer button
    return { text: 'Transfer & Deposit', disabled: false };
  }, [
    totalLoading, isConnected, isWrongNetwork, isCorrectFromNetwork, fromChain,
    isApprovalNeeded, amount, userUSDCBalanceFormatted, currentRoute
  ]);


  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
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
        {/* Wallet Connection Status Warning */}
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

        {/* Generic Wrong Network Warning (if wallet is on *any* unsupported network) */}
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
                onClick={switchToSupportedNetwork} // Triggers wallet context's network switch
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Switch Network
              </button>
            </div>
          </div>
        )}
        
        {/* Specific Network Mismatch Warning (if wallet is connected to a supported but incorrect FROM network) */}
        {isConnected && !isWrongNetwork && !isCorrectFromNetwork && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                            <div className="text-yellow-400 font-medium">Network Mismatch</div>
                            <div className="text-sm text-gray-400">
                                Your wallet is on {SUPPORTED_CHAINS[currentChainId]?.name || 'an unknown network'}, but you selected {fromChain.name} as the source.
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleTransfer} // This will trigger the network switch logic within handleTransfer
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        disabled={isApproving || isTransferring} // Disable button if process is active
                    >
                        Switch to {fromChain.name}
                    </button>
                </div>
            </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Transfer Form */}
          <div className="space-y-6">
            {/* Chain Selection Components */}
            <div className="space-y-4">
              <ChainSelector
                chain={fromChain}
                label="From Network"
                // onClick={() => { /* You can add a modal here to select a different 'from' chain */ }}
                disabled={isApproving || isTransferring}
              />
              
              {/* Swap Chains Button */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative">
                  <button
                    onClick={handleSwapChains}
                    disabled={isApproving || isTransferring} // Disable swap during active process
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
                // onClick={() => { /* You can add a modal here to select a different 'to' chain */ }}
                disabled={isApproving || isTransferring}
              />
            </div>

            {/* Transfer Amount Input Form */}
            <TransferForm
              fromChain={fromChain}
              toChain={toChain}
              amount={amount}
              setAmount={setAmount}
              balance={userUSDCBalanceFormatted} // Display user's real USDC balance
              onMaxClick={() => setAmount(userUSDCBalanceFormatted)} // Set max to USDC balance
              onSwapChains={handleSwapChains}
              canSwapChains={!(isApproving || isTransferring)} // Allow swap if no process is active
              isLoadingBalance={isLoadingUSDCBalance || isLoadingUsdcDecimals} // Pass loading state for balance
            />

            {/* Main Action Button (Connect, Switch, Approve, or Transfer) */}
            <button
              onClick={handleTransfer}
              disabled={getButtonState.disabled}
              className={`
                w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200
                ${!getButtonState.disabled
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {getButtonState.text}
            </button>
          </div>

          {/* Right Column - Summary & Info */}
          <div className="space-y-6">
            <TransferSummary
              fromChain={fromChain}
              toChain={toChain}
              amount={amount || '0'} // Display current amount
              estimatedFee={estimatedFeeFormatted} // Display real estimated fee
              estimatedTime={currentRoute.estimatedTime} // Display estimated time from route config
              isVisible={parseFloat(amount) > 0 || isTransferring || isApproving} // Show summary if amount entered or process active
            />

            {/* Available Route Statuses */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Route Status</h3>
              <div className="space-y-2">
                {Object.values(SUPPORTED_CHAINS).map(chainA => (
                  Object.values(SUPPORTED_CHAINS).map(chainB => {
                    if (chainA.id === chainB.id) return null; // Skip self-to-self routes
                    const route = getTransferRoute(chainA.id, chainB.id);
                    return (
                      <div key={`${chainA.id}-${chainB.id}`} className="flex items-center justify-between">
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

            {/* "How It Works" Section */}
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

      {/* Transfer Status Modal */}
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
                ccipMessageId={transferStatus.ccipMessageId} // Ensure message ID is passed
                error={transferStatus.error}
              />
            </div>
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <button
                onClick={() => {
                  // If completed or failed, close directly.
                  if (transferStatus.status === 'completed' || transferStatus.status === 'failed') {
                    handleCloseStatusModal();
                  } else {
                    // Otherwise, show confirmation dialog.
                    setShowCancelConfirmation(true);
                  }
                }}
                className="w-full py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
              >
                {transferStatus.status === 'completed'
                  ? 'Done'
                  : transferStatus.status === 'failed'
                    ? 'Close'
                    : 'Cancel Transfer'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for cancelling transfer */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={() => {
          handleCloseStatusModal(); // Perform the actual close logic
          setShowCancelConfirmation(false); // Close the confirmation dialog
        }}
        title="Cancel Transfer?"
        message="Are you sure you want to cancel this transfer? The transaction may still complete on-chain, and funds might be lost or stuck. Only cancel if you understand the risks."
        confirmText="Yes, Cancel"
        cancelText="No, Continue"
      />
    </div>
  )
}
