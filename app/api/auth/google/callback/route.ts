import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://talos-coach--talos-agente-personal-agustin.us-east4.hosted.app';

function redirect(path: string) {
  return NextResponse.redirect(`${APP_URL}${path}`);
}

// Lee las credenciales OAuth del config del usuario en Firestore
async function getOAuthCredentials(uid: string) {
  const doc = await db.collection('users').doc(uid).collection('config').doc('google_oauth_credentials').get();
  if (doc.exists) {
    return { clientId: doc.data()?.clientId, clientSecret: doc.data()?.clientSecret };
  }
  // Fallback a env vars
  return {
    clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '213567039014-sr4rpp0gpbkpfhb21m4v8um89pc9l593.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
  };
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    if (error) return redirect('/configuracion?error=google_auth_denied');
    if (!code || !state) return redirect('/configuracion?error=missing_params');

    const user = await getSessionUser();
    if (!user || user.uid !== state) return redirect('/configuracion?error=invalid_state');

    const creds = await getOAuthCredentials(user.uid);
    const redirectUri = `${APP_URL}/api/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) return redirect('/configuracion?error=token_exchange_failed');

    const tokens = await tokenRes.json();

    await db.collection('users').doc(user.uid).collection('config').doc('google_oauth').set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      createdAt: new Date(),
    });

    return redirect('/configuracion?success=google_calendar_connected');
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return redirect('/configuracion?error=callback_error');
  }
}
