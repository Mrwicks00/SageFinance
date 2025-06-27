// src/components/crosschain/TransferStatus.tsx

import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import {
  
  TRANSFER_STEPS,
  Chain,
  CCIP_EXPLORER_BASE_URL
} from '@/data/crosschain'

interface TransferStatusProps {
  status: String; // 'idle' | 'pending' | 'confirming' | 'bridging' | 'depositing' | 'completed' | 'failed'
  currentStep: number; // Current step index (0-indexed)
  totalSteps: number;
  fromChain: Chain;
  toChain: Chain;
  amount: string;
  txHash?: string;
  ccipMessageId?: string;
  error?: string;
  isTransactionConfirmed?: boolean; // New prop to track if source tx is confirmed
}

export const TransferStatus: React.FC<TransferStatusProps> = ({
  status,
  currentStep,
  totalSteps,
  fromChain,
  toChain,
  amount,
  txHash,
  ccipMessageId,
  error,
  isTransactionConfirmed = false
}) => {
  const [bridgeStartTime, setBridgeStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Start timer when bridging begins (transaction confirmed + ccipMessageId available)
  useEffect(() => {
    if (isTransactionConfirmed && ccipMessageId && status === 'bridging' && !bridgeStartTime) {
      setBridgeStartTime(Date.now());
    }
  }, [isTransactionConfirmed, ccipMessageId, status, bridgeStartTime]);

  // Update elapsed time every second during bridging
  useEffect(() => {
    if (bridgeStartTime && status === 'bridging') {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - bridgeStartTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [bridgeStartTime, status]);

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    } else if (stepIndex === currentStep) {
      if (status === 'failed' && stepIndex === currentStep) {
         return <AlertCircle className="w-4 h-4 text-red-500" />
      }
      return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
    } else {
      return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) {
      return status === 'failed' ? 'failed' : 'active'
    }
    return 'pending'
  }

  const getTransactionExplorerUrl = (chain: Chain, hash: string) => {
    return `${chain.blockExplorer}/tx/${hash}`;
  };

  const getCcipExplorerUrl = (messageId: string) => {
    return `${CCIP_EXPLORER_BASE_URL}${messageId}`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBridgeProgress = () => {
    const estimatedDuration = 20 * 60; // 20 minutes in seconds
    const progress = Math.min((elapsedTime / estimatedDuration) * 100, 95); // Cap at 95% until actually completed
    return progress;
  };

  return (
    <div className="relative">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Transfer Status</h3>
        </div>

        <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-medium">{amount} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white font-medium">{fromChain.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">To:</span>
                    <span className="text-white font-medium">{toChain.name}</span>
                </div>
            </div>

            {TRANSFER_STEPS.map((step, index) => {
                const stepStatus = getStepStatus(index)
                const isBridgingStep = step.toLowerCase().includes('bridge') || step.toLowerCase().includes('cross-chain');
                
                return (
                    <div key={index} className="flex items-center space-x-3">
                        {getStepIcon(index)}
                        <div className="flex-1">
                            <div className={`
                                font-medium
                                ${stepStatus === 'completed' ? 'text-green-400' :
                                stepStatus === 'active' ? 'text-yellow-400' :
                                stepStatus === 'failed' ? 'text-red-400' : 'text-gray-500'}
                            `}>
                                {step}
                            </div>
                            {stepStatus === 'active' && status !== 'failed' && (
                                <div className="text-sm text-gray-400">
                                  {isBridgingStep && bridgeStartTime ? (
                                    <div className="space-y-1">
                                      <div>Processing cross-chain transfer...</div>
                                      <div className="flex items-center space-x-2">
                                        <div className="text-xs">
                                          {formatTime(elapsedTime)} / ~20:00
                                        </div>
                                        <div className="w-32 bg-gray-700 rounded-full h-1.5">
                                          <div 
                                            className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000"
                                            style={{ width: `${getBridgeProgress()}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    'In progress...'
                                  )}
                                </div>
                            )}
                            {stepStatus === 'failed' && (
                                <div className="text-sm text-red-400">{error || 'An error occurred.'}</div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>

        {txHash && (
            <div className="mt-6 p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Transaction Hash:</span>
                    <a
                        href={getTransactionExplorerUrl(fromChain, txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500 hover:text-yellow-400 flex items-center space-x-1"
                    >
                        <span className="text-sm">View</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </div>
            </div>
        )}

        {ccipMessageId && (
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">CCIP Message ID:</span>
                    <a
                        href={getCcipExplorerUrl(ccipMessageId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500 hover:text-yellow-400 flex items-center space-x-1"
                    >
                        <span className="text-sm">Track</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div className="text-xs text-gray-500 mt-1 font-mono break-all">
                    {ccipMessageId.slice(0, 10)}...{ccipMessageId.slice(-8)}
                </div>
                {status === 'bridging' && (
                  <div className="mt-2 text-xs text-blue-400">
                    🔄 Cross-chain transfer in progress - This typically takes 15-20 minutes
                  </div>
                )}
            </div>
        )}

        {status === 'completed' && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                        <div className="text-green-400 font-medium">Transfer Complete!</div>
                        <div className="text-sm text-gray-400">
                            Your USDC has been successfully transferred and deposited into yield farming.
                        </div>
                    </div>
                </div>
            </div>
        )}
        {status === 'failed' && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                        <div className="text-red-400 font-medium">Transfer Failed</div>
                        <div className="text-sm text-gray-400">
                            {error || 'An unexpected error occurred during transfer.'}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}