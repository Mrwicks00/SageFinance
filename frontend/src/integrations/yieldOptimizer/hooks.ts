// src/integrations/yieldOptimizer/hooks.ts
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address,  parseUnits } from 'viem';
import { useMemo, useCallback } from 'react';

// Make sure these imports are correct based on your constants.ts and ABI location
import { YIELD_OPTIMIZER_ADDRESSES, CHAINLINK_CHAIN_SELECTORS, YIELD_OPTIMIZER_ABI } from './constants';
// import { ERC20_ABI } from '@/integrations/erc20/hooks'; // Assuming ERC20_ABI is exported from here
// import { toast } from 'react-toastify';


// Hook to get a user's total balance across all strategies in the YieldOptimizer
export function useGetUserTotalBalance(userAddress?: Address, chainId?: number) {
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: yieldOptimizerAddress,
    abi: YIELD_OPTIMIZER_ABI, // Use the imported ABI here
    functionName: 'getUserBalance',
    args: [userAddress as Address], // Cast is fine if you've ensured userAddress is defined before enabled
    query: {
      enabled: !!userAddress && !!yieldOptimizerAddress,
      refetchInterval: 10000,
    },
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    refetch,
    error,
  };
}

// Hook to deposit into the YieldOptimizer
export function useDeposit(
  depositTokenAddress?: Address,
  strategyId?: number, // Assuming this comes from STRATEGY_IDS which might be numbers, convert to BigInt for args
  amount?: string,
  tokenDecimals?: number,
  chainId?: number // This is the connectedChainId passed from DepositForm.tsx
) {
  const { address: userAddress } = useAccount(); // Renamed to userAddress for clarity
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  // Ensure chainSelector is a BigInt
  const chainSelectorBigInt = useMemo(() => {
    if (chainId && CHAINLINK_CHAIN_SELECTORS[chainId]) {
      return BigInt(CHAINLINK_CHAIN_SELECTORS[chainId]); // Explicit conversion for safety
    }
    return undefined;
  }, [chainId]);

  // Convert amount string to BigInt, considering token decimals
  const parsedAmount = useMemo(() => {
    if (amount && tokenDecimals !== undefined) {
      try {
        const parsed = parseUnits(amount, tokenDecimals);
        return parsed > 0n ? parsed : undefined; // Ensure amount is positive
      } catch (e) {
        console.error("Failed to parse amount for deposit:", e);
        return undefined;
      }
    }
    return undefined;
  }, [amount, tokenDecimals]);

  const {
    data: hash,
    isPending: isDepositLoading,
    error: depositError,
    writeContract: writeDeposit, // Renamed 'deposit' to 'writeDeposit' to avoid conflict with the returned 'write'
    reset: resetDepositHook, // Added reset function
  } = useWriteContract();

  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed,
    error: depositConfirmError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Combine loading states
  const isLoading = isDepositLoading || isDepositConfirming;
  // Combine success states
  const isSuccess = isDepositConfirmed;
  // Combine error states
  const error = useMemo(() => depositError || depositConfirmError, [depositError, depositConfirmError]);


  const write = useCallback(() => {
    // Extensive checks for all required arguments before calling writeDeposit
    if (
      !writeDeposit || // Check if write function itself is available
      !yieldOptimizerAddress ||
      !depositTokenAddress ||
      strategyId === undefined || // Can be 0, so check for undefined not falsy
      !parsedAmount || // parsedAmount will be undefined if amount is 0 or parsing fails
      parsedAmount <= 0n || // Explicitly check if parsedAmount is not zero or negative
      !chainSelectorBigInt ||
      !userAddress
    ) {
        console.error("Missing parameters for deposit transaction:", {
            writeDeposit: !!writeDeposit, // Boolean to show if func is available
            yieldOptimizerAddress,
            depositTokenAddress,
            strategyId,
            parsedAmount,
            chainSelectorBigInt,
            userAddress
        });
        // Optionally, throw an error or show a toast here if this is user-triggered
        return;
    }

    writeDeposit({
      address: yieldOptimizerAddress,
      abi: YIELD_OPTIMIZER_ABI, // Use the imported ABI here
      functionName: 'deposit',
      args: [
        depositTokenAddress,
        BigInt(strategyId), // Convert strategyId to BigInt for uint256
        parsedAmount,
        chainSelectorBigInt, // Pass the BigInt chain selector
        userAddress // The _forUser address
      ],
    });
  }, [
    writeDeposit,
    depositTokenAddress,
    strategyId,
    parsedAmount,
    chainSelectorBigInt,
    yieldOptimizerAddress,
    userAddress,
  ]);

  return {
    write, // The function to call to initiate the deposit
    data: hash,
    isLoading,
    isSuccess,
    error,
    reset: resetDepositHook, // Expose the reset function
  };
}

// Hook to get a user's specific position in a strategy
export function useGetUserPosition(userAddress?: Address, positionIndex?: number, chainId?: number) {
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  const { data: position, isLoading, refetch, error } = useReadContract({
    address: yieldOptimizerAddress,
    abi: YIELD_OPTIMIZER_ABI, // Use the imported ABI here
    functionName: 'userPositions',
    args: [userAddress as Address, BigInt(positionIndex || 0)], // positionIndex needs to be BigInt for uint256
    query: {
      enabled: !!userAddress && positionIndex !== undefined && !!yieldOptimizerAddress,
      refetchInterval: 10000,
    },
  });

  return {
    position: position ? {
      strategyId: Number(position[0]), // Convert back to Number if needed for UI
      balance: position[1] as bigint,
      lastUpdated: Number(position[2]),
      lastRebalanced: Number(position[3]),
    } : undefined,
    isLoading,
    refetch,
    error,
  };
}


// Hook to withdraw from the YieldOptimizer
export function useWithdraw(
  positionIndex?: number, // Needs to be BigInt for args
  amount?: string,
  tokenDecimals?: number,
  chainId?: number
) {
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  // Ensure chainSelector is a BigInt for the withdraw function
  const chainSelectorBigInt = useMemo(() => {
    if (chainId && CHAINLINK_CHAIN_SELECTORS[chainId]) {
      return BigInt(CHAINLINK_CHAIN_SELECTORS[chainId]); // Explicit conversion for safety
    }
    return undefined;
  }, [chainId]);

  // Convert amount string to BigInt
  const parsedAmount = useMemo(() => {
    if (amount && tokenDecimals !== undefined) {
      try {
        const parsed = parseUnits(amount, tokenDecimals);
        return parsed > 0n ? parsed : undefined; // Ensure amount is positive
      } catch (e) {
        console.error("Failed to parse amount for withdraw:", e);
        return undefined;
      }
    }
    return undefined;
  }, [amount, tokenDecimals]);

  const {
    data: hash,
    isPending: isWithdrawLoading,
    error: withdrawError,
    writeContract: writeWithdraw, // Renamed 'withdraw' to 'writeWithdraw'
    reset: resetWithdrawHook, // Added reset function
  } = useWriteContract();

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed,
    error: withdrawConfirmError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Combine loading states
  const isLoading = isWithdrawLoading || isWithdrawConfirming;
  // Combine success states
  const isSuccess = isWithdrawConfirmed;
  // Combine error states
  const error = useMemo(() => withdrawError || withdrawConfirmError, [withdrawError, withdrawConfirmError]);


  const write = useCallback(() => {
    if (
      !writeWithdraw ||
      positionIndex === undefined || // positionIndex can be 0, so check for undefined
      !parsedAmount ||
      parsedAmount <= 0n ||
      !chainSelectorBigInt ||
      !yieldOptimizerAddress
    ) {
        console.error("Missing parameters for withdraw transaction:", {
            writeWithdraw: !!writeWithdraw,
            positionIndex,
            parsedAmount,
            chainSelectorBigInt,
            yieldOptimizerAddress
        });
        return;
    }

    writeWithdraw({
      address: yieldOptimizerAddress,
      abi: YIELD_OPTIMIZER_ABI, // Use the imported ABI here
      functionName: 'withdraw',
      args: [
        BigInt(positionIndex), // Convert positionIndex to BigInt for uint256
        parsedAmount,
        chainSelectorBigInt, // Pass the BigInt chain selector
      ],
    });
  }, [
    writeWithdraw,
    positionIndex,
    parsedAmount,
    chainSelectorBigInt,
    yieldOptimizerAddress,
  ]);

  return {
    write, // The function to call to initiate the withdraw
    data: hash,
    isLoading,
    isSuccess,
    error,
    reset: resetWithdrawHook, // Expose the reset function
  };
}
