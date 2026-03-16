import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Asistente TALOS',
    short_name: 'TALOS',
    description: 'Tu asistente personal inteligente — powered by TALOS AI',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#020617',
    theme_color: '#2563eb',
    categories: ['productivity', 'lifestyle'],
    icons: [
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
