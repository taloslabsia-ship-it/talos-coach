'use client';

import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { clientAuth, googleProvider } from '@/lib/firebase-client';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirect') || '/';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createSession = async (idToken: string) => {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Error creando sesión');
    router.push(redirectTo);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(clientAuth, googleProvider);
      const token = await result.user.getIdToken();
      await createSession(token);
    } catch (e: any) {
      setError('No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async () => {
    if (!email || !password) { setError('Completá todos los campos.'); return; }
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'register' ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const result = await fn(clientAuth, email, password);
      const token = await result.user.getIdToken();
      await createSession(token);
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Contraseña incorrecta.'
        : e.code === 'auth/user-not-found' ? 'No existe una cuenta con ese email.'
        : e.code === 'auth/email-already-in-use' ? 'Ese email ya está registrado.'
        : e.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.'
        : 'Error de autenticación. Intentá de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: '#0a1414',
        backgroundImage: 'radial-gradient(ellipse at 20% 30%, rgba(13,242,242,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(168,85,247,0.05) 0%, transparent 50%)',
      }}
    >
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-16 flex items-center justify-center animate-float">
            <div className="absolute inset-0 orb-glow opacity-60 rounded-full animate-glow-pulse" />
            <Image src="/icon-192.png" alt="TALOS" width={56} height={56} className="relative z-10 rounded-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl tracking-tight">TALOS Coach</h1>
            <p className="text-slate-500 text-sm mt-1">Tu asistente personal con IA</p>
          </div>
        </div>

        {/* Card */}
        <div className="card space-y-5">
          <h2 className="text-white font-bold text-base">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          {/* Google */}
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border font-semibold text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: '#e2e8f0' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-slate-600 text-xs">o</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email/password */}
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="input-dark w-full"
              onKeyDown={e => e.key === 'Enter' && loginWithEmail()}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="input-dark w-full"
              onKeyDown={e => e.key === 'Enter' && loginWithEmail()}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={loginWithEmail}
            disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          <p className="text-center text-xs text-slate-500">
            {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-primary-400 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
