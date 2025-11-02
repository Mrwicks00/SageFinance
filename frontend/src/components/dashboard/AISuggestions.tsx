"use client";

import { mockAISuggestions } from "../../data/mockData";
import { 
  Brain, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Target,
  ArrowLeftRight,
  Coins,
  Zap,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

const getActionIcon = (action: string) => {
  switch (action) {
    case "rebalance":
      return Target;
    case "bridge":
      return ArrowLeftRight;
    case "stake":
      return Coins;
    default:
      return TrendingUp;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "rebalance":
      return "from-blue-500 to-blue-600";
    case "bridge":
      return "from-purple-500 to-purple-600";
    case "stake":
      return "from-yellow-400 to-yellow-600";
    default:
      return "from-green-500 to-green-600";
  }
};

const getPriorityBadge = (index: number) => {
  if (index === 0) return { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  if (index === 1) return { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return { label: "Low", color: "bg-green-500/20 text-green-400 border-green-500/30" };
};

export function AISuggestions() {
  const [executedSuggestions, setExecutedSuggestions] = useState<Set<string>>(new Set());

  const handleExecute = (id: string) => {
    setExecutedSuggestions(prev => new Set(prev).add(id));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 hover:border-yellow-400/40 transition-all duration-300 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-yellow-400/5 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg animate-breathe">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            AI Suggestions
          </h2>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <div className="space-y-4">
          {mockAISuggestions.map((suggestion, index) => {
            const ActionIcon = getActionIcon(suggestion.action);
            const actionColor = getActionColor(suggestion.action);
            const priority = getPriorityBadge(index);
            const isExecuted = executedSuggestions.has(suggestion.id);
            
            return (
              <div
                key={suggestion.id}
                className={`relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl border transition-all duration-300 group overflow-hidden animate-slide-in-up stagger-${index + 1} ${
                  isExecuted 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-gray-700 hover:border-yellow-400/30 hover:scale-[1.02]'
                }`}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex items-start space-x-4">
                    {/* Action Icon with animation */}
                    <div className={`relative p-3 rounded-xl bg-gradient-to-r ${actionColor} flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <ActionIcon className="w-5 h-5 text-white" />
                      {!isExecuted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                      )}
                    </div>

                    {/* Suggestion Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors text-lg">
                          {suggestion.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3 group-hover:text-gray-300 transition-colors">
                        {suggestion.description}
                      </p>
                      
                      {/* Potential Gain with enhanced styling */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">
                            {suggestion.potentialGain}
                          </span>
                        </div>
                        
                        {/* Action Button */}
                        {isExecuted ? (
                          <div className="flex items-center space-x-2 text-green-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            <span>Executed</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleExecute(suggestion.id)}
                            className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 group-hover:translate-x-1 transform shadow-lg hover:shadow-yellow-400/20"
                          >
                            <span>Execute</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Status - Enhanced */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 via-yellow-400/10 to-purple-500/10 border border-purple-500/30 rounded-xl relative overflow-hidden group animate-slide-in-up stagger-4">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-yellow-400/5 to-purple-500/5 animate-gradient-border" />
          
          <div className="relative z-10 flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div className="flex-1 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-semibold">AI Agent Active</span>
              </div>
              <span className="text-gray-300 text-xs">
                Analyzing market conditions for optimal strategies
              </span>
            </div>
            <Brain className="w-6 h-6 text-purple-400 animate-breathe" />
          </div>
        </div>

        {/* Chat CTA - Enhanced */}
        <div className="mt-4">
          <button className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Brain className="w-5 h-5 group-hover:animate-bounce" />
            <span>Chat with AI Assistant</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}