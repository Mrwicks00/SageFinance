// src/components/dashboard/yield/UserPositions.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, MoreVertical } from "lucide-react";

// --- WAGMI / VIEM Imports (CRITICAL) ---
import { useAccount, useChainId, useReadContracts, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import type { Address } from 'viem';

import { toast } from "react-toastify";

// Import your hooks and constants
import { useWithdraw } from '@/integrations/yieldOptimizer/hooks';
import { YIELD_OPTIMIZER_ADDRESSES, STRATEGY_IDS, YIELD_OPTIMIZER_ABI } from '@/integrations/yieldOptimizer/constants';

// Import your data and types from yieldData.ts
import { SUPPORTED_CHAINS, PROTOCOLS, POOL_DATA, Token, getPoolInfo } from "@/data/yieldData";


const MAX_POSITIONS_PER_USER_CONTRACT_VALUE = 50; // Max number of possible user positions in contract

interface ProcessedUserPosition {
  id: string;
  positionIndex: number;
  chainId: number;
  protocolId: string;
  protocolDisplayName: string;
  chainDisplayName: string;
  token: Token;
  depositedRaw: bigint;
  deposited: number;
  earned: number;
  apy: number;
  roi: number;
  depositDate: string;
}

// Helper to reverse map Strategy ID to Protocol ID string
const getProtocolIdFromStrategyId = (strategyId: number): string | undefined => {
  const entry = Object.entries(STRATEGY_IDS).find(([, id]) => id === strategyId);
  return entry ? entry[0].toLowerCase() : undefined;
};

export function UserPositions() {
  const { address: userAddress, isConnected } = useAccount();
  const connectedChainId = useChainId();
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedPositionForWithdraw, setSelectedPositionForWithdraw] = useState<number | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedPositionTokenDecimals, setSelectedPositionTokenDecimals] = useState<number | undefined>(undefined);

  // --- 1. Fetch Total Deposited Balance ---
  const { data: totalDepositedBalanceBigInt } = useReadContract({
    address: connectedChainId ? YIELD_OPTIMIZER_ADDRESSES[connectedChainId] : undefined,
    abi: YIELD_OPTIMIZER_ABI,
    functionName: 'getUserBalance',
    args: [userAddress as Address],
    query: {
      enabled: isConnected && !!userAddress && !!YIELD_OPTIMIZER_ADDRESSES[connectedChainId],
      refetchInterval: 10000,
    },
  });

  const totalDepositedFormatted = useMemo(() => {
    if (totalDepositedBalanceBigInt === undefined) return '0.00';
    return formatUnits(totalDepositedBalanceBigInt, 6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [totalDepositedBalanceBigInt]);


  // --- 2. Fetch all userPositions (balance, strategyId, lastUpdated) ---
  const userPositionsCalls = useMemo(() => {
    if (!userAddress || !connectedChainId || !YIELD_OPTIMIZER_ADDRESSES[connectedChainId]) return [];
    const calls = [];
    for (let i = 0; i < MAX_POSITIONS_PER_USER_CONTRACT_VALUE; i++) {
      calls.push({
        address: YIELD_OPTIMIZER_ADDRESSES[connectedChainId],
        abi: YIELD_OPTIMIZER_ABI,
        functionName: 'userPositions',
        args: [userAddress, BigInt(i)],
      });
    }
    return calls;
  }, [userAddress, connectedChainId]);

  const { data: rawUserPositionsData, isLoading: isLoadingUserPositions, refetch: refetchUserPositions } = useReadContracts({
    contracts: userPositionsCalls,
    query: {
      enabled: isConnected && !!userAddress && !!YIELD_OPTIMIZER_ADDRESSES[connectedChainId],
      select: (data) => data.map((item, index) => { // Added index for better logging
        if (item.status === 'success') {
          return item.result;
        }
        // Changed to console.warn for less alarming output and better explanation
        if (item.status === 'failure') {
          console.warn(`UserPositions call for index ${index} reverted (likely unused position, expected for empty slots). Error: ${item.error.message}`);
        }
        return undefined;
      }).filter(Boolean) as (readonly [bigint, bigint, bigint, bigint])[],
      refetchInterval: 10000,
    }
  });

  // --- 3. Identify active positions and their actual strategy IDs from rawUserPositionsData ---
  const activeUserPositionRawData = useMemo(() => {
    const activeData: { 
      positionIndex: number; 
      strategyId: number; 
      balance: bigint; 
      lastUpdated: bigint; 
      lastRebalanced: bigint;
    }[] = [];

    if (rawUserPositionsData && rawUserPositionsData.length > 0) {
      rawUserPositionsData.forEach((posResult, index) => {
        if (posResult && Array.isArray(posResult) && posResult.length >= 4) {
          const [strategyIdRaw, balanceRaw, lastUpdatedRaw, lastRebalancedRaw] = posResult as [bigint, bigint, bigint, bigint];
          if (balanceRaw > 0n) {
            activeData.push({
              positionIndex: index,
              strategyId: Number(strategyIdRaw),
              balance: balanceRaw,
              lastUpdated: lastUpdatedRaw,
              lastRebalanced: lastRebalancedRaw,
            });
          }
        }
      });
    }
    return activeData;
  }, [rawUserPositionsData]);

  // --- 4. Fetch strategy details (receiptTokenAddress) for ONLY the active strategy IDs ---
  const strategyDetailsCalls = useMemo(() => {
    if (!connectedChainId || !YIELD_OPTIMIZER_ADDRESSES[connectedChainId] || activeUserPositionRawData.length === 0) return [];
    
    const uniqueStrategyIds = [...new Set(activeUserPositionRawData.map(p => p.strategyId))];

    const calls = uniqueStrategyIds.map(sId => ({
      address: YIELD_OPTIMIZER_ADDRESSES[connectedChainId],
      abi: YIELD_OPTIMIZER_ABI,
      functionName: 'strategies',
      args: [BigInt(sId)],
    }));
    return calls;
  }, [activeUserPositionRawData, connectedChainId]);

  const { data: rawStrategyDetailsData, isLoading: isLoadingStrategyDetails, refetch: refetchStrategyDetails } = useReadContracts({
    contracts: strategyDetailsCalls,
    query: {
      enabled: activeUserPositionRawData.length > 0 && !!connectedChainId && !!YIELD_OPTIMIZER_ADDRESSES[connectedChainId],
      select: (data) => data.map(item => {
        if (item.status === 'success') {
          return item.result;
        }
        // Changed to console.warn for less alarming output
        if (item.status === 'failure') {
          console.warn(`Strategies call for a strategy ID reverted. Error: ${item.error.message}`);
        }
        return undefined;
      }).filter(Boolean) as (readonly [bigint, string, Address, Address, boolean])[],
      refetchInterval: 10000,
    }
  });

  const strategyDetailsMap = useMemo(() => {
    const map = new Map<number, { id: bigint, protocol: string, pool: Address, receiptToken: Address, active: boolean }>();
    if (rawStrategyDetailsData && rawStrategyDetailsData.length > 0) {
      rawStrategyDetailsData.forEach(sResult => {
        if (sResult && Array.isArray(sResult) && sResult.length >= 5) {
            const [id, protocolName, pool, receiptToken, active] = sResult as [bigint, string, Address, Address, boolean];
            map.set(Number(id), { id, protocol: protocolName, pool, receiptToken, active });
        }
      });
    }
    return map;
  }, [rawStrategyDetailsData]);


  // --- 5. Final processing of all fetched data into displayable format ---
  const activeUserPositions = useMemo(() => {
    const positions: ProcessedUserPosition[] = [];
    if (!connectedChainId || activeUserPositionRawData.length === 0 || strategyDetailsMap.size === 0) return [];

    activeUserPositionRawData.forEach((posDetail) => {
      const strategyInfo = strategyDetailsMap.get(posDetail.strategyId);

      if (!strategyInfo) {
        console.warn(`Strategy details not found in map for strategyId: ${posDetail.strategyId}. Skipping position.`);
        return;
      }

      const receiptTokenAddress = strategyInfo.receiptToken;
      const protocolId = getProtocolIdFromStrategyId(posDetail.strategyId);
      const protocol = PROTOCOLS.find(p => p.id === protocolId);
      const chain = SUPPORTED_CHAINS.find(c => c.id === connectedChainId);

      // Use getPoolInfo to find the full Token object using the exact receiptTokenAddress
      const poolInfo = getPoolInfo(connectedChainId, protocolId || '', receiptTokenAddress);

      const tokenForPosition: Token = poolInfo?.token || {
          address: receiptTokenAddress || "0x0000000000000000000000000000000000000000",
          symbol: "UNK",
          name: "Unknown Token",
          decimals: 18,
          icon: ""
      };

      if (tokenForPosition.decimals === undefined || tokenForPosition.decimals < 0) {
          console.error(`Invalid token decimals (${tokenForPosition.decimals}) for ${tokenForPosition.symbol}. Skipping position.`);
          return;
      }

      const depositedFormatted = Number(formatUnits(posDetail.balance, tokenForPosition.decimals));
      const depositDate = new Date(Number(posDetail.lastUpdated) * 1000).toLocaleDateString();

      const mockEarned = depositedFormatted * 0.05;
      const mockApy = poolInfo?.apy || 0;

      positions.push({
        id: `pos-${posDetail.positionIndex}-${posDetail.strategyId}-${connectedChainId}-${tokenForPosition.symbol}-${receiptTokenAddress.slice(2, 8)}`,
        positionIndex: posDetail.positionIndex,
        chainId: connectedChainId,
        protocolId: protocolId || 'unknown',
        protocolDisplayName: protocol?.displayName || 'Unknown Protocol',
        chainDisplayName: chain?.displayName || 'Unknown Chain',
        token: tokenForPosition,
        depositedRaw: posDetail.balance,
        deposited: depositedFormatted,
        earned: mockEarned,
        apy: mockApy,
        roi: depositedFormatted > 0 ? (mockEarned / depositedFormatted) * 100 : 0,
        depositDate: depositDate,
      });
    });
    return positions;
  }, [activeUserPositionRawData, strategyDetailsMap, connectedChainId]);


  // Summary Stats (calculated from activeUserPositions)
  const totalSumEarned = useMemo(() => {
    return activeUserPositions.reduce((sum, pos) => sum + pos.earned, 0);
  }, [activeUserPositions]);

  const portfolioValueSum = useMemo(() => {
    return Number(totalDepositedFormatted.replace(/,/g, '')) + totalSumEarned;
  }, [totalDepositedFormatted, totalSumEarned]);

  const avgApyCalculated = useMemo(() => {
    if (activeUserPositions.length === 0) return '0.00';
    const totalApy = activeUserPositions.reduce((sum, pos) => sum + pos.apy, 0);
    return (totalApy / activeUserPositions.length).toFixed(2);
  }, [activeUserPositions]);


  // Withdrawal Logic
  const {
    write: withdrawFunds,
    isLoading: isWithdrawing,
    isSuccess: isWithdrawConfirmed,
    error: withdrawError,
  } = useWithdraw(
    selectedPositionForWithdraw !== null ? selectedPositionForWithdraw : undefined,
    withdrawAmount,
    selectedPositionTokenDecimals,
    connectedChainId
  );

  useEffect(() => {
    if (withdrawError) {
      toast.error(`Withdrawal failed: ${withdrawError.message}`);
    } else if (isWithdrawConfirmed) {
      toast.success('Withdrawal successful!');
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setSelectedPositionForWithdraw(null);
      setSelectedPositionTokenDecimals(undefined);
      refetchUserPositions();
      refetchStrategyDetails();
    }
  }, [withdrawError, isWithdrawConfirmed, refetchUserPositions, refetchStrategyDetails]);

  const handleWithdrawClick = useCallback((positionIndex: number, tokenSymbol: string, tokenDecimals: number) => {
    setSelectedPositionForWithdraw(positionIndex);
    setSelectedPositionTokenDecimals(tokenDecimals);
    setWithdrawModalOpen(true);
    const position = activeUserPositions.find(p => p.positionIndex === positionIndex);
    if (position) {
        setWithdrawAmount(position.deposited.toString());
    }
  }, [activeUserPositions]);

  const submitWithdraw = useCallback(() => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        toast.error("Please enter a valid amount to withdraw.");
        return;
    }
    if (selectedPositionForWithdraw === null || selectedPositionTokenDecimals === undefined) {
        toast.error("Withdrawal position not selected correctly.");
        return;
    }

    const currentPosition = activeUserPositions.find(p => p.positionIndex === selectedPositionForWithdraw);
    if (currentPosition && parseFloat(withdrawAmount) > currentPosition.deposited) {
        toast.error(`Withdrawal amount (${withdrawAmount}) exceeds your deposited balance (${currentPosition.deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`);
        return;
    }
    
    withdrawFunds?.();
  }, [withdrawAmount, selectedPositionForWithdraw, selectedPositionTokenDecimals, activeUserPositions, withdrawFunds]);


  const isLoadingOverall = isLoadingUserPositions || isLoadingStrategyDetails;

  return (
    <div className="bg-gray-900/50 border border-yellow-400/20 rounded-xl p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-yellow-400" />
          My Positions
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Total Deposited</div>
              <div className="text-2xl font-bold text-white">
                ${totalDepositedFormatted}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Total Earned (Mock)</div>
              <div className="text-xl font-bold text-green-400">
                +${totalSumEarned.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Portfolio Value (Mock Earned)</div>
              <div className="text-xl font-bold text-white">
                ${portfolioValueSum.toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Avg APY</div>
              <div className="text-lg font-bold text-yellow-400">
                {avgApyCalculated}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 bg-black/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "bg-yellow-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Active Positions
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-yellow-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          History (Mock)
        </button>
      </div>

      {activeTab === "positions" && (
        <div className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8 text-yellow-400">
              Please connect your wallet to view positions.
            </div>
          ) : isLoadingOverall ? (
            <div className="text-center py-8 text-gray-400">Loading positions...</div>
          ) : activeUserPositions.length > 0 ? (
            activeUserPositions.map((position) => {
              const roi = position.deposited > 0 ? (position.earned / position.deposited) * 100 : 0;

              return (
                <div
                  key={position.id}
                  className="bg-black/30 border border-gray-800 rounded-lg p-4 hover:border-yellow-400/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {position.token.icon && (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                            <img src={position.token.icon} alt={position.token.symbol} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {!position.token.icon && (
                         <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                                {position.token.symbol.charAt(0)}
                            </span>
                         </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {position.token.symbol}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {position.protocolDisplayName} • {position.chainDisplayName}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-gray-400 text-xs">Deposited</div>
                      <div className="text-white font-medium">
                        ${position.deposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Earned (Mock)</div>
                      <div className="text-green-400 font-medium">
                        +${position.earned.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400">
                        APY: <span className="text-yellow-400">{position.apy}%</span>
                      </span>
                      <span className="text-gray-400">
                        ROI (Mock): <span className="text-green-400">+{roi.toFixed(2)}%</span>
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleWithdrawClick(position.positionIndex, position.token.symbol, position.token.decimals)}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Withdraw
                      </button>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs transition-colors">
                        Add More
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="lg:text-lg font-medium text-white mb-2">No Active Positions</h3>
              <p className="text-gray-400 text-sm">
                Start depositing to see your positions here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3">
          {[
            { type: "deposit", amount: 1000, token: "USDC", date: "2024-12-01", hash: "0x1234...5678" },
            { type: "earned", amount: 15.2, token: "USDC", date: "2024-12-15", hash: "0x9abc...def0" },
            { type: "withdraw", amount: 200, token: "USDC", date: "2024-12-20", hash: "0xdead...beef" },
            { type: "deposit", amount: 500, token: "USDC", date: "2024-11-15", hash: "0x2468...ace0" }
          ].map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  tx.type === "deposit"
                    ? "bg-blue-400/10 text-blue-400"
                    : tx.type === "earned"
                      ? "bg-green-400/10 text-green-400"
                      : "bg-red-400/10 text-red-400"
                }`}>
                  {tx.type === "deposit" ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : tx.type === "earned" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium capitalize">
                    {tx.type} {tx.token}
                  </div>
                  <div className="text-gray-400 text-sm">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  tx.type === "deposit" || tx.type === "withdraw" ? "text-white" : "text-green-400"
                }`}>
                  {tx.type === "deposit" || tx.type === "withdraw" ? "-" : "+"}${tx.amount}
                </div>
                <div className="text-gray-400 text-xs">{tx.hash}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {withdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-yellow-400/20 rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h3>
            <p className="text-gray-400 mb-4">
              Enter amount to withdraw from position {selectedPositionForWithdraw !== null ? selectedPositionForWithdraw + 1 : ''}.
            </p>
            <input
              type="number"
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isWithdrawing}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                disabled={isWithdrawing}
              >
                Cancel
              </button>
              <button
                onClick={submitWithdraw}
                className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                {isWithdrawing ? "Withdrawing..." : "Confirm Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}