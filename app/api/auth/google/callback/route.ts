import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const error = req.nextUrl.searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`/configuracion?error=google_auth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`/configuracion?error=missing_params`);
    }

    const user = await getSessionUser();
    if (!user || user.uid !== state) {
      return NextResponse.redirect(`/configuracion?error=invalid_state`);
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`/configuracion?error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();

    // Guardar en Firestore
    await db.collection('users').doc(user.uid).collection('config').doc('google_oauth').set({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      createdAt: new Date(),
    });

    return NextResponse.redirect(`/configuracion?success=google_calendar_connected`);
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`/configuracion?error=callback_error`);
  }
}
