import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import ChildAvatar from '@/components/ChildAvatar';
import ActivityIcon from '@/components/ActivityIcon';
import { MessageSquare, Calendar, Image, ChevronDown, ListFilter, Heart, Info, BookOpen, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import BottomSheet from '@/components/BottomSheet';

export default function ParentHome() {
  const { children, parentChildId, parentFilter, setParentFilter, updateChild } = useApp();
  const navigate = useNavigate();
  const [dayFilter, setDayFilter] = useState('Últimos 30 días');
  const [showDayDrop, setShowDayDrop] = useState(false);
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});
  const toggleLike = (index: number) => {
    setLikedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };
  const [showTypeDrop, setShowTypeDrop] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dayRef.current && !dayRef.current.contains(e.target as Node)) setShowDayDrop(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setShowTypeDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const child = children.find(c => c.id === parentChildId);
  if (!child) { navigate('/parent-onboarding'); return null; }

  const smartDateLabel = (dateStr?: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ref = dateStr ? new Date(dateStr) : today;
    const refDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
    if (refDay.getTime() === today.getTime()) return 'hoy';
    if (refDay.getTime() === yesterday.getTime()) return 'ayer';
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return days[refDay.getDay()] + ', ' + refDay.getDate() + ' ' + months[refDay.getMonth()];
  };

  const filtered = child.tl.filter(item => parentFilter === 'todo' || item.type === parentFilter);

  const actions = [
    { icon: <MessageSquare size={24} strokeWidth={1.5} />, label: 'Mensaje',     fn: () => navigate('/parent-chat'),    color: 'hsl(240,60%,62%)' },
    { icon: <Calendar     size={24} strokeWidth={1.5} />, label: 'Calendario',  fn: () => navigate('/calendar'),       color: 'hsl(175,65%,45%)' },
    { icon: <BookOpen     size={24} strokeWidth={1.5} />, label: 'Información', fn: () => setShowInfo(true),           color: 'hsl(45,85%,55%)' },
    { icon: <Image        size={24} strokeWidth={1.5} />, label: 'Galería',     fn: () => navigate('/parent-gallery'), color: 'hsl(200,65%,50%)' },
  ];

  const InfoField = ({ label, value, field }: { label: string; value: string; field: string }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const save = () => {
      if (field === 'alerts') {
        updateChild(child.id, { alerts: draft ? draft.split(',').map(s => s.trim()) : [] });
      } else {
        updateChild(child.id, { [field]: draft } as any);
      }
      setEditing(false);
    };
    return (
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
        <span className="text-sm font-semibold text-foreground min-w-[110px]">{label}</span>
        {editing ? (
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
            className="flex-1 text-right text-sm text-foreground bg-secondary border-b-2 border-primary outline-none px-2 py-0.5 ml-3"
          />
        ) : (
          <button onClick={() => { setDraft(field === 'alerts' ? child.alerts.join(', ') : value); setEditing(true); }}
            className="flex-1 text-right text-sm text-muted-foreground active:opacity-60 ml-3">
            {value || <span className="text-muted-foreground/40">Añadir</span>}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Full-screen image viewer */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/90 flex items-center justify-center"
            onClick={() => setFullScreenImg(null)}
          >
            <button
              onClick={() => setFullScreenImg(null)}
              className="absolute top-12 right-4 w-10 h-10 bg-card/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
            >
              <X size={20} className="text-primary-foreground" />
            </button>
            {fullScreenImg === 'emoji' ? (
              <div className="text-[120px]">{child.emoji}</div>
            ) : (
              <img src={fullScreenImg} alt="" className="max-w-full max-h-full object-contain" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Franja 1: navegación */}
      <div className="flex items-center justify-between px-4 pt-8 pb-3 border-b border-border bg-card">
        <button
          onClick={() => navigate('/parent-select')}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${child.present ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-base font-bold text-foreground">{child.name}</span>
        </div>

        <button
          onClick={() => navigate('/parent-profile')}
          className="text-sm font-bold text-primary active:opacity-70 transition-opacity"
        >
          Perfil
        </button>
      </div>

      {/* Franja 2: avatar */}
      <div className="flex flex-col items-center py-5 bg-card">
        <ChildAvatar child={child} size={88} className="border-[3px] border-border shadow-soft" />
      </div>

      {/* Franja 3: acciones rápidas */}
      <div className="flex border-b border-border bg-card py-4 px-2">
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.fn}
            className="flex-1 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <span style={{ color: a.color }}>{a.icon}</span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Franja 4: filtros + feed */}
      <div className="bg-background">
        <div className="flex gap-2.5 px-4 py-3">
          <div ref={dayRef} className="relative flex-1">
            <button
              onClick={() => { setShowDayDrop(!showDayDrop); setShowTypeDrop(false); }}
              className="w-full flex items-center justify-between gap-1.5 bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground shadow-soft active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-primary flex-shrink-0" />
                <span className="truncate">{dayFilter}</span>
              </span>
              <ChevronDown size={13} className={`text-muted-foreground transition-transform flex-shrink-0 ${showDayDrop ? 'rotate-180' : ''}`} />
            </button>
            {showDayDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['Hoy', 'Últimos 7 días', 'Últimos 30 días', 'Todo'].map(d => (
                  <button key={d} onClick={() => { setDayFilter(d); setShowDayDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors ${dayFilter === d ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={typeRef} className="relative flex-1">
            <button
              onClick={() => { setShowTypeDrop(!showTypeDrop); setShowDayDrop(false); }}
              className="w-full flex items-center justify-between gap-1.5 bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground shadow-soft active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-1.5">
                <ListFilter size={13} className="text-primary flex-shrink-0" />
                <span className="truncate">{parentFilter === 'todo' ? 'Todo' : parentFilter.charAt(0).toUpperCase() + parentFilter.slice(1)}</span>
              </span>
              <ChevronDown size={13} className={`text-muted-foreground transition-transform flex-shrink-0 ${showTypeDrop ? 'rotate-180' : ''}`} />
            </button>
            {showTypeDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['todo', 'foto', 'nota', 'comida', 'sueño', 'actividad', 'salud'].map(f => (
                  <button key={f} onClick={() => { setParentFilter(f); setShowTypeDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors ${parentFilter === f ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    {f === 'todo' ? 'Todo' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            {smartDateLabel()}
          </span>
        </div>

        <div className="px-3.5 space-y-2.5 pb-8">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-2xl">
              <div className="text-3xl mb-2">📋</div>
              Sin registros{parentFilter !== 'todo' ? ' de este tipo' : ' hoy'}.
            </div>
          )}
          {filtered.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }} className="bg-card rounded-2xl overflow-hidden shadow-card">

              {item.hasImg ? (
                /* Tarjeta foto: icono izquierda + imagen derecha cuadrada */
                <div className="flex items-stretch">
                  {/* Columna izquierda — mismo padding que tarjetas normales (p-3.5) */}
                  <div className="flex flex-col items-center justify-between py-3.5 flex-shrink-0 w-16">
                    <ActivityIcon type={item.type} size={38} iconSize={18} />
                    <div className="flex flex-col items-center gap-3">
                      <button onClick={() => toggleLike(i)} className="active:scale-90 transition-transform">
                        <Heart size={18}
                          className={likedItems[i] ? 'text-[hsl(0,72%,55%)] fill-[hsl(0,72%,55%)]' : 'text-muted-foreground'}
                          strokeWidth={likedItems[i] ? 0 : 1.5} />
                      </button>
                      <Download size={18} className="text-muted-foreground" strokeWidth={1.5} />
                    </div>
                  </div>
                  {/* Imagen cuadrada derecha — clickable */}
                  <button
                    onClick={() => setFullScreenImg(item.photo || 'emoji')}
                    className="flex-1 aspect-[5/4] overflow-hidden active:opacity-90 transition-opacity"
                    style={{ background: `linear-gradient(135deg, #EFF6FF, #fff)` }}
                  >
                    {item.photo ? (
                      <img src={item.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl">{child.emoji}</div>
                    )}
                  </button>
                </div>
              ) : (
                /* Tarjeta normal sin imagen */
                <div className="flex items-center gap-3 p-3.5 pb-2">
                  <ActivityIcon type={item.type} size={38} iconSize={18} />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">{item.time} · Cuido Rayito de Sol</div>
                  </div>
                </div>
              )}

              {item.duracion && (
                <div className="bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-secondary-foreground">
                  😴 Durmió {item.duracion}
                </div>
              )}

              {item.hasImg && (
                <div className="px-3.5 pt-2 pb-1">
                  <div className="text-[11px] text-muted-foreground">{item.time} · Cuido Rayito de Sol</div>
                </div>
              )}

              <div className="px-3.5 pb-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</div>

              {!item.hasImg && (
                <>
                  <div className="px-3.5 py-2.5 flex items-center justify-between">
                    <button onClick={() => toggleLike(i)} className="active:scale-90 transition-transform">
                      <Heart size={20}
                        className={likedItems[i] ? 'text-[hsl(0,72%,55%)] fill-[hsl(0,72%,55%)]' : 'text-muted-foreground'}
                        strokeWidth={likedItems[i] ? 0 : 1.5} />
                    </button>
                  </div>
                  <div className="border-t border-border" />
                </>
              )}
              {item.hasImg && <div className="border-t border-border" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Información BottomSheet */}
      <BottomSheet open={showInfo} onClose={() => setShowInfo(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#1E3A8A]">
            <Info size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">Información — {child.name}</h3>
            <p className="text-xs text-muted-foreground">Toca cualquier campo para editar</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-4">
          <InfoField label="Nombre"      value={child.name.split(' ')[0]}   field="name" />
          <InfoField label="Cumpleaños"  value={child.cumpleanos || ''}      field="cumpleanos" />
          <InfoField label="Notas"       value={child.notas || ''}           field="notas" />
          <InfoField label="Alergias"    value={child.alerts.join(', ')}     field="alerts" />
          <InfoField label="Medicamento" value={child.medicamentos || ''}    field="medicamentos" />
        </div>
        {child.contactos.length > 0 && (
          <>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Contactos</p>
            <div className="space-y-2">
              {child.contactos.map((ct, i) => (
                <div key={i} className="bg-card rounded-2xl p-3.5 shadow-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: child.bg }}>
                    {child.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{ct.nombre}</div>
                    <div className="text-xs text-muted-foreground">{ct.relacion}</div>
                  </div>
                  <a href={`tel:${ct.telefono.replace(/-/g, '')}`}
                    className="bg-success text-success-foreground rounded-full px-3 py-1.5 text-[11px] font-bold">
                    Llamar
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
