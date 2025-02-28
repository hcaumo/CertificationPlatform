"use client";

import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="w-full max-w-md rounded-lg bg-white/10 p-8 backdrop-blur-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">
          Check your email
        </h2>
        
        <div className="mb-6 text-center text-gray-200">
          <p className="mb-4">
            A sign in link has been sent to your email address.
          </p>
          <p>
            Please check your email inbox and click the link to sign in.
          </p>
        </div>
        
        <div className="text-center">
          <Link
            href="/"
            className="text-indigo-300 hover:text-indigo-200 underline"
          >
            Back to home page
          </Link>
        </div>
      </div>
    </div>
  );
}