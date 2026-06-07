import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-dark relative overflow-hidden">
      {/* Ambient Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-purple opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-40 w-80 h-80 bg-accent-blue opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Content Wrapper - Added z-10 to stay above blurs */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 transition-opacity hover:opacity-80">
          <img src="/phantompip-logo.png" alt="Phantompip" className="h-40 w-auto" />
        </Link>

        {/* Page Content Injection */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}