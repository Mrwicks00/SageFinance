"use client";

import { Trophy, Users, Clock, Gift } from "lucide-react";
import { WEEKLY_REWARDS } from "@/data/yieldData";

export function WeeklyRewards() {
  const currentWeek = WEEKLY_REWARDS.find(week => week.status === "active");
  const lastWeek = WEEKLY_REWARDS.find(week => week.status === "completed");

  if (!currentWeek) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-500/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl p-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Weekly SAGE Rewards</h2>
            <p className="text-gray-300">5 lucky depositors win 100 SAGE tokens each week!</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-yellow-400 font-bold text-2xl">500 SAGE</div>
          <div className="text-gray-400 text-sm">Total Prize Pool</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Week Stats */}
        <div className="bg-black/30 border border-yellow-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{currentWeek.week} - Active</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Participants:</span>
              <span className="text-white font-medium">{currentWeek.totalParticipants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your Entries:</span>
              <span className="text-green-400 font-medium">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ends In:</span>
              <span className="text-white font-medium">3d 12h</span>
            </div>
          </div>
        </div>

        {/* How to Participate */}
        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Gift className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">How to Enter</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-300">Deposit minimum $10 to any pool</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-300">Each $10 deposited = 1 entry</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-300">Winners selected randomly</span>
            </div>
          </div>
        </div>

        {/* Last Week Winners */}
        <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Last Week Winners</span>
          </div>
          {lastWeek && lastWeek.winners.length > 0 ? (
            <div className="space-y-2">
              {lastWeek.winners.slice(0, 3).map((winner, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{winner}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 font-medium">100</span>
                    <span className="text-gray-400">SAGE</span>
                  </div>
                </div>
              ))}
              {lastWeek.winners.length > 3 && (
                <div className="text-center text-gray-400 text-xs">
                  +{lastWeek.winners.length - 3} more winners
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No previous winners</div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">Your Winning Chances</span>
          <span className="text-yellow-400 text-sm font-medium">
            2 / {currentWeek.totalParticipants} entries ({((2 / currentWeek.totalParticipants) * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((2 / currentWeek.totalParticipants) * 100 * 5, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Deposit more to increase your chances of winning!
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center">
        <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium px-6 py-2 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all">
          Deposit Now to Enter
        </button>
      </div>
    </div>
  );
}