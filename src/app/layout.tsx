import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentShield — Real-time Trust & Safety Layer for AI Agents',
  description: 'Trust every AI decision before it reaches the user. Real-time runtime guardrails, context validation, Moss low-latency retrieval, and continuous agent evaluation.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300 min-h-screen">
        <div className="relative min-h-screen flex flex-col bg-grid-pattern">
          {children}
        </div>
      </body>
    </html>
  );
}
