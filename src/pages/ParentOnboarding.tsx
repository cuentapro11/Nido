import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, CheckCircle, Key, ArrowLeft, Camera, X } from 'lucide-react';

const DEMO_CUIDOS = [
  { id: 1, nombre: 'Cuido Rayito de Sol ☀️', direccion: 'Santo Domingo', niños: 12, code: 'RS-2891' },
  { id: 2, nombre: 'Jardín de Mariposas 🦋', direccion: 'Santiago',      niños: 8,  code: 'JM-1234' },
  { id: 3, nombre: 'Nido Alegre 🌈',          direccion: 'La Vega',       niños: 15, code: 'NA-5678' },
];

const GRUPOS = ['Bebés', 'Caminadores', 'Pre-escolar'];

export default function ParentOnboarding() {
  const { cuidoCode, addChild, children, setParentChildId } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const [screen, setScreen] = useState<'join' | 'code' | 'search' | 'waiting' | 'addChild' | 'welcome'>('join');
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [selectedCuido, setSelectedCuido] = useState<typeof DEMO_CUIDOS[0] | null>(null);
  const [childForm, setChildForm] = useState({ nombre: '', nacimiento: '', grupo: 'Bebés', alergias: '', photo: '' });
  const photoRef = useRef<HTMLInputElement>(null);
  const [addedChildId, setAddedChildId] = useState<number | null>(null);

  const handleCode = () => {
    if (inputCode.trim().toUpperCase() === cuidoCode) {
      setSelectedCuido(DEMO_CUIDOS[0]);
      setCodeError('');
      setScreen('waiting');
    } else {
      setCodeError('Código incorrecto. Verifica con el cuido.');
    }
  };

  const handleSelectCuido = (c: typeof DEMO_CUIDOS[0]) => {
    setSelectedCuido(c);
    setScreen('waiting');
  };

  const handleAddChild = () => {
    if (!childForm.nombre.trim()) { show('Ingresa el nombre del niño'); return; }
    const newId = Math.max(...children.map(c => c.id)) + 1;
    const newChild = {
      id: newId,
      name: childForm.nombre,
      emoji: '👶',
      photo: childForm.photo || null,
      bg: '#EFF6FF',
      tc: '#1E3A8A',
      group: childForm.grupo,
      age: childForm.nacimiento ? calcAge(childForm.nacimiento) : 'Edad no especificada',
      present: false,
      lastMin: null,
      alerts: childForm.alergias ? [childForm.alergias] : [],
      cumpleanos: childForm.nacimiento,
      medicamentos: '',
      contactos: [],
      notas: '',
      tl: [],
    };
    addChild(newChild);
    setParentChildId(newId);
    setAddedChildId(newId);
    setScreen('welcome');
  };

  const calcAge = (dob: string) => {
    try {
      const d = new Date(dob);
      const now = new Date();
      const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (months < 24) return months + ' meses';
      return Math.floor(months / 12) + ' años';
    } catch { return 'Edad'; }
  };

  const filtered = DEMO_CUIDOS.filter(c =>
    c.nombre.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.direccion.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <AnimatePresence mode="wait">

        {/* ── PANTALLA 1a: Unirse ── */}
        {screen === 'join' && (
          <motion.div key="join" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-sm">🏠</div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">Únete a un cuido</h2>
              <p className="text-sm text-muted-foreground">¿Cómo quieres encontrar el cuido de tu hijo?</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setScreen('code')}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Key size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">Tengo un código</p>
                  <p className="text-xs text-muted-foreground mt-0.5">El cuido te dio un código de acceso</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>

              <button
                onClick={() => setScreen('search')}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Search size={20} className="text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">Buscar mi cuido</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Busca por nombre o ubicación</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PANTALLA 1b: Código ── */}
        {screen === 'code' && (
          <motion.div key="code" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm">
            <button onClick={() => setScreen('join')} className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors">
              <ArrowLeft size={15} /> Volver
            </button>
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Key size={24} className="text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">Ingresa tu código</h2>
              <p className="text-sm text-muted-foreground">El cuido te debe haber compartido un código</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
              <label className="text-xs font-semibold text-muted-foreground block mb-2">Código de acceso</label>
              <input
                value={inputCode}
                onChange={e => { setInputCode(e.target.value.toUpperCase()); setCodeError(''); }}
                placeholder="RS-2891"
                className="w-full bg-background border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-center text-2xl font-bold tracking-widest transition-all"
              />
              {codeError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-destructive mt-2.5 font-medium">
                  {codeError}
                </motion.p>
              )}
            </div>
            <button
              onClick={handleCode}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Confirmar código →
            </button>
          </motion.div>
        )}

        {/* ── PANTALLA 1c: Búsqueda ── */}
        {screen === 'search' && (
          <motion.div key="search" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm">
            <button onClick={() => setScreen('join')} className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors">
              <ArrowLeft size={15} /> Volver
            </button>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-foreground mb-1">Buscar cuido</h2>
              <p className="text-sm text-muted-foreground">Escribe el nombre o ciudad</p>
            </div>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Nombre del cuido..."
                className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2.5">
              {filtered.map(c => (
                <button key={c.id} onClick={() => handleSelectCuido(c)}
                  className="w-full bg-card border border-border rounded-2xl p-4 text-left flex items-center gap-3 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏠</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{c.direccion} · {c.niños} niños</p>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground flex-shrink-0" />
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No se encontraron cuidos</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── PANTALLA 2: Espera aprobación ── */}
        {screen === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-sm text-center">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-6xl mb-6">⏳</motion.div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Solicitud enviada</h2>
            <p className="text-sm text-muted-foreground mb-1">Tu solicitud fue enviada a</p>
            <p className="font-bold text-foreground text-base mb-5">
              {selectedCuido?.nombre || 'Cuido Rayito de Sol ☀️'}
            </p>
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-left mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                El administrador debe aprobarte para continuar. Te notificaremos cuando sea aprobada.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 mb-8">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  className="w-2 h-2 bg-primary/50 rounded-full" />
              ))}
            </div>
            <button
              onClick={() => setScreen('addChild')}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Simular aprobación →
            </button>
          </motion.div>
        )}

        {/* ── PANTALLA 3: Vincular hijo ── */}
        {screen === 'addChild' && (
          <motion.div key="addChild" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            className="w-full max-w-sm">
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">👶</div>
              <h2 className="text-2xl font-extrabold text-foreground mb-1">Vincula a tu hijo</h2>
              <p className="text-sm text-muted-foreground">Cuéntanos sobre tu pequeño</p>
            </div>

            {/* Foto */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                {childForm.photo ? (
                  <>
                    <img src={childForm.photo} alt="preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-card shadow-md" />
                    <button
                      onClick={() => setChildForm(p => ({ ...p, photo: '' }))}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-destructive rounded-full flex items-center justify-center shadow-sm"
                    >
                      <X size={13} className="text-white" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => photoRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 active:scale-95 transition-all"
                  >
                    <Camera size={20} className="text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground font-semibold">Subir foto</span>
                  </button>
                )}
                <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setChildForm(p => ({ ...p, photo: reader.result as string }));
                    reader.readAsDataURL(file);
                  }} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre del niño *</label>
                  <input
                    value={childForm.nombre}
                    onChange={e => setChildForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Nombre"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={childForm.nacimiento}
                    onChange={e => setChildForm(p => ({ ...p, nacimiento: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">Grupo</label>
                  <div className="flex gap-2">
                    {GRUPOS.map(g => (
                      <button
                        key={g}
                        onClick={() => setChildForm(p => ({ ...p, grupo: g }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          childForm.grupo === g
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background text-muted-foreground border-border hover:border-primary/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Alergias conocidas</label>
                  <input
                    value={childForm.alergias}
                    onChange={e => setChildForm(p => ({ ...p, alergias: e.target.value }))}
                    placeholder="Maní, látex... (opcional)"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddChild}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all mt-4"
            >
              Continuar →
            </button>
          </motion.div>
        )}

        {/* ── PANTALLA 4: Bienvenida ── */}
        {screen === 'welcome' && (
          <motion.div key="welcome" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="w-full max-w-sm text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
              className="mb-6 flex justify-center">
              {childForm.photo
                ? <img src={childForm.photo} alt={childForm.nombre} className="w-28 h-28 rounded-full object-cover border-4 border-card shadow-lg" />
                : <div className="w-28 h-28 bg-accent/15 rounded-full flex items-center justify-center text-6xl shadow-lg">👶</div>
              }
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">¡Ya estás conectado!</h2>
              <p className="text-muted-foreground text-sm mb-1">
                <span className="font-bold text-foreground">{childForm.nombre}</span> está vinculado a
              </p>
              <p className="font-bold text-foreground text-sm mb-7">
                {selectedCuido?.nombre || 'Cuido Rayito de Sol ☀️'}
              </p>
              <div className="flex items-center justify-center gap-2.5 bg-success-light border border-success/20 rounded-2xl px-5 py-3.5 mb-7">
                <CheckCircle size={17} className="text-success flex-shrink-0" />
                <span className="text-sm font-semibold text-success">Perfil creado y vinculado</span>
              </div>
              <button
                onClick={() => navigate('/parent-home')}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
              >
                Entrar al diario de {childForm.nombre} →
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
