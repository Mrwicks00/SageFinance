// src/integrations/erc20/hooks.ts
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, erc20Abi, parseUnits } from 'viem';
import { ERC20_ABI } from './constants';
import { YIELD_OPTIMIZER_ADDRESSES } from '@/integrations/yieldOptimizer/constants';
import { useMemo, useCallback } from 'react';

// Hook to get an ERC-20 token's balance for the connected user
export function useErc20Balance(tokenAddress?: Address) {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address && !!tokenAddress, // Only enable query if address and tokenAddress exist
      refetchInterval: 5000, // Refetch balance every 5 seconds
    },
  });

  return {
    balance: balance as bigint | undefined,
    isLoading,
    refetch,
    error,
  };
}

// Hook to get an ERC-20 token's decimals
export function useErc20Decimals(tokenAddress?: Address) {
  const { data: decimals, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
      staleTime: Infinity, // Decimals don't change
    },
  });

  return {
    decimals: decimals as number | undefined,
    isLoading,
    error,
  };
}

// Hook to get the allowance granted by the user to the YieldOptimizer contract for a specific token
export function useErc20Allowance(tokenAddress?: Address, chainId?: number) {
  const { address } = useAccount();
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  const { data: allowance, isLoading, refetch, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, yieldOptimizerAddress as Address],
    query: {
      enabled: !!address && !!tokenAddress && !!yieldOptimizerAddress,
      refetchInterval: 5000, // Refetch allowance every 5 seconds
    },
  });

  return {
    allowance: allowance as bigint | undefined,
    isLoading,
    refetch,
    error,
  };
}

// Hook to approve the YieldOptimizer contract to spend a certain amount of an ERC-20 token
export function useApproveErc20(tokenAddress?: Address, amountToApprove?: bigint) {
  const { chainId } = useAccount();
  const yieldOptimizerAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  const {
    data: hash,
    isPending: isApproveLoading,
    error: approveError,
    writeContract: approve,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: approveConfirmError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const write = useCallback(() => {
    if (tokenAddress && yieldOptimizerAddress && amountToApprove !== undefined) {
      approve({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [yieldOptimizerAddress, amountToApprove],
      });
    }
  }, [tokenAddress, yieldOptimizerAddress, amountToApprove, approve]);

  const error = useMemo(() => approveError || approveConfirmError, [approveError, approveConfirmError]);

  return {
    write,
    data: hash,
    isLoading: isApproveLoading || isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error,
  };
}