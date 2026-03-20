import type { Metadata, Viewport } from 'next';
import './globals.css';
import { NavWrapper } from '@/components/NavWrapper';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { getSessionUser } from '@/lib/session';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null);

  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden">
        <ServiceWorkerRegistration />
        <NavWrapper user={user}>{children}</NavWrapper>
      </body>
    </html>
  );
}
