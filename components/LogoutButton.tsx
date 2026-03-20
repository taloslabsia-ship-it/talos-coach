'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  label?: string;
  className?: string;
}

export function LogoutButton({ label = 'Cerrar sesión', className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} disabled={loading} className={className}>
      {loading ? 'Saliendo…' : label}
    </button>
  );
}
