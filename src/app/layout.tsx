import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PriceOracle - Real-time Price Intelligence",
  description: "AI-powered price tracking and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background flex flex-col`}
      >
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            border: '2px solid #000',
            borderRadius: '0px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }} />
        <footer className="w-full py-8 px-6 border-t border-slate-100 bg-white/50 backdrop-blur-sm relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-medium">
              © 2026 PriceOracle. Empowering Market Intelligence.
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors">
                Privacy & Data Transparency
              </a>
              <a href="/docs" className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
