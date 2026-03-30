import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Edit2, Trash2, AlertTriangle, ChevronLeft, Phone, Mail, Lock, Users } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const SALAS = ['Bebés', 'Caminadores', 'Pre-escolar'] as const;
const ROLES = ['Maestra', 'Asistente', 'Auxiliar', 'Directora'] as const;

type Sala = typeof SALAS[number];
type Rol  = typeof ROLES[number];

// ─── Field row ────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}

// ─── Edit Sheet ───────────────────────────────────────────────
function EditSheet({ cuidador, onClose }: {
  cuidador: ReturnType<typeof useApp>['cuidadores'][0];
  onClose: () => void;
}) {
  const { updateCuidador, removeCuidador } = useApp();
  const { show } = useToast();

  const [nombre,   setNombre]   = useState(cuidador.nombre);
  const [telefono, setTelefono] = useState('');           // stored in rol field as metadata for now
  const [email,    setEmail]    = useState('');
  const [rol,      setRol]      = useState<Rol>(cuidador.rol as Rol ?? 'Maestra');
  const [sala,     setSala]     = useState<Sala>('Bebés');
  const [activo,   setActivo]   = useState(cuidador.activo);
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (!nombre.trim()) return;
    updateCuidador(cuidador.id, { nombre: nombre.trim(), rol, activo });
    show('Cuidador actualizado');
    onClose();
  };

  const handleDelete = () => {
    removeCuidador(cuidador.id);
    show('Cuidador eliminado');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-card rounded-t-3xl safe-bottom max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-extrabold text-foreground">Editar cuidador</h2>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Nombre */}
          <Field label="Nombre completo *" value={nombre} onChange={setNombre} placeholder="Nombre del cuidador" />

          {/* Teléfono */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={10} /> Teléfono
            </label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
              placeholder="829-555-0000"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={10} /> Correo electrónico
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="cuidador@correo.com"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={10} /> Nueva contraseña (opcional)
            </label>
            <input type="password" placeholder="Dejar vacío para no cambiar"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>

          {/* Rol */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Rol</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => setRol(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    rol === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Sala asignada */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users size={10} /> Sala asignada
            </label>
            <div className="flex gap-2">
              {SALAS.map(s => (
                <button key={s} type="button" onClick={() => setSala(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    sala === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-foreground">Estado</p>
              <p className="text-xs text-muted-foreground">{activo ? 'Cuidador activo' : 'Cuidador inactivo'}</p>
            </div>
            <button onClick={() => setActivo(a => !a)}
              className={`w-12 h-6 rounded-full transition-all relative ${activo ? 'bg-primary' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${activo ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="pb-2" />
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-border space-y-2.5 flex-shrink-0">
          <button onClick={handleSave} disabled={!nombre.trim()}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-[0.98] disabled:opacity-40">
            Guardar cambios
          </button>
          <button onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-destructive text-sm font-bold rounded-xl border border-destructive/25 active:scale-[0.98] hover:bg-destructive/5">
            <Trash2 size={14} /> Eliminar cuidador
          </button>
        </div>
      </motion.div>

      {/* Delete confirm */}
      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/50 flex items-center justify-center px-6"
            onClick={() => setShowDelete(false)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-float">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={22} className="text-destructive" />
                </div>
                <h3 className="font-extrabold text-foreground text-lg">¿Eliminar a {cuidador.nombre.split(' ')[0]}?</h3>
                <p className="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)} className="flex-1 bg-muted text-foreground font-bold py-3.5 rounded-2xl text-sm">Cancelar</button>
                <button onClick={handleDelete} className="flex-1 bg-destructive text-destructive-foreground font-bold py-3.5 rounded-2xl text-sm">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Add Sheet ────────────────────────────────────────────────
function AddSheet({ onClose }: { onClose: () => void }) {
  const { addCuidador } = useApp();
  const { createCaregiver, loading } = useSupabase();
  const { show } = useToast();

  const [nombre,   setNombre]   = useState('');
  const [telefono, setTelefono] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [rol,      setRol]      = useState<Rol>('Maestra');
  const [sala,     setSala]     = useState<Sala>('Bebés');
  const [error,    setError]    = useState('');

  const handleAdd = async () => {
    if (!nombre.trim()) { setError('El nombre es requerido.'); return; }
    if (!email.trim() && !telefono.trim()) { setError('Correo o teléfono son requeridos.'); return; }
    setError('');
    addCuidador({ nombre: nombre.trim(), rol, emoji: '👤', activo: true });
    if (email && password) {
      await createCaregiver({ name: nombre.trim(), phone: telefono, email, password, sala });
    }
    show('Cuidador añadido');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-card rounded-t-3xl safe-bottom max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-extrabold text-foreground">Nuevo cuidador</h2>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && <p className="bg-destructive/10 text-destructive text-xs font-bold px-3 py-2 rounded-xl">{error}</p>}

          <Field label="Nombre completo *" value={nombre} onChange={setNombre} placeholder="Nombre del cuidador" />

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={10} /> Teléfono
            </label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
              placeholder="829-555-0000"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={10} /> Correo electrónico
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="cuidador@correo.com"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock size={10} /> Contraseña temporal
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mín. 6 caracteres"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
            <p className="text-[10px] text-muted-foreground mt-1">Comparte estas credenciales con el cuidador para que pueda entrar.</p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Rol</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => setRol(r)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    rol === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users size={10} /> Sala asignada
            </label>
            <div className="flex gap-2">
              {SALAS.map(s => (
                <button key={s} type="button" onClick={() => setSala(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    sala === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="pb-2" />
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-border flex-shrink-0">
          <button onClick={handleAdd} disabled={loading || !nombre.trim()}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-[0.98] disabled:opacity-40">
            {loading ? 'Creando...' : 'Crear cuidador'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Caregivers() {
  const { cuidadores } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof cuidadores[0] | null>(null);

  const activos   = cuidadores.filter(c => c.activo);
  const inactivos = cuidadores.filter(c => !c.activo);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-border bg-card">
        <button onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90">
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <h1 className="flex-1 text-base font-extrabold text-foreground">Equipo</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl active:scale-95">
          <UserPlus size={14} /> Añadir
        </button>
      </div>

      <div className="px-4 pt-4 space-y-2.5 pb-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2.5 mb-1">
          {[
            { label: 'Activos', value: activos.length },
            { label: 'Total',   value: cuidadores.length },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl p-3 text-center border border-border">
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {cuidadores.length === 0 && (
          <div className="text-center py-12">
            <p className="font-bold text-foreground">Sin cuidadores</p>
            <p className="text-sm text-muted-foreground mt-1">Añade el primer miembro del equipo.</p>
            <button onClick={() => setShowAdd(true)}
              className="mt-4 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl text-sm active:scale-95">
              + Añadir cuidador
            </button>
          </div>
        )}

        {activos.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Activos</p>
            <div className="space-y-2">
              {activos.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl p-3.5 shadow-card border border-border flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-extrabold text-primary flex-shrink-0">
                    {c.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.rol}</p>
                  </div>
                  <span className="bg-success/10 text-success text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">Activo</span>
                  <button onClick={() => setEditTarget(c)}
                    className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90 flex-shrink-0">
                    <Edit2 size={13} className="text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {inactivos.length > 0 && (
          <div className="mt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Inactivos</p>
            <div className="space-y-2">
              {inactivos.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl p-3.5 shadow-card border border-border flex items-center gap-3 opacity-60">
                  <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-sm font-extrabold text-muted-foreground flex-shrink-0">
                    {c.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.rol}</p>
                  </div>
                  <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">Inactivo</span>
                  <button onClick={() => setEditTarget(c)}
                    className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center active:scale-90 flex-shrink-0">
                    <Edit2 size={13} className="text-muted-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      <AnimatePresence>
        {showAdd    && <AddSheet  onClose={() => setShowAdd(false)} />}
        {editTarget && <EditSheet cuidador={editTarget} onClose={() => setEditTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
