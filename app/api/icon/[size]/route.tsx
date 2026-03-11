import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size) || 512;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #4d7eff 100%)',
          borderRadius: size * 0.2,
        }}
      >
        <div
          style={{
            fontSize: size * 0.55,
            lineHeight: 1,
          }}
        >
          ⚡
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
