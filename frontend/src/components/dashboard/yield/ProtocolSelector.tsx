"use client";

import { useState } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { Chain, Protocol, PROTOCOLS, isProtocolAvailable } from "@/data/yieldData";

interface ProtocolSelectorProps {
  selectedProtocol: Protocol;
  selectedChain: Chain;
  onProtocolSelect: (protocol: Protocol) => void;
}

export function ProtocolSelector({ 
  selectedProtocol, 
  selectedChain, 
  onProtocolSelect 
}: ProtocolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableProtocols = PROTOCOLS.filter(protocol => 
    isProtocolAvailable(selectedChain.id, protocol.id)
  );

  // If current protocol is not available on selected chain, auto-select first available
  const currentProtocolAvailable = availableProtocols.some(p => p.id === selectedProtocol.id);
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Protocol
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full border rounded-lg px-4 py-3 text-left flex items-center justify-between transition-colors ${
            currentProtocolAvailable 
              ? 'bg-gray-900/50 border-yellow-400/20 hover:border-yellow-400/40' 
              : 'bg-red-900/20 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${
              currentProtocolAvailable ? selectedProtocol.color : 'from-gray-500 to-gray-600'
            }`}>
              <span className="text-white text-xs font-bold">
                {selectedProtocol.displayName.charAt(0)}
              </span>
            </div>
            <div>
              <div className={`font-medium ${currentProtocolAvailable ? 'text-white' : 'text-red-400'}`}>
                {selectedProtocol.displayName}
              </div>
              {!currentProtocolAvailable && (
                <div className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not available on {selectedChain.displayName}
                </div>
              )}
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-yellow-400/20 rounded-lg shadow-xl z-50">
            <div className="py-2">
              {availableProtocols.length > 0 ? (
                availableProtocols.map((protocol) => (
                  <button
                    key={protocol.id}
                    onClick={() => {
                      onProtocolSelect(protocol);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-800 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r ${protocol.color}`}>
                        <span className="text-white text-xs font-bold">
                          {protocol.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-yellow-400 transition-colors">
                          {protocol.displayName}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Available on {selectedChain.displayName}
                        </div>
                      </div>
                    </div>
                    {selectedProtocol.id === protocol.id && (
                      <Check className="w-5 h-5 text-yellow-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <div className="text-sm">No protocols available on {selectedChain.displayName}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Protocol Info */}
      {currentProtocolAvailable && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-xs text-gray-400">
            {selectedProtocol.displayName} pools available
          </span>
        </div>
      )}
    </div>
  );
}