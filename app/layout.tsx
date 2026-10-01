import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Phantompip — AI Trading with Invisible Moves. Definitive Pips.',
  description: 'Professional institutional-grade AI trading platform for MetaTrader 5. Connect your MT5 account and let our automated plans trade autonomously 24/7.',
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
        <div className="min-h-screen bg-dark relative">
          {/* Four-layer Atmosphere: Aurora, Grid, Vignette, Grain */}
          <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* 1. Aurora */}
            <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-violet-600/[0.12] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
            <div className="absolute -bottom-40 left-[-10%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.11] blur-[100px] md:h-[820px] md:w-[820px] md:blur-[130px]" />
            {/* 2. Fine grid, fading out from the top */}
            <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000_30%,transparent_100%)]" />
            {/* 3. Vignette */}
            <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_40%,rgba(9,9,11,.85)_100%)]" />
            {/* 4. Film grain */}
            <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
          </div>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

