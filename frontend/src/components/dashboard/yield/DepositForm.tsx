// src/components/dashboard/yield/DepositForm.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWallet } from '@/contexts/WalletContext';
import { useErc20Balance, useErc20Allowance, useApproveErc20, useErc20Decimals } from '@/integrations/erc20/hooks';
import { useDeposit } from '@/integrations/yieldOptimizer/hooks';
// Assuming TOKEN_ADDRESSES is imported here as TOKEN_ADDRESSES_MAP
import { TOKEN_ADDRESSES_MAP, STRATEGY_IDS } from '@/integrations/yieldOptimizer/constants'; 
import { formatUnits, parseUnits } from 'viem';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Chain and Protocol types from your data file
import { Chain, Protocol } from '@/data/yieldData'; 

interface DepositFormProps {
  selectedChain: Chain;
  selectedProtocol: Protocol;
}

export function DepositForm({ selectedChain, selectedProtocol }: DepositFormProps) {
  const { address: userAddress } = useAccount();
  const connectedChainId = useChainId();
  const { isConnected, isWrongNetwork } = useWallet(); 

  const [amount, setAmount] = useState<string>('');
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>('');

  // Determine which tokens are available for the currently selected chain
  const availableDepositTokenSymbols = useMemo(() => {
    if (!selectedChain || !TOKEN_ADDRESSES_MAP) return [];
    const symbols = Object.keys(TOKEN_ADDRESSES_MAP).filter(tokenSymbol =>
      TOKEN_ADDRESSES_MAP[tokenSymbol]?.[selectedChain.id] !== undefined
    );
    return symbols;
  }, [selectedChain]);

  // Set the default selected token when available tokens change or on initial render
  useEffect(() => {
    // Only update if there are available tokens and either no token is selected
    // or the currently selected token is no longer available for the new chain.
    if (availableDepositTokenSymbols.length > 0 && 
        (!selectedTokenSymbol || !availableDepositTokenSymbols.includes(selectedTokenSymbol))) {
      setSelectedTokenSymbol(availableDepositTokenSymbols[0]);
    } else if (availableDepositTokenSymbols.length === 0 && selectedTokenSymbol !== '') {
      // If no tokens are available for the selected chain, clear the selection
      setSelectedTokenSymbol('');
    }
    // Also, clear amount if token changes or becomes unavailable
    setAmount(''); 
  }, [availableDepositTokenSymbols, selectedTokenSymbol, selectedChain]); // Depend on selectedChain to reset on chain change


  // Derive the deposit token address for the current chain and selected symbol
  const depositTokenAddress = useMemo(() => {
    // Only attempt to get address if a token is selected and we are on the correct chain
    if (!selectedTokenSymbol || !connectedChainId || connectedChainId !== selectedChain.id) return undefined;
    const tokenMap = TOKEN_ADDRESSES_MAP[selectedTokenSymbol];
    return tokenMap ? (tokenMap[connectedChainId] as `0x${string}`) : undefined; // Type assertion for viem Address
  }, [selectedTokenSymbol, connectedChainId, selectedChain.id]);

  // Fetch token decimals dynamically for the selected token and chain
  const { decimals: tokenDecimals } = useErc20Decimals(depositTokenAddress);

  // Fetch user's ERC-20 balance
  const { balance: userTokenBalance, refetch: refetchUserTokenBalance } = useErc20Balance(depositTokenAddress);

  // Fetch allowance for the YieldOptimizer contract
  const { allowance: yieldOptimizerAllowance, refetch: refetchYieldOptimizerAllowance } =
    useErc20Allowance(depositTokenAddress, connectedChainId);

  // Determine strategy ID based on protocol ID from selectedProtocol
  const strategyId = useMemo(() => {
    const protocolKey = selectedProtocol.id.toUpperCase();
    return STRATEGY_IDS[protocolKey];
  }, [selectedProtocol.id]);
  
  // Log derived values for debugging
  useEffect(() => {
    console.log("DepositForm State Debug:", {
      selectedChainId: selectedChain.id,
      selectedProtocolId: selectedProtocol.id,
      connectedChainId,
      isWrongNetwork,
      isConnected,
      availableDepositTokenSymbols,
      selectedTokenSymbol,
      depositTokenAddress,
      strategyId,
      tokenDecimals,
      userTokenBalance: userTokenBalance?.toString(),
      yieldOptimizerAllowance: yieldOptimizerAllowance?.toString(),
    });
  }, [
    selectedChain.id,
    selectedProtocol.id,
    connectedChainId,
    isWrongNetwork,
    isConnected,
    availableDepositTokenSymbols,
    selectedTokenSymbol,
    depositTokenAddress,
    strategyId,
    tokenDecimals,
    userTokenBalance,
    yieldOptimizerAllowance,
  ]);

  // Wagmi hook for ERC-20 approval
  const {
    write: approveToken,
    isLoading: isApproving,
    isSuccess: isApproved,
    error: approveError,
  } = useApproveErc20(
    depositTokenAddress,
    tokenDecimals !== undefined && amount ? parseUnits(amount, tokenDecimals) : undefined
  );

  // Wagmi hook for deposit
  const {
    write: depositFunds,
    isLoading: isDepositing,
    isSuccess: isDeposited,
    error: depositError,
  } = useDeposit(depositTokenAddress, strategyId, amount, tokenDecimals, connectedChainId);

  // Handle toast notifications for approval
  useEffect(() => {
    if (approveError) {
      toast.error(`Approval failed: ${approveError.message}`);
    } else if (isApproved) {
      toast.success('Token approved successfully!');
      refetchYieldOptimizerAllowance(); // Refetch allowance after successful approval
    }
  }, [approveError, isApproved, refetchYieldOptimizerAllowance]);

  // Handle toast notifications for deposit
  useEffect(() => {
    if (depositError) {
      toast.error(`Deposit failed: ${depositError.message}`);
    } else if (isDeposited) {
      toast.success('Deposit successful!');
      setAmount(''); // Clear amount field on success
      refetchUserTokenBalance(); // Refetch user balance after successful deposit
    }
  }, [depositError, isDeposited, refetchUserTokenBalance]);

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to proceed.');
      return;
    }
    
    if (isWrongNetwork) {
      toast.error(`Your wallet is connected to an unsupported network. Please switch to a supported chain.`);
      return;
    }

    if (connectedChainId !== selectedChain.id) {
        toast.error(`Please switch your wallet to ${selectedChain.displayName}.`);
        return;
    }

    if (!selectedTokenSymbol || !depositTokenAddress || strategyId === undefined || tokenDecimals === undefined) {
      toast.error('Invalid token or strategy configuration. Please try again.');
      console.error("Missing config:", { selectedTokenSymbol, depositTokenAddress, strategyId, tokenDecimals });
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount to deposit.');
      return;
    }
    const parsedAmount = parseUnits(amount, tokenDecimals);
    if (userTokenBalance === undefined || parsedAmount > userTokenBalance) {
      toast.error('Insufficient token balance.');
      return;
    }

    // If allowance is not enough, approve first
    if (yieldOptimizerAllowance === undefined || parsedAmount > yieldOptimizerAllowance) {
      approveToken?.(); // Trigger the approve transaction
    } else {
      depositFunds?.(); // Trigger the deposit transaction
    }
  };

  const currentFormattedBalance = userTokenBalance !== undefined && tokenDecimals !== undefined
    ? formatUnits(userTokenBalance, tokenDecimals)
    : '0.00';

  const isDepositPossible = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0 || !tokenDecimals || userTokenBalance === undefined) return false;
    try {
        const parsedAmount = parseUnits(amount, tokenDecimals);
        return parsedAmount > 0 && parsedAmount <= userTokenBalance;
    } catch (e) {
        console.error("Error parsing amount for isDepositPossible:", e);
        return false;
    }
  }, [amount, tokenDecimals, userTokenBalance]);

  const isApprovedForDeposit = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0 || !tokenDecimals || yieldOptimizerAllowance === undefined) return false;
    try {
        const parsedAmount = parseUnits(amount, tokenDecimals);
        return parsedAmount <= yieldOptimizerAllowance;
    } catch (e) {
        console.error("Error parsing amount for isApprovedForDeposit:", e);
        return false;
    }
  }, [amount, tokenDecimals, yieldOptimizerAllowance]);


  const isLoading = isApproving || isDepositing;

  const isCorrectChainForForm = isConnected && connectedChainId === selectedChain.id;
  const isReadyForInteraction = isConnected && isCorrectChainForForm && !isWrongNetwork;

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-xl border border-gray-700"> {/* Updated styling */}
      <h3 className="text-xl font-semibold text-white mb-4">
        Deposit into {selectedProtocol.displayName} on {selectedChain.displayName}
      </h3>
      <p className="text-gray-400 mb-6">
        Choose a token to deposit and start earning yield.
      </p>

      {/* Connection and Network Status Messages */}
      {!isConnected && (
        <p className="text-yellow-400 text-center mb-4 p-2 bg-gray-900 rounded">
          Please connect your wallet to proceed.
        </p>
      )}
      {isConnected && isWrongNetwork && (
        <p className="text-red-400 text-center mb-4 p-2 bg-gray-900 rounded">
          Your wallet is on an unsupported network. Please switch to a supported chain.
        </p>
      )}
      {isConnected && !isWrongNetwork && !isCorrectChainForForm && (
        <p className="text-yellow-400 text-center mb-4 p-2 bg-gray-900 rounded">
          Please switch your wallet to {selectedChain.displayName} to deposit.
        </p>
      )}

      {/* Select Token dropdown */}
      <div className="mb-4">
        <label htmlFor="token-select" className="block text-white text-sm font-bold mb-2">
          Select Token:
        </label>
        <select
          id="token-select"
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline 
                     bg-gray-800 border-gray-700 text-white
                     focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
          value={selectedTokenSymbol}
          onChange={(e) => setSelectedTokenSymbol(e.target.value)}
          disabled={isLoading || !isReadyForInteraction || availableDepositTokenSymbols.length === 0}
        >
          {availableDepositTokenSymbols.length === 0 ? (
            <option value="">No tokens available</option>
          ) : (
            availableDepositTokenSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))
          )}
        </select>
        {availableDepositTokenSymbols.length === 0 && isReadyForInteraction && (
            <p className="text-red-400 text-sm mt-2">
                No deposit tokens are configured for {selectedProtocol.displayName} on {selectedChain.displayName}.
                Please ensure `TOKEN_ADDRESSES` in `constants.ts` includes entries for this combination.
            </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-white text-sm font-bold mb-2">
          Amount:
        </label>
        <input
          type="number"
          id="amount"
          className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline 
                     bg-gray-800 border-gray-700 text-white
                     focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading || !isReadyForInteraction || !selectedTokenSymbol}
        />
        <p className="text-gray-400 text-sm mt-1">
          Your balance: {currentFormattedBalance} {selectedTokenSymbol}
        </p>
      </div>

      <button
        onClick={handleDeposit}
        className={`w-full py-3 px-4 rounded font-bold text-lg focus:outline-none focus:shadow-outline transition-colors duration-200
          ${(isLoading || !isReadyForInteraction || !isDepositPossible || !selectedTokenSymbol || strategyId === undefined) // Added strategyId check for robust disabling
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black' // Yellow button with black text
          }`}
        disabled={isLoading || !isReadyForInteraction || !isDepositPossible || !selectedTokenSymbol || strategyId === undefined}
      >
        {isLoading
          ? (isApproving ? 'Approving...' : 'Depositing...')
          : !isReadyForInteraction
            ? (isConnected && isWrongNetwork ? "Unsupported Network" : `Switch to ${selectedChain.displayName}`)
            : (!isApprovedForDeposit && isDepositPossible)
                ? `Approve ${selectedTokenSymbol}`
                : 'Deposit'}
      </button>

      {/* Optional: Display transaction status */}
      {(isApproved || isDeposited) && (
        <p className="text-green-400 mt-4 text-center text-sm p-2 bg-gray-900 rounded">Transaction successful!</p>
      )}
      {(approveError || depositError) && (
        <p className="text-red-400 mt-4 text-center text-sm p-2 bg-gray-900 rounded">Error: {approveError?.message || depositError?.message}</p>
      )}
    </div>
  );
}