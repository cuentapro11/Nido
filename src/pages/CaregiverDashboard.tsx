import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp, LOG_OPTS } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityIcon from '@/components/ActivityIcon';
import {
  LogOut, Users, ClipboardList, Clock, MessageSquare, Send,
  ChevronRight, Bell, X, Search, Home, MoreHorizontal,
  User, BookOpen, Settings, Lock, Building2, Save, Eye, EyeOff
} from 'lucide-react';

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' : ''}${m} ${ap}`;
};

const MOCK_NOTIFS = [
  { id: 1, child: 'Sofía',  field: 'Alergias',    new: 'Maní',             time: 'Hace 10 min', read: false },
  { id: 2, child: 'Diego',  field: 'Medicamentos', new: 'Amoxicilina 5ml', time: 'Hace 1 hora', read: false },
  { id: 3, child: 'Mateo',  field: 'Cumpleaños',   new: '3 marzo 2024',    time: 'Ayer',        read: true  },
];

// ─── Notification Panel ───────────────────────────────────────────────────
function NotifPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const markRead = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <div className="bg-[#1E3A8A] px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white">Notificaciones</h2>
          <p className="text-xs text-white/65">Cambios en perfiles de niños</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center active:scale-95">
          <X size={16} className="text-white" />
        </button>
      </div>
      {notifs.some(n => !n.read) && (
        <div className="px-4 pt-3 flex justify-end">
          <button onClick={markAll} className="text-xs font-bold text-primary">Marcar todas como leídas</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {notifs.map(n => (
          <button key={n.id} onClick={() => markRead(n.id)}
            className={`w-full text-left rounded-2xl p-4 shadow-card transition-all active:scale-[0.98] border-l-4 ${
              n.read ? 'bg-card border-transparent opacity-60' : 'bg-card border-primary'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                {n.field === 'Alergias' ? '⚠️' : n.field === 'Medicamentos' ? '💊' : '🎂'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{n.child} — {n.field} actualizado</p>
                <p className="text-xs text-muted-foreground mt-0.5">Nuevo: <span className="font-semibold text-foreground">{n.new}</span></p>
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

// ─── Chat Panel ───────────────────────────────────────────────────────────
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

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }); }, [msgs.length]);

  const handleSend = () => {
    if (!text.trim() || openParentId === null) return;
    sendMessage(openParentId, text.trim());
    setText('');
  };

  if (openParentId === null) {
    return (
      <div className="space-y-2.5 px-4 pt-4">
        <p className="text-sm font-extrabold text-foreground mb-3">Chat</p>
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
                    <span className="w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-primary-foreground flex items-center justify-center flex-shrink-0">{p.unread}</span>
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
    <div className="flex flex-col px-4 pt-4" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <button onClick={() => setOpenParentId(null)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold">←</button>
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
              m.from === 's' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card text-foreground shadow-card rounded-bl-sm'
            }`}>
              <p>{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.from === 's' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{m.ts}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-3 border-t border-border pb-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 shadow-card" />
        <button onClick={handleSend} className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
          <Send size={16} className="text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Más Panel ────────────────────────────────────────────────────────────
function MasPanel({ profile, daycare, cuidadores, aulas, cuidadorAulaMap, onLogout }: {
  profile: any; daycare: any; cuidadores: any[]; aulas: any[]; cuidadorAulaMap: Record<number,number>; onLogout: () => void;
}) {
  const navigate = useNavigate();
  const { show } = useApp() as any;
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Datos del cuidador actual (mock id=1 por demo)
  const myCuidador = cuidadores[0] ?? { nombre: profile?.name ?? 'Cuidador/a', rol: 'Cuidadora principal' };
  const myAulaId   = cuidadorAulaMap[myCuidador.id ?? 1];
  const myAula     = aulas.find(a => a.id === myAulaId);

  // Formularios
  const [nombre, setNombre] = useState(myCuidador.nombre);
  const [email,  setEmail]  = useState(profile?.email ?? 'cuidador@cuido.app');
  const [pwActual, setPwActual]   = useState('');
  const [pwNueva,  setPwNueva]    = useState('');
  const [pwConf,   setPwConf]     = useState('');
  const [showPw,   setShowPw]     = useState(false);

  function SectionLabel({ label }: { label: string }) {
    return <div className="px-4 pt-5 pb-2"><p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p></div>;
  }

  function NavRow({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc?: string; onClick: () => void }) {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-muted/60 transition-colors text-left">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
      </button>
    );
  }

  // ── Sub-panels ────────────────────────────────────────────────────────
  if (activePanel === 'info') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
          <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-95">
            <ChevronRight size={18} className="text-foreground rotate-180" />
          </button>
          <span className="text-base font-bold text-foreground">Información personal</span>
        </div>
        <div className="px-4 pt-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nombre completo</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">Este correo fue asignado por el administrador.</p>
          </div>
          <button className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Save size={16} /> Guardar cambios
          </button>
        </div>
      </div>
    );
  }

  if (activePanel === 'password') {
    const handleSavePw = () => {
      if (!pwActual) { alert('Ingresa tu contraseña actual'); return; }
      if (pwNueva.length < 6) { alert('La nueva contraseña debe tener al menos 6 caracteres'); return; }
      if (pwNueva !== pwConf) { alert('Las contraseñas no coinciden'); return; }
      setPwActual(''); setPwNueva(''); setPwConf('');
      setActivePanel(null);
    };
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
          <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-95">
            <ChevronRight size={18} className="text-foreground rotate-180" />
          </button>
          <span className="text-base font-bold text-foreground">Cambiar contraseña</span>
        </div>
        <div className="px-4 pt-5 space-y-4">
          {[
            { label: 'Contraseña actual', val: pwActual, set: setPwActual },
            { label: 'Nueva contraseña',  val: pwNueva,  set: setPwNueva  },
            { label: 'Confirmar nueva',   val: pwConf,   set: setPwConf   },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 pr-11 text-sm text-foreground outline-none focus:border-primary" />
                <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground px-1">La contraseña fue creada por el administrador del cuido. Puedes actualizarla aquí.</p>
          <button onClick={handleSavePw} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            <Save size={16} /> Actualizar contraseña
          </button>
        </div>
      </div>
    );
  }

  if (activePanel === 'salon') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
          <button onClick={() => setActivePanel(null)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-95">
            <ChevronRight size={18} className="text-foreground rotate-180" />
          </button>
          <span className="text-base font-bold text-foreground">Mi salón</span>
        </div>
        <div className="px-4 pt-5">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Salón asignado</p>
          <div className="space-y-2.5">
            {aulas.map(a => (
              <div key={a.id} className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl border-2 transition-colors ${
                a.id === myAulaId ? 'border-primary bg-primary/5' : 'border-border bg-card opacity-50'
              }`}>
                <span className="text-2xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{a.nombre}</p>
                  {a.id === myAulaId && <p className="text-xs text-primary font-semibold mt-0.5">Tu salón actual</p>}
                </div>
                {a.id === myAulaId && <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 px-1">El salón es asignado por el administrador. Contacta al admin si necesitas un cambio.</p>
        </div>
      </div>
    );
  }

  // ── Vista principal de Más ─────────────────────────────────────────────
  return (
    <div className="pb-8">
      {/* Card de perfil — mismo estilo que admin */}
      <div className="bg-card shadow-card overflow-hidden">
        <div className="bg-[#1E3A8A] px-4 py-4 flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            {daycare?.emoji ?? '🐣'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-base">{daycare?.name ?? 'Cuido Rayito de Sol ☀️'}</p>
            <p className="text-white/60 text-xs mt-0.5">{myCuidador.rol}</p>
          </div>
        </div>
      </div>

      {/* Mi perfil */}
      <div className="bg-card shadow-card overflow-hidden divide-y divide-border mt-3 mx-0">
        <SectionLabel label="Mi perfil" />
        <NavRow icon={User}      label="Información personal"  desc={nombre}          onClick={() => setActivePanel('info')} />
        <NavRow icon={Lock}      label="Cambiar contraseña"    desc="Actualiza tu acceso" onClick={() => setActivePanel('password')} />
        <NavRow icon={Building2} label="Mi salón"              desc={myAula?.nombre ?? 'Sin asignar'} onClick={() => setActivePanel('salon')} />
      </div>

      {/* Herramientas */}
      <div className="bg-card shadow-card overflow-hidden divide-y divide-border mt-3 mx-0">
        <SectionLabel label="Herramientas" />
        <NavRow icon={BookOpen} label="Reporte Diario"  desc="Solo mis niños"         onClick={() => navigate('/reporte-diario')} />
        <NavRow icon={Settings} label="Configuración"   desc="Notificaciones, idioma" onClick={() => navigate('/configuracion-general')} />
      </div>

      {/* Cerrar sesión */}
      <div className="mt-3 mx-0">
        <button onClick={onLogout}
          className="w-full bg-card shadow-card py-4 text-center text-destructive font-bold text-sm active:scale-[0.98] transition-transform">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ─── Log Stepper ──────────────────────────────────────────────────────────
function LogStepper({ present, profile, onSave }: {
  present: any[]; profile: any; onSave: (childId: string, type: string, note: string) => void;
}) {
  const [step, setStep]     = useState<1|2|3>(1);
  const [logType, setLogType] = useState('');
  const [logChildId, setLogChildId] = useState<string|null>(null);
  const [logNote, setLogNote] = useState('');
  const [logPhoto, setLogPhoto] = useState<string|null>(null);
  const [childSearch, setChildSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedChild = present.find((c: any) => c.id === logChildId);
  const actMeta = LOG_OPTS.find(a => a.label === logType);
  const reset = () => { setStep(1); setLogType(''); setLogChildId(null); setLogNote(''); setLogPhoto(null); setChildSearch(''); };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-extrabold text-foreground">Registrar actividad</p>
        {step > 1 && <button onClick={reset} className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg active:scale-95">Reiniciar</button>}
      </div>

      {step === 1 && (
        <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>
          <p className="text-xs text-muted-foreground mb-3">Toca para seleccionar y continuar</p>
          <div className="grid grid-cols-4 gap-2.5">
            {LOG_OPTS.map(opt => {
              const isEntryExit = opt.type === 'entry' || opt.type === 'exit';
              const blocked = !isEntryExit && present.length === 0;
              return (
                <button key={opt.type}
                  onClick={() => {
                    if (blocked) return;
                    setLogType(opt.label); setStep(2);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-transform aspect-square ${blocked ? 'opacity-35 cursor-not-allowed' : 'active:scale-95'}`}
                  style={{ background: opt.bg, borderColor: opt.bg }}>
                  <span className="text-2xl leading-none">{opt.icon}</span>
                  <span className="text-[10px] font-bold text-foreground leading-tight text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
          {present.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3 bg-muted rounded-xl px-3 py-2">
              🚪 Solo puedes registrar <strong>Entrada</strong>. Las demás actividades se habilitarán cuando el niño llegue.
            </p>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>
          <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2 mb-4">
            <span className="text-lg">{actMeta?.icon}</span>
            <span className="text-sm font-bold text-primary">{logType}</span>
            <button onClick={() => { setStep(1); setLogType(''); }} className="ml-auto text-[10px] font-bold text-muted-foreground">Cambiar</button>
          </div>
          {present.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay niños presentes. Registra la entrada primero.</p>
          ) : (
            <>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={childSearch} onChange={e => setChildSearch(e.target.value)} placeholder="Buscar niño..."
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 shadow-card" />
              </div>
              <div className="flex flex-col gap-2.5">
                {present.filter((c:any) => c.name.toLowerCase().includes(childSearch.toLowerCase())).map((c:any) => (
                  <button key={c.id} onClick={() => { setLogChildId(c.id); setStep(3); }}
                    className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left border-2 border-transparent">
                    <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center text-xl flex-shrink-0">👶</div>
                    <div className="flex-1"><p className="font-bold text-foreground text-sm">{c.name}</p><p className="text-xs text-muted-foreground">{c.age_months} meses</p></div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {step === 3 && (
        <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>
          <div className="bg-card border border-border rounded-2xl p-3.5 mb-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{actMeta?.icon}</span>
              <div><p className="font-bold text-foreground text-sm">{logType}</p><p className="text-xs text-muted-foreground">para {selectedChild?.name}</p></div>
              <button onClick={() => { setStep(2); setLogChildId(null); }} className="ml-auto text-[10px] font-bold text-muted-foreground">Cambiar</button>
            </div>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Nota (opcional)</p>
          <textarea value={logNote} onChange={e => setLogNote(e.target.value)} placeholder="Describe lo que pasó..." rows={3}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none shadow-card mb-4" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Foto (opcional)</p>
          {logPhoto ? (
            <div className="relative mb-4">
              <img src={logPhoto} alt="preview" className="w-full h-48 object-cover rounded-xl border border-border" />
              <button onClick={() => setLogPhoto(null)} className="absolute top-2 right-2 w-7 h-7 bg-foreground/70 rounded-full flex items-center justify-center"><X size={14} className="text-white" /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-28 bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-4">
              <span className="text-2xl">📷</span><span className="text-xs font-bold text-muted-foreground">Toca para subir foto</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          <div className="bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 text-sm text-primary font-semibold mb-4">
            {actMeta?.icon} {logType} para <strong>{selectedChild?.name}</strong> — por <strong>{profile?.name}</strong>
          </div>
          <button onClick={() => onSave(logChildId!, logType, logNote)}
            className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-base shadow-elevated active:scale-[0.98] transition-transform">
            Guardar actividad ✓
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────
const CAREGIVER_TABS = [
  { id: 'inicio',   label: 'Inicio',  Icon: Home,           color: 'hsl(240,60%,62%)' },
  { id: 'children', label: 'Niños',   Icon: Users,          color: 'hsl(25,90%,58%)'  },
  { id: 'chat',     label: 'Chat',    Icon: MessageSquare,  color: 'hsl(200,65%,50%)' },
  { id: 'mas',      label: 'Más',     Icon: MoreHorizontal, color: 'hsl(290,55%,55%)' },
];

// ─── Main ─────────────────────────────────────────────────────────────────
export default function CaregiverDashboard() {
  const { profile, daycare, logout, getChildren, getActivities, getUserById,
    isPresent, togglePresence, addActivity } = useSupabase();
  const { logout: appLogout, children: appChildren, cuidadores, aulas, cuidadorAulaMap } = useApp();
  const navigate = useNavigate();

  const [tab, setTab]         = useState<'inicio'|'children'|'chat'|'mas'>('inicio');
  const [showNotifs, setShowNotifs] = useState(false);
  const [logOk, setLogOk]     = useState(false);
  const [, tick]               = useState(0);
  const refresh = () => tick(n => n + 1);

  const supaChildren = getChildren();
  const activities   = getActivities();
  const present      = supaChildren.filter(c => isPresent(c.id));

  const getMinsSinceActivity = (childId: string) => {
    const acts = activities.filter(a => a.child_id === childId);
    if (!acts.length) return 9999;
    const latest = acts.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
    return Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 60000);
  };

  const sinActividadLabel = (mins: number) => {
    if (mins >= 9999) return 'Sin actividades registradas';
    if (mins === 0) return 'Actividad ahora mismo';
    if (mins < 60)  return `Sin actividad hace ${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m === 0 ? `Sin actividad hace ${h}h` : `Sin actividad hace ${h}h ${m}min`;
  };

  const presentSorted = [...present].sort((a, b) => getMinsSinceActivity(b.id) - getMinsSinceActivity(a.id));
  const unreadNotifs  = MOCK_NOTIFS.filter(n => !n.read).length;
  const handleLogout  = () => { logout(); appLogout(); navigate('/'); };
  const getAppChildId = (name: string) => {
    const found = appChildren.find(c => c.name.toLowerCase() === name.toLowerCase());
    return found?.id ?? appChildren[0]?.id ?? 0;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence>{showNotifs && <NotifPanel onClose={() => setShowNotifs(false)} />}</AnimatePresence>

      {/* ── HEADER — solo en Inicio y Actividades ────────────────── */}
      {(tab === 'inicio' || tab === 'log') && (
        <div className="bg-[#1E3A8A] px-5 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
              {daycare?.emoji ?? '🐣'}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Cuidador/a</p>
              <h1 className="text-xl font-extrabold text-white leading-tight">{profile?.name ?? 'Ana García'}</h1>
            </div>
          </div>
          <button onClick={() => setShowNotifs(true)}
            className="relative w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center active:scale-90 transition-transform">
            <Bell size={18} className="text-white" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1 border-2 border-[#1E3A8A]">
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── CONTENT ──────────────────────────────────────────────── */}

      {/* INICIO */}
      {tab === 'inicio' && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-extrabold text-foreground">Con entrada hoy</span>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">{present.length} niños</span>
          </div>
          <div className="space-y-2.5">
            {present.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-3xl mb-2">🌅</div>
                <div className="text-sm font-bold text-foreground">Todo tranquilo</div>
                <div className="text-xs mt-1">Nadie ha llegado aún.</div>
              </div>
            )}
            {presentSorted.map((c, i) => {
              const mins = getMinsSinceActivity(c.id);
              const isWarn = mins >= 60;
              return (
                <motion.div key={c.id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}>
                  <button onClick={() => navigate(`/child/${getAppChildId(c.name)}`)}
                    className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0">👶</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.age_months} meses</div>
                      <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 ${isWarn ? 'bg-warning-light' : 'bg-success-light'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isWarn ? 'bg-warning' : 'bg-success'}`} />
                        <span className={`text-[10px] font-bold ${isWarn ? 'text-warning-foreground' : 'text-success'}`}>{sinActividadLabel(mins)}</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ChevronRight size={14} className="text-primary" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* NIÑOS — sin header azul */}
      {tab === 'children' && (
        <div className="px-4 pt-10">
          <p className="text-sm font-extrabold text-foreground mb-3">Mis niños</p>
          <div className="space-y-2.5">
            {supaChildren.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
                <button onClick={() => navigate(`/child/${getAppChildId(c.name)}`)}
                  className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl flex-shrink-0">👶</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.age_months} meses</div>
                    <div className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold ${isPresent(c.id) ? 'text-success' : 'text-destructive'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPresent(c.id) ? 'bg-success' : 'bg-destructive'}`} />
                      {isPresent(c.id) ? 'Presente' : 'Ausente'}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT — sin header azul */}
      {tab === 'chat' && <ChatPanel />}

      {/* MÁS — sin header azul */}
      {tab === 'mas' && (
        <MasPanel
          profile={profile}
          daycare={daycare}
          cuidadores={cuidadores}
          aulas={aulas}
          cuidadorAulaMap={cuidadorAulaMap}
          onLogout={handleLogout}
        />
      )}

      {/* ── BOTTOM NAV ──────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-30">
        <div className="flex h-16">
          {CAREGIVER_TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-all">
                <t.Icon size={22} strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? t.color : undefined }}
                  className={active ? '' : 'text-muted-foreground/60'} />
                <span className={`text-[10px] font-semibold ${active ? '' : 'text-muted-foreground/60'}`}
                  style={active ? { color: t.color } : undefined}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
