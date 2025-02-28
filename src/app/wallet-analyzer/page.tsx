"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the TransactionGraph component with SSR disabled
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
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimal?: string;
  isToken?: boolean;
  timestamp: number;
  network: string;
  networkName: string;
  blockNumber: number;
}

// Sort direction type
type SortDirection = 'asc' | 'desc';

// Sort field type
type SortField = 'network' | 'from' | 'to' | 'date' | 'value';

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

  // State for token transfers
  const [includeTokenTransfers, setIncludeTokenTransfers] = useState(false);

  // State for filtering and sorting
  const [filterNetwork, setFilterNetwork] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  // Function to fetch token transfers for a wallet
  const fetchTokenTransfers = async (address: string, network: typeof blockchainNetworks[0]) => {
    try {
      // Construct API URL for token transfers (ERC20)
      const url = `${network.apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${network.apiKey}`;
      
      // Make API request
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1') {
        return data.result || [];
      } else {
        console.warn(`API error for token transfers on ${network.name}: ${data.message}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching token transfers for ${address} on ${network.name}:`, error);
      return [];
    }
  };
  
  // Function to find interactions between wallets
  const findInteractions = (transactions: any[], wallets: string[], network: typeof blockchainNetworks[0], isTokenTx = false) => {
    const walletSet = new Set(wallets.map(w => w.toLowerCase()));
    const interactions: WalletInteraction[] = [];
    
    for (const tx of transactions) {
      const from = tx.from.toLowerCase();
      const to = tx.to?.toLowerCase(); // 'to' might be null for contract creation
      
      // Check if this transaction is between our wallets of interest
      if (walletSet.has(from) && to && walletSet.has(to)) {
        if (tx.to) { // Only add if 'to' address exists
          interactions.push({
            txHash: tx.hash,
            hash: tx.hash, // Alias for compatibility with graph component
            from: tx.from,
            to: tx.to,
            value: tx.value,
            tokenSymbol: isTokenTx ? tx.tokenSymbol : undefined,
            tokenName: isTokenTx ? tx.tokenName : undefined,
            tokenDecimal: isTokenTx ? tx.tokenDecimal : undefined,
            isToken: isTokenTx,
            timestamp: parseInt(tx.timeStamp),
            network: network.id,
            networkName: network.name,
            blockNumber: parseInt(tx.blockNumber)
          });
        }
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
    console.log("Opening transaction explorer for:", tx);
    
    if (!tx || !tx.txHash) {
      console.error("Missing transaction or hash:", tx);
      return;
    }
    
    // Get the block explorer URL for this network
    const explorerUrl = getExplorerUrl(tx.network);
    
    // Construct the full URL to the transaction
    const fullUrl = `${explorerUrl}/tx/${tx.txHash}`;
    console.log("Opening transaction URL:", fullUrl);
    
    // Open in a new tab
    window.open(fullUrl, '_blank');
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

  // Handle sorting change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted and filtered interactions
  const getSortedAndFilteredInteractions = () => {
    return interactions
      .filter(tx => {
        // Apply network filter
        if (filterNetwork && tx.network !== filterNetwork) {
          return false;
        }
        
        // Apply from address filter
        if (filterFrom && !tx.from.toLowerCase().includes(filterFrom.toLowerCase())) {
          return false;
        }
        
        // Apply to address filter
        if (filterTo && !tx.to.toLowerCase().includes(filterTo.toLowerCase())) {
          return false;
        }
        
        // Apply date filter (start)
        if (filterDateStart) {
          const startTimestamp = new Date(filterDateStart).getTime() / 1000;
          if (tx.timestamp < startTimestamp) {
            return false;
          }
        }
        
        // Apply date filter (end)
        if (filterDateEnd) {
          const endTimestamp = new Date(filterDateEnd).getTime() / 1000 + 86399; // End of day
          if (tx.timestamp > endTimestamp) {
            return false;
          }
        }
        
        // Filter token transfers if not included
        if (!includeTokenTransfers && tx.isToken) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortField === 'network') {
          return sortDirection === 'asc' 
            ? a.networkName.localeCompare(b.networkName)
            : b.networkName.localeCompare(a.networkName);
        } else if (sortField === 'from') {
          return sortDirection === 'asc'
            ? a.from.localeCompare(b.from)
            : b.from.localeCompare(a.from);
        } else if (sortField === 'to') {
          return sortDirection === 'asc'
            ? a.to.localeCompare(b.to)
            : b.to.localeCompare(a.to);
        } else if (sortField === 'date') {
          return sortDirection === 'asc'
            ? a.timestamp - b.timestamp
            : b.timestamp - a.timestamp;
        } else if (sortField === 'value') {
          try {
            const valueA = BigInt(a.value);
            const valueB = BigInt(b.value);
            return sortDirection === 'asc'
              ? valueA > valueB ? 1 : -1
              : valueB > valueA ? 1 : -1;
          } catch (e) {
            return 0;
          }
        }
        
        return 0;
      });
  };
  
  // Handle form submission
  const handleAnalyzeWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous results
    setInteractions([]);
    setAnalysisStats(null);
    setAnalysisError(null);
    
    // Filter out invalid and undefined wallet addresses
    const validAddresses = walletAddresses
      .filter((addr): addr is string => typeof addr === 'string' && addr.trim() !== '')
      .filter(addr => isValidEVMAddress(addr));
    
    // Check if we have at least 2 valid addresses
    if (validAddresses.length < 2) {
      setAnalysisError("Please enter at least 2 valid Ethereum addresses");
      return;
    }

    // Create a type-safe array of addresses
    const safeAddresses: string[] = [...validAddresses];
    
    // Check if at least one network is selected
    if (selectedNetworks.length === 0) {
      setAnalysisError("Please select at least one blockchain network");
      return;
    }
    
    setIsAnalyzing(true);
    
    // For demo purposes, let's use a mix of actual API calls and simulated data
    try {
      const allInteractions: WalletInteraction[] = [];
      let totalTxnsScanned = 0;
      
      // Get the relevant networks
      const networksToScan = blockchainNetworks.filter(n => selectedNetworks.includes(n.id));
      
      // Mock data generation for demo - this would be replaced by actual API calls
      const generateMockInteraction = (from: string, to: string, network: typeof blockchainNetworks[0], timestamp: number, isToken = false): WalletInteraction => {
        // Generate a single consistent hash for the transaction
        const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 58)}`;
        
        // Return a complete mock transaction object
        return {
          txHash: txHash,
          hash: txHash, // Required for graph component compatibility
          from: from,
          to: to,
          value: (Math.random() * 10 * 1e18).toString(), // Convert to wei format for realistic values
          tokenSymbol: isToken ? ['USDT', 'WETH', 'LINK', 'UNI', 'AAVE'][Math.floor(Math.random() * 5)] : undefined,
          tokenName: isToken ? ['Tether', 'Wrapped Ether', 'Chainlink', 'Uniswap', 'Aave'][Math.floor(Math.random() * 5)] : undefined,
          tokenDecimal: isToken ? '18' : undefined,
          isToken: isToken,
          timestamp: timestamp,
          network: network.id,
          networkName: network.name,
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000
        };
      };
      
      for (const network of networksToScan.slice(0, 3)) { // Limit to first 3 networks to avoid rate limits
        // For the first wallet, try to actually fetch some transactions
        try {
          if (validAddresses[0]) {
            const txns = await fetchTransactions(validAddresses[0], network);
            totalTxnsScanned += txns.length;
            
            // Find real interactions if any
            const realInteractions = findInteractions(txns, validAddresses.filter((addr): addr is string => !!addr), network);
            allInteractions.push(...realInteractions);
            
            // Fetch token transfers if requested
            if (includeTokenTransfers) {
              const tokenTxns = await fetchTokenTransfers(validAddresses[0], network);
              totalTxnsScanned += tokenTxns.length;
              
              // Find token transfer interactions
              const tokenInteractions = findInteractions(tokenTxns, validAddresses.filter((addr): addr is string => !!addr), network, true);
              allInteractions.push(...tokenInteractions);
            }
          }
          
          // Generate mock interactions for demo purposes
          if (validAddresses.length >= 2) {
            const addr1 = validAddresses[0];
            const addr2 = validAddresses[1];
            
            if (addr1 && addr2) {
              // Create some mock interactions for demo purposes
              for (let i = 0; i < 2; i++) {
                const fromAddr = i % 2 === 0 ? addr1 : addr2;
                const toAddr = i % 2 === 0 ? addr2 : addr1;
                
                allInteractions.push(generateMockInteraction(
                  fromAddr,
                  toAddr,
                  network,
                  Math.floor(Date.now() / 1000) - i * 86400 // 1 day apart
                ));
                
                // Add token transfers if requested
                if (includeTokenTransfers) {
                  allInteractions.push(generateMockInteraction(
                    fromAddr,
                    toAddr,
                    network,
                    Math.floor(Date.now() / 1000) - i * 86400 - 3600, // 1 hour earlier
                    true
                  ));
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing ${network.name}:`, error);
        }
      }
      
      // Add some more mock interactions for demo purposes
      for (const network of networksToScan.slice(3)) {
        // Get the first two valid addresses
        const [addr1, addr2] = validAddresses.filter((addr): addr is string => !!addr).slice(0, 2);
        
        if (addr1 && addr2) {
          const baseTimestamp = Math.floor(Date.now() / 1000);
          
          // Generate regular transactions
          allInteractions.push(
            generateMockInteraction(
              addr1,
              addr2,
              network,
              baseTimestamp - Math.floor(Math.random() * 30) * 86400
            ),
            generateMockInteraction(
              addr2,
              addr1,
              network,
              baseTimestamp - Math.floor(Math.random() * 30) * 86400
            )
          );
          
          // Add token transfers if requested
          if (includeTokenTransfers) {
            allInteractions.push(
              generateMockInteraction(
                addr1,
                addr2,
                network,
                baseTimestamp - Math.floor(Math.random() * 30) * 86400 - 7200, // 2 hours earlier
                true
              ),
              generateMockInteraction(
                addr2,
                addr1,
                network,
                baseTimestamp - Math.floor(Math.random() * 30) * 86400 - 7200, // 2 hours earlier
                true
              )
            );
          }
        }
        totalTxnsScanned += Math.floor(Math.random() * 100) + 50; // Simulate scanning transactions
      }
      
      // If we have more than 2 addresses, create some additional interactions
      const validAddressesFiltered = validAddresses.filter((addr): addr is string => !!addr);
      if (validAddressesFiltered.length > 2) {
        const [addr1, addr2, ...additionalAddrs] = validAddressesFiltered;
        
        for (const addr3 of additionalAddrs) {
          const network = networksToScan[additionalAddrs.indexOf(addr3) % networksToScan.length];
          const baseTimestamp = Math.floor(Date.now() / 1000);
          
          // Add interactions between this address and the first two
          allInteractions.push(
            generateMockInteraction(
              addr3,
              addr1,
              network,
              baseTimestamp - Math.floor(Math.random() * 30) * 86400
            ),
            generateMockInteraction(
              addr2,
              addr3,
              network,
              baseTimestamp - Math.floor(Math.random() * 30) * 86400
            )
          );
          
          // Add token transfers if requested
          if (includeTokenTransfers) {
            allInteractions.push(
              generateMockInteraction(
                addr3,
                addr1,
                network,
                baseTimestamp - Math.floor(Math.random() * 30) * 86400 - 3600,
                true
              ),
              generateMockInteraction(
                addr2,
                addr3,
                network,
                baseTimestamp - Math.floor(Math.random() * 30) * 86400 - 3600,
                true
              )
            );
          }
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

  // Get sort indicator icon for a field
  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">▲</span> 
      : <span className="ml-1">▼</span>;
  };

  const filteredInteractions = getSortedAndFilteredInteractions();

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
                  {getValidAddressCount()}/{walletAddresses.length} valid addresses
                </div>
              </div>
            </div>
            
            {/* Token and Blockchain Networks */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold text-white mb-4">Options</h2>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="include-tokens"
                    checked={includeTokenTransfers}
                    onChange={() => setIncludeTokenTransfers(!includeTokenTransfers)}
                    className="rounded border-gray-600 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="include-tokens" className="ml-2 text-gray-200">
                    Include Token Transfers
                  </label>
                </div>
              </div>
              
              <div className="lg:col-span-4">
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
              
              {/* Table View with Filtering */}
              {activeTab === 'table' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="bg-white/5 p-4 rounded-lg mb-4">
                    <h3 className="text-white font-medium mb-3">Filter & Sort</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Network</label>
                        <select 
                          value={filterNetwork} 
                          onChange={(e) => setFilterNetwork(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        >
                          <option value="">All Networks</option>
                          {selectedNetworks.map(id => {
                            const network = blockchainNetworks.find(n => n.id === id);
                            return network ? (
                              <option key={id} value={id}>{network.icon} {network.name}</option>
                            ) : null;
                          })}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">From Address</label>
                        <input 
                          type="text" 
                          value={filterFrom} 
                          onChange={(e) => setFilterFrom(e.target.value)}
                          placeholder="Filter by sender"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">To Address</label>
                        <input 
                          type="text" 
                          value={filterTo} 
                          onChange={(e) => setFilterTo(e.target.value)}
                          placeholder="Filter by receiver"
                          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Date From</label>
                          <input 
                            type="date" 
                            value={filterDateStart} 
                            onChange={(e) => setFilterDateStart(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Date To</label>
                          <input 
                            type="date" 
                            value={filterDateEnd} 
                            onChange={(e) => setFilterDateEnd(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                
                  {/* Table */}
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                          <tr>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSortChange('network')}
                            >
                              Network {getSortIndicator('network')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSortChange('from')}
                            >
                              From {getSortIndicator('from')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSortChange('to')}
                            >
                              To {getSortIndicator('to')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSortChange('value')}
                            >
                              Value {getSortIndicator('value')}
                            </th>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSortChange('date')}
                            >
                              Date {getSortIndicator('date')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                              Transaction
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/5 divide-y divide-gray-700">
                          {filteredInteractions.length > 0 ? (
                            filteredInteractions.map((interaction, index) => (
                              <tr key={index} className={`hover:bg-gray-700/30 ${interaction.isToken ? 'bg-gray-800/20' : ''}`}>
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
                                  {interaction.isToken ? (
                                    <span className="flex items-center">
                                      <span className="bg-blue-900/50 text-blue-200 text-xs px-2 py-0.5 rounded mr-2">
                                        Token
                                      </span>
                                      {(parseFloat(interaction.value) / Math.pow(10, parseInt(interaction.tokenDecimal || '18'))).toFixed(4)} {interaction.tokenSymbol}
                                    </span>
                                  ) : (
                                    parseFloat(interaction.value) > 0 
                                      ? `${(parseFloat(interaction.value) / 1e18).toFixed(4)} ETH` 
                                      : 'Contract Call'
                                  )}
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                No interactions found matching your filters
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Results counter */}
                  <div className="text-sm text-gray-400 text-right">
                    Showing {filteredInteractions.length} of {interactions.length} interactions
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
                        transactions={filteredInteractions}
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
                  {filteredInteractions.length > 0 ? (
                    <div className="w-full">
                      <div className="text-white font-medium mb-4">Interaction Timeline</div>
                      {/* Simple timeline visualization */}
                      <div className="relative">
                        <div className="absolute left-0 top-10 w-full border-t border-gray-700"></div>
                        {filteredInteractions
                          .sort((a, b) => a.timestamp - b.timestamp)
                          .map((interaction, index) => {
                            // Calculate position along the timeline
                            const minTime = Math.min(...filteredInteractions.map(i => i.timestamp));
                            const maxTime = Math.max(...filteredInteractions.map(i => i.timestamp));
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
                                  className={`w-3 h-3 rounded-full cursor-pointer ${interaction.isToken ? 'ring-2 ring-blue-400' : ''}`}
                                  style={{ backgroundColor: getNetworkColor(interaction.network) }}
                                  onClick={() => openTransactionExplorer(interaction)}
                                  title={`${formatDate(interaction.timestamp)}: ${shortenAddress(interaction.from)} → ${shortenAddress(interaction.to)} ${interaction.isToken ? `(${interaction.tokenSymbol})` : ''}`}
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