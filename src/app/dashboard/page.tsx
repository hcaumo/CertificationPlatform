"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const FeatureCard = ({ title, description, icon, linkHref, linkText }: { 
  title: string; 
  description: string; 
  icon: string;
  linkHref: string;
  linkText: string;
}) => (
  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300 mb-4">{description}</p>
    <Link 
      href={linkHref}
      className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white no-underline transition-colors"
    >
      {linkText}
    </Link>
  </div>
);

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session?.user?.email}
          </h1>
          <p className="text-gray-300">
            Access your DeFi tools and blockchain analytics
          </p>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Protocols Analyzed</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Wallets Tracked</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Networks</h3>
            <p className="text-2xl font-bold">5</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Recent Alerts</h3>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>

        {/* Features */}
        <h2 className="text-2xl font-bold text-white mb-6">DeFi Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            title="Wallet Interactions"
            description="Analyze direct interactions between blockchain wallets across various networks."
            icon="🔍"
            linkHref="/wallet-analyzer"
            linkText="Check Interactions"
          />
          
          <FeatureCard
            title="Transaction History"
            description="View detailed transaction history for any wallet address with filtering options."
            icon="📊"
            linkHref="/transaction-history"
            linkText="View Transactions"
          />
          
          <FeatureCard
            title="Token Balances"
            description="Check token balances and portfolio valuation across multiple networks."
            icon="💰"
            linkHref="/token-balances"
            linkText="View Balances"
          />
          
          <FeatureCard
            title="Smart Contract Analysis"
            description="Analyze smart contracts for security vulnerabilities and integration risks."
            icon="📝"
            linkHref="/contract-analysis"
            linkText="Analyze Contracts"
          />
          
          <FeatureCard
            title="DeFi Protocol Exposure"
            description="Track wallet exposure to different DeFi protocols and assess risk."
            icon="🏦"
            linkHref="/protocol-exposure"
            linkText="Check Exposure"
          />
          
          <FeatureCard
            title="Liquidity Pool Analysis"
            description="Analyze liquidity pool positions and impermanent loss across protocols."
            icon="💧"
            linkHref="/liquidity-analysis"
            linkText="Analyze Liquidity"
          />
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        
        <div className="bg-white/10 rounded-lg p-6 backdrop-blur-lg mb-8">
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Wallet Analysis Completed</h3>
                  <p className="text-sm text-gray-400">
                    Analysis of wallet 0x742d...44e completed
                  </p>
                </div>
                <span className="text-sm text-gray-400">5 min ago</span>
              </div>
            </div>
            
            <div className="border-b border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">New Transaction Detected</h3>
                  <p className="text-sm text-gray-400">
                    Transaction 0xf7d4...582 detected between watched wallets
                  </p>
                </div>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Smart Contract Scan Alert</h3>
                  <p className="text-sm text-gray-400">
                    Potential risk detected in contract 0x8626...199
                  </p>
                </div>
                <span className="text-sm text-gray-400">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}