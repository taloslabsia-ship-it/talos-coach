'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function ConfigPage() {
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const [elevenLabsDoc, googleCalendarDoc] = await Promise.all([
            getDoc(doc(db, 'users', user.uid, 'config', 'elevenlabs')),
            getDoc(doc(db, 'users', user.uid, 'config', 'google_oauth')),
          ]);

          if (elevenLabsDoc.exists()) {
            const data = elevenLabsDoc.data();
            setApiKey(data.apiKey || '');
            setVoiceId(data.voiceId || '');
          }

          if (googleCalendarDoc.exists()) {
            setGoogleConnected(true);
            setGoogleEmail(googleCalendarDoc.data()?.email || 'Conectado');
          }
        } catch (err) {
          console.error('Error loading config:', err);
          setError('Error al cargar configuración');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('La API Key es requerida');
      return;
    }
    if (!voiceId.trim()) {
      setError('El Voice ID es requerido');
      return;
    }

    startTransition(async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No estás autenticado');
          return;
        }

        const configRef = doc(db, 'users', user.uid, 'config', 'elevenlabs');
        await setDoc(configRef, {
          apiKey: apiKey.trim(),
          voiceId: voiceId.trim(),
          updatedAt: new Date(),
        });

        setSaved(true);
        setError('');
        setTimeout(() => setSaved(false), 3000);
      } catch (err: any) {
        setError('Error al guardar: ' + err.message);
      }
    });
  };

  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true);
    // Redirige al endpoint OAuth que maneja todo el flujo
    window.location.href = '/api/auth/google-calendar?action=authorize';
  };

  // Detectar si volvemos de la autenticación
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'success') {
      setGoogleConnected(true);
      setError('');
      window.history.replaceState({}, document.title, window.location.pathname);
      // Recargar config
      const user = auth.currentUser;
      if (user) {
        getDoc(doc(db, 'users', user.uid, 'config', 'google_oauth')).then(docSnap => {
          if (docSnap.exists()) {
            setGoogleEmail(docSnap.data().email || 'Conectado');
          }
        });
      }
    } else if (params.get('google') === 'error') {
      setError('Error al conectar Google Calendar. Intenta de nuevo.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setIsConnectingGoogle(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400 text-sm mt-1">Personaliza tu experiencia con TALOS</p>
      </div>

      {/* ElevenLabs Config */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-cyan-400">🎙️ ElevenLabs (Voz del Bot)</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk_..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
          />
          <p className="text-xs text-slate-400 mt-2">
            Obtén tu API Key en{' '}
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              elevenlabs.io
            </a>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Voice ID</label>
          <input
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="86V9x9hrQds83qf7zaGn"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition"
          />
          <p className="text-xs text-slate-400 mt-2">
            ID de la voz que prefieres (ej: la voz que te gusta de ElevenLabs)
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {saved && <p className="text-sm text-emerald-400">✅ Guardado exitosamente</p>}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {isPending ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Una vez guardados, el bot usará esta voz en las próximas respuestas.
      </p>

      {/* Google Calendar Config */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-cyan-400">📅 Google Calendar</h2>

        {googleConnected ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <p className="text-sm text-emerald-400">✅ Conectado a Google Calendar</p>
              <p className="text-xs text-emerald-300 mt-1">{googleEmail}</p>
            </div>
            <p className="text-xs text-slate-400">
              Ahora el bot puede agendar eventos. Prueba diciendo: "Agendá una reunión mañana a las 3pm"
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Conecta tu Google Calendar para que el bot pueda agendar eventos automáticamente.</p>
            <button
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {isConnectingGoogle ? 'Conectando...' : '🔗 Conectar Google'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
