"use client";

import { mockAISuggestions } from "@/data/mockData";
import { 
  Brain, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Target,
  ArrowLeftRight,
  Coins
} from "lucide-react";

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

export function AISuggestions() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2 text-yellow-400" />
          AI Suggestions
        </h2>
        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      <div className="space-y-4">
        {mockAISuggestions.map((suggestion) => {
          const ActionIcon = getActionIcon(suggestion.action);
          const actionColor = getActionColor(suggestion.action);
          
          return (
            <div
              key={suggestion.id}
              className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 hover:border-yellow-400/30 transition-all duration-200 group"
            >
              <div className="flex items-start space-x-4">
                {/* Action Icon */}
                <div className={`p-2 rounded-lg bg-gradient-to-r ${actionColor} flex-shrink-0`}>
                  <ActionIcon className="w-4 h-4 text-white" />
                </div>

                {/* Suggestion Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-2 group-hover:text-yellow-400 transition-colors">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    {suggestion.description}
                  </p>
                  
                  {/* Potential Gain */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium text-sm">
                        {suggestion.potentialGain}
                      </span>
                    </div>
                    
                    {/* Action Button */}
                    <button className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors group-hover:translate-x-1 transform duration-200">
                      <span>Execute</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Status */}
      <div className="mt-6 p-3 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="text-sm">
            <span className="text-yellow-400 font-medium">AI Agent Active</span>
            <span className="text-gray-300 ml-2">
              Analyzing market conditions for optimal strategies
            </span>
          </div>
        </div>
      </div>

      {/* Chat CTA */}
      <div className="mt-4">
        <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2">
          <Brain className="w-4 h-4" />
          <span>Chat with AI Assistant</span>
        </button>
      </div>
    </div>
  );
}