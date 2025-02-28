"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import AuthCheck from '../app/_components/AuthCheck';

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthCheck />
      {children}
    </SessionProvider>
  );
}