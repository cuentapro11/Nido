import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BackHeader from '@/components/BackHeader';
import { Bell, Globe, BellRing, DollarSign, LogIn } from 'lucide-react';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-primary' : 'bg-border'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${value ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-1 pt-2 pb-1">
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  );
}

function SettingRow({ icon: Icon, label, desc, right }: {
  icon: any; label: string; desc?: string; right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border last:border-0">
      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export default function ConfiguracionGeneral() {
  const { configuracion, updateConfiguracion } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const update = (key: keyof typeof configuracion, value: any) => {
    updateConfiguracion({ [key]: value });
    show('✓ Guardado');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <BackHeader title="Configuración" onBack={() => navigate('/configuracion')} />

      <div className="px-3.5 pt-4 space-y-3">

        {/* Notifications section */}
        <SectionHeader label="Notificaciones" />
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <SettingRow
            icon={Bell}
            label="Notificaciones"
            desc="Activar o desactivar todas"
            right={<Toggle value={configuracion.notificaciones} onChange={v => update('notificaciones', v)} />}
          />
          <SettingRow
            icon={LogIn}
            label="Entrada / Salida"
            desc="Notificar cuando niños llegan o salen"
            right={<Toggle value={configuracion.notifEntradaSalida} onChange={v => update('notifEntradaSalida', v)} />}
          />
          <SettingRow
            icon={BellRing}
            label="Actividades"
            desc="Nuevas fotos, reportes y notas"
            right={<Toggle value={configuracion.notifActividades} onChange={v => update('notifActividades', v)} />}
          />
          <SettingRow
            icon={DollarSign}
            label="Pagos y cobros"
            desc="Recordatorios de pagos pendientes"
            right={<Toggle value={configuracion.notifPagos} onChange={v => update('notifPagos', v)} />}
          />
        </div>

        {/* Language */}
        <SectionHeader label="Idioma y región" />
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <SettingRow
            icon={Globe}
            label="Idioma"
            desc="Idioma de la interfaz"
            right={
              <div className="flex gap-1.5">
                {(['es', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => update('idioma', lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      configuracion.idioma === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}
                  >
                    {lang === 'es' ? '🇩🇴 ES' : '🇺🇸 EN'}
                  </button>
                ))}
              </div>
            }
          />
        </div>

        {/* Preferences note */}
        <SectionHeader label="Preferencias" />
        <div className="bg-card rounded-2xl shadow-card p-4 text-center">
          <div className="text-3xl mb-2">🚧</div>
          <p className="text-sm font-bold text-foreground">Más opciones próximamente</p>
          <p className="text-xs text-muted-foreground mt-1">Tema, accesibilidad, exportación de datos y más.</p>
        </div>

        {/* App version */}
        <div className="text-center pt-2 pb-4">
          <p className="text-[11px] text-muted-foreground">Cuido · versión 9.0</p>
        </div>
      </div>
    </div>
  );
}
