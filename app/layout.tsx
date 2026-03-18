import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { PageTransition } from '@/components/PageTransition';
import { PullToRefresh } from '@/components/PullToRefresh';

export const metadata: Metadata = {
  title: 'Asistente TALOS',
  description: 'Tu asistente personal inteligente — powered by TALOS AI',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Asistente TALOS',
  },
};

export const viewport: Viewport = {
  themeColor: '#0df2f2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden">
        <ServiceWorkerRegistration />
        {/* Desktop sidebar */}
        <Sidebar />
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 md:px-6 md:py-8 md:max-w-5xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        {/* Mobile pull-to-refresh */}
        <PullToRefresh />
        {/* Mobile bottom nav */}
        <BottomNav />
      </body>
    </html>
  );
}
