"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthCheck() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Only redirect if we have a definitive authenticated status (not "loading")
    if (status === 'authenticated') {
      // If we're on the signin page or root and authenticated, redirect to dashboard
      if (pathname === '/auth/signin' || pathname === '/') {
        console.log('Redirecting authenticated user from', pathname, 'to dashboard');
        router.replace('/dashboard');
      }
    } else if (status === 'unauthenticated') {
      // If we're on a protected page and not authenticated, redirect to signin
      if (!pathname.startsWith('/auth/') && pathname !== '/' && !pathname.startsWith('/api/')) {
        console.log('Redirecting unauthenticated user from', pathname, 'to signin');
        router.replace('/auth/signin');
      }
    }
    // We intentionally don't redirect while status is "loading" to avoid flicker
  }, [status, pathname, router]);

  // Return null as this is just a behavior component
  return null;
}