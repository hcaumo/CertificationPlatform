"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const Navigation = () => {
    const router = useRouter();
    
    // Your navigation component logic here
    
    return (
        <nav className="bg-white/10 p-4 backdrop-blur-lg">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white font-bold text-xl cursor-pointer" onClick={() => router.push('/')}>
                    Drexfy Certification
                </div>
                <div className="space-x-4">
                    <button 
                        onClick={() => router.push('/')}
                        className="text-white hover:text-gray-300"
                    >
                        Home
                    </button>
                    <button 
                        onClick={() => router.push('/certifications')}
                        className="text-white hover:text-gray-300"
                    >
                        Certifications
                    </button>
                    <button 
                        onClick={() => router.push('/api/auth/signin')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;