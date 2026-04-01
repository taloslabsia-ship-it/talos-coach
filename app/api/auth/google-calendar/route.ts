import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { getSessionUser } from '@/lib/session';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'https://talos-coach-talos-agente-personal-agustin.us-east4.hosted.app'}/api/auth/google-calendar/callback`
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const code = searchParams.get('code');

  // Step 1: Redirect to Google for authorization
  if (action === 'authorize') {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
    return NextResponse.redirect(authUrl);
  }

  // Step 2: Handle callback from Google
  if (code) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Save to Firestore
      const uid = user.uid;
      const configRef = db.collection('users').doc(uid).collection('config').doc('google_oauth');
      await configRef.set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        expiry_date: tokens.expiry_date || null,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope,
        email: user.email,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Redirect to success page
      return NextResponse.redirect(new URL('/configuracion?google=success', req.url));
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/configuracion?google=error', req.url));
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
