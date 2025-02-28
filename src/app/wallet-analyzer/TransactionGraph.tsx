"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Node,
  Edge,
  NodeMouseHandler,
  EdgeMouseHandler,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useMemo } from 'react';
// Type for our transaction
interface Transaction {
  txHash: string;
  hash: string;
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

interface TransactionGraphProps {
  wallets: string[];
  transactions: Transaction[];
  onNodeClick: (address: string, network: string) => void;
  onEdgeClick: (tx: Transaction) => void;
}

const TransactionGraph = ({ wallets, transactions, onNodeClick, onEdgeClick }: TransactionGraphProps) => {
  // Create nodes from wallet addresses
  const nodes = useMemo(() => 
    wallets
      .filter(wallet => wallet.trim() !== '')
      .map((wallet, index) => ({
        id: wallet.toLowerCase(),
        data: { 
          label: `Wallet ${index + 1}`,
          address: wallet 
        },
        position: { 
          x: 250 * (index - (wallets.length - 1) / 2), 
          y: 100 
        },
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #646cff',
          borderRadius: '8px',
          padding: '10px',
          width: 180,
        }
      })),
    [wallets]
  );

  // Create edges from transactions
  const edges = useMemo(() => {
    // Create a map to group transactions between the same wallets
    const edgesMap = new Map();
    
    // Process each transaction
    transactions.forEach(tx => {
      // Make sure both wallets are in our list
      const fromWallet = wallets.find(w => w.toLowerCase() === tx.from.toLowerCase());
      const toWallet = wallets.find(w => w.toLowerCase() === tx.to?.toLowerCase());
      
      if (fromWallet && toWallet) {
        // Create a unique key for this wallet pair
        const edgeKey = `${tx.from.toLowerCase()}-${tx.to.toLowerCase()}`;
        
        // See if we already have an edge for this wallet pair
        if (edgesMap.has(edgeKey)) {
          // Update existing edge
          const edge = edgesMap.get(edgeKey);
          edge.data.transactions.push(tx);
          
          // Try to update the total value (might fail if not valid numbers)
          try {
            const currentValue = BigInt(edge.data.totalValue);
            const newValue = BigInt(tx.value);
            edge.data.totalValue = (currentValue + newValue).toString();
          } catch (e) {
            // Just keep the original value if we can't add them
            console.log("Couldn't add transaction values:", e);
          }
        } else {
          // Create a new edge
          edgesMap.set(edgeKey, {
            id: edgeKey,
            source: tx.from.toLowerCase(),
            target: tx.to.toLowerCase(),
            type: 'smoothstep',
            animated: true,
            style: { 
              stroke: getNetworkColor(tx.network) 
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: getNetworkColor(tx.network),
            },
            data: {
              // Store the full transaction objects
              transactions: [tx],
              totalValue: tx.value,
              network: tx.network
            },
            // Format a label showing the value
            label: formatEtherValue(tx.value)
          });
        }
      }
    });
    
    // Convert the map to an array and update the labels with total values
    return Array.from(edgesMap.values()).map(edge => ({
      ...edge,
      label: formatEtherValue(edge.data.totalValue)
    }));
  }, [transactions, wallets]);

  // Handle clicking on a node (wallet)
  const handleNodeClick: NodeMouseHandler = useCallback((e, node) => {
    console.log("Node clicked:", node);
    onNodeClick(node.data.address, node.data.network || 'ethereum');
  }, [onNodeClick]);

  // Handle clicking on an edge (transaction)
  const handleEdgeClick: EdgeMouseHandler = useCallback((e, edge) => {
    console.log("Edge clicked:", edge);
    
    // Make sure we have transaction data
    if (!edge?.data?.transactions?.length) {
      console.error("No transactions in edge:", edge);
      return;
    }
    
    // Get the first transaction from the edge
    const tx = edge.data.transactions[0];
    console.log("Transaction from edge:", tx);
    
    // Call the callback with the transaction
    onEdgeClick(tx);
  }, [onEdgeClick]);

  return (
    <div style={{ height: 400, background: '#0a0a0a', borderRadius: '12px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background color="#333" variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap style={{ background: '#1a1a1a' }} nodeColor="#646cff" />
      </ReactFlow>
    </div>
  );
};

// Helper function to format ETH values
function formatEtherValue(value: string): string {
  try {
    // Convert string to BigInt and handle the division
    const valueBigInt = BigInt(value);
    const divisor = BigInt(10 ** 18); // 1e18 as BigInt
    const quotient = valueBigInt / divisor;
    const remainder = valueBigInt % divisor;
    
    // Format the decimal part (first 4 digits)
    const decimalStr = remainder.toString().padStart(18, '0').slice(0, 4);
    
    return `${quotient}.${decimalStr} ETH`;
  } catch (e) {
    return "0.0000 ETH";
  }
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

export default TransactionGraph;