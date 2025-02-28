import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "./providers";
import Navigation from "./_components/Navigation";

export const metadata: Metadata = {
  title: "Drexfy Certification Platform",
  description: "Learn and get certified with Drexfy",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <TRPCReactProvider>
            {/* Navigation component handles its own conditional rendering */}
            <Navigation />
            {children}
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}