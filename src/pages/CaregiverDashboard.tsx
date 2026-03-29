import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp, LOG_OPTS } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityIcon from '@/components/ActivityIcon';
import { LogOut, Users, ClipboardList, Clock, MessageSquare, Send, ChevronRight, Bell, X, Search } from 'lucide-react';




const fmtTime = (iso: string) => {
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' : ''}${m} ${ap}`;
};

// ─── Mock notifications (changes to child "Información" fields) ────────────
const MOCK_NOTIFS = [
  { id: 1, child: 'Sofía',  field: 'Alergias',     old: '',        new: 'Maní',                  time: 'Hace 10 min', read: false },
  { id: 2, child: 'Diego',  field: 'Medicamentos',  old: '',        new: 'Amoxicilina 5ml 10am',  time: 'Hace 1 hora', read: false },
  { id: 3, child: 'Mateo',  field: 'Cumpleaños',    old: '',        new: '3 marzo 2024',           time: 'Ayer',        read: true  },
];

// ─── Notifications panel ──────────────────────────────────────────────────
function NotifPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
      className="bg-background flex flex-col">
      {/* Header */}
      <div className="bg-[#1E3A8A] px-5 pt-4 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-primary-foreground">Notificaciones</h2>
          <p className="text-xs text-primary-foreground/65">Cambios en perfiles de niños</p>
        </div>
        <button onClick={onClose}
          className="w-9 h-9 bg-primary-foreground/15 rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <X size={16} className="text-primary-foreground" />
        </button>
      </div>

      {/* Mark all read */}
      {notifs.some(n => !n.read) && (
        <div className="px-4 pt-3 pb-1 flex justify-end">
          <button onClick={markAll} className="text-xs font-bold text-primary">
            Marcar todas como leídas
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {notifs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold text-foreground">Sin notificaciones</p>
          </div>
        )}
        {notifs.map(n => (
          <button key={n.id} onClick={() => markRead(n.id)}
            className={`w-full text-left rounded-2xl p-4 shadow-card transition-all active:scale-[0.98] border-l-4 ${
              n.read ? 'bg-card border-transparent opacity-60' : 'bg-card border-primary'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                n.read ? 'bg-muted' : 'bg-primary/10'
              }`}>
                {n.field === 'Alergias' ? '⚠️' : n.field === 'Medicamentos' ? '💊' : n.field === 'Cumpleaños' ? '🎂' : 'ℹ️'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">
                  {n.child} — {n.field} actualizado
                </p>
                {n.new && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nuevo valor: <span className="font-semibold text-foreground">{n.new}</span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 pt-2">
        <p className="text-[10px] text-center text-muted-foreground">
          Solo recibes notificaciones de cambios en: Alergias, Medicamentos, Cumpleaños y Notas
        </p>
      </div>
    </div>
  );
}

// ─── Chat panel ────────────────────────────────────────────────────────────
function ChatPanel() {
  const { parents, chatMessages, sendMessage } = useApp();
  const [openParentId, setOpenParentId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  const parent = parents.find(p => p.id === openParentId);
  const defaultMsgs = parent ? [
    { from: 'r', text: `Hola, ${parent.name.split(' ')[0]}! Todo bien con ${parent.hijo} 😊`, ts: '8:00 AM' },
    { from: 'r', text: parent.msg, ts: parent.time },
  ] : [];
  const msgs = openParentId !== null ? (chatMessages[openParentId] || defaultMsgs) : [];

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs.length]);

  const handleSend = () => {
    if (!text.trim() || openParentId === null) return;
    sendMessage(openParentId, text.trim());
    setText('');
  };

  if (openParentId === null) {
    return (
      <div className="space-y-2.5">
        <p className="text-xs font-bold text-muted-foreground px-1 mb-3">
          Conversaciones con padres — acceso completo
        </p>
        {parents.map(p => {
          const pMsgs = chatMessages[p.id];
          const lastMsg = pMsgs?.length ? pMsgs[pMsgs.length - 1].text : p.msg;
          return (
            <button key={p.id} onClick={() => setOpenParentId(p.id)}
              className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: p.bg, color: p.tc }}>{p.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-foreground text-sm">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground truncate flex-1">{lastMsg}</span>
                  {p.unread > 0 && (
                    <span className="w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-primary-foreground flex items-center justify-center flex-shrink-0">
                      {p.unread}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/60">Hijo: {p.hijo}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <button onClick={() => setOpenParentId(null)}
          className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">←</button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: parent?.bg, color: parent?.tc }}>{parent?.initials}</div>
        <div>
          <p className="font-bold text-foreground text-sm">{parent?.name}</p>
          <p className="text-xs text-muted-foreground">Hijo: {parent?.hijo}</p>
        </div>
      </div>
      <div ref={bodyRef} className="flex-1 overflow-y-auto space-y-2 pb-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 's' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm ${
              m.from === 's'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card text-foreground shadow-card rounded-bl-sm'
            }`}>
              <p>{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from === 's' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{m.ts}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-3 border-t border-border">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 shadow-card" />
        <button onClick={handleSend}
          className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
          <Send size={16} className="text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}


// ─── Log Stepper ──────────────────────────────────────────────────────────
function LogStepper({ present, profile, onSave }: {
  present: any[];
  profile: any;
  onSave: (childId: string, type: string, note: string) => void;
}) {
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [logType, setLogType] = useState('');
  const [logChildId, setLogChildId] = useState<string | null>(null);
  const [logNote, setLogNote] = useState('');
  const [logPhoto, setLogPhoto] = useState<string | null>(null);
  const [childSearch, setChildSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedChild = present.find((c: any) => c.id === logChildId);
  const actMeta = LOG_OPTS.find(a => a.label === logType);

  const handlePickType = (type: string) => {
    setLogType(type);
    setStep(2);
  };

  const handlePickChild = (childId: string) => {
    setLogChildId(childId);
    setStep(3);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!logChildId || !logType) return;
    onSave(logChildId, logType, logNote);
  };

  const reset = () => {
    setStep(1); setLogType(''); setLogChildId(null);
    setLogNote(''); setLogPhoto(null); setChildSearch('');
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-extrabold text-foreground">Registrar actividad</p>
        {step > 1 && (
          <button onClick={reset}
            className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
            Reiniciar
          </button>
        )}
      </div>


      {/* ── PASO 1: Tipo de actividad ──────────────────────────── */}
      {step === 1 && (
        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}>
          <p className="text-xs text-muted-foreground mb-3">Toca para seleccionar y continuar</p>
          <div className="grid grid-cols-4 gap-2.5">
            {LOG_OPTS.map(opt => (
              <button key={opt.type} onClick={() => handlePickType(opt.label)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 active:scale-95 transition-transform aspect-square"
                style={{ background: opt.bg, borderColor: opt.bg }}>
                <span className="text-2xl leading-none">{opt.icon}</span>
                <span className="text-[10px] font-bold text-foreground leading-tight text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PASO 2: Niño ───────────────────────────────────────── */}
      {step === 2 && (
        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}>
          {/* Selected type badge */}
          <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2 mb-4">
            <span className="text-lg">{actMeta?.icon}</span>
            <span className="text-sm font-bold text-primary">{logType}</span>
            <button onClick={() => { setStep(1); setLogType(''); }}
              className="ml-auto text-[10px] font-bold text-muted-foreground">Cambiar</button>
          </div>
          {present.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay niños presentes. Marca la entrada primero.
            </p>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={childSearch}
                  onChange={e => setChildSearch(e.target.value)}
                  placeholder="Buscar niño..."
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 shadow-card"
                />
              </div>
              {/* List */}
              <div className="flex flex-col gap-2.5">
                {present
                  .filter((c: any) => c.name.toLowerCase().includes(childSearch.toLowerCase()))
                  .map((c: any) => (
                    <button key={c.id} onClick={() => handlePickChild(c.id)}
                      className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left border-2 border-transparent">
                      <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center text-xl flex-shrink-0">
                        👶
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.age_months} meses</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  ))}
                {present.filter((c: any) => c.name.toLowerCase().includes(childSearch.toLowerCase())).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Sin resultados</p>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── PASO 3: Nota + foto ─────────────────────────────────── */}
      {step === 3 && (
        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}>
          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-3.5 mb-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{actMeta?.icon}</span>
              <div>
                <p className="font-bold text-foreground text-sm">{logType}</p>
                <p className="text-xs text-muted-foreground">para {selectedChild?.name}</p>
              </div>
              <button onClick={() => { setStep(2); setLogChildId(null); }}
                className="ml-auto text-[10px] font-bold text-muted-foreground">Cambiar</button>
            </div>
          </div>

          {/* Nota */}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Nota (opcional)
          </p>
          <textarea value={logNote} onChange={e => setLogNote(e.target.value)}
            placeholder="Describe lo que pasó..." rows={3}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none shadow-card mb-4" />

          {/* Foto */}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Foto (opcional)
          </p>
          {logPhoto ? (
            <div className="relative mb-4">
              <img src={logPhoto} alt="preview"
                className="w-full h-48 object-cover rounded-xl border border-border" />
              <button onClick={() => setLogPhoto(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-foreground/70 rounded-full flex items-center justify-center">
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-28 bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-4">
              <span className="text-2xl">📷</span>
              <span className="text-xs font-bold text-muted-foreground">Toca para subir foto</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            onChange={handlePhoto} className="hidden" />

          {/* Preview */}
          <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-semibold mb-4">
            {actMeta?.icon} {logType} para <strong>{selectedChild?.name}</strong> — registrado por{' '}
            <strong>{profile?.name}</strong>
          </div>

          <button onClick={handleSave}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-base shadow-elevated active:scale-[0.98] transition-transform">
            Guardar actividad ✓
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function CaregiverDashboard() {
  const { profile, daycare, logout, getChildren, getActivities, getUserById,
    isPresent, togglePresence, addActivity } = useSupabase();
  const { logout: appLogout, children: appChildren } = useApp();
  const navigate = useNavigate();

  const [tab, setTab]           = useState<'children' | 'log' | 'today' | 'chat'>('children');
  const [logOk, setLogOk]       = useState(false);
  const [, tick]                = useState(0);
  const refresh = () => tick(n => n + 1);

  const supaChildren  = getChildren();
  const activities    = getActivities();
  const present       = supaChildren.filter(c => isPresent(c.id));
  const absent        = supaChildren.filter(c => !isPresent(c.id));

  // Tiempo sin actividad por niño basado en la actividad más reciente
  const getMinsSinceActivity = (childId: string): number => {
    const childActivities = activities.filter(a => a.child_id === childId);
    if (childActivities.length === 0) return 9999; // nunca registrado = al final sin actividad
    const latest = childActivities.reduce((a, b) =>
      new Date(a.created_at) > new Date(b.created_at) ? a : b
    );
    return Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 60000);
  };

  const sinActividadLabel = (mins: number): string => {
    if (mins >= 9999) return 'Sin actividades registradas';
    if (mins === 0) return 'Actividad ahora mismo';
    if (mins < 60) return `Sin actividad hace ${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `Sin actividad hace ${h}h` : `Sin actividad hace ${h}h ${m}min`;
  };

  // Ordenar presentes: mayor tiempo sin actividad primero
  const presentSorted = [...present].sort((a, b) =>
    getMinsSinceActivity(b.id) - getMinsSinceActivity(a.id)
  );

  const handleToggle = (childId: string) => { togglePresence(childId); refresh(); };


  const handleLogout = () => { logout(); appLogout(); navigate('/'); };

  const getAppChildId = (name: string) => {
    const found = appChildren.find(c => c.name.toLowerCase() === name.toLowerCase());
    return found?.id ?? appChildren[0]?.id ?? 0;
  };

  const TABS = [
    { id: 'children', label: 'Niños',       Icon: Users         },
    { id: 'log',      label: 'Actividades', Icon: ClipboardList },
    { id: 'today',    label: 'Hoy',         Icon: Clock         },
    { id: 'chat',     label: 'Chat',        Icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-6" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="bg-[#1E3A8A] px-5 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar del cuidador sin borde */}
            <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl shadow-soft flex-shrink-0">
              👤
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary-foreground/60 tracking-wider uppercase">{daycare?.name}</p>
              <h1 className="text-xl font-extrabold text-primary-foreground">
                Hola, {profile?.name?.split(' ')[0]} 👋
              </h1>
              <span className="inline-block bg-primary-foreground/15 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                Cuidador/a
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Logout */}
            <button onClick={handleLogout}
              className="w-9 h-9 bg-primary-foreground/15 rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <LogOut size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-primary-foreground/10 rounded-xl p-1">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                tab === id ? 'bg-card text-primary shadow-soft' : 'text-primary-foreground/70'
              }`}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-4">

        {/* NIÑOS — solo presentes, sin entrada/salida, tappable al perfil */}
        {tab === 'children' && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-card rounded-xl p-3 text-center shadow-card">
                <div className="text-xl font-extrabold text-success">{present.length}</div>
                <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Presentes</div>
              </div>
              <div className="flex-1 bg-card rounded-xl p-3 text-center shadow-card">
                <div className="text-xl font-extrabold text-primary">{supaChildren.length}</div>
                <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">Total</div>
              </div>
            </div>

            <p className="text-sm font-extrabold text-foreground mb-2">Niños presentes hoy</p>
            <div className="space-y-2.5 mb-4">
              {present.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="text-3xl mb-2">🌅</div>
                  <div className="text-sm font-bold text-foreground">Nadie ha llegado aún</div>
                  <div className="text-xs mt-1">Registra la entrada en la pestaña Actividades</div>
                </div>
              )}
              {presentSorted.map((c, i) => {
                const mins = getMinsSinceActivity(c.id);
                const isWarn = mins >= 60;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <button onClick={() => navigate(`/child/${getAppChildId(c.name)}`)}
                      className="w-full bg-card rounded-2xl p-3.5 shadow-card active:scale-[0.98] transition-transform text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center text-2xl flex-shrink-0 relative">
                          👶
                          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground text-sm flex items-center gap-1">
                            {c.name}
                            {c.allergies && (
                              <span className="bg-destructive/10 text-destructive rounded-md px-1.5 py-px text-[10px] font-bold">⚠</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.age_months} meses</div>
                          {c.medical_conditions && (
                            <div className="text-[10px] text-warning font-bold mt-0.5">💊 {c.medical_conditions}</div>
                          )}
                          <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 ${isWarn ? 'bg-warning-light' : 'bg-success-light'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isWarn ? 'bg-warning' : 'bg-success'}`} />
                            <span className={`text-[10px] font-bold ${isWarn ? 'text-warning-foreground' : 'text-success'}`}>
                              {sinActividadLabel(mins)}
                            </span>
                          </div>
                        </div>
                        <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          <ChevronRight size={14} className="text-primary" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* REGISTRAR — stepper: tipo → niño → nota+foto */}
        {tab === 'log' && (
          <LogStepper
            present={present}
            profile={profile}
            onSave={(childId, type, note) => {
              addActivity({
                daycare_id: daycare?.id || 'dc1',
                child_id: childId,
                created_by: profile?.id || 'u2',
                type,
                note,
              });
              refresh();
              setLogOk(true);
              setTimeout(() => setLogOk(false), 2500);
              setTab('today');
            }}
          />
        )}

        {/* HOY */}
        {tab === 'today' && (
          <>
            <p className="text-sm font-extrabold text-foreground mb-3">Actividades de hoy</p>
            {logOk && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-success-light text-success rounded-xl px-4 py-3 text-sm font-bold mb-3">
                ✓ Actividad guardada.
              </motion.div>
            )}
            <div className="space-y-2.5">
              {activities.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Aún no hay actividades registradas.
                </div>
              )}
              {activities.map((a, i) => {
                const child = supaChildren.find(c => c.id === a.child_id);
                const by    = getUserById(a.created_by);
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-2xl p-3.5 shadow-card">
                    <div className="flex gap-3 items-start">
                      <ActivityIcon
                        type={a.type.toLowerCase().replace('foto del día', 'foto')}
                        size={44} iconSize={20}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-sm">
                          {a.type} a las {fmtTime(a.created_at)}
                        </div>
                        {a.note && (
                          <div className="text-xs text-muted-foreground mt-0.5">{a.note}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            👶 {child?.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            por <span className="font-semibold text-foreground">{by?.name || 'Cuidador'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* CHAT */}
        {tab === 'chat' && <ChatPanel />}

      </div>

    </div>
  );
}
