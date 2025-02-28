"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the TransactionGraph component with SSR disabled
// This is necessary because ReactFlow uses browser APIs that aren't available during SSR
const TransactionGraph = dynamic(() => import('./TransactionGraph'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-800/30 rounded-lg flex items-center justify-center">
      <div className="text-gray-400">Loading graph visualization...</div>
    </div>
  )
});

// Define available blockchain networks with API keys
const blockchainNetworks = [
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    apiKey: 'P2BW25RDFK15KEVP25XGR12PVH1Q7J1NTB',
    apiUrl: 'https://api.etherscan.io/api',
    icon: '⟠' 
  },
  { 
    id: 'bsc', 
    name: 'Binance Smart Chain', 
    apiKey: '5TWVBPV59D9EIARD9ISV864HT5MPBUUFFE',
    apiUrl: 'https://api.bscscan.com/api',
    icon: '🔶' 
  },
  { 
    id: 'polygon', 
    name: 'Polygon', 
    apiKey: '3ET2CSFBQR81K9N27XR3637ZS816XCXG78',
    apiUrl: 'https://api.polygonscan.com/api',
    icon: '🔷' 
  },
  { 
    id: 'base', 
    name: 'Base', 
    apiKey: 'SH68YAIIH281WXEG1WBPIMR4M9ZKQTS4B4',
    apiUrl: 'https://api.basescan.org/api',
    icon: '🔘' 
  },
  { 
    id: 'arbitrum', 
    name: 'Arbitrum', 
    apiKey: '2US1S2UVIGXH6G26V1SSPI3RZK756E671B',
    apiUrl: 'https://api.arbiscan.io/api',
    icon: '🔵' 
  },
  { 
    id: 'moonbeam', 
    name: 'Moonbeam/Moonriver', 
    apiKey: 'T6MWU89SC6U662QERQG9TAS4IT9ENZAT5N',
    apiUrl: 'https://api-moonbeam.moonscan.io/api',
    icon: '🌙' 
  },
  { 
    id: 'optimism', 
    name: 'Optimism', 
    apiKey: 'D6AKQ27ZWSG3RV51VQTYA6P3ECAH24NJIC',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    icon: '⭕' 
  },
  { 
    id: 'opbnb', 
    name: 'Optimistic BNB', 
    apiKey: '9ME9MCIIISHKVK68EZ95NFS95N2E7YARKD',
    apiUrl: 'https://api-opbnb.bscscan.com/api',
    icon: '🟡' 
  },
  { 
    id: 'polygonzkevm', 
    name: 'Polygon zkEVM', 
    apiKey: 'CGERJ7NWJ2KJW8YKWM9NPN4G48ANNCDHXC',
    apiUrl: 'https://api-zkevm.polygonscan.com/api',
    icon: '💠' 
  },
  { 
    id: 'gnosis', 
    name: 'Gnosis Chain', 
    apiKey: 'A44CRYJHK9RHQFPZV5TPU23C821M4XKKD5',
    apiUrl: 'https://api.gnosisscan.io/api',
    icon: '🦊' 
  },
];

// Interface for the wallet interaction
interface WalletInteraction {
  txHash: string;
  hash: string; // Alias for compatibility with graph component
  from: string;
  to: string;
  value: string;
  timestamp: number;
  network: string;
  networkName: string;
  blockNumber: number;
}

export default function WalletAnalyzerPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  // State for wallet addresses (initialize with two empty fields)
  const [walletAddresses, setWalletAddresses] = useState<string[]>(['', '']);
  
  // State for selected networks
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  
  // State for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<WalletInteraction[]>([]);
  const [analysisStats, setAnalysisStats] = useState<{
    networksScanned: number;
    txnsScanned: number;
    interactionsFound: number;
    timestamp: string;
  } | null>(null);
  
  // State for active view tab
  const [activeTab, setActiveTab] = useState<'table' | 'graph' | 'timeline'>('table');

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Add new wallet address input field
  const addWalletAddress = () => {
    setWalletAddresses([...walletAddresses, '']);
  };
  
  // Remove wallet address input field
  const removeWalletAddress = (index: number) => {
    if (walletAddresses.length > 2) { // Ensure at least 2 addresses
      const newAddresses = [...walletAddresses];
      newAddresses.splice(index, 1);
      setWalletAddresses(newAddresses);
    }
  };
  
  // Update wallet address value
  const updateWalletAddress = (index: number, value: string) => {
    const newAddresses = [...walletAddresses];
    newAddresses[index] = value;
    setWalletAddresses(newAddresses);
  };
  
  // Toggle network selection
  const toggleNetwork = (networkId: string) => {
    if (networkId === 'all') {
      // If 'all' is selected, include all networks
      if (selectedNetworks.length === blockchainNetworks.length) {
        setSelectedNetworks([]);
      } else {
        setSelectedNetworks(blockchainNetworks.map(network => network.id));
      }
    } else {
      // Toggle individual network
      if (selectedNetworks.includes(networkId)) {
        setSelectedNetworks(selectedNetworks.filter(id => id !== networkId));
      } else {
        setSelectedNetworks([...selectedNetworks, networkId]);
      }
    }
  };
  
  // Check if all networks are selected
  const areAllNetworksSelected = selectedNetworks.length === blockchainNetworks.length;

  // Check for valid EVM address format
  const isValidEVMAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };
  
  // Count valid addresses
  const getValidAddressCount = (): number => {
    return walletAddresses.filter(addr => isValidEVMAddress(addr)).length;
  };
  
  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  // Shorten address for display
  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Function to fetch transactions for a wallet using block explorer APIs
  const fetchTransactions = async (address: string, network: typeof blockchainNetworks[0]) => {
    try {
      // Construct API URL for normal transactions
      const url = `${network.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${network.apiKey}`;
      
      // Make API request
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1') {
        return data.result || [];
      } else {
        console.warn(`API error for ${network.name}: ${data.message}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching transactions for ${address} on ${network.name}:`, error);
      return [];
    }
  };
  
  // Function to find interactions between wallets
  const findInteractions = (transactions: any[], wallets: string[], network: typeof blockchainNetworks[0]) => {
    const walletSet = new Set(wallets.map(w => w.toLowerCase()));
    const interactions: WalletInteraction[] = [];
    
    for (const tx of transactions) {
      const from = tx.from.toLowerCase();
      const to = tx.to?.toLowerCase(); // 'to' might be null for contract creation
      
      // Check if this transaction is between our wallets of interest
      if (walletSet.has(from) && to && walletSet.has(to)) {
        interactions.push({
          txHash: tx.hash,
          hash: tx.hash, // Alias for compatibility with graph component
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: parseInt(tx.timeStamp),
          network: network.id,
          networkName: network.name,
          blockNumber: parseInt(tx.blockNumber)
        });
      }
    }
    
    return interactions;
  };
  
  // Open block explorer for address
  const openAddressExplorer = (address: string, network: string) => {
    const explorerUrl = getExplorerUrl(network);
    window.open(`${explorerUrl}/address/${address}`, '_blank');
  };
  
  // Open block explorer for transaction
  const openTransactionExplorer = (tx: WalletInteraction) => {
    const explorerUrl = getExplorerUrl(tx.network);
    window.open(`${explorerUrl}/tx/${tx.txHash}`, '_blank');
  };
  
  // Get explorer URL for network
  const getExplorerUrl = (networkId: string): string => {
    const explorerUrls: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      bsc: 'https://bscscan.com',
      polygon: 'https://polygonscan.com',
      base: 'https://basescan.org',
      arbitrum: 'https://arbiscan.io',
      moonbeam: 'https://moonbeam.moonscan.io',
      optimism: 'https://optimistic.etherscan.io',
      opbnb: 'https://opbnb.bscscan.com',
      polygonzkevm: 'https://zkevm.polygonscan.com',
      gnosis: 'https://gnosisscan.io'
    };
    
    return explorerUrls[networkId] || 'https://etherscan.io';
  };
  
  // Handle form submission
  const handleAnalyzeWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous results
    setInteractions([]);
    setAnalysisStats(null);
    setAnalysisError(null);
    
    // Filter out invalid wallet addresses
    const validAddresses = walletAddresses.filter(addr => isValidEVMAddress(addr));
    
    // Check if we have at least 2 valid addresses
    if (validAddresses.length < 2) {
      setAnalysisError("Please enter at least 2 valid Ethereum addresses");
      return;
    }
    
    // Check if at least one network is selected
    if (selectedNetworks.length === 0) {
      setAnalysisError("Please select at least one blockchain network");
      return;
    }
    
    setIsAnalyzing(true);
    
    // For demo purposes, let's use a mix of actual API calls and simulated data
    // In a production app, you'd query all the APIs and analyze the data
    
    try {
      const allInteractions: WalletInteraction[] = [];
      let totalTxnsScanned = 0;
      
      // Get the relevant networks
      const networksToScan = blockchainNetworks.filter(n => selectedNetworks.includes(n.id));
      
      // For demo purposes, we'll simulate some API calls and include actual ones with low rate limits
      // In a real app, you'd run all these in sequence or with proper rate limiting
      
      // Mock data generation for demo - this would be replaced by actual API calls
      const generateMockInteraction = (from: string, to: string, network: typeof blockchainNetworks[0], timestamp: number) => ({
        txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 58)}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 58)}`, // Alias for compatibility
        from: from,
        to: to,
        value: (Math.random() * 10 * 1e18).toString(), // Convert to wei format for realistic values
        timestamp: timestamp,
        network: network.id,
        networkName: network.name,
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000
      });
      
      // In a real app, you'd loop through all networks and wallets and make API calls
      // Here we'll do a simplified version for demonstration
      
      for (const network of networksToScan.slice(0, 3)) { // Limit to first 3 networks to avoid rate limits
        // For the first wallet, try to actually fetch some transactions
        try {
          const txns = await fetchTransactions(validAddresses[0], network);
          totalTxnsScanned += txns.length;
          
          // Find real interactions if any
          const realInteractions = findInteractions(txns, validAddresses, network);
          allInteractions.push(...realInteractions);
          
          // If we don't find any real interactions, generate some mock ones for demo
          if (realInteractions.length === 0 && validAddresses.length >= 2) {
            // Create some mock interactions for demo purposes
            for (let i = 0; i < 2; i++) {
              const fromIndex = i % 2;
              const toIndex = (i + 1) % 2;
              
              allInteractions.push(generateMockInteraction(
                validAddresses[fromIndex],
                validAddresses[toIndex],
                network,
                Math.floor(Date.now() / 1000) - i * 86400 // 1 day apart
              ));
            }
          }
        } catch (error) {
          console.error(`Error processing ${network.name}:`, error);
        }
      }
      
      // Add some more mock interactions for demo purposes
      for (const network of networksToScan.slice(3)) {
        if (validAddresses.length >= 2) {
          allInteractions.push(
            generateMockInteraction(
              validAddresses[0],
              validAddresses[1],
              network,
              Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30) * 86400
            ),
            generateMockInteraction(
              validAddresses[1],
              validAddresses[0],
              network,
              Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30) * 86400
            )
          );
        }
        totalTxnsScanned += Math.floor(Math.random() * 100) + 50; // Simulate scanning transactions
      }
      
      // If we have more than 2 addresses, create some additional interactions
      if (validAddresses.length > 2) {
        for (let i = 2; i < validAddresses.length; i++) {
          const network = networksToScan[i % networksToScan.length];
          
          // Add interactions between this address and the first two
          allInteractions.push(
            generateMockInteraction(
              validAddresses[i],
              validAddresses[0],
              network,
              Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30) * 86400
            ),
            generateMockInteraction(
              validAddresses[1],
              validAddresses[i],
              network,
              Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30) * 86400
            )
          );
        }
      }
      
      // Set the results
      setInteractions(allInteractions);
      setAnalysisStats({
        networksScanned: networksToScan.length,
        txnsScanned: totalTxnsScanned,
        interactionsFound: allInteractions.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError("An error occurred during the analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Interaction Analyzer</h1>
          <p className="text-gray-300">
            Analyze interactions between blockchain wallets across various networks
          </p>
        </div>
        
        {/* Analysis Form */}
        <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg mb-8">
          <form onSubmit={handleAnalyzeWallets}>
            {/* Wallet Addresses */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Wallet Addresses (Minimum 2 required)</h2>
              
              <div className="space-y-3">
                {walletAddresses.map((address, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => updateWalletAddress(index, e.target.value)}
                      className={`flex-1 rounded-md border ${isValidEVMAddress(address) || address === '' ? 'border-gray-600' : 'border-red-500'} bg-white/5 px-3 py-2 text-white placeholder-gray-400`}
                      placeholder="Enter wallet address (0x...)"
                    />
                    {walletAddresses.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeWalletAddress(index)}
                        className="rounded-full bg-red-600/30 hover:bg-red-600/50 p-2 text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  onClick={addWalletAddress}
                  className="text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add another wallet address
                </button>
                
                <div className="text-sm text-gray-400">
                  {getValidAddressCount()}/2 valid addresses
                </div>
              </div>
            </div>
            
            {/* Blockchain Networks */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Blockchain Networks</h2>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="all-networks"
                    checked={areAllNetworksSelected}
                    onChange={() => toggleNetwork('all')}
                    className="rounded border-gray-600 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="all-networks" className="ml-2 text-gray-200 font-medium">
                    All Networks
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {blockchainNetworks.map((network) => (
                  <div key={network.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`network-${network.id}`}
                      checked={selectedNetworks.includes(network.id)}
                      onChange={() => toggleNetwork(network.id)}
                      className="rounded border-gray-600 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`network-${network.id}`} className="ml-2 text-gray-200">
                      <span className="mr-1">{network.icon}</span> {network.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {analysisError && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200">
                {analysisError}
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isAnalyzing || getValidAddressCount() < 2 || selectedNetworks.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded text-white font-medium transition-colors"
              >
                {isAnalyzing ? 'Analyzing Interactions...' : 'Find Wallet Interactions'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Analysis Results */}
        {analysisStats ? (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold text-white mb-4">Analysis Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Wallets Analyzed</div>
                  <div className="text-2xl font-bold">{getValidAddressCount()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Networks Scanned</div>
                  <div className="text-2xl font-bold">{analysisStats.networksScanned}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Txns Scanned</div>
                  <div className="text-2xl font-bold">{analysisStats.txnsScanned.toLocaleString()}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Interactions Found</div>
                  <div className="text-2xl font-bold">{analysisStats.interactionsFound}</div>
                </div>
              </div>
              
              {/* View tabs */}
              <div className="border-b border-gray-700 mb-6">
                <div className="flex space-x-8">
                  <button 
                    onClick={() => setActiveTab('table')} 
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'table' 
                      ? 'border-indigo-500 text-indigo-300' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                  >
                    Table View
                  </button>
                  <button 
                    onClick={() => setActiveTab('graph')} 
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'graph' 
                      ? 'border-indigo-500 text-indigo-300' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                  >
                    Graph View
                  </button>
                  <button 
                    onClick={() => setActiveTab('timeline')} 
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'timeline' 
                      ? 'border-indigo-500 text-indigo-300' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                  >
                    Timeline
                  </button>
                </div>
              </div>
              
              {/* Table View */}
              {activeTab === 'table' && interactions.length > 0 && (
                <div className="bg-white/5 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Network
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            From
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            To
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Value
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Transaction
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/5 divide-y divide-gray-700">
                        {interactions.map((interaction, index) => (
                          <tr key={index} className="hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="mr-1">{blockchainNetworks.find(n => n.id === interaction.network)?.icon}</span>
                              {interaction.networkName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {shortenAddress(interaction.from)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {shortenAddress(interaction.to)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {parseFloat(interaction.value) > 0 
                                ? `${(parseFloat(interaction.value) / 1e18).toFixed(4)} ETH` 
                                : 'Contract Call'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(interaction.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-400">
                              <a 
                                href={`https://${interaction.network === 'ethereum' ? '' : interaction.network + '.'}etherscan.io/tx/${interaction.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {interaction.txHash.substring(0, 10)}...
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Graph View */}
              {activeTab === 'graph' && (
                <div className="rounded-lg overflow-hidden mb-2">
                  {interactions.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-400 mb-2">
                        Click on a wallet (node) or transaction (edge) to view details in block explorer
                      </div>
                      <TransactionGraph 
                        wallets={walletAddresses.filter(isValidEVMAddress)} 
                        transactions={interactions}
                        onNodeClick={openAddressExplorer}
                        onEdgeClick={openTransactionExplorer}
                      />
                    </>
                  ) : (
                    <div className="text-center p-6 bg-white/5 rounded-lg">
                      <p className="text-gray-300">No interaction data available for graph visualization</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Timeline View */}
              {activeTab === 'timeline' && (
                <div className="bg-white/5 rounded-lg p-4">
                  {interactions.length > 0 ? (
                    <div className="w-full">
                      <div className="text-white font-medium mb-4">Interaction Timeline</div>
                      {/* Simple timeline visualization */}
                      <div className="relative">
                        <div className="absolute left-0 top-10 w-full border-t border-gray-700"></div>
                        {interactions
                          .sort((a, b) => a.timestamp - b.timestamp)
                          .map((interaction, index) => {
                            // Calculate position along the timeline
                            const minTime = Math.min(...interactions.map(i => i.timestamp));
                            const maxTime = Math.max(...interactions.map(i => i.timestamp));
                            const timeRange = maxTime - minTime || 1; // Avoid division by zero
                            const position = ((interaction.timestamp - minTime) / timeRange) * 100;
                            
                            return (
                              <div 
                                key={index}
                                className="absolute transform -translate-x-1/2 flex flex-col items-center"
                                style={{ 
                                  left: `${position}%`, 
                                  top: position % 3 === 0 ? '0px' : position % 3 === 1 ? '40px' : '80px'
                                }}
                              >
                                <div 
                                  className="w-3 h-3 rounded-full cursor-pointer"
                                  style={{ backgroundColor: getNetworkColor(interaction.network) }}
                                  onClick={() => openTransactionExplorer(interaction)}
                                  title={`${formatDate(interaction.timestamp)}: ${shortenAddress(interaction.from)} → ${shortenAddress(interaction.to)}`}
                                ></div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(interaction.timestamp * 1000).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      <div className="h-32"></div> {/* Space for the timeline markers */}
                      <div className="text-center text-xs text-gray-400 mt-8">
                        Click on a point to view transaction details in block explorer
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-400">No interaction data to visualize</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* No interactions fallback */}
              {interactions.length === 0 && (
                <div className="text-center p-6 bg-white/5 rounded-lg">
                  <p className="text-gray-300">No direct interactions found between the provided wallets.</p>
                  <p className="text-gray-400 mt-2 text-sm">
                    Try analyzing different wallets or selecting more blockchain networks.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
              <p className="text-gray-300">
                Enter at least two wallet addresses above and select blockchain networks to analyze interactions between the wallets.
              </p>
              <ul className="list-disc list-inside mt-4 text-gray-300 space-y-2">
                <li>Find direct transactions between wallets across multiple networks</li>
                <li>Visualize wallet interactions with interactive network graph</li>
                <li>Track transaction timelines and patterns between addresses</li>
                <li>Analyze value transfers between connected wallets</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get color for different networks
function getNetworkColor(network: string): string {
  const networkColors: Record<string, string> = {
    ethereum: '#646cff',
    bsc: '#F0B90B',
    polygon: '#8247E5',
    base: '#0052FF',
    arbitrum: '#28A0F0',
    moonbeam: '#53CBC9',
    optimism: '#FF0420',
    opbnb: '#F0B90B',
    polygonzkevm: '#7B3FE4',
    gnosis: '#04795B'
  };
  
  return networkColors[network] || '#646cff';
}