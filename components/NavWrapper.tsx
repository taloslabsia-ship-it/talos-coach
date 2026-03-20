'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';
import { PullToRefresh } from './PullToRefresh';
import type { SessionUser } from '@/lib/types';

const NO_NAV = ['/login', '/subscribe'];

interface Props {
  user?: SessionUser | null;
  children: React.ReactNode;
}

export function NavWrapper({ user, children }: Props) {
  const pathname = usePathname();
  const showNav = !NO_NAV.some(p => pathname.startsWith(p));

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8 md:px-6 md:py-8 md:max-w-5xl">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <PullToRefresh />
      <BottomNav />
    </>
  );
}
