import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthLens — LinkedIn Growth Audit for Founders",
  description: "Analyze any LinkedIn profile strategy. Get a complete audit with actionable insights to grow your presence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <nav className="fixed top-0 w-full z-50 glass">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Satoshi, sans-serif' }}>GrowthLens</span>
            </a>
            <div className="flex items-center gap-6">
              <a href="/audit" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Audit</a>
              <a href="/compare" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Compare</a>
              <a href="/audit" className="bg-accent hover:bg-accent-dim text-navy font-semibold text-sm px-4 py-2 rounded-lg transition-colors">Get Started</a>
            </div>
          </div>
        </nav>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
