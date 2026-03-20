export const dynamic = 'force-dynamic';

import { LogoutButton } from '@/components/LogoutButton';

export default function SubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: '#0a1414',
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(252,129,129,0.06) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-6xl">⏳</div>
        <div>
          <h1 className="text-white font-black text-2xl">Tu acceso venció</h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Tu suscripción a TALOS Coach expiró.<br />
            Renovála para seguir usando el asistente.
          </p>
        </div>

        <div className="card space-y-4">
          <div className="p-4 rounded-2xl text-left space-y-2"
            style={{ background: 'rgba(13,242,242,0.05)', border: '1px solid rgba(13,242,242,0.15)' }}>
            <p className="text-primary-400 font-bold text-sm">TALOS Coach Plus</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>✓ Asistente personal con IA</li>
              <li>✓ Seguimiento de hábitos y diario</li>
              <li>✓ Bot de Telegram 24/7</li>
              <li>✓ Integración con Google Calendar</li>
              <li>✓ Análisis de ventas y comercios</li>
            </ul>
          </div>

          <a
            href="https://talos-admin.firebaseapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-3 text-sm block"
          >
            Renovar suscripción
          </a>
        </div>

        <LogoutButton
          label="Cerrar sesión"
          className="text-slate-600 text-xs hover:text-slate-400 transition-colors"
        />
      </div>
    </div>
  );
}
