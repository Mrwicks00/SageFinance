// src/integrations/erc20/hooks.ts

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, erc20Abi } from 'viem';
import { useMemo, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

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
export function useApproveErc20(tokenAddress?: Address, spenderAddress?: Address, amountToApprove?: bigint) {
  const {
    data: hash,
    isPending: isApproveLoading,
    error: approveError,
    writeContract: approve,
    reset: resetApprove,
  } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        console.log('Approval transaction submitted:', data);
        toast.info('Approval submitted, waiting for confirmation...');
      },
      onError: (error) => {
        console.error('Approval transaction failed:', error);
        toast.error(`Approval failed: ${error.message}`);
      },
    },
  });

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

  // Debug logging
  useEffect(() => {
    console.log('Approval Hook State:', {
      hash,
      isApproveLoading,
      isApproveConfirming,
      isApproveConfirmed,
      approveError: approveError?.message,
      approveConfirmError: approveConfirmError?.message,
    });
  }, [hash, isApproveLoading, isApproveConfirming, isApproveConfirmed, approveError, approveConfirmError]);

  const write = useCallback(() => {
    console.log('Attempting approval with params:', {
      approve: !!approve,
      tokenAddress,
      spenderAddress,
      amountToApprove: amountToApprove?.toString(),
    });

    if (!approve) {
      console.error('approve function is not available');
      toast.error('Approval function not available. Please try again.');
      return;
    }

    if (!tokenAddress) {
      console.error('Token address is missing');
      toast.error('Invalid token address.');
      return;
    }

    if (!spenderAddress) {
      console.error('Spender address is missing');
      toast.error('Invalid spender address.');
      return;
    }

    if (amountToApprove === undefined) {
      console.error('Amount to approve is undefined');
      toast.error('Invalid approval amount.');
      return;
    }

    try {
      console.log('Calling approve with args:', [spenderAddress, amountToApprove]);
      
      approve({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amountToApprove],
      });
    } catch (error) {
      console.error('Error calling approve:', error);
      toast.error('Failed to submit approval. Please try again.');
    }
  }, [tokenAddress, spenderAddress, amountToApprove, approve]);

  const error = useMemo(() => approveError || approveConfirmError, [approveError, approveConfirmError]);

  return {
    write,
    data: hash,
    isLoading: isApproveLoading || isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error,
    reset: resetApprove,
  };
}

// Specific hook for Yield Optimizer approvals (keeps your current logic)
export function useApproveErc20ForYieldOptimizer(tokenAddress?: Address, amountToApprove?: bigint, chainId?: number) {
  const YIELD_OPTIMIZER_ADDRESSES: Record<number, `0x${string}`> = {
    11155111: "0x543aeA3ad17fE0a4cfc8546f958d15BB2828e68B", // Sepolia
    84532: "0x2fE627AD81358FC3a8ccC197869ad347E487c3C0",   // Base Sepolia
    421614: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",   // Arbitrum Sepolia
  };
  
  const spenderAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  return useApproveErc20(tokenAddress, spenderAddress, amountToApprove);
}

// Specific hook for Yield Optimizer allowance (keeps your current logic)
export function useErc20AllowanceForYieldOptimizer(tokenAddress?: Address, chainId?: number) {
  const YIELD_OPTIMIZER_ADDRESSES: Record<number, `0x${string}`> = {
    11155111: "0x543aeA3ad17fE0a4cfc8546f958d15BB2828e68B", // Sepolia
    84532: "0x2fE627AD81358FC3a8ccC197869ad347E487c3C0",   // Base Sepolia
    421614: "0xA939e5f884f46a281Eac2c438a7337b890644b8C",   // Arbitrum Sepolia
  };
  
  const spenderAddress = chainId ? YIELD_OPTIMIZER_ADDRESSES[chainId] : undefined;

  return useErc20Allowance(tokenAddress, spenderAddress);
}