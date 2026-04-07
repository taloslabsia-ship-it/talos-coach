'use client';

import { useState, useTransition } from 'react';
import { saveUserProfile, saveComercios } from '@/app/actions';
import type { UserProfile, BotPersonality, Comercio } from '@/lib/types';

const PERSONALITIES: {
  id: BotPersonality;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'acompanante',
    emoji: '🧘',
    name: 'Acompañante',
    tagline: 'Suave y sin presión',
    description: 'Te apoya sin juzgarte. Recordatorios amables, celebra cada avance, cero presión.',
    color: 'rgba(99,179,237,0.15)',
  },
  {
    id: 'equilibrado',
    emoji: '⚖️',
    name: 'Equilibrado',
    tagline: 'Apoyo con exigencia',
    description: 'Combina motivación con responsabilidad. Te da espacio pero no te deja escapar.',
    color: 'rgba(154,230,180,0.15)',
  },
  {
    id: 'entrenador',
    emoji: '🔥',
    name: 'Entrenador',
    tagline: 'Directo y exigente',
    description: 'Te cuestiona, no acepta excusas. Si no cumplís, te lo dice sin rodeos.',
    color: 'rgba(251,191,36,0.15)',
  },
  {
    id: 'beast',
    emoji: '⚔️',
    name: 'Modo Beast',
    tagline: 'Sin filtro, solo resultados',
    description: 'Máxima presión. Te trata como atleta de élite. Solo para los que van en serio.',
    color: 'rgba(252,129,129,0.15)',
  },
];

interface IntegrationsData {
  calendarConnected: boolean;
  comercios: Comercio[];
}

interface Props {
  profile: UserProfile | null;
  integrations: IntegrationsData;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: ok ? '#4ade80' : '#f87171' }}>
      <span className="w-2 h-2 rounded-full inline-block" style={{ background: ok ? '#4ade80' : '#f87171', boxShadow: ok ? '0 0 6px #4ade80' : '0 0 6px #f87171' }} />
      {label}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-white font-bold text-sm uppercase tracking-widest" style={{ color: 'rgba(13,242,242,0.7)' }}>
      {children}
    </h2>
  );
}

export function SettingsClient({ profile, integrations }: Props) {
  // Perfil
  const [personality, setPersonality] = useState<BotPersonality>(profile?.botPersonality ?? 'equilibrado');
  const [name, setName] = useState(profile?.name ?? '');
  const [quietStart, setQuietStart] = useState(profile?.quietStart ?? '23:00');
  const [quietEnd, setQuietEnd] = useState(profile?.quietEnd ?? '08:00');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Comercios
  const [comercios, setComercios] = useState<Comercio[]>(integrations.comercios);
  const [newComercioId, setNewComercioId] = useState('');
  const [newComercioLabel, setNewComercioLabel] = useState('');
  const [editingComercio, setEditingComercio] = useState<string | null>(null);
  const [comerciosSaved, setComerciosSaved] = useState(false);
  const [comerciosPending, startComerciosTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveUserProfile({ name, botPersonality: personality, quietStart, quietEnd, onboardingDone: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const handleAddComercio = () => {
    if (!newComercioId.trim() || !newComercioLabel.trim()) return;
    setComercios(prev => [...prev, { id: newComercioId.trim(), label: newComercioLabel.trim(), active: true }]);
    setNewComercioId('');
    setNewComercioLabel('');
  };

  const handleToggleComercio = (id: string) => {
    setComercios(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDeleteComercio = (id: string) => {
    setComercios(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveComercios = () => {
    startComerciosTransition(async () => {
      await saveComercios(comercios);
      setComerciosSaved(true);
      setTimeout(() => setComerciosSaved(false), 3000);
    });
  };

  return (
    <div className="space-y-10 max-w-xl">

      {/* Header */}
      <div>
        <h1 className="text-white font-black text-2xl">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Personalizá tu experiencia con TALOS</p>
      </div>

      {/* ── PERFIL ── */}
      <section className="space-y-3">
        <SectionTitle>Tu nombre</SectionTitle>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="¿Cómo te llamo?"
          className="input-dark w-full"
        />
      </section>

      {/* ── PERSONALIDAD ── */}
      <section className="space-y-3">
        <div>
          <SectionTitle>Personalidad del coach</SectionTitle>
          <p className="text-slate-500 text-xs mt-1">Define cómo te va a hablar y presionar el asistente</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERSONALITIES.map(p => {
            const isSelected = personality === p.id;
            return (
              <button key={p.id} onClick={() => setPersonality(p.id)}
                className="text-left p-4 rounded-2xl border transition-all duration-200"
                style={{
                  background: isSelected ? p.color : 'rgba(255,255,255,0.02)',
                  borderColor: isSelected ? 'rgba(13,242,242,0.4)' : 'rgba(255,255,255,0.07)',
                  boxShadow: isSelected ? '0 0 16px rgba(13,242,242,0.08)' : 'none',
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{p.name}</p>
                    <p className="text-[10px] uppercase tracking-wide font-semibold"
                      style={{ color: isSelected ? 'rgba(13,242,242,0.8)' : 'rgba(255,255,255,0.3)' }}>
                      {p.tagline}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="ml-auto material-symbols-outlined text-base"
                      style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">{p.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── HORARIO SILENCIOSO ── */}
      <section className="space-y-3">
        <div>
          <SectionTitle>Horario silencioso</SectionTitle>
          <p className="text-slate-500 text-xs mt-1">El bot no te va a interrumpir en este rango</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-slate-500 text-xs mb-1 block">Desde</label>
            <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="input-dark w-full" />
          </div>
          <span className="text-slate-600 mt-5">→</span>
          <div className="flex-1">
            <label className="text-slate-500 text-xs mb-1 block">Hasta</label>
            <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="input-dark w-full" />
          </div>
        </div>
      </section>

      {/* Guardar perfil */}
      <button onClick={handleSave} disabled={isPending}
        className="w-full py-3 rounded-2xl font-bold text-sm transition-all"
        style={{
          background: saved ? 'rgba(74,222,128,0.15)' : 'rgba(13,242,242,0.15)',
          color: saved ? '#4ade80' : '#0df2f2',
          border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : 'rgba(13,242,242,0.3)'}`,
        }}>
        {isPending ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar configuración'}
      </button>

      {/* ── INTEGRACIONES ── */}
      <div className="border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mb-6">
          <SectionTitle>Integraciones</SectionTitle>
          <p className="text-slate-500 text-xs mt-1">Estado de las conexiones del asistente</p>
        </div>

        <div className="space-y-3">

          {/* Google Calendar */}
          <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-white font-semibold text-sm">Google Calendar</p>
                  <p className="text-slate-500 text-xs">Crear y gestionar eventos desde el bot</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge ok={integrations.calendarConnected} label={integrations.calendarConnected ? 'Conectado' : 'Sin conectar'} />
                <button
                  onClick={() => window.location.href = '/api/auth/google/connect'}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/50 hover:bg-primary-500/30 transition-all"
                >
                  {integrations.calendarConnected ? 'Reconectar' : 'Conectar'}
                </button>
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">✈️</span>
                <div>
                  <p className="text-white font-semibold text-sm">Telegram Bot</p>
                  <p className="text-slate-500 text-xs">Canal principal de comunicación con TALOS</p>
                </div>
              </div>
              <StatusBadge ok={true} label="Activo" />
            </div>
            <div className="mt-3 pl-9">
              <a href="https://t.me/AgenteTALOSbot" target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold transition-colors inline-flex items-center gap-1"
                style={{ color: 'rgba(13,242,242,0.7)' }}>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Abrir @AgenteTALOSbot
              </a>
            </div>
          </div>

          {/* LLMs */}
          <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <p className="text-white font-semibold text-sm">Modelos de IA</p>
                  <p className="text-slate-500 text-xs">Groq (principal) + Claude Haiku (fallback)</p>
                </div>
              </div>
              <StatusBadge ok={true} label="Activos" />
            </div>
            <p className="text-slate-600 text-xs mt-2 pl-9">Las API keys se gestionan en las variables de entorno del servidor.</p>
          </div>

        </div>
      </div>

      {/* ── COMERCIOS DE VENTAS ── */}
      <section className="space-y-4">
        <div>
          <SectionTitle>Comercios conectados</SectionTitle>
          <p className="text-slate-500 text-xs mt-1">Los comercios que TALOS puede consultar para datos de ventas</p>
        </div>

        <div className="space-y-2">
          {comercios.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: c.active ? 'rgba(13,242,242,0.15)' : 'rgba(255,255,255,0.05)' }}>
              <span className="text-lg">🏪</span>
              <div className="flex-1 min-w-0">
                {editingComercio === c.id ? (
                  <input
                    className="input-dark w-full text-sm py-1"
                    defaultValue={c.label}
                    onBlur={e => {
                      setComercios(prev => prev.map(x => x.id === c.id ? { ...x, label: e.target.value } : x));
                      setEditingComercio(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <p className={`font-semibold text-sm ${c.active ? 'text-white' : 'text-slate-500'}`}>{c.label}</p>
                    <p className="text-slate-600 text-[10px] font-mono truncate">{c.id}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleToggleComercio(c.id)} title={c.active ? 'Desactivar' : 'Activar'}
                  className={`p-1.5 rounded-lg transition-colors ${c.active ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'}`}>
                  <span className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: c.active ? "'FILL' 1" : "'FILL' 0" }}>
                    {c.active ? 'toggle_on' : 'toggle_off'}
                  </span>
                </button>
                <button onClick={() => setEditingComercio(c.id)} className="text-slate-600 hover:text-primary-400 p-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button onClick={() => handleDeleteComercio(c.id)} className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agregar comercio */}
        <div className="p-3 rounded-xl border border-dashed space-y-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Agregar comercio</p>
          <input
            type="text"
            value={newComercioLabel}
            onChange={e => setNewComercioLabel(e.target.value)}
            placeholder="Nombre del comercio"
            className="input-dark w-full text-sm"
          />
          <input
            type="text"
            value={newComercioId}
            onChange={e => setNewComercioId(e.target.value)}
            placeholder="ID de Firebase (comercioId)"
            className="input-dark w-full text-sm font-mono"
          />
          <button
            onClick={handleAddComercio}
            disabled={!newComercioId.trim() || !newComercioLabel.trim()}
            className="w-full py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-30"
            style={{ background: 'rgba(13,242,242,0.1)', color: '#0df2f2', border: '1px solid rgba(13,242,242,0.2)' }}>
            + Agregar
          </button>
        </div>

        <button onClick={handleSaveComercios} disabled={comerciosPending}
          className="w-full py-3 rounded-2xl font-bold text-sm transition-all"
          style={{
            background: comerciosSaved ? 'rgba(74,222,128,0.15)' : 'rgba(13,242,242,0.15)',
            color: comerciosSaved ? '#4ade80' : '#0df2f2',
            border: `1px solid ${comerciosSaved ? 'rgba(74,222,128,0.3)' : 'rgba(13,242,242,0.3)'}`,
          }}>
          {comerciosPending ? 'Guardando…' : comerciosSaved ? '✓ Comercios guardados' : 'Guardar comercios'}
        </button>
      </section>

    </div>
  );
}
