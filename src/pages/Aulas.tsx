import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Plus, Trash2, X, Users, Baby,
  Check, Search, ChevronRight, AlertTriangle, Pencil, Minus
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = ['Bebés', 'Caminadores', 'Pre-escolar'];
function getCategoryForIndex(i: number) { return DEFAULT_CATEGORIES[i] ?? `Grupo ${i + 1}`; }

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Bebés':       { bg: 'bg-rose-50',   text: 'text-rose-600',   dot: 'bg-rose-400' },
  'Caminadores': { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400' },
  'Pre-escolar': { bg: 'bg-sky-50',    text: 'text-sky-600',    dot: 'bg-sky-400' },
};
function catStyle(cat?: string) {
  return CATEGORY_COLORS[cat ?? ''] ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-border' };
}

// ─── Slide-in screen wrapper ──────────────────────────────────────
function SlideScreen({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      className="fixed inset-0 z-40 bg-background flex flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

// ─── Add Members Sheet (+ button) ────────────────────────────────
function AddMembersSheet({ aulaId, mode, onClose }: {
  aulaId: number;
  mode: 'ninos' | 'cuidadores';
  onClose: () => void;
}) {
  const { children, cuidadores, aulaAsignaciones, cuidadorAulaMap, asignarNinoAula, asignarCuidadorAula } = useApp();
  const { show } = useToast();
  const [search, setSearch] = useState('');

  const isNinos = mode === 'ninos';

  // Only show items NOT already in this aula
  const available = isNinos
    ? children.filter(c => aulaAsignaciones[c.id] !== aulaId)
    : cuidadores.filter(c => cuidadorAulaMap[c.id] !== aulaId);

  const filtered = available.filter(item => {
    const name = (item as any).nombre ?? (item as any).name ?? '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleAdd = () => {
    if (isNinos) selected.forEach(id => asignarNinoAula(id, aulaId));
    else selected.forEach(id => asignarCuidadorAula(id, aulaId));
    show(`${selected.length} ${isNinos ? 'niño(s)' : 'cuidador(es)'} añadido(s)`);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="w-full bg-card rounded-t-3xl safe-bottom max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-foreground">
              {isNinos ? 'Añadir niños' : 'Añadir cuidadores'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} disponibles
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Buscar ${isNinos ? 'niño' : 'cuidador'}...`} autoFocus
              className="w-full bg-muted border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">
                {available.length === 0
                  ? `Todos los ${isNinos ? 'niños' : 'cuidadores'} ya están en esta sala`
                  : 'Sin resultados'}
              </p>
            </div>
          ) : (
            filtered.map(item => {
              const id = item.id;
              const name = (item as any).nombre ?? (item as any).name ?? '';
              const sub = isNinos ? (item as any).age : (item as any).rol;
              const isSelected = selected.includes(id);
              return (
                <button key={id} onClick={() => toggle(id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all active:scale-[0.98] text-left ${
                    isSelected ? 'bg-primary/8 border-primary/25' : 'bg-background border-border'
                  }`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                    {name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{name}</p>
                    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-border flex-shrink-0">
          <button onClick={handleAdd} disabled={selected.length === 0}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-2xl text-sm active:scale-[0.98] disabled:opacity-40">
            {selected.length > 0 ? `Añadir ${selected.length} seleccionado(s)` : 'Selecciona para añadir'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCREEN 3 — Editar Sala (solo nombre y categoría)
// ══════════════════════════════════════════════════════════════════
function EditarAula({ aula, onBack, onDeleted }: {
  aula: ReturnType<typeof useApp>['aulas'][0];
  onBack: () => void;
  onDeleted: () => void;
}) {
  const { updateAula, removeAula } = useApp();
  const { show } = useToast();

  const [nombre, setNombre] = useState((aula as any).nombre ?? '');
  const [categoria, setCategoria] = useState((aula as any).categoria ?? '');
  const [customCat, setCustomCat] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const finalCat = categoria === '__custom__' ? customCat : categoria;
  const canSave = nombre.trim() && !(categoria === '__custom__' && !customCat.trim());

  const handleSave = () => {
    updateAula(aula.id, { nombre: nombre.trim(), categoria: finalCat } as any);
    show('Sala actualizada');
    onBack();
  };

  const handleDelete = () => { removeAula(aula.id); show('Sala eliminada'); onDeleted(); };

  return (
    <SlideScreen>
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border bg-background flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90">
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <h1 className="flex-1 text-base font-extrabold text-foreground">Editar sala</h1>
        <button onClick={handleSave} disabled={!canSave}
          className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40 active:scale-95">
          Guardar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-5 space-y-6">

          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nombre de la sala</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Bebés, Caminadores..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary" />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => setCategoria(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    categoria === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
                  }`}>{cat}</button>
              ))}
              <button type="button" onClick={() => setCategoria('__custom__')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  categoria === '__custom__' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
                }`}>+ Otra</button>
            </div>
            {categoria === '__custom__' && (
              <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="Nombre de categoría"
                className="mt-3 w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Zona de peligro */}
          <div className="pb-8">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Zona de peligro</p>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-bold active:scale-[0.98] hover:bg-destructive/5">
              <Trash2 size={15} /> Eliminar sala
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center px-6"
            onClick={() => setShowDeleteConfirm(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-card rounded-3xl p-6 shadow-float">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                  <AlertTriangle size={22} className="text-destructive" />
                </div>
                <h3 className="font-extrabold text-foreground text-lg">¿Eliminar "{(aula as any).nombre}"?</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Los niños y cuidadores quedarán sin sala. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-muted text-foreground font-bold py-3.5 rounded-2xl text-sm">Cancelar</button>
                <button onClick={handleDelete}
                  className="flex-1 bg-destructive text-destructive-foreground font-bold py-3.5 rounded-2xl text-sm">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideScreen>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCREEN 2 — Detalle de Sala
// ══════════════════════════════════════════════════════════════════
function DetalleAula({ aula, onBack, onDeleted }: {
  aula: ReturnType<typeof useApp>['aulas'][0];
  onBack: () => void;
  onDeleted: () => void;
}) {
  const { children, cuidadores, aulaAsignaciones, cuidadorAulaMap, asignarNinoAula, asignarCuidadorAula } = useApp();
  const { show } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [addSheet, setAddSheet] = useState<'ninos' | 'cuidadores' | null>(null);
  const [editingNinos, setEditingNinos] = useState(false);
  const [editingCuids, setEditingCuids] = useState(false);

  const ninos = children.filter(c => aulaAsignaciones[c.id] === aula.id);
  const cuids = cuidadores.filter(c => cuidadorAulaMap[c.id] === aula.id);
  const { bg, text, dot } = catStyle((aula as any).categoria);

  const removeNino = (childId: number) => {
    asignarNinoAula(childId, -1);
    show('Niño removido de la sala');
  };

  const removeCuid = (cuidId: number) => {
    asignarCuidadorAula(cuidId, -1);
    show('Cuidador removido de la sala');
  };

  // Section header with + button and optional edit-mode toggle
  const SectionHeader = ({
    icon: Icon, label, count, onAdd, editing, onToggleEdit,
  }: {
    icon: React.ElementType;
    label: string;
    count: number;
    onAdd: () => void;
    editing: boolean;
    onToggleEdit: () => void;
  }) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-muted-foreground" />
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-xs text-muted-foreground ml-0.5">({count})</span>
      <div className="flex-1" />
      {count > 0 && (
        <button onClick={onToggleEdit}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 ${
            editing ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
          }`}>
          {editing ? 'Listo' : 'Editar'}
        </button>
      )}
      <button onClick={onAdd}
        className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center active:scale-90 transition-all ml-1">
        <Plus size={14} className="text-primary-foreground" />
      </button>
    </div>
  );

  return (
    <>
      <SlideScreen>
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border bg-background flex-shrink-0">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-extrabold text-foreground">{(aula as any).nombre}</h1>
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 text-sm font-bold text-primary px-3 py-2 rounded-xl active:scale-95 active:bg-primary/10">
            <Pencil size={13} /> Editar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className={`mx-4 mt-5 rounded-2xl p-5 ${bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span className={`text-sm font-bold ${text}`}>{(aula as any).categoria || 'Sin categoría'}</span>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-extrabold text-foreground">{cuids.length}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">cuidadores</p>
              </div>
              <div className="w-px bg-border/50" />
              <div>
                <p className="text-3xl font-extrabold text-foreground">{ninos.length}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">niños</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 space-y-6 pb-10">

            {/* ── CUIDADORES (primero) ── */}
            <section>
              <SectionHeader
                icon={Users} label="Cuidadores" count={cuids.length}
                onAdd={() => setAddSheet('cuidadores')}
                editing={editingCuids} onToggleEdit={() => setEditingCuids(e => !e)}
              />
              {cuids.length === 0 ? (
                <button onClick={() => setAddSheet('cuidadores')}
                  className="w-full bg-card rounded-2xl px-4 py-5 text-center border border-dashed border-border active:scale-[0.98] transition-all">
                  <p className="text-sm text-muted-foreground">Sin cuidadores asignados</p>
                  <p className="text-xs text-primary font-bold mt-1">Toca + para añadir</p>
                </button>
              ) : (
                <div className="bg-card rounded-2xl overflow-hidden border border-border divide-y divide-border">
                  <AnimatePresence>
                    {cuids.map(c => (
                      <motion.div key={c.id} layout
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-4 py-3">
                        {/* Remove button in edit mode */}
                        <AnimatePresence>
                          {editingCuids && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              onClick={() => removeCuid(c.id)}
                              className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 active:scale-90">
                              <Minus size={12} className="text-white" strokeWidth={3} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                          {c.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{c.nombre}</p>
                          <p className="text-[11px] text-muted-foreground">{c.rol}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          c.activo ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* ── NIÑOS (segundo) ── */}
            <section>
              <SectionHeader
                icon={Baby} label="Niños" count={ninos.length}
                onAdd={() => setAddSheet('ninos')}
                editing={editingNinos} onToggleEdit={() => setEditingNinos(e => !e)}
              />
              {ninos.length === 0 ? (
                <button onClick={() => setAddSheet('ninos')}
                  className="w-full bg-card rounded-2xl px-4 py-5 text-center border border-dashed border-border active:scale-[0.98] transition-all">
                  <p className="text-sm text-muted-foreground">Sin niños asignados</p>
                  <p className="text-xs text-primary font-bold mt-1">Toca + para añadir</p>
                </button>
              ) : (
                <div className="bg-card rounded-2xl overflow-hidden border border-border divide-y divide-border">
                  <AnimatePresence>
                    {ninos.map(c => (
                      <motion.div key={c.id} layout
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 px-4 py-3">
                        {/* Remove button in edit mode */}
                        <AnimatePresence>
                          {editingNinos && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              onClick={() => removeNino(c.id)}
                              className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center flex-shrink-0 active:scale-90">
                              <Minus size={12} className="text-white" strokeWidth={3} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                          {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground">{c.age}</p>
                        </div>
                        {c.alerts.length > 0 && (
                          <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full flex-shrink-0">
                            ⚠ {c.alerts[0]}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        </div>
      </SlideScreen>

      {/* Edit screen */}
      <AnimatePresence>
        {showEdit && (
          <EditarAula aula={aula} onBack={() => setShowEdit(false)}
            onDeleted={() => { setShowEdit(false); onDeleted(); }} />
        )}
      </AnimatePresence>

      {/* Add members sheet */}
      <AnimatePresence>
        {addSheet && (
          <AddMembersSheet aulaId={aula.id} mode={addSheet} onClose={() => setAddSheet(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Tarjeta niño sin aula con selector de sala ────────────────────────────
function SinAulaCard({ child, aulas, i, onAssign }: { child: any; aulas: any[]; i: number; onAssign: (aulaId: number) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
      <div className="bg-card rounded-2xl border border-destructive/20 overflow-hidden">
        <div className="p-3.5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: child.bg }}>{child.emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">{child.name}</p>
            <p className="text-xs text-muted-foreground">{child.age}</p>
          </div>
          <button onClick={() => setShowPicker(p => !p)}
            className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
            + Asignar sala
          </button>
        </div>
        {showPicker && (
          <div className="border-t border-border px-3 pb-3 pt-2 space-y-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Elige una sala</p>
            {aulas.map(a => (
              <button key={a.id} onClick={() => { onAssign(a.id); setShowPicker(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted hover:bg-primary/10 active:scale-[0.98] transition-all text-left">
                <span className="text-lg">{a.emoji || '🏫'}</span>
                <span className="text-sm font-semibold text-foreground">{a.nombre}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SCREEN 1 — Lista de Salas
// ══════════════════════════════════════════════════════════════════
export default function Aulas() {
  const { aulas, children, cuidadores, aulaAsignaciones, cuidadorAulaMap, addAula, asignarNinoAula, asignarCuidadorAula } = useApp();
  const { show } = useToast();
  const navigate = useNavigate();

  const [activeAulaId, setActiveAulaId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newCategoria, setNewCategoria] = useState('');
  const [newCustomCat, setNewCustomCat] = useState('');
  const [newNinos, setNewNinos] = useState<number[]>([]);
  const [newCuids, setNewCuids] = useState<number[]>([]);

  const [view, setView] = useState<'salas' | 'ninos' | 'sinAula'>('salas');
  const sinAulaList = children.filter(c => !aulaAsignaciones[c.id] || aulaAsignaciones[c.id] === -1);
  const sinAulaCount = sinAulaList.length;

  const openCreate = () => {
    setNewNombre('');
    setNewCategoria(getCategoryForIndex(aulas.length));
    setNewCustomCat('');
    setNewNinos([]);
    setNewCuids([]);
    setShowCreate(true);
  };

  const handleCreate = () => {
    if (!newNombre.trim()) return;
    const finalCat = newCategoria === '__custom__' ? newCustomCat : newCategoria;
    const newId = Date.now();
    addAula({ nombre: newNombre.trim(), emoji: '', color: 'hsl(var(--primary))', categoria: finalCat } as any);
    setTimeout(() => {
      newNinos.forEach(id => asignarNinoAula(id, newId));
      newCuids.forEach(id => asignarCuidadorAula(id, newId));
    }, 0);
    setShowCreate(false);
    show('Sala creada');
  };

  const canCreate = newNombre.trim() && !(newCategoria === '__custom__' && !newCustomCat.trim());

  return (
    <div className="min-h-screen bg-background pb-8">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-border bg-card">
        <button onClick={() => navigate('/configuracion')}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90">
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <h1 className="flex-1 text-base font-extrabold text-foreground">Aulas</h1>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-xl active:scale-95">
          <Plus size={15} /> Nueva
        </button>
      </div>

      {/* Summary — botones funcionales */}
      <div className="px-4 pt-4 pb-3 grid grid-cols-3 gap-2.5">
        {[
          { label: 'Salas',    value: aulas.length,    alert: false,           id: 'salas'   },
          { label: 'Niños',    value: children.length, alert: false,           id: 'ninos'   },
          { label: 'Sin sala', value: sinAulaCount,    alert: sinAulaCount > 0, id: 'sinAula' },
        ].map(s => (
          <button key={s.label} onClick={() => setView(s.id as any)}
            className={`bg-card rounded-2xl p-3 text-center border-2 transition-all active:scale-95 ${
              view === s.id ? 'border-primary shadow-card' : s.alert ? 'border-destructive/30' : 'border-transparent'
            }`}>
            <p className={`text-xl font-extrabold ${s.alert ? 'text-destructive' : view === s.id ? 'text-primary' : 'text-foreground'}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* ── VISTA: SALAS ── */}
      {view === 'salas' && (
      <div className="px-4 space-y-2.5">
        {aulas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Baby size={28} className="text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground">Sin salas registradas</p>
            <p className="text-sm text-muted-foreground mt-1">Crea la primera sala para organizar tu cuido.</p>
            <button onClick={openCreate}
              className="mt-5 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl text-sm active:scale-95">
              + Crear primera sala
            </button>
          </div>
        ) : (
          aulas.map((aula, i) => {
            const ninos = children.filter(c => aulaAsignaciones[c.id] === aula.id);
            const cuids = cuidadores.filter(c => cuidadorAulaMap[c.id] === aula.id);
            const { bg, text, dot } = catStyle((aula as any).categoria);
            return (
              <motion.button key={aula.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} onClick={() => setActiveAulaId(aula.id)}
                className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-all">
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-4 h-4 rounded-full ${dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-foreground text-base leading-tight truncate">{(aula as any).nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {(aula as any).categoria && <span className={`text-[11px] font-bold ${text}`}>{(aula as any).categoria}</span>}
                    {(aula as any).categoria && <span className="text-muted-foreground/40 text-[10px]">·</span>}
                    <span className="text-xs text-muted-foreground">
                      {cuids.length} cuidador{cuids.length !== 1 ? 'es' : ''} · {ninos.length} {ninos.length === 1 ? 'niño' : 'niños'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
              </motion.button>
            );
          })
        )}
      </div>
      )}

      {/* ── VISTA: NIÑOS ── */}
      {view === 'ninos' && (
      <div className="px-4 space-y-2.5">
        <p className="text-sm font-extrabold text-foreground mb-2">Todos los niños ({children.length})</p>
        {children.map((c, i) => {
          const aulaId = aulaAsignaciones[c.id];
          const aula = aulas.find(a => a.id === aulaId);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="w-full bg-card rounded-2xl border border-border p-3.5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: c.bg }}>{c.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.age}</p>
                </div>
                {aula ? (
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{(aula as any).nombre}</span>
                ) : (
                  <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-1 rounded-full">Sin sala</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      )}

      {/* ── VISTA: SIN AULA ── */}
      {view === 'sinAula' && (
      <div className="px-4 space-y-2.5">
        <p className="text-sm font-extrabold text-foreground mb-2">Sin sala asignada ({sinAulaCount})</p>
        {sinAulaCount === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-foreground">Todos los niños tienen sala</p>
            <p className="text-xs text-muted-foreground mt-1">No hay niños sin asignar.</p>
          </div>
        ) : (
          sinAulaList.map((c, i) => (
            <SinAulaCard key={c.id} child={c} aulas={aulas} i={i} onAssign={(aulaId) => asignarNinoAula(c.id, aulaId)} />
          ))
        )}
      </div>
      )}

      {/* Detail screen */}
      <AnimatePresence>
        {activeAulaId && (() => { const activeAula = aulas.find(a => a.id === activeAulaId) ?? null; return activeAula ? (
          <DetalleAula key={activeAula.id} aula={activeAula}
            onBack={() => setActiveAulaId(null)}
            onDeleted={() => setActiveAulaId(null)} />
        ) : null; })()}
      </AnimatePresence>

      {/* Create bottom sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl safe-bottom max-h-[92vh] flex flex-col">

              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-extrabold text-foreground">Nueva sala</h2>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nombre *</label>
                  <input value={newNombre} onChange={e => setNewNombre(e.target.value)}
                    placeholder="Ej: Bebés, Caminadores..." autoFocus
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-primary" />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setNewCategoria(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                          newCategoria === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
                        }`}>{cat}</button>
                    ))}
                    <button type="button" onClick={() => setNewCategoria('__custom__')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        newCategoria === '__custom__' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border'
                      }`}>+ Otra</button>
                  </div>
                  {newCategoria === '__custom__' && (
                    <input value={newCustomCat} onChange={e => setNewCustomCat(e.target.value)} placeholder="Nombre de categoría"
                      className="mt-2 w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                  )}
                </div>

                <div className="h-px bg-border" />

                {/* Niños en creación */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Baby size={13} className="text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Niños</span>
                    {newNinos.length > 0 && (
                      <span className="ml-auto bg-primary/15 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {newNinos.length} seleccionados
                      </span>
                    )}
                  </div>
                  {children.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No hay niños registrados</p>
                  ) : (
                    <div className="space-y-1.5">
                      {children.map(c => {
                        const isSelected = newNinos.includes(c.id);
                        return (
                          <button key={c.id} onClick={() => setNewNinos(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all active:scale-[0.98] text-left ${
                              isSelected ? 'bg-primary/8 border-primary/25' : 'bg-background border-border'
                            }`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                              {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                              {c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{c.name}</p>
                              <p className="text-[11px] text-muted-foreground">{c.age}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border" />

                {/* Cuidadores en creación */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={13} className="text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cuidadores</span>
                    {newCuids.length > 0 && (
                      <span className="ml-auto bg-primary/15 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {newCuids.length} seleccionados
                      </span>
                    )}
                  </div>
                  {cuidadores.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No hay cuidadores registrados</p>
                  ) : (
                    <div className="space-y-1.5">
                      {cuidadores.map(c => {
                        const isSelected = newCuids.includes(c.id);
                        return (
                          <button key={c.id} onClick={() => setNewCuids(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all active:scale-[0.98] text-left ${
                              isSelected ? 'bg-primary/8 border-primary/25' : 'bg-background border-border'
                            }`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                              {isSelected && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0">
                              {c.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>{c.nombre}</p>
                              <p className="text-[11px] text-muted-foreground">{c.rol}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pb-4" />
              </div>

              <div className="px-5 pb-6 pt-3 border-t border-border flex-shrink-0">
                <button onClick={handleCreate} disabled={!canCreate}
                  className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl text-base active:scale-[0.98] disabled:opacity-40">
                  Crear sala
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
