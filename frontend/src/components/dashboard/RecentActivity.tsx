"use client";

import { mockTransactions } from "../../data/mockData";
import { 
  Clock, 
  ArrowDown, 
  ArrowUp, 
  ArrowLeftRight, 
  Coins,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return ArrowDown;
    case "withdraw":
      return ArrowUp;
    case "transfer":
      return ArrowLeftRight;
    case "stake":
      return Coins;
    default:
      return Clock;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "pending":
      return Loader;
    case "failed":
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-400";
    case "pending":
      return "text-yellow-400";
    case "failed":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export function RecentActivity() {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          Recent Activity
        </h2>
        <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {mockTransactions.slice(0, 5).map((transaction, index) => {
          const TransactionIcon = getTransactionIcon(transaction.type);
          const StatusIcon = getStatusIcon(transaction.status);
          const statusColor = getStatusColor(transaction.status);
          const isCopied = copiedHash === transaction.hash;
          
          return (
            <div
              key={transaction.id}
              className={`relative group p-4 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-yellow-400/30 transition-all duration-300 hover:bg-gray-800/50 hover:scale-[1.01] animate-slide-in-up stagger-${index + 1}`}
            >
              {/* Timeline connector */}
              {index < 4 && (
                <div className="absolute left-8 top-full w-0.5 h-3 bg-gradient-to-b from-gray-700 to-transparent" />
              )}

              <div className="flex items-start space-x-4">
                {/* Transaction Type Icon with enhanced styling */}
                <div className="relative">
                  <div className="p-2.5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-600 group-hover:border-yellow-400/30 transition-all duration-300 group-hover:scale-110">
                    <TransactionIcon className="w-5 h-5 text-yellow-400" />
                  </div>
                  {/* Status indicator dot */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                    transaction.status === "completed" ? "bg-green-400" :
                    transaction.status === "pending" ? "bg-yellow-400 animate-pulse" :
                    "bg-red-400"
                  }`} />
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-white font-semibold capitalize">
                          {transaction.type} {transaction.asset}
                        </div>
                        <StatusIcon className={`w-4 h-4 ${statusColor} ${
                          transaction.status === "pending" ? "animate-spin" : ""
                        }`} />
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="font-medium text-white">
                          {transaction.amount.toLocaleString()} {transaction.asset}
                        </span>
                        {transaction.protocol && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="capitalize px-2 py-0.5 bg-gray-700/50 rounded text-xs">
                              {transaction.protocol}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium text-sm px-2 py-1 bg-gray-700/50 rounded capitalize">
                        {transaction.chain}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(transaction.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Hash and Actions */}
                  {transaction.hash && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700/50">
                      <div className="flex-1 flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <span className="truncate">{transaction.hash}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(transaction.hash!)}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors rounded hover:bg-gray-700/50"
                          title="Copy hash"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors rounded hover:bg-gray-700/50"
                          title="View on explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View more indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span>Live activity feed</span>
        </div>
      </div>
    </div>
  );
}