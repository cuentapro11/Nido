import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import FABButton from '@/components/FABButton';
import PageHeader from '@/components/PageHeader';
import ChildAvatar from '@/components/ChildAvatar';
import ActivityModal from '@/components/ActivityModal';
import { useState } from 'react';
import { Bell, X } from 'lucide-react';

// ─── Notification Panel ──────────────────────────────────────────
function NotifPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const adminNotifs = notifications.filter(n => n.target === 'admin');

  const fieldIcon = (f: string) => {
    if (f.toLowerCase().includes('alergia')) return '⚠️';
    if (f.toLowerCase().includes('medicamento')) return '💊';
    if (f.toLowerCase().includes('cumplea')) return '🎂';
    return 'ℹ️';
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#1E3A8A] px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-primary-foreground">Notificaciones</h2>
          <p className="text-xs text-primary-foreground/65">Cambios en perfiles de niños</p>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 bg-primary-foreground/15 rounded-full flex items-center justify-center active:scale-95">
          <X size={16} className="text-primary-foreground" />
        </button>
      </div>

      {adminNotifs.some(n => !n.read) && (
        <div className="px-4 pt-3 flex justify-end">
          <button onClick={() => markAllNotificationsRead('admin')}
            className="text-xs font-bold text-primary">
            Marcar todas como leídas
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {adminNotifs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">Sin notificaciones</p>
            <p className="text-xs mt-1">Aparecerán aquí cuando los padres editen información.</p>
          </div>
        )}
        {adminNotifs.map(n => (
          <button key={n.id} onClick={() => markNotificationRead(n.id)}
            className={`w-full text-left rounded-2xl p-4 shadow-card transition-all active:scale-[0.98] border-l-4 ${
              n.read ? 'bg-card border-transparent opacity-60' : 'bg-card border-primary'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                {fieldIcon(n.field)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{n.childName} — {n.field} actualizado</p>
                {n.newValue && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nuevo: <span className="font-semibold text-foreground">{n.newValue}</span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1" />}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { children, notifications } = useApp();
  const navigate = useNavigate();
  const [showFab, setShowFab] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(n => n.target === 'admin' && !n.read).length;

  const presentes = children.filter(c => c.present);
  const ausentes = children.filter(c => !c.present);

  // Tiempo sin actividad: lastMin es negativo (ej: -70 = hace 70 min)
  const minutesSinceActivity = (c: typeof children[0]): number | null => {
    if (!c.present || c.lastMin === null) return null;
    return Math.abs(c.lastMin); // positivo = minutos sin actividad
  };

  const isWarn = (c: typeof children[0]) => {
    const mins = minutesSinceActivity(c);
    return mins !== null && mins >= 60;
  };

  const sinActividadLabel = (c: typeof children[0]) => {
    const mins = minutesSinceActivity(c);
    if (mins === null) return '';
    if (mins === 0) return 'Actividad ahora mismo';
    if (mins < 60) return `Sin actividad hace ${mins} min`;
    const horas = Math.floor(mins / 60);
    const resto = mins % 60;
    if (resto === 0) return `Sin actividad hace ${horas}h`;
    return `Sin actividad hace ${horas}h ${resto}min`;
  };

  // Ordenar presentes: mayor tiempo sin actividad primero
  const presentesSorted = [...presentes].sort((a, b) => {
    const ma = minutesSinceActivity(a) ?? -1;
    const mb = minutesSinceActivity(b) ?? -1;
    return mb - ma;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence>{showNotifs && <NotifPanel onClose={() => setShowNotifs(false)} />}</AnimatePresence>

      {/* Header with bell */}
      <div className="flex items-start justify-between px-4 pt-12 pb-3">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Cuido Rayito de Sol ☀️</p>
          <h1 className="text-2xl font-extrabold text-foreground leading-tight">Panel</h1>
        </div>
        <button onClick={() => setShowNotifs(true)}
          className="relative w-10 h-10 bg-card border border-border rounded-2xl flex items-center justify-center shadow-card active:scale-90 transition-transform mt-1">
          <Bell size={18} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center px-1 border-2 border-background">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="flex gap-2 px-4 pb-4">
        {[
          { num: presentes.length, label: 'Presentes', color: 'text-success' },
          { num: ausentes.length, label: 'Ausentes', color: 'text-destructive' },
          { num: children.length, label: 'Total', color: 'text-primary' },
        ].map(m => (
          <div key={m.label} className="flex-1 bg-card rounded-xl p-3 text-center shadow-card">
            <div className={`text-xl font-extrabold ${m.color}`}>{m.num}</div>
            <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Children list */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-foreground">Con entrada hoy</span>
        <span className="text-[11px] font-semibold text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">
          {presentes.length} niños
        </span>
      </div>

      <div className="px-3.5 space-y-2.5">
        {presentes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-2">🌅</div>
            <div className="text-sm font-bold text-foreground">Todo tranquilo</div>
            <div className="text-xs mt-1">Nadie ha llegado aún.</div>
          </div>
        )}
        {presentesSorted.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => { navigate(`/child/${c.id}`); }}
              className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left"
            >
              <ChildAvatar child={c} size={50} showStatus />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground flex items-center gap-1">
                  {c.name}
                  {c.alerts.length > 0 && (
                    <span className="bg-destructive/10 text-destructive rounded-md px-1.5 py-px text-[10px] font-bold">⚠</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.age} · {c.group}</div>
                {c.lastMin !== null && (
                  <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 ${isWarn(c) ? 'bg-warning-light' : 'bg-success-light'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isWarn(c) ? 'bg-warning' : 'bg-success'}`} />
                    <span className={`text-[10px] font-bold ${isWarn(c) ? 'text-warning-foreground' : 'text-success'}`}>
                      {sinActividadLabel(c)}
                    </span>
                  </div>
                )}
              </div>
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                  <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="#1E3A8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <FABButton onClick={() => setShowFab(true)} />
      <BottomNav />
      <ActivityModal open={showFab} onClose={() => setShowFab(false)} />
    </div>
  );
}
