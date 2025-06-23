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
  Loader
} from "lucide-react";

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
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-400" />
          Recent Activity
        </h2>
        <button className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {mockTransactions.slice(0, 5).map((transaction) => {
          const TransactionIcon = getTransactionIcon(transaction.type);
          const StatusIcon = getStatusIcon(transaction.status);
          const statusColor = getStatusColor(transaction.status);
          
          return (
            <div
              key={transaction.id}
              className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-colors"
            >
              {/* Transaction Type Icon */}
              <div className="p-2 bg-gray-700 rounded-lg">
                <TransactionIcon className="w-4 h-4 text-yellow-400" />
              </div>

              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium capitalize">
                      {transaction.type} {transaction.asset}
                    </div>
                    <div className="text-sm text-gray-400">
                      {transaction.amount.toLocaleString()} {transaction.asset}
                      {transaction.protocol && (
                        <span className="ml-2 capitalize">
                          • {transaction.protocol}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {transaction.chain}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(transaction.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Link */}
              <div className="flex items-center space-x-2">
                <StatusIcon className={`w-4 h-4 ${statusColor} ${
                  transaction.status === "pending" ? "animate-spin" : ""
                }`} />
                {transaction.hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}