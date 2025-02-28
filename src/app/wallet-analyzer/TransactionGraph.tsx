"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

// Interface for transaction type
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  network: string;
  networkName: string;
}

interface TransactionGraphProps {
  wallets: string[];
  transactions: Transaction[];
  onNodeClick?: (address: string, network: string) => void;
  onEdgeClick?: (transaction: Transaction) => void;
}

// Helper function to get color for a network - MOVED UP BEFORE USAGE
const getNetworkColor = (network: string): string => {
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
};

// Helper function to get explorer URL for different networks
const getExplorerUrl = (network: string): string => {
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
  
  return explorerUrls[network] || 'https://etherscan.io';
};

// Helper function to format ETH values
const formatEtherValue = (value: string): string => {
  try {
    return `${ethers.formatEther(value).slice(0, 6)} ETH`;
  } catch (e) {
    return "0.0000 ETH";
  }
};

const TransactionGraph = ({ wallets, transactions, onNodeClick, onEdgeClick }: TransactionGraphProps) => {
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

  const edges = useMemo(() => {
    const edgeMap = new Map();
    transactions.forEach(tx => {
      const fromWallet = wallets.find(w => w.toLowerCase() === tx.from.toLowerCase());
      const toWallet = wallets.find(w => w.toLowerCase() === tx.to?.toLowerCase());
      
      if (fromWallet && toWallet) {
        const edgeId = `${tx.from.toLowerCase()}-${tx.to.toLowerCase()}`;
        const existingEdge = edgeMap.get(edgeId);
        
        if (existingEdge) {
          let currentTotal;
          let newValue;
          
          try {
            currentTotal = BigInt(existingEdge.data.totalValue);
            newValue = BigInt(tx.value);
            existingEdge.data.transactions.push(tx);
            existingEdge.data.totalValue = (currentTotal + newValue).toString();
          } catch (e) {
            // Handle case where values might not be valid BigInts
            existingEdge.data.transactions.push(tx);
          }
        } else {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: tx.from.toLowerCase(),
            target: tx.to.toLowerCase(),
            type: 'smoothstep',
            animated: true,
            style: { stroke: getNetworkColor(tx.network) },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: getNetworkColor(tx.network),
            },
            data: {
              transactions: [tx],
              totalValue: tx.value,
              network: tx.network
            },
            label: formatEtherValue(tx.value),
          });
        }
      }
    });
    
    return Array.from(edgeMap.values()).map(edge => ({
      ...edge,
      label: formatEtherValue(edge.data.totalValue),
    }));
  }, [transactions, wallets]);

  const handleNodeClick = useCallback((_, node) => {
    if (onNodeClick) {
      onNodeClick(node.data.address, 'ethereum'); // Default to ethereum
    } else {
      window.open(`https://etherscan.io/address/${node.data.address}`, '_blank');
    }
  }, [onNodeClick]);

  const handleEdgeClick = useCallback((_, edge) => {
    const tx = edge.data.transactions[0];
    if (onEdgeClick) {
      onEdgeClick(tx);
    } else {
      // Default behavior - open in appropriate block explorer
      const baseUrl = getExplorerUrl(tx.network);
      window.open(`${baseUrl}/tx/${tx.hash}`, '_blank');
    }
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
        <Background color="#333" variant="dots" />
        <Controls />
        <MiniMap style={{ background: '#1a1a1a' }} nodeColor="#646cff" />
      </ReactFlow>
    </div>
  );
};

export default TransactionGraph;