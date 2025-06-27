// src/integrations/crossChain/hooks.ts

import { useMemo, useCallback } from 'react';
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
  usePublicClient,
  useChainId,
  useAccount
} from 'wagmi';
import { Address, parseUnits, formatUnits, Hex, parseAbiItem, decodeEventLog, getEventSelector } from 'viem';
import {
  CrossChainManagerABI,
  CROSS_CHAIN_MANAGER_ADDRESSES,
  CHAINLINK_CHAIN_SELECTORS_MAP,
  USDC_CONTRACT_ADDRESSES_CROSSCHAIN
} from './constants';
import { toast } from 'react-toastify';

// import { useErc20Allowance, useApproveErc20, ERC20_ABI } from '@/integrations/erc20/hooks';


// --- Hook to get CCIP transfer fee ---
export function useGetTransferFee(
  amount: string,
  destinationChainId?: number,
  sourceChainId?: number, // Explicitly taking sourceChainId as an argument
  receiverAddress?: Address
) {
  const { address: userAddress } = useAccount();
  const currentConnectedChainId = useChainId(); // Get the truly current connected chain

  const effectiveSourceChainId = sourceChainId || currentConnectedChainId; // Use provided sourceChainId or current connected
  const sourceManagerAddress = effectiveSourceChainId ? CROSS_CHAIN_MANAGER_ADDRESSES[effectiveSourceChainId] : undefined;
  const destinationChainSelector = destinationChainId ? CHAINLINK_CHAIN_SELECTORS_MAP[destinationChainId] : undefined;
  const usdcAddressOnSource = effectiveSourceChainId ? USDC_CONTRACT_ADDRESSES_CROSSCHAIN[effectiveSourceChainId] : undefined;

  const parsedAmount = useMemo(() => {
    try {
      if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) return 0n;
      return parseUnits(amount, 6); // USDC typically has 6 decimals
    } catch (e) {
      console.error("Error parsing amount for fee calculation:", e);
      return 0n;
    }
  }, [amount]);

  const { data: feeData, isLoading, isError, error, refetch } = useReadContract({
    address: sourceManagerAddress,
    abi: CrossChainManagerABI,
    functionName: 'getTransferFee',
    args: [
      parsedAmount,
      destinationChainSelector as bigint,
      receiverAddress || userAddress as Address
    ],
    query: {
      enabled:
        !!sourceManagerAddress &&
        !!destinationChainSelector &&
        !!usdcAddressOnSource &&
        parsedAmount > 0n &&
        !!(receiverAddress || userAddress) &&
        !!effectiveSourceChainId &&
        !!destinationChainId
      ,
      refetchInterval: 15000,
    },
  });

  const formattedFee = useMemo(() => {
    if (feeData === undefined) return '0.000';
    return formatUnits(feeData, 18);
  }, [feeData]);

  return {
    fee: formattedFee,
    feeRaw: feeData,
    isLoading,
    isError,
    error,
    refetch, // Expose refetch from useReadContract
  };
}

// --- Hook to execute the cross-chain transfer ---
export function useTransferCrossChain(
  amount: string,
  destinationChainId: number | undefined,
  receiverAddress: Address | undefined
) {
  const { address: userAddress, chainId: currentChainId } = useAccount();
  // const publicClient = usePublicClient();

  // Get transfer fee using the dedicated hook, passing the currentChainId as source
  const {
    feeRaw,
    isLoading: isLoadingFee,
    isError: isErrorFee,
    error: errorFee,
    refetch: refetchEstimatedFee // Get the refetch function from useGetTransferFee
  } = useGetTransferFee(
    amount,
    destinationChainId,
    currentChainId, // Pass currentChainId as sourceChainId to fee hook
    receiverAddress || userAddress
  );

  const sourceManagerAddress = currentChainId ? CROSS_CHAIN_MANAGER_ADDRESSES[currentChainId] : undefined;
  const destinationChainSelector = destinationChainId ? CHAINLINK_CHAIN_SELECTORS_MAP[destinationChainId] : undefined;
  const usdcAddressOnSource = currentChainId ? USDC_CONTRACT_ADDRESSES_CROSSCHAIN[currentChainId] : undefined;


  const parsedAmount = useMemo(() => {
    try {
      if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) return 0n;
      return parseUnits(amount, 6); // USDC has 6 decimals
    } catch (e) {
      console.error("Error parsing amount for transfer:", e);
      return 0n;
    }
  }, [amount]);

  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating,
  } = useSimulateContract({
    address: sourceManagerAddress,
    abi: CrossChainManagerABI,
    functionName: 'transferCrossChain',
    args: [
      parsedAmount,
      destinationChainSelector as bigint,
      receiverAddress || userAddress as Address
    ],
    value: feeRaw,
    query: {
      enabled:
        !!sourceManagerAddress &&
        !!destinationChainSelector &&
        !!usdcAddressOnSource &&
        parsedAmount > 0n &&
        !!feeRaw &&
        feeRaw > 0n &&
        !!(receiverAddress || userAddress) &&
        !isLoadingFee && !isErrorFee &&
        !!currentChainId && !!destinationChainId,
    },
  });

  const {
    data: hash,
    isPending: isWritePending,
    error: writeError,
    writeContract: transfer,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const ccipMessageId = useMemo(() => {
    if (!receipt || !sourceManagerAddress) return undefined;
    
    try {
      const transferInitiatedEvent = parseAbiItem('event CrossChainTransferInitiated(address indexed sender, uint256 amount, uint64 indexed destinationChainSelector, bytes32 indexed messageId)');
      
      // Get event selector using viem's utility function
      const eventSelector = getEventSelector(transferInitiatedEvent);

      const logs = receipt.logs.filter(
        (log) => log.address.toLowerCase() === sourceManagerAddress.toLowerCase() &&
                  log.topics[0] === eventSelector
      );

      if (logs.length > 0) {
        // Use viem's decodeEventLog utility function
        const decodedLog = decodeEventLog({
          abi: [transferInitiatedEvent],
          data: logs[0].data,
          topics: logs[0].topics,
        });
        return decodedLog.args.messageId as Hex;
      }
    } catch (e) {
      console.error("Error parsing CrossChainTransferInitiated event:", e);
    }
    return undefined;
  }, [receipt, sourceManagerAddress]);


  const write = useCallback(() => {
    if (simulateData?.request) {
      transfer(simulateData.request);
    } else if (simulateError) {
      // Fixed: Use message instead of shortMessage and add proper error handling
      const errorMessage = simulateError.message || 'Unknown simulation error';
      toast.error(`Transaction simulation failed: ${errorMessage}`);
      console.error("Simulation error:", simulateError);
    } else {
      toast.error("Transfer not ready: Simulation data missing.");
    }
  }, [simulateData, simulateError, transfer]);

  const isLoading = isSimulating || isWritePending || isConfirming || isLoadingFee;
  const isError = !!simulateError || !!writeError || isConfirmError || !!errorFee;
  const error = simulateError || writeError || confirmError || errorFee;

  return {
    write,
    data: hash,
    ccipMessageId,
    isLoading,
    isSuccess: isConfirmed && !!ccipMessageId,
    isError,
    error,
    refetchEstimatedFee // Now returning the refetch function
  };
}