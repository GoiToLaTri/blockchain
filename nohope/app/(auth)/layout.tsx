"use client";

import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-md h-112 bg-indigo-500/30 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-lg h-128 bg-blue-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Noise overlay (optional cho xịn hơn) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
}
