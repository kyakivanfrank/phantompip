import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Phantompip — AI Trading with Invisible Moves. Definitive Pips.',
  description: 'Professional institutional-grade AI trading platform for MetaTrader 5. Connect your MT5 account and let neural strategies trade autonomously 24/7.',
  keywords: ['trading', 'forex', 'AI', 'terminal', 'platform', 'MT5', 'automated trading', 'neural networks'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="min-h-screen bg-dark">
          {children}
        </div>
      </body>
    </html>
  );
}
