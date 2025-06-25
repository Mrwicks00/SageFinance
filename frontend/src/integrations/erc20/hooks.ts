// src/integrations/erc20/hooks.ts

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, erc20Abi } from 'viem'; // Removed maxUint256 import
import { useMemo, useCallback } from 'react';

export const ERC20_ABI = erc20Abi;

// Hook to get an ERC-20 token's balance for the connected user
export function useErc20Balance(tokenAddress?: Address) {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address && !!tokenAddress,
      refetchInterval: 5000,
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
      staleTime: Infinity,
    },
  });

  return {
    decimals: decimals as number | undefined,
    isLoading,
    error,
  };
}

// Hook to get the allowance granted by the user to a specified spender contract for a specific token
export function useErc20Allowance(tokenAddress?: Address, spenderAddress?: Address) {
  const { address } = useAccount();

  const { data: allowance, isLoading, refetch, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as Address, spenderAddress as Address],
    query: {
      enabled: !!address && !!tokenAddress && !!spenderAddress,
      refetchInterval: 5000,
    },
  });

  return {
    allowance: allowance as bigint | undefined,
    isLoading,
    refetch,
    error,
  };
}

// Hook to approve a specified spender contract to spend a specific amount of an ERC-20 token.
// This now takes `amountToApprove` as an argument.
export function useApproveErc20(tokenAddress?: Address, spenderAddress?: Address, amountToApprove?: bigint) {
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
    if (tokenAddress && spenderAddress && amountToApprove !== undefined) {
      // Approve the specific amount
      approve({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountToApprove],
      });
    }
  }, [tokenAddress, spenderAddress, amountToApprove, approve]); // Added amountToApprove to dependencies

  const error = useMemo(() => approveError || approveConfirmError, [approveError, approveConfirmError]);

  return {
    write,
    data: hash,
    isLoading: isApproveLoading || isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error,
  };
}
