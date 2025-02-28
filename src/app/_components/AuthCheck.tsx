"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // If we have a session and we're on the signin page, redirect to dashboard
    if (status === 'authenticated' && (pathname === '/auth/signin' || pathname === '/')) {
      router.replace('/dashboard');
    }
  }, [status, pathname, router]);

  // Return null as this is just a behavior component
  return null;
}