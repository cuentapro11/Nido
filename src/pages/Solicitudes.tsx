import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BackHeader from '@/components/BackHeader';

export default function Solicitudes() {
  const { pendingSolicitudes, approveSolicitud, rejectSolicitud } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="Solicitudes" onBack={() => navigate(-1)} />

      <div className="px-5 pt-2 pb-4">
        <p className="text-xs font-bold text-primary">Aprueba o rechaza el acceso</p>
        <h2 className="text-lg font-extrabold text-foreground">Solicitudes</h2>
      </div>

      <div className="px-3.5 space-y-3">
        {pendingSolicitudes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">✓</div>
            <div className="text-sm">Sin solicitudes pendientes.</div>
          </div>
        )}
        {pendingSolicitudes.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: s.bg, color: s.tc }}>
                {s.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">Solicita unirse · Código: #{s.code}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-3">Hijo: {s.hijo}</div>
            <div className="flex gap-2">
              <button
                onClick={() => { approveSolicitud(i); show('✓ ' + s.name + ' aprobado'); }}
                className="flex-1 bg-success-light text-success font-bold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
              >
                ✓ Aprobar
              </button>
              <button
                onClick={() => { rejectSolicitud(i); show('Rechazado'); }}
                className="flex-1 bg-destructive/10 text-destructive font-bold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
              >
                ✕ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
