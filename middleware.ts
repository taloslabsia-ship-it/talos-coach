import { NextRequest, NextResponse } from 'next/server';

// Rutas públicas — no requieren sesión
const PUBLIC_PATHS = ['/login', '/api/auth', '/api/webhooks', '/api/v1', '/api/notas', '/api/notes', '/api/diario', '/api/recordatorios', '/api/habitos', '/api/stats', '/api/reflections'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y assets
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(ico|png|jpg|svg|webmanifest|js)$/)
  ) {
    return NextResponse.next();
  }

  // Verificar cookie de sesión (verificación de firma ocurre en server components)
  const session = request.cookies.get('__session')?.value;
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
