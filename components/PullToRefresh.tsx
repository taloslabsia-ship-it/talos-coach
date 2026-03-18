'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const THRESHOLD = 70;

export function PullToRefresh() {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);

  useEffect(() => {
    const scrollEl = document.querySelector('main');
    if (!scrollEl) return;

    const onTouchStart = (e: TouchEvent) => {
      if (scrollEl.scrollTop > 0) return;
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || scrollEl.scrollTop > 0) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) setPullY(Math.min(dy, THRESHOLD * 1.4));
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullY >= THRESHOLD) {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => { setRefreshing(false); setPullY(0); }, 1000);
      } else {
        setPullY(0);
      }
    };

    scrollEl.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollEl.addEventListener('touchmove', onTouchMove, { passive: true });
    scrollEl.addEventListener('touchend', onTouchEnd);
    return () => {
      scrollEl.removeEventListener('touchstart', onTouchStart);
      scrollEl.removeEventListener('touchmove', onTouchMove);
      scrollEl.removeEventListener('touchend', onTouchEnd);
    };
  }, [router, pullY]);

  const progress = Math.min(pullY / THRESHOLD, 1);
  const visible = pullY > 5 || refreshing;

  if (!visible) return null;

  const accentOpacity = 0.3 + progress * 0.7;
  const iconOpacity = 0.4 + progress * 0.6;
  const rotation = refreshing ? 360 : progress * 180;

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingTop: Math.max(pullY * 0.4, 8) }}
    >
      <div
        className="flex items-center justify-center size-9 rounded-full border"
        style={{
          background: 'rgba(10,20,20,0.9)',
          borderColor: `rgba(13,242,242,${accentOpacity})`,
          boxShadow: refreshing ? '0 0 12px rgba(13,242,242,0.4)' : 'none',
        }}
      >
        <span
          className="material-symbols-outlined text-lg"
          style={{
            color: `rgba(13,242,242,${iconOpacity})`,
            transform: `rotate(${rotation}deg)`,
            transition: refreshing ? 'transform 0.6s linear' : 'none',
          }}
        >
          {refreshing ? 'sync' : 'arrow_downward'}
        </span>
      </div>
    </div>
  );
}
