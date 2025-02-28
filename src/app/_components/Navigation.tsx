import React from 'react';
import { useRouter } from 'next/navigation';

const Navigation = () => {
    const router = useRouter();

    return (
        <nav className="flex space-x-4 p-4 bg-gray-800 text-white">
            <button onClick={() => router.push('/dashboard')} className="hover:underline">
                Dashboard
            </button>
            <button onClick={() => router.push('/auth/signin')} className="hover:underline">
                Sign In
            </button>
            {/* Add more navigation items as needed */}
        </nav>
    );
};

export default Navigation;