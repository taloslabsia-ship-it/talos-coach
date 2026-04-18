import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/session';

const TALOS_USER_UID = process.env.TALOS_USER_UID || 'QXGkRXR6sZYJSvYopNISy3wiSxN2';

export interface AuthResult {
  uid: string;
  isApiKey: boolean;
}

/**
 * Resuelve el UID del usuario autenticado.
 * Acepta: API Key via header x-api-key o query param api_key
 *         O sesión web via cookie __session
 * Retorna null si ninguna autenticación es válida.
 */
export async function resolveAuthUid(req: NextRequest): Promise<AuthResult | null> {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  if (key && key === process.env.TALOS_API_SECRET) {
    return { uid: TALOS_USER_UID, isApiKey: true };
  }

  try {
    const user = await getSessionUser();
    if (user) return { uid: user.uid, isApiKey: false };
  } catch {
    // no-op
  }

  return null;
}

// Respuestas estándar reutilizables
export function unauthorized() {
  return Response.json(
    { data: null, error: 'Unauthorized', code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

export function badRequest(message: string, code = 'BAD_REQUEST') {
  return Response.json(
    { data: null, error: message, code },
    { status: 400 }
  );
}

export function notFound(message = 'Not found') {
  return Response.json(
    { data: null, error: message, code: 'NOT_FOUND' },
    { status: 404 }
  );
}

export function serverError(message: string) {
  return Response.json(
    { data: null, error: message, code: 'SERVER_ERROR' },
    { status: 500 }
  );
}

export function ok<T>(data: T, status = 200) {
  return Response.json({ data, error: null }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}
