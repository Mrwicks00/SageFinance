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

import { useErc20Allowance, useApproveErc20, ERC20_ABI } from '@/integrations/erc20/hooks';


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

  // Add validation for chain selector existence
  const isValidChainConfiguration = useMemo(() => {
    const hasSourceManager = !!sourceManagerAddress;
    const hasDestinationSelector = !!destinationChainSelector;
    const hasUsdcAddress = !!usdcAddressOnSource;
    const hasValidChainIds = !!effectiveSourceChainId && !!destinationChainId;
    
    if (!hasSourceManager) {
      console.warn(`No CrossChainManager address found for source chain ${effectiveSourceChainId}`);
    }
    if (!hasDestinationSelector) {
      console.warn(`No chain selector found for destination chain ${destinationChainId}`);
    }
    if (!hasUsdcAddress) {
      console.warn(`No USDC address found for source chain ${effectiveSourceChainId}`);
    }
    
    return hasSourceManager && hasDestinationSelector && hasUsdcAddress && hasValidChainIds;
  }, [sourceManagerAddress, destinationChainSelector, usdcAddressOnSource, effectiveSourceChainId, destinationChainId]);

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
        isValidChainConfiguration &&
        parsedAmount > 0n &&
        !!(receiverAddress || userAddress),
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
    isError: isError || !isValidChainConfiguration,
    error: error || (!isValidChainConfiguration ? new Error('Invalid chain configuration') : null),
    refetch, // Expose refetch from useReadContract
    isValidChainConfiguration,
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
    refetch: refetchEstimatedFee, // Get the refetch function from useGetTransferFee
    isValidChainConfiguration
  } = useGetTransferFee(
    amount,
    destinationChainId,
    currentChainId, // Pass currentChainId as sourceChainId to fee hook
    receiverAddress || userAddress
  );

  const sourceManagerAddress = currentChainId ? CROSS_CHAIN_MANAGER_ADDRESSES[currentChainId] : undefined;
  const destinationChainSelector = destinationChainId ? CHAINLINK_CHAIN_SELECTORS_MAP[destinationChainId] : undefined;
  const usdcAddressOnSource = currentChainId ? USDC_CONTRACT_ADDRESSES_CROSSCHAIN[currentChainId] : undefined;

  // Add logging for debugging
  useMemo(() => {
    if (currentChainId && destinationChainId) {
      console.log('CrossChain Transfer Configuration:', {
        sourceChainId: currentChainId,
        destinationChainId,
        sourceManagerAddress,
        destinationChainSelector: destinationChainSelector?.toString(),
        usdcAddressOnSource,
        isValidChainConfiguration
      });
    }
  }, [currentChainId, destinationChainId, sourceManagerAddress, destinationChainSelector, usdcAddressOnSource, isValidChainConfiguration]);

  const parsedAmount = useMemo(() => {
    try {
      if (!amount || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) return 0n;
      return parseUnits(amount, 6); // USDC has 6 decimals
    } catch (e) {
      console.error("Error parsing amount for transfer:", e);
      return 0n;
    }
  }, [amount]);

  // Enhanced simulation with better error handling

  const {
    allowance: currentAllowance,
    isLoading: isLoadingCurrentAllowance,
    refetch: refetchCurrentAllowance,
  } = useErc20Allowance(usdcAddressOnSource, sourceManagerAddress);


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
      isValidChainConfiguration &&
      !!sourceManagerAddress &&
      !!destinationChainSelector &&
      !!usdcAddressOnSource &&
      parsedAmount > 0n &&
      !!feeRaw &&
      feeRaw > 0n &&
      !!(receiverAddress || userAddress) &&
      !isLoadingFee && 
      !isErrorFee &&
      !!currentChainId && 
      !!destinationChainId &&
      !isLoadingCurrentAllowance &&
      currentAllowance !== undefined &&
      currentAllowance >= parsedAmount, // Add this allowance check
  },
});

  // Add logging for simulation errors
  useMemo(() => {
    if (simulateError) {
      console.error('Simulation Error Details:', {
        error: simulateError,
        sourceChainId: currentChainId,
        destinationChainId,
        amount: parsedAmount.toString(),
        fee: feeRaw?.toString(),
        enabled: isValidChainConfiguration &&
          !!sourceManagerAddress &&
          !!destinationChainSelector &&
          !!usdcAddressOnSource &&
          parsedAmount > 0n &&
          !!feeRaw &&
          feeRaw > 0n &&
          !!(receiverAddress || userAddress) &&
          !isLoadingFee && 
          !isErrorFee &&
          !!currentChainId && 
          !!destinationChainId
      });
    }
  }, [simulateError, currentChainId, destinationChainId, parsedAmount, feeRaw, isValidChainConfiguration, sourceManagerAddress, destinationChainSelector, usdcAddressOnSource, receiverAddress, userAddress, isLoadingFee, isErrorFee]);

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
    if (!isValidChainConfiguration) {
      toast.error("Invalid chain configuration. Please check chain support.");
      return;
    }
  
    // Add explicit allowance check before attempting transfer
    if (currentAllowance === undefined || currentAllowance < parsedAmount) {
      toast.error("Insufficient USDC allowance. Please approve USDC first.");
      console.error("Allowance check failed:", {
        currentAllowance: currentAllowance?.toString(),
        parsedAmount: parsedAmount.toString(),
        hasAllowance: currentAllowance !== undefined,
        isAllowanceSufficient: currentAllowance !== undefined && currentAllowance >= parsedAmount
      });
      return;
    }
  
    if (simulateData?.request) {
      console.log('Executing transfer with config:', {
        sourceChain: currentChainId,
        destinationChain: destinationChainId,
        amount: parsedAmount.toString(),
        fee: feeRaw?.toString(),
        allowance: currentAllowance.toString()
      });
      transfer(simulateData.request);
    } else if (simulateError) {
      // Enhanced error handling with more specific messages
      let errorMessage = simulateError.message || 'Unknown simulation error';
      
      // Check for common CCIP errors
      if (errorMessage.includes('allowance') || errorMessage.includes('ERC20: transfer amount exceeds allowance')) {
        errorMessage = 'Insufficient USDC allowance. Please approve USDC first.';
        // Trigger allowance refetch
        refetchCurrentAllowance();
      } else if (errorMessage.includes('router')) {
        errorMessage = 'CCIP Router error. This route may not be supported.';
      } else if (errorMessage.includes('selector')) {
        errorMessage = 'Invalid destination chain selector. This route may not be active.';
      } else if (errorMessage.includes('fee')) {
        errorMessage = 'Insufficient fee for cross-chain transfer.';
      } else if (errorMessage.includes('balance')) {
        errorMessage = 'Insufficient USDC balance.';
      }
  
      toast.error(`Transaction simulation failed: ${errorMessage}`);
      console.error("Simulation error:", simulateError);
    } else {
      toast.error("Transfer not ready: Simulation data missing.");
    }
  }, [simulateData, simulateError, transfer, isValidChainConfiguration, currentChainId, destinationChainId, parsedAmount, feeRaw, currentAllowance, refetchCurrentAllowance]);
  

  const isLoading = isSimulating || isWritePending || isConfirming || isLoadingFee;
  const isError = !!simulateError || !!writeError || isConfirmError || !!errorFee || !isValidChainConfiguration;
  const error = simulateError || writeError || confirmError || errorFee || (!isValidChainConfiguration ? new Error('Invalid chain configuration') : null);

  return {
    write,
    data: hash,
    ccipMessageId,
    isLoading,
    isSuccess: isConfirmed && !!ccipMessageId,
    isError,
    error,
    refetchEstimatedFee,
    refetchCurrentAllowance, // Add this
    isValidChainConfiguration
  };
}