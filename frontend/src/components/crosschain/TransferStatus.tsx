// src/components/crosschain/TransferStatus.tsx

import React from 'react';
import { CircleCheck, CircleX, Loader, Info, Clock, Link as LinkIcon } from 'lucide-react';
import { Chain } from '@/data/crosschain';
import { TRANSFER_STEPS, CCIP_EXPLORER_BASE_URL } from '@/data/crosschain';

interface TransferStatusProps {
  status: 'idle' | 'pending' | 'confirming' | 'bridging' | 'depositing' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  fromChain: Chain;
  toChain: Chain;
  amount: string;
  txHash?: string; // Optional transaction hash
  ccipMessageId?: string; // Optional CCIP message ID
  error?: string; // Optional error message
  message?: string; // Optional detailed message
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
  message,
}) => {
  const getStatusIcon = (currentStatus: TransferStatusProps['status']) => {
    switch (currentStatus) {
      case 'completed':
        return <CircleCheck className="w-8 h-8 text-green-500" />;
      case 'failed':
        return <CircleX className="w-8 h-8 text-red-500" />;
      case 'idle':
        return <Info className="w-8 h-8 text-gray-400" />;
      default:
        return <Loader className="w-8 h-8 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    if (message) return message; // Prioritize custom message
    switch (status) {
      case 'idle':
        return 'Ready to transfer.';
      case 'pending':
        return 'Waiting for your wallet confirmation...';
      case 'confirming':
        return 'Confirming transaction...';
      case 'bridging':
        return 'Transfer initiated. Funds are now bridging across chains via CCIP...';
      case 'depositing':
        return 'Bridge complete. Depositing funds into yield strategy...';
      case 'completed':
        return 'Cross-chain transfer and deposit successful!';
      case 'failed':
        return 'Transfer failed. Please check details below.';
      default:
        return 'Unknown status.';
    }
  };

  const getStepStatus = (index: number) => {
    if (currentStep === index) return 'current';
    if (currentStep > index) return 'completed';
    return 'pending';
  };

  return (
    <div className="text-white text-center p-4">
      <div className="mb-4 flex justify-center">
        {getStatusIcon(status)}
      </div>
      <h2 className="text-2xl font-bold mb-2">Transfer Status</h2>
      <p className="text-gray-300 mb-2">{getStatusMessage()}</p>

      {/* New: Approximate Transfer Time Message */}
      {(status === 'pending' || status === 'confirming' || status === 'bridging' || status === 'depositing') && (
        <p className="text-gray-400 text-sm mb-4 flex items-center justify-center">
          <Clock className="w-4 h-4 mr-1" /> This transfer may take approximately 20 minutes.
        </p>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg mb-4 text-sm">
          Error: {error}
        </div>
      )}

      <div className="space-y-4 mb-6 text-left">
        <div className="flex justify-between items-center text-gray-300">
          <span>From:</span>
          <span className="font-semibold flex items-center">
            <img src={fromChain.logo} alt={fromChain.name} className="w-5 h-5 rounded-full mr-2" />
            {fromChain.name}
          </span>
        </div>
        <div className="flex justify-between items-center text-gray-300">
          <span>To:</span>
          <span className="font-semibold flex items-center">
            <img src={toChain.logo} alt={toChain.name} className="w-5 h-5 rounded-full mr-2" />
            {toChain.name}
          </span>
        </div>
        <div className="flex justify-between items-center text-gray-300">
          <span>Amount:</span>
          <span className="font-semibold">{amount} USDC</span>
        </div>

        {txHash && (
          <div className="flex justify-between items-center text-gray-300 text-sm">
            <span>Transaction Hash:</span>
            <a
              href={`${fromChain.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:underline flex items-center"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)} <LinkIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}

        {ccipMessageId && (
          <div className="flex justify-between items-center text-gray-300 text-sm">
            <span>CCIP Message ID:</span>
            <a
              href={`${CCIP_EXPLORER_BASE_URL}${ccipMessageId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-400 hover:underline flex items-center break-all"
            >
              {ccipMessageId.slice(0, 8)}...{ccipMessageId.slice(-8)} <LinkIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {TRANSFER_STEPS.map((stepText, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
              ${getStepStatus(index) === 'completed' ? 'bg-green-500 text-white' : ''}
              ${getStepStatus(index) === 'current' ? 'bg-yellow-500 text-black animate-pulse' : ''}
              ${getStepStatus(index) === 'pending' ? 'bg-gray-700 text-gray-400' : ''}
            `}>
              {index + 1}
            </div>
            <span className={`
              text-lg
              ${getStepStatus(index) === 'completed' ? 'text-green-300' : ''}
              ${getStepStatus(index) === 'current' ? 'text-white font-medium' : ''}
              ${getStepStatus(index) === 'pending' ? 'text-gray-400' : ''}
            `}>
              {stepText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
