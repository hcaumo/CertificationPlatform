"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface WalletInteraction {
  from: string;
  to: string;
  timestamp: string;
  txHash: string;
  value: string;
  network: string;
}

// Mock data for demonstration
const MOCK_INTERACTIONS: WalletInteraction[] = [
  {
    from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    to: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    timestamp: '2023-06-15T14:32:11Z',
    txHash: '0xf7d4d62b9e3b9d6fa1d1fe61d45d97429d3c35bdd695d2aad96c0fecb00ec582',
    value: '1.25 ETH',
    network: 'Ethereum'
  },
  {
    from: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    timestamp: '2023-07-22T09:14:33Z',
    txHash: '0x3a8e692b2a52d6a45b5bde74f520c8a77c63b32b2b22642e8d5a4c2b5fd0d3a1',
    value: '0.5 ETH',
    network: 'Ethereum'
  }
];

export default function WalletAnalyzerPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const [walletA, setWalletA] = useState('');
  const [walletB, setWalletB] = useState('');
  const [network, setNetwork] = useState('all');
  const [timeframe, setTimeframe] = useState('all');
  const [results, setResults] = useState<WalletInteraction[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check wallet interactions
  const checkInteractions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!walletA || !walletB) {
        throw new Error('Both wallet addresses are required');
      }

      if (!isValidEthereumAddress(walletA) || !isValidEthereumAddress(walletB)) {
        throw new Error('Invalid wallet address format');
      }

      // In a real app, you would make an API call to fetch interactions
      // For demonstration, we're using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Filter mock data based on the addresses
      const filteredResults = MOCK_INTERACTIONS.filter(
        interaction => 
          (interaction.from.toLowerCase() === walletA.toLowerCase() && 
           interaction.to.toLowerCase() === walletB.toLowerCase()) ||
          (interaction.from.toLowerCase() === walletB.toLowerCase() && 
           interaction.to.toLowerCase() === walletA.toLowerCase())
      );

      setResults(filteredResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate Ethereum address format
  const isValidEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6">
      <div className="max-w-4xl mx-auto bg-white/10 rounded-lg p-8 backdrop-blur-lg text-white">
        <h1 className="text-3xl font-bold mb-6">Wallet Interaction Analyzer</h1>
        
        <div className="mb-8">
          <p className="text-gray-300 mb-4">
            Check if two blockchain wallets have directly interacted with each other through transactions.
          </p>
          
          <form onSubmit={checkInteractions} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="walletA" className="block text-sm font-medium text-gray-200 mb-1">
                  Wallet Address A
                </label>
                <input
                  id="walletA"
                  type="text"
                  value={walletA}
                  onChange={(e) => setWalletA(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="walletB" className="block text-sm font-medium text-gray-200 mb-1">
                  Wallet Address B
                </label>
                <input
                  id="walletB"
                  type="text"
                  value={walletB}
                  onChange={(e) => setWalletB(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="network" className="block text-sm font-medium text-gray-200 mb-1">
                  Network
                </label>
                <select
                  id="network"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Networks</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="bsc">Binance Smart Chain</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeframe" className="block text-sm font-medium text-gray-200 mb-1">
                  Timeframe
                </label>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-gray-600 rounded-md text-white"
                >
                  <option value="all">All Time</option>
                  <option value="day">Last 24 Hours</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Check Interactions'}
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-md">
            <p className="text-red-200">{error}</p>
          </div>
        )}
        
        {results !== null && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
            
            {results.length === 0 ? (
              <div className="p-4 bg-gray-800 rounded-md">
                <p className="text-gray-300">No direct interactions found between these wallets.</p>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-green-300">
                  Found {results.length} direct interaction{results.length !== 1 ? 's' : ''} between these wallets.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-800 text-left">
                        <th className="p-3 border-b border-gray-700">From</th>
                        <th className="p-3 border-b border-gray-700">To</th>
                        <th className="p-3 border-b border-gray-700">Time</th>
                        <th className="p-3 border-b border-gray-700">Value</th>
                        <th className="p-3 border-b border-gray-700">Network</th>
                        <th className="p-3 border-b border-gray-700">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((interaction, index) => (
                        <tr key={index} className="hover:bg-gray-800/50">
                          <td className="p-3 border-b border-gray-700">
                            <span className="text-xs md:text-sm font-mono">
                              {interaction.from.substring(0, 6)}...{interaction.from.substring(38)}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-700">
                            <span className="text-xs md:text-sm font-mono">
                              {interaction.to.substring(0, 6)}...{interaction.to.substring(38)}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-700">
                            {new Date(interaction.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3 border-b border-gray-700">{interaction.value}</td>
                          <td className="p-3 border-b border-gray-700">{interaction.network}</td>
                          <td className="p-3 border-b border-gray-700">
                            <a
                              href={`https://etherscan.io/tx/${interaction.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300 underline text-xs md:text-sm font-mono"
                            >
                              {interaction.txHash.substring(0, 6)}...{interaction.txHash.substring(60)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}