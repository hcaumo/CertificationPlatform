"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

const Navigation = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/signin');
    };

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="bg-gray-900 text-white border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
                                Drexfy DeFi
                            </span>
                        </Link>
                        
                        {isAuthenticated && (
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                <Link 
                                    href="/dashboard" 
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        isActive('/dashboard') 
                                            ? 'border-indigo-500 text-white' 
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-200'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                
                                <Link 
                                    href="/wallet-analyzer" 
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        isActive('/wallet-analyzer') 
                                            ? 'border-indigo-500 text-white' 
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-200'
                                    }`}
                                >
                                    Wallet Analyzer
                                </Link>
                                
                                <Link 
                                    href="/transaction-history" 
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        isActive('/transaction-history') 
                                            ? 'border-indigo-500 text-white' 
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-200'
                                    }`}
                                >
                                    Transactions
                                </Link>
                                
                                <Link 
                                    href="/token-balances" 
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                        isActive('/token-balances') 
                                            ? 'border-indigo-500 text-white' 
                                            : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-gray-200'
                                    }`}
                                >
                                    Tokens
                                </Link>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center ml-4 md:ml-6">
                                <span className="text-sm text-gray-300 mr-4">
                                    {session?.user?.email}
                                </span>
                                <button 
                                    onClick={handleSignOut}
                                    className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex">
                                <Link 
                                    href="/auth/signin"
                                    className="px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                        
                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                {isAuthenticated && (
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link 
                            href="/dashboard" 
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/dashboard') 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Dashboard
                        </Link>
                        
                        <Link 
                            href="/wallet-analyzer" 
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/wallet-analyzer') 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Wallet Analyzer
                        </Link>
                        
                        <Link 
                            href="/transaction-history" 
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/transaction-history') 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Transactions
                        </Link>
                        
                        <Link 
                            href="/token-balances" 
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                isActive('/token-balances') 
                                    ? 'bg-gray-800 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Tokens
                        </Link>
                    </div>
                )}
                
                <div className="pt-4 pb-3 border-t border-gray-700">
                    {isAuthenticated ? (
                        <div className="px-2 space-y-1">
                            <div className="px-3 py-2 text-base font-medium text-gray-400">
                                {session?.user?.email}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="px-2">
                            <Link 
                                href="/auth/signin"
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;