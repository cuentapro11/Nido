import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import BottomSheet from '@/components/BottomSheet';
import {
  Building2, Users, Baby, ClipboardList,
  CreditCard, HelpCircle, ChevronRight, Copy, Plus, Trash2,
  X, Check, Pencil, LogOut, Settings, LayoutGrid,
  BookOpen, Search, Mail, Lock
} from 'lucide-react';

function EditField({ label, value, placeholder, onSave }: {
  label: string; value: string; placeholder: string; onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const save = () => { onSave(draft); setEditing(false); };
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {editing ? (
        <div className="flex items-center gap-2 flex-1 ml-4">
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} autoFocus
            className="flex-1 bg-secondary border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary text-right" />
          <button onClick={save} className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Check size={13} className="text-primary-foreground" />
          </button>
        </div>
      ) : (
        <button onClick={() => { setDraft(value); setEditing(true); }} className="flex items-center gap-2 text-right group ml-4">
          <span className={`text-sm ${value ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>{value || placeholder}</span>
          <Pencil size={12} className="text-muted-foreground/40 group-active:text-primary flex-shrink-0" />
        </button>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-1 pt-1 pb-1">
      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{label}</p>
    </div>
  );
}

function NavItem({ icon: Icon, label, desc, onClick, badge }: {
  icon: any; label: string; desc?: string; onClick: () => void; badge?: string;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-muted/50 transition-colors text-left">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted text-foreground">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {badge && <span className="text-[9px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
        {desc && <span className="text-xs text-muted-foreground">{desc}</span>}
      </div>
      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
    </button>
  );
}

export default function Configuracion() {
  const {
    cuidoInfo, updateCuidoInfo, planActivo, setPlan,
    cuidadores, addCuidador, removeCuidador, updateCuidador, cuidoCode,
    parents, removeParent, pagoConfig, updatePagoConfig, children, logout,
    pendingSolicitudes,
  } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const photoRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showAddCuidador, setShowAddCuidador] = useState(false);
  const [editCuidador, setEditCuidador] = useState<typeof cuidadores[0] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nombre: string } | null>(null);
  const [newCuidador, setNewCuidador] = useState({ nombre: '', rol: 'Cuidadora principal', email: '', password: '' });
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [confirmDeleteParent, setConfirmDeleteParent] = useState<{ id: number; name: string } | null>(null);
  const [searchEquipo, setSearchEquipo] = useState('');

  const PLANES = [
    { id: 'basico',  label: 'Básico',   desc: 'hasta 15 niños', precio: 'RD$900/mes' },
    { id: 'pro',     label: 'Pro',      desc: 'hasta 30 niños', precio: 'RD$1,700/mes' },
    { id: 'premium', label: 'Premium',  desc: 'ilimitados',     precio: 'RD$3,500/mes' },
  ] as const;

  const ROLES  = ['Cuidadora principal','Asistente','Apoyo'];

  const openEditCuidador = (c: typeof cuidadores[0]) => {
    setEditCuidador(c);
    setNewCuidador({ nombre: c.nombre, rol: c.rol, email: '', password: '' });
    setShowAddCuidador(true);
  };

  const handleSaveCuidador = () => {
    if (!newCuidador.nombre.trim()) { show('Ingresa el nombre'); return; }
    if (editCuidador) {
      updateCuidador(editCuidador.id, { nombre: newCuidador.nombre, rol: newCuidador.rol });
      show('Cuidador actualizado');
    } else {
      if (!newCuidador.email.trim() || !newCuidador.password.trim()) { show('Correo y contraseña son requeridos'); return; }
      if (newCuidador.password.length < 6) { show('La contraseña debe tener al menos 6 caracteres'); return; }
      addCuidador({ nombre: newCuidador.nombre, rol: newCuidador.rol, emoji: '👤', activo: true });
      show('Cuidador creado');
    }
    setNewCuidador({ nombre: '', rol: 'Cuidadora principal', email: '', password: '' });
    setEditCuidador(null);
    setShowAddCuidador(false);
  };

  const filteredCuidadores = cuidadores.filter(c =>
    c.nombre.toLowerCase().includes(searchEquipo.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Administración" />
      <div className="px-3.5 space-y-3 pt-1">

        {/* Profile card */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] px-4 py-4 flex items-center gap-3">
            <button onClick={() => photoRef.current?.click()} className="relative flex-shrink-0 active:scale-95 transition-transform">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Perfil" className="w-16 h-16 rounded-full object-cover shadow-soft" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl shadow-soft">{cuidoInfo.emoji}</div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-soft border border-border">
                <span className="text-xs">📷</span>
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-extrabold text-base">{cuidoInfo.nombre}</p>
              <p className="text-primary-foreground/60 text-xs">{children.length} niños · {cuidadores.length} cuidadores</p>
            </div>
          </div>
        </div>
        <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { setProfilePhoto(reader.result as string); show('Foto actualizada'); };
            reader.readAsDataURL(file);
          }} />

        {/* SECCIÓN 1: GESTIÓN PRINCIPAL */}
        <SectionLabel label="Gestión principal" />
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <NavItem icon={Building2} label="Centro" desc="Nombre, dirección, horarios" onClick={() => setActivePanel('centro')} />
          <NavItem icon={Users} label="Equipo" desc={`${cuidadores.length} cuidadores`} onClick={() => setActivePanel('equipo')} />
          <NavItem icon={Baby} label="Niños y Familias" desc={`${children.length} niños · ${parents.length} familias`} onClick={() => setActivePanel('familias')} />
          <NavItem icon={ClipboardList} label="Solicitudes" desc="Aprueba o rechaza acceso"
            onClick={() => navigate('/solicitudes')}
            badge={pendingSolicitudes.length > 0 ? String(pendingSolicitudes.length) : undefined}
          />
        </div>

        {/* SECCIÓN 2: CONTROL OPERATIVO */}
        <SectionLabel label="Control operativo" />
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <NavItem icon={LayoutGrid} label="Aulas" desc="Salones y asignaciones"
            onClick={() => navigate('/aulas')} />
          <NavItem icon={BookOpen} label="Reporte Diario" desc="Registro de actividades"
            onClick={() => navigate('/reporte-diario')} />
        </div>

        {/* SECCIÓN 3: SISTEMA */}
        <SectionLabel label="Sistema" />
        <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
          <NavItem icon={CreditCard} label="Pagos y Suscripción" desc={`Plan ${planActivo}`} onClick={() => setActivePanel('pagos')} />
          <NavItem icon={Settings} label="Configuración" desc="Notificaciones, idioma" onClick={() => navigate('/configuracion-general')} />
          <NavItem icon={HelpCircle} label="Soporte" desc="Ayuda y contacto" onClick={() => show('Próximamente')} />
        </div>

        {/* Cerrar sesión */}
        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full bg-card rounded-2xl shadow-card p-4 flex items-center gap-3 active:scale-[0.98] transition-transform mt-2">
          <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
            <LogOut size={20} className="text-destructive" />
          </div>
          <span className="text-sm font-semibold text-destructive">Cerrar sesión</span>
        </button>
      </div>

      {/* PANEL: Centro */}
      <BottomSheet open={activePanel === 'centro'} onClose={() => setActivePanel(null)}>
        <h3 className="text-lg font-extrabold text-foreground mb-4">Centro</h3>
        <EditField label="Nombre" value={cuidoInfo.nombre.replace(' ☀️','')} placeholder="Nombre del cuido" onSave={v => { updateCuidoInfo({ nombre: v }); show('Guardado'); }} />
        <EditField label="Dirección" value={cuidoInfo.direccion} placeholder="Agrega dirección" onSave={v => { updateCuidoInfo({ direccion: v }); show('Guardado'); }} />
        <EditField label="Teléfono" value={cuidoInfo.telefono} placeholder="829-000-0000" onSave={v => { updateCuidoInfo({ telefono: v }); show('Guardado'); }} />
        <EditField label="Apertura" value={cuidoInfo.horarioApertura} placeholder="7:00 AM" onSave={v => { updateCuidoInfo({ horarioApertura: v }); show('Guardado'); }} />
        <EditField label="Cierre" value={cuidoInfo.horarioCierre} placeholder="6:00 PM" onSave={v => { updateCuidoInfo({ horarioCierre: v }); show('Guardado'); }} />
        <EditField label="Capacidad máx." value={cuidoInfo.capacidadMax ? String(cuidoInfo.capacidadMax) : ''} placeholder="Ej: 20" onSave={v => { updateCuidoInfo({ capacidadMax: parseInt(v) || null }); show('Guardado'); }} />
      </BottomSheet>

      {/* PANEL: Equipo */}
      <BottomSheet open={activePanel === 'equipo'} onClose={() => setActivePanel(null)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-foreground">Equipo</h3>
          <button onClick={() => { setEditCuidador(null); setNewCuidador({ nombre:'', rol:'Cuidadora principal', email:'', password:'' }); setShowAddCuidador(true); }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-xl active:scale-95">
            <Plus size={12} /> Agregar
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchEquipo}
            onChange={e => setSearchEquipo(e.target.value)}
            placeholder="Buscar cuidador..."
            className="w-full bg-muted border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2.5">
          {filteredCuidadores.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {searchEquipo ? 'Sin resultados' : 'Sin cuidadores'}
              </p>
            </div>
          )}
          {filteredCuidadores.map(c => (
            <div key={c.id} className="bg-muted rounded-2xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-card shadow-soft flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
                  {c.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{c.nombre}</p>
                  <p className="text-xs text-muted-foreground">{c.rol}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEditCuidador(c)} className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center active:scale-95">
                    <Pencil size={13} className="text-primary" />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: c.id, nombre: c.nombre })} className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center active:scale-95">
                    <Trash2 size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* PANEL: Familias */}
      <BottomSheet open={activePanel === 'familias'} onClose={() => setActivePanel(null)}>
        <h3 className="text-lg font-extrabold text-foreground mb-4">Niños y Familias</h3>
        <div className="mb-4">
          <p className="text-xs font-bold text-muted-foreground mb-2">Código de invitación</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3">
              <span className="font-extrabold text-foreground tracking-widest">{cuidoCode}</span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(cuidoCode).catch(()=>{}); show('Código copiado'); }}
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center active:scale-95 flex-shrink-0">
              <Copy size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl mb-4 text-sm active:scale-[0.98]">
          Invitar padre / madre
        </button>
        <p className="text-xs font-bold text-muted-foreground mb-2">Familias vinculadas</p>
        {parents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin familias vinculadas.</p>}
        {parents.map(p => (
          <div key={p.id} className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: p.bg, color: p.tc }}>{p.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">Hijo: {p.hijo}</p>
            </div>
            <button onClick={() => setConfirmDeleteParent({ id: p.id, name: p.name })}
              className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center active:scale-95">
              <Trash2 size={14} className="text-destructive" />
            </button>
          </div>
        ))}
      </BottomSheet>

      {/* PANEL: Pagos */}
      <BottomSheet open={activePanel === 'pagos'} onClose={() => setActivePanel(null)}>
        <h3 className="text-lg font-extrabold text-foreground mb-4">Pagos y Suscripción</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Plan</p>
        <div className="space-y-2 mb-5">
          {PLANES.map(p => {
            const active = planActivo === p.id;
            return (
              <button key={p.id} onClick={() => { setPlan(p.id); show('Plan ' + p.label); }}
                className={`w-full rounded-xl p-3.5 text-left flex items-center gap-3 active:scale-[0.98] border-2 ${active ? 'border-primary bg-primary/5' : 'border-border bg-muted'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-primary bg-primary' : 'border-border'}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1"><span className="font-bold text-foreground text-sm">{p.label}</span><span className="text-xs text-muted-foreground ml-2">{p.desc}</span></div>
                <span className={`text-sm font-bold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{p.precio}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Cobros</p>
        <EditField label="Tarifa/mes" value={pagoConfig.tarifaMensual} placeholder="RD$900" onSave={v => { updatePagoConfig({ tarifaMensual: v }); show('Guardado'); }} />
        <EditField label="Día de cobro" value={pagoConfig.diaCobro} placeholder="1" onSave={v => { updatePagoConfig({ diaCobro: v }); show('Guardado'); }} />
        <div className="py-3">
          <p className="text-xs font-bold text-muted-foreground mb-2">Método preferido</p>
          <div className="flex gap-2">
            {(['efectivo','transferencia','mixto'] as const).map(m => (
              <button key={m} onClick={() => { updatePagoConfig({ metodo: m }); show('Guardado'); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border ${pagoConfig.metodo === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* MODAL: Confirm delete parent */}
      {confirmDeleteParent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6" style={{ background:'rgba(0,0,0,0.4)' }}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-elevated">
            <h3 className="text-base font-extrabold text-foreground mb-2">¿Eliminar padre/madre?</h3>
            <p className="text-sm text-muted-foreground mb-5">Se eliminará a <span className="font-bold text-foreground">{confirmDeleteParent.name}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteParent(null)} className="flex-1 bg-muted text-foreground font-bold py-3 rounded-xl text-sm">Cancelar</button>
              <button onClick={() => { removeParent(confirmDeleteParent.id); setConfirmDeleteParent(null); show('Eliminado'); }}
                className="flex-1 bg-destructive text-destructive-foreground font-bold py-3 rounded-xl text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Invite parent */}
      <BottomSheet open={showInvite} onClose={() => setShowInvite(false)}>
        <h3 className="text-lg font-extrabold text-foreground mb-4">Invitar padre / madre</h3>
        <div className="bg-muted rounded-xl p-4 text-center mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-1">Código de invitación</div>
          <div className="text-2xl font-bold text-foreground tracking-widest">{cuidoCode}</div>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(cuidoCode).catch(()=>{}); show('Código copiado'); }}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl mb-3">Copiar código</button>
        <div className="text-center text-xs text-muted-foreground mb-3">— o invitar por email —</div>
        <input type="email" placeholder="Email del padre/madre" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary mb-3" />
        <button onClick={() => { if (!inviteEmail.trim()) { show('Ingresa un email'); return; } show('Invitación enviada a '+inviteEmail); setShowInvite(false); setInviteEmail(''); }}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-card">Enviar invitación</button>
      </BottomSheet>

      {/* MODAL: Add/Edit Cuidador - Professional, no emojis */}
      <AnimatePresence>
        {showAddCuidador && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end" onClick={() => setShowAddCuidador(false)}>
            <motion.div initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:25, stiffness:300 }}
              onClick={e => e.stopPropagation()} className="w-full bg-card rounded-t-3xl p-6 safe-bottom max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-foreground text-lg">{editCuidador ? 'Editar cuidador' : 'Nuevo cuidador'}</h3>
                <button onClick={() => setShowAddCuidador(false)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><X size={16} className="text-muted-foreground" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Nombre completo *</label>
                  <input value={newCuidador.nombre} onChange={e => setNewCuidador(p => ({...p, nombre:e.target.value}))}
                    placeholder="Nombre del cuidador"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>

                {!editCuidador && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Correo electrónico *</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="email" value={newCuidador.email} onChange={e => setNewCuidador(p => ({...p, email:e.target.value}))}
                          placeholder="correo@ejemplo.com"
                          className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block">Contraseña *</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="password" value={newCuidador.password} onChange={e => setNewCuidador(p => ({...p, password:e.target.value}))}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="bg-muted border border-border rounded-xl px-4 py-3">
                      <p className="text-xs text-muted-foreground">El cuidador usará este correo y contraseña para acceder con "Soy del Cuido".</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">Rol</label>
                  <div className="flex flex-col gap-2">
                    {ROLES.map(r => (
                      <button key={r} onClick={() => setNewCuidador(p => ({...p, rol:r}))}
                        className={`py-3 px-4 rounded-xl text-sm font-bold text-left border-2 ${newCuidador.rol===r ? 'border-primary bg-primary/8 text-primary' : 'border-border bg-secondary text-foreground'}`}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSaveCuidador}
                className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-base shadow-elevated active:scale-[0.98] mt-5">
                {editCuidador ? 'Guardar cambios' : 'Crear cuidador'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Delete cuidador */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center px-6" onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-float">
              <div className="text-center mb-5">
                <h3 className="font-extrabold text-foreground text-lg">¿Eliminar a {deleteTarget.nombre}?</h3>
                <p className="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 bg-secondary text-foreground font-bold py-3.5 rounded-2xl text-sm">Cancelar</button>
                <button onClick={() => { removeCuidador(deleteTarget.id); setDeleteTarget(null); show('Eliminado'); }}
                  className="flex-1 bg-destructive text-destructive-foreground font-bold py-3.5 rounded-2xl text-sm">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
